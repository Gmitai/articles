const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const db = require('../db/db');
const ensureInteractionTables = require('../db/interaction-tables');

const router = express.Router();

let trashTableReady;

async function ensureTrashTable() {
    if (!trashTableReady) {
        trashTableReady = db.query(`
            CREATE TABLE IF NOT EXISTS admin_trash (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                recordType VARCHAR(32) NOT NULL,
                recordId INT NOT NULL,
                label VARCHAR(500) NOT NULL,
                payload JSON NOT NULL,
                deletedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                KEY idx_admin_trash_deletedAt (deletedAt)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `).then(() => true).catch(error => {
            trashTableReady = null;
            throw error;
        });
    }
    return trashTableReady;
}

function parseTrashPayload(payload) {
    return typeof payload === 'string' ? JSON.parse(payload) : payload;
}

function normalizeSnapshotDates(value, key = '') {
    if (value instanceof Date) {
        const iso = value.toISOString();
        return /date|year/i.test(key) ? iso.slice(0, 10) : iso.slice(0, 19).replace('T', ' ');
    }
    if (Array.isArray(value)) return value.map(item => normalizeSnapshotDates(item));
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [
            childKey,
            normalizeSnapshotDates(childValue, childKey)
        ]));
    }
    return value;
}

async function saveToTrash(connection, recordType, record, label, related = {}) {
    await connection.query(
        'INSERT INTO admin_trash (recordType, recordId, label, payload) VALUES (?, ?, ?, ?)',
        [recordType, record.id, String(label || record.id).slice(0, 500), JSON.stringify(normalizeSnapshotDates({ record, ...related }))]
    );
}

async function insertSnapshot(connection, table, record) {
    const allowedTables = new Set(['articles', 'authors', 'publishers', 'directions', 'genres', 'users', 'bbk_classifiers', 'isbn_classifiers']);
    if (!allowedTables.has(table) || !record || !Number.isInteger(Number(record.id))) {
        throw new Error('Некорректная запись для восстановления.');
    }
    const columns = Object.keys(record);
    const escapedColumns = columns.map(column => `\`${column.replace(/`/g, '')}\``).join(', ');
    const placeholders = columns.map(() => '?').join(', ');
    await connection.query(
        `INSERT INTO ${table} (${escapedColumns}) VALUES (${placeholders})`,
        columns.map(column => record[column])
    );
}

async function ensureRecordIdAvailable(connection, table, id) {
    const allowedTables = new Set(['articles', 'authors', 'publishers', 'directions', 'genres', 'users', 'bbk_classifiers', 'isbn_classifiers']);
    if (!allowedTables.has(table)) throw new Error('Неизвестный тип записи.');
    const [existing] = await connection.query(`SELECT id FROM ${table} WHERE id = ? FOR UPDATE`, [id]);
    if (existing.length) {
        const conflict = new Error('Эта запись уже существует. Удалите или переименуйте её перед восстановлением.');
        conflict.statusCode = 409;
        throw conflict;
    }
}

function getAuthToken(req) {
    const cookie = req.headers.cookie
        ?.split(';')
        .map(value => value.trim())
        .find(value => value.startsWith('authToken='));
    return cookie ? decodeURIComponent(cookie.slice('authToken='.length)) : null;
}

async function requireAdmin(req, res, next) {
    try {
        await ensureTrashTable();
        await ensureInteractionTables();
        const token = getAuthToken(req);
        if (!token) {
            return res.status(401).json({ success: false, message: 'Нужна авторизация администратора' });
        }

        const [users] = await db.query(
            'SELECT id FROM users WHERE authToken = ? AND role = ? LIMIT 1',
            [token, 'admin']
        );
        if (!users.length) {
            return res.status(403).json({ success: false, message: 'Недостаточно прав' });
        }
        req.adminId = users[0].id;
        next();
    } catch (error) {
        console.error('Ошибка проверки администратора:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
}

async function removeUnusedArticleFiles(fileNames) {
    const uploadDirectory = path.resolve(__dirname, '..', 'uploads');
    for (const fileName of new Set(fileNames.filter(Boolean))) {
        const safeName = path.basename(fileName);
        if (!safeName || safeName === '.' || safeName === '..') continue;

        const [references] = await db.query(
            'SELECT COUNT(*) AS total FROM articles WHERE filePath = ? OR coverPath = ?',
            [safeName, safeName]
        );
        if (Number(references[0].total) > 0) continue;
        const [userReferences] = await db.query(
            'SELECT COUNT(*) AS total FROM users WHERE profilePhoto = ?', [safeName]
        );
        if (Number(userReferences[0].total) > 0) continue;

        const [trashRows] = await db.query(
            "SELECT recordType, payload FROM admin_trash WHERE recordType IN ('catalog', 'user')"
        );
        const keptInTrash = trashRows.some(row => {
            const snapshot = parseTrashPayload(row.payload)?.record;
            return snapshot?.filePath === safeName || snapshot?.coverPath === safeName || snapshot?.profilePhoto === safeName;
        });
        if (keptInTrash) continue;

        const filePath = path.resolve(uploadDirectory, safeName);
        if (path.dirname(filePath) !== uploadDirectory) continue;
        await fs.promises.unlink(filePath).catch(error => {
            if (error.code !== 'ENOENT') console.error('Could not remove uploaded file:', error);
        });
    }
}

router.delete('/catalog/:id', requireAdmin, async (req, res) => {
    let transaction;
    try {
        const articleId = Number(req.params.id);
        if (!Number.isInteger(articleId) || articleId < 1) {
            return res.status(400).json({ success: false, message: 'Некорректный ID записи.' });
        }

        const connection = await db.getConnection();
        transaction = connection;
        await connection.beginTransaction();
        const [articles] = await connection.query(
            'SELECT * FROM articles WHERE id = ? FOR UPDATE',
            [articleId]
        );
        if (!articles.length) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Запись не найдена.' });
        }

        const [articleAuthors] = await connection.query(
            'SELECT * FROM article_authors WHERE id_article = ? FOR UPDATE', [articleId]
        );
        const [favorites] = await connection.query(
            'SELECT * FROM favorites WHERE articleId = ? FOR UPDATE', [articleId]
        );
        const [ratings] = await connection.query(
            "SELECT * FROM ratings WHERE targetType = 'article' AND targetId = ? FOR UPDATE", [articleId]
        );
        await saveToTrash(
            connection,
            'catalog',
            articles[0],
            articles[0].title_tj || articles[0].title_ru || `#${articleId}`,
            { articleAuthors, favorites, ratings }
        );
        await connection.query('DELETE FROM article_authors WHERE id_article = ?', [articleId]);
        await connection.query('DELETE FROM favorites WHERE articleId = ?', [articleId]);
        await connection.query("DELETE FROM ratings WHERE targetType = 'article' AND targetId = ?", [articleId]);
        await connection.query('DELETE FROM articles WHERE id = ?', [articleId]);
        await connection.commit();
        res.json({ success: true, message: 'Запись удалена.' });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Catalog delete error:', error);
        res.status(500).json({ success: false, message: 'Не удалось удалить запись.' });
    } finally {
        if (transaction) transaction.release();
    }
});

router.delete('/authors/:id', requireAdmin, async (req, res) => {
    let transaction;
    try {
        const authorId = Number(req.params.id);
        if (!Number.isInteger(authorId) || authorId < 1) {
            return res.status(400).json({ success: false, message: 'Некорректный ID автора.' });
        }

        const connection = await db.getConnection();
        transaction = connection;
        await connection.beginTransaction();
        const [authors] = await connection.query('SELECT * FROM authors WHERE id = ? FOR UPDATE', [authorId]);
        if (!authors.length) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Автор не найден.' });
        }

        const [articleAuthors] = await connection.query(
            'SELECT * FROM article_authors WHERE id_author = ? FOR UPDATE', [authorId]
        );
        const [favoriteAuthors] = await connection.query(
            'SELECT * FROM favorite_authors WHERE authorId = ? FOR UPDATE', [authorId]
        );
        const [ratings] = await connection.query(
            "SELECT * FROM ratings WHERE targetType = 'author' AND targetId = ? FOR UPDATE", [authorId]
        );
        const authorLabel = [authors[0].lastName, authors[0].firstName, authors[0].familyName].filter(Boolean).join(' ') || `#${authorId}`;
        await saveToTrash(connection, 'author', authors[0], authorLabel, { articleAuthors, favoriteAuthors, ratings });
        await connection.query('DELETE FROM article_authors WHERE id_author = ?', [authorId]);
        await connection.query('DELETE FROM favorite_authors WHERE authorId = ?', [authorId]);
        await connection.query("DELETE FROM ratings WHERE targetType = 'author' AND targetId = ?", [authorId]);
        await connection.query('DELETE FROM authors WHERE id = ?', [authorId]);
        await connection.commit();
        res.json({ success: true, message: 'Автор удалён.' });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Author delete error:', error);
        res.status(500).json({ success: false, message: 'Не удалось удалить автора.' });
    } finally {
        if (transaction) transaction.release();
    }
});

router.delete('/publishers/:id', requireAdmin, async (req, res) => {
    let transaction;
    try {
        const publisherId = Number(req.params.id);
        if (!Number.isInteger(publisherId) || publisherId < 1) {
            return res.status(400).json({ success: false, message: 'Некорректный ID издательства.' });
        }

        const connection = await db.getConnection();
        transaction = connection;
        await connection.beginTransaction();
        const [publishers] = await connection.query('SELECT * FROM publishers WHERE id = ? FOR UPDATE', [publisherId]);
        if (!publishers.length) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Издательство не найдено.' });
        }

        const [linkedArticles] = await connection.query(
            'SELECT id, publisherId FROM articles WHERE publisherId = ? FOR UPDATE', [publisherId]
        );
        await saveToTrash(
            connection,
            'publisher',
            publishers[0],
            publishers[0].title_tj || `#${publisherId}`,
            { linkedArticles }
        );
        await connection.query('UPDATE articles SET publisherId = NULL WHERE publisherId = ?', [publisherId]);
        await connection.query('DELETE FROM publishers WHERE id = ?', [publisherId]);
        await connection.commit();
        res.json({ success: true, message: 'Издательство удалено.' });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Publisher delete error:', error);
        res.status(500).json({ success: false, message: 'Не удалось удалить издательство.' });
    } finally {
        if (transaction) transaction.release();
    }
});

router.delete('/directions/:id', requireAdmin, async (req, res) => {
    let transaction;
    try {
        const directionId = Number(req.params.id);
        if (!Number.isInteger(directionId) || directionId < 1) {
            return res.status(400).json({ success: false, message: 'Некорректный ID направления.' });
        }

        const connection = await db.getConnection();
        transaction = connection;
        await connection.beginTransaction();
        const [directions] = await connection.query(
            'SELECT * FROM directions WHERE id = ? FOR UPDATE',
            [directionId]
        );
        if (!directions.length) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Направление не найдено.' });
        }

        const [[{ articleCount }]] = await connection.query(
            'SELECT COUNT(*) AS articleCount FROM articles WHERE directionId = ?',
            [directionId]
        );
        const [[{ childCount }]] = await connection.query(
            'SELECT COUNT(*) AS childCount FROM directions WHERE parentId = ?',
            [directionId]
        );
        if (Number(articleCount) || Number(childCount)) {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                message: 'Нельзя удалить направление, пока к нему привязаны публикации или подразделы. Сначала переназначьте их.'
            });
        }

        await saveToTrash(
            connection,
            'direction',
            directions[0],
            directions[0].title_ru || directions[0].udc || `#${directionId}`
        );
        await connection.query('DELETE FROM directions WHERE id = ?', [directionId]);
        await connection.commit();
        res.json({ success: true, message: 'Направление удалено.' });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Direction delete error:', error);
        res.status(500).json({ success: false, message: 'Не удалось удалить направление.' });
    } finally {
        if (transaction) transaction.release();
    }
});

router.get('/trash', requireAdmin, async (req, res) => {
    try {
        const [records] = await db.query(
            'SELECT id, recordType, recordId, label, deletedAt FROM admin_trash ORDER BY deletedAt DESC, id DESC'
        );
        res.json({ success: true, records });
    } catch (error) {
        console.error('Trash list error:', error);
        res.status(500).json({ success: false, message: 'Не удалось загрузить корзину.' });
    }
});

router.delete('/trash', requireAdmin, async (req, res) => {
    let transaction;
    let committed = false;
    try {
        const connection = await db.getConnection();
        transaction = connection;
        await connection.beginTransaction();
        const [trashRows] = await connection.query('SELECT recordType, recordId, payload FROM admin_trash FOR UPDATE');
        const fileNames = [];
        for (const row of trashRows) {
            const record = parseTrashPayload(row.payload)?.record;
            if (row.recordType === 'catalog') fileNames.push(record?.filePath, record?.coverPath);
            if (row.recordType === 'user') fileNames.push(record?.profilePhoto);
            if (row.recordType === 'catalog' || row.recordType === 'author') {
                await connection.query('DELETE FROM ratings WHERE targetType = ? AND targetId = ?', [
                    row.recordType === 'catalog' ? 'article' : 'author', row.recordId
                ]);
            }
        }
        await connection.query('DELETE FROM admin_trash');
        await connection.commit();
        committed = true;
        await removeUnusedArticleFiles(fileNames).catch(error => {
            console.error('Could not clean up emptied trash files:', error);
        });
        res.json({ success: true, deleted: trashRows.length });
    } catch (error) {
        if (transaction && !committed) await transaction.rollback();
        console.error('Trash clear error:', error);
        res.status(500).json({ success: false, message: 'Не удалось очистить корзину.' });
    } finally {
        if (transaction) transaction.release();
    }
});

router.post('/trash/:id/restore', requireAdmin, async (req, res) => {
    let transaction;
    try {
        const trashId = Number(req.params.id);
        if (!Number.isInteger(trashId) || trashId < 1) {
            return res.status(400).json({ success: false, message: 'Некорректный ID записи корзины.' });
        }

        const connection = await db.getConnection();
        transaction = connection;
        await connection.beginTransaction();
        const [trashRows] = await connection.query('SELECT * FROM admin_trash WHERE id = ? FOR UPDATE', [trashId]);
        if (!trashRows.length) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Запись корзины не найдена.' });
        }

        const trash = trashRows[0];
        const payload = parseTrashPayload(trash.payload);
        const record = payload.record;
        const id = Number(record.id);
        let section;

        switch (trash.recordType) {
            case 'catalog': {
                await ensureRecordIdAvailable(connection, 'articles', id);
                await insertSnapshot(connection, 'articles', record);
                for (const relation of payload.articleAuthors || []) {
                    const [[authorExists]] = await connection.query('SELECT id FROM authors WHERE id = ?', [relation.id_author]);
                    if (authorExists) {
                        await connection.query(
                            'INSERT INTO article_authors (id_article, id_author) VALUES (?, ?)',
                            [id, relation.id_author]
                        );
                    }
                }
                for (const favorite of payload.favorites || []) {
                    const [[userExists]] = await connection.query('SELECT id FROM users WHERE id = ?', [favorite.userId]);
                    if (userExists) {
                        await connection.query(
                            'INSERT IGNORE INTO favorites (userId, articleId, createdAt) VALUES (?, ?, ?)',
                            [favorite.userId, id, favorite.createdAt]
                        );
                    }
                }
                for (const rating of payload.ratings || []) {
                    const [[userExists]] = await connection.query('SELECT id FROM users WHERE id = ?', [rating.userId]);
                    if (userExists) {
                        await connection.query(
                            'INSERT IGNORE INTO ratings (userId, targetType, targetId, score, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
                            [rating.userId, 'article', id, rating.score, rating.createdAt, rating.updatedAt]
                        );
                    }
                }
                section = Number(record.typeOf) === 1 ? 'articles' : 'books';
                break;
            }
            case 'author': {
                await ensureRecordIdAvailable(connection, 'authors', id);
                await insertSnapshot(connection, 'authors', record);
                for (const relation of payload.articleAuthors || []) {
                    const [[articleExists]] = await connection.query('SELECT id FROM articles WHERE id = ?', [relation.id_article]);
                    if (articleExists) {
                        await connection.query(
                            'INSERT INTO article_authors (id_article, id_author) VALUES (?, ?)',
                            [relation.id_article, id]
                        );
                    }
                }
                for (const favorite of payload.favoriteAuthors || []) {
                    const [[userExists]] = await connection.query('SELECT id FROM users WHERE id = ?', [favorite.userId]);
                    if (userExists) {
                        await connection.query(
                            'INSERT IGNORE INTO favorite_authors (userId, authorId, createdAt) VALUES (?, ?, ?)',
                            [favorite.userId, id, favorite.createdAt]
                        );
                    }
                }
                for (const rating of payload.ratings || []) {
                    const [[userExists]] = await connection.query('SELECT id FROM users WHERE id = ?', [rating.userId]);
                    if (userExists) {
                        await connection.query(
                            'INSERT IGNORE INTO ratings (userId, targetType, targetId, score, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
                            [rating.userId, 'author', id, rating.score, rating.createdAt, rating.updatedAt]
                        );
                    }
                }
                section = 'authors';
                break;
            }
            case 'publisher': {
                await ensureRecordIdAvailable(connection, 'publishers', id);
                await insertSnapshot(connection, 'publishers', record);
                for (const linked of payload.linkedArticles || []) {
                    await connection.query(
                        'UPDATE articles SET publisherId = ? WHERE id = ? AND publisherId IS NULL',
                        [id, linked.id]
                    );
                }
                section = 'publishers';
                break;
            }
            case 'direction': {
                await ensureRecordIdAvailable(connection, 'directions', id);
                await insertSnapshot(connection, 'directions', record);
                section = 'directions';
                break;
            }
            case 'classifier': {
                const type = payload.classifierType;
                const table = type === 'bbk' ? 'bbk_classifiers' : type === 'isbn' ? 'isbn_classifiers' : null;
                if (!table) throw new Error('Неизвестный тип классификатора.');
                await ensureRecordIdAvailable(connection, table, id);
                await insertSnapshot(connection, table, record);
                section = 'directions';
                break;
            }
            case 'genre': {
                await ensureRecordIdAvailable(connection, 'genres', id);
                await insertSnapshot(connection, 'genres', record);
                for (const relation of payload.userGenres || []) {
                    const [[userExists]] = await connection.query('SELECT id FROM users WHERE id = ?', [relation.userId]);
                    if (userExists) {
                        await connection.query(
                            'INSERT IGNORE INTO user_genres (userId, genreId) VALUES (?, ?)',
                            [relation.userId, id]
                        );
                    }
                }
                section = 'genres';
                break;
            }
            case 'user': {
                await ensureRecordIdAvailable(connection, 'users', id);
                await insertSnapshot(connection, 'users', { ...record, authToken: null });
                for (const relation of payload.userGenres || []) {
                    const [[genreExists]] = await connection.query('SELECT id FROM genres WHERE id = ?', [relation.genreId]);
                    if (genreExists) {
                        await connection.query(
                            'INSERT IGNORE INTO user_genres (userId, genreId) VALUES (?, ?)',
                            [id, relation.genreId]
                        );
                    }
                }
                for (const favorite of payload.favorites || []) {
                    const [[articleExists]] = await connection.query('SELECT id FROM articles WHERE id = ?', [favorite.articleId]);
                    if (articleExists) {
                        await connection.query(
                            'INSERT IGNORE INTO favorites (userId, articleId, createdAt) VALUES (?, ?, ?)',
                            [id, favorite.articleId, favorite.createdAt]
                        );
                    }
                }
                for (const favorite of payload.favoriteAuthors || []) {
                    const [[authorExists]] = await connection.query('SELECT id FROM authors WHERE id = ?', [favorite.authorId]);
                    if (authorExists) {
                        await connection.query(
                            'INSERT IGNORE INTO favorite_authors (userId, authorId, createdAt) VALUES (?, ?, ?)',
                            [id, favorite.authorId, favorite.createdAt]
                        );
                    }
                }
                for (const rating of payload.ratings || []) {
                    await connection.query(
                        'INSERT IGNORE INTO ratings (userId, targetType, targetId, score, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
                        [id, rating.targetType, rating.targetId, rating.score, rating.createdAt, rating.updatedAt]
                    );
                }
                section = 'users';
                break;
            }
            default:
                throw new Error('Неизвестный тип записи корзины.');
        }

        await connection.query('DELETE FROM admin_trash WHERE id = ?', [trashId]);
        await connection.commit();
        res.json({ success: true, section });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Trash restore error:', error);
        res.status(error.statusCode || (error.code === 'ER_DUP_ENTRY' ? 409 : 500)).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY'
                ? 'Восстановление невозможно: логин, email или другое уникальное значение уже занято.'
                : (error.message || 'Не удалось восстановить запись.')
        });
    } finally {
        if (transaction) transaction.release();
    }
});

router.delete('/trash/:id', requireAdmin, async (req, res) => {
    let transaction;
    let committed = false;
    let recordType = null;
    let fileNames = [];
    try {
        const trashId = Number(req.params.id);
        if (!Number.isInteger(trashId) || trashId < 1) {
            return res.status(400).json({ success: false, message: 'Некорректный ID записи корзины.' });
        }
        const connection = await db.getConnection();
        transaction = connection;
        await connection.beginTransaction();
        const [trashRows] = await connection.query('SELECT * FROM admin_trash WHERE id = ? FOR UPDATE', [trashId]);
        if (!trashRows.length) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Запись корзины не найдена.' });
        }
        recordType = trashRows[0].recordType;
        if (recordType === 'catalog') {
            const record = parseTrashPayload(trashRows[0].payload).record;
            fileNames = [record.filePath, record.coverPath];
        }
        if (recordType === 'user') {
            const record = parseTrashPayload(trashRows[0].payload).record;
            fileNames = [record.profilePhoto];
        }
        if (recordType === 'catalog' || recordType === 'author') {
            await connection.query('DELETE FROM ratings WHERE targetType = ? AND targetId = ?', [
                recordType === 'catalog' ? 'article' : 'author', trashRows[0].recordId
            ]);
        }
        await connection.query('DELETE FROM admin_trash WHERE id = ?', [trashId]);
        await connection.commit();
        committed = true;

        if (fileNames.length) {
            await removeUnusedArticleFiles(fileNames).catch(error => {
                console.error('Could not clean up permanently deleted files:', error);
            });
        }
        res.json({ success: true });
    } catch (error) {
        if (transaction && !committed) await transaction.rollback();
        console.error('Trash purge error:', error);
        res.status(500).json({ success: false, message: 'Не удалось удалить запись навсегда.' });
    } finally {
        if (transaction) transaction.release();
    }
});

router.post('/users', requireAdmin, async (req, res) => {
    try {
        const {
            eMail,
            login,
            password,
            firstName,
            lastName,
            familyName,
            pseudonym,
            role = 'user'
        } = req.body || {};

        const email = typeof eMail === 'string' ? eMail.trim() : '';
        const userLogin = typeof login === 'string' ? login.trim() : '';
        if (!email || !userLogin || typeof password !== 'string' || !password) {
            return res.status(400).json({
                success: false,
                message: 'Заполните email, логин и пароль'
            });
        }

        if (email.length > 30 || userLogin.length > 30 || password.length > 72 ||
            ['firstName', 'lastName', 'familyName'].some(key => typeof req.body[key] === 'string' && req.body[key].trim().length > 25) ||
            (typeof pseudonym === 'string' && pseudonym.trim().length > 50)) {
            return res.status(400).json({
                success: false,
                message: 'Email и логин должны быть не длиннее 30 символов, пароль — до 72 символов'
            });
        }

        if (role !== 'user' && role !== 'admin') {
            return res.status(400).json({ success: false, message: 'Некорректная роль пользователя' });
        }

        const [existing] = await db.query(
            'SELECT id FROM users WHERE login = ? OR eMail = ? LIMIT 1',
            [userLogin, email]
        );
        if (existing.length) {
            return res.status(409).json({
                success: false,
                message: 'Такой логин или email уже используется'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const [result] = await db.query(
            `INSERT INTO users (eMail, login, password, firstName, lastName, familyName, pseudonym, role)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                email,
                userLogin,
                hashedPassword,
                typeof firstName === 'string' && firstName.trim() ? firstName.trim() : null,
                typeof lastName === 'string' && lastName.trim() ? lastName.trim() : null,
                typeof familyName === 'string' && familyName.trim() ? familyName.trim() : null,
                typeof pseudonym === 'string' && pseudonym.trim() ? pseudonym.trim() : null,
                role
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Пользователь добавлен',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Ошибка добавления пользователя:', error);
        res.status(500).json({ success: false, message: 'Не удалось добавить пользователя' });
    }
});

router.get('/users/:id', requireAdmin, async (req, res) => {
    try {
        const userId = Number(req.params.id);
        if (!Number.isInteger(userId) || userId < 1) {
            return res.status(400).json({ success: false, message: 'Некорректный ID пользователя' });
        }
        if (userId === req.adminId) {
            return res.status(403).json({ success: false, message: 'Нельзя редактировать свою учётную запись из этого списка' });
        }
        const [users] = await db.query(
            `SELECT id, eMail, login, firstName, lastName, familyName, pseudonym, role
             FROM users WHERE id = ? LIMIT 1`,
            [userId]
        );
        if (!users.length) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }
        res.json({ success: true, user: users[0] });
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({ success: false, message: 'Не удалось загрузить пользователя' });
    }
});

router.put('/users/:id', requireAdmin, async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const {
            eMail,
            login,
            password,
            firstName,
            lastName,
            familyName,
            pseudonym,
            role
        } = req.body || {};
        const email = typeof eMail === 'string' ? eMail.trim() : '';
        const userLogin = typeof login === 'string' ? login.trim() : '';

        if (!Number.isInteger(userId) || userId < 1 || !email || !userLogin) {
            return res.status(400).json({ success: false, message: 'Проверьте ID, email и логин' });
        }
        if (userId === req.adminId) {
            return res.status(403).json({ success: false, message: 'Нельзя редактировать свою учётную запись из этого списка' });
        }
        if (email.length > 30 || userLogin.length > 30 ||
            (typeof password === 'string' && password.length > 72) ||
            ['firstName', 'lastName', 'familyName'].some(key => typeof req.body[key] === 'string' && req.body[key].trim().length > 25) ||
            (typeof pseudonym === 'string' && pseudonym.trim().length > 50)) {
            return res.status(400).json({ success: false, message: 'Превышена допустимая длина поля' });
        }
        if (role !== 'user' && role !== 'admin') {
            return res.status(400).json({ success: false, message: 'Некорректная роль пользователя' });
        }
        const [existing] = await db.query(
            'SELECT id FROM users WHERE (login = ? OR eMail = ?) AND id <> ? LIMIT 1',
            [userLogin, email, userId]
        );
        if (existing.length) {
            return res.status(409).json({ success: false, message: 'Такой логин или email уже используется' });
        }

        const [target] = await db.query('SELECT id FROM users WHERE id = ? LIMIT 1', [userId]);
        if (!target.length) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }

        const values = [
            email,
            userLogin,
            typeof firstName === 'string' && firstName.trim() ? firstName.trim() : null,
            typeof lastName === 'string' && lastName.trim() ? lastName.trim() : null,
            typeof familyName === 'string' && familyName.trim() ? familyName.trim() : null,
            typeof pseudonym === 'string' && pseudonym.trim() ? pseudonym.trim() : null,
            role
        ];
        let passwordSql = '';
        if (typeof password === 'string' && password) {
            values.push(await bcrypt.hash(password, 12));
            passwordSql = ', password = ?';
        }

        await db.query(
            `UPDATE users
             SET eMail = ?, login = ?, firstName = ?, lastName = ?, familyName = ?, pseudonym = ?, role = ?${passwordSql}
             WHERE id = ?`,
            [...values, userId]
        );
        res.json({ success: true, message: 'Данные пользователя обновлены' });
    } catch (error) {
        console.error('Ошибка изменения пользователя:', error);
        res.status(500).json({ success: false, message: 'Не удалось изменить пользователя' });
    }
});

router.delete('/users/:id', requireAdmin, async (req, res) => {
    let transaction;
    try {
        const userId = Number(req.params.id);
        if (!Number.isInteger(userId) || userId < 1) {
            return res.status(400).json({ success: false, message: 'Некорректный ID пользователя' });
        }
        if (userId === req.adminId) {
            return res.status(403).json({ success: false, message: 'Нельзя удалить свою учётную запись' });
        }

        const connection = await db.getConnection();
        transaction = connection;
        await connection.beginTransaction();
        const [targets] = await connection.query(
            'SELECT * FROM users WHERE id = ? FOR UPDATE',
            [userId]
        );
        if (!targets.length) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }

        const [userGenres] = await connection.query(
            'SELECT * FROM user_genres WHERE userId = ? FOR UPDATE', [userId]
        );
        const [favorites] = await connection.query(
            'SELECT * FROM favorites WHERE userId = ? FOR UPDATE', [userId]
        );
        const [favoriteAuthors] = await connection.query(
            'SELECT * FROM favorite_authors WHERE userId = ? FOR UPDATE', [userId]
        );
        const [ratings] = await connection.query(
            'SELECT * FROM ratings WHERE userId = ? FOR UPDATE', [userId]
        );
        await saveToTrash(
            connection,
            'user',
            { ...targets[0], authToken: null },
            targets[0].login || targets[0].eMail || `#${userId}`,
            { userGenres, favorites, favoriteAuthors, ratings }
        );
        await connection.query('DELETE FROM favorites WHERE userId = ?', [userId]);
        await connection.query('DELETE FROM favorite_authors WHERE userId = ?', [userId]);
        await connection.query('DELETE FROM ratings WHERE userId = ?', [userId]);
        await connection.query('DELETE FROM user_genres WHERE userId = ?', [userId]);
        await connection.query('DELETE FROM users WHERE id = ?', [userId]);
        await connection.commit();
        res.json({ success: true, message: 'Пользователь удалён' });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Ошибка удаления пользователя:', error);
        res.status(500).json({ success: false, message: 'Не удалось удалить пользователя' });
    } finally {
        if (transaction) transaction.release();
    }
});

router.post('/genres', requireAdmin, async (req, res) => {
    try {
        const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
        if (!name || name.length > 50) {
            return res.status(400).json({ success: false, message: 'Введите название жанра не длиннее 50 символов' });
        }
        const [existing] = await db.query('SELECT id FROM genres WHERE name = ? LIMIT 1', [name]);
        if (existing.length) {
            return res.status(409).json({ success: false, message: 'Такой жанр уже существует' });
        }
        const [result] = await db.query(
            'INSERT INTO genres (name, status) VALUES (?, 1)',
            [name]
        );
        res.status(201).json({ success: true, genreId: result.insertId, message: 'Жанр добавлен' });
    } catch (error) {
        console.error('Ошибка добавления жанра:', error);
        res.status(500).json({ success: false, message: 'Не удалось добавить жанр' });
    }
});

router.get('/genres/:id', requireAdmin, async (req, res) => {
    try {
        const genreId = Number(req.params.id);
        if (!Number.isInteger(genreId) || genreId < 1) {
            return res.status(400).json({ success: false, message: 'Некорректный ID жанра' });
        }
        const [genres] = await db.query(
            'SELECT id, name, status FROM genres WHERE id = ? LIMIT 1',
            [genreId]
        );
        if (!genres.length) {
            return res.status(404).json({ success: false, message: 'Жанр не найден' });
        }
        res.json({ success: true, genre: genres[0] });
    } catch (error) {
        console.error('Ошибка получения жанра:', error);
        res.status(500).json({ success: false, message: 'Не удалось загрузить жанр' });
    }
});

router.put('/genres/:id', requireAdmin, async (req, res) => {
    try {
        const genreId = Number(req.params.id);
        const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
        if (!Number.isInteger(genreId) || genreId < 1 || !name || name.length > 50) {
            return res.status(400).json({ success: false, message: 'Проверьте ID и название жанра' });
        }
        const [existing] = await db.query(
            'SELECT id FROM genres WHERE name = ? AND id <> ? LIMIT 1',
            [name, genreId]
        );
        if (existing.length) {
            return res.status(409).json({ success: false, message: 'Такой жанр уже существует' });
        }
        const [target] = await db.query('SELECT id FROM genres WHERE id = ? LIMIT 1', [genreId]);
        if (!target.length) {
            return res.status(404).json({ success: false, message: 'Жанр не найден' });
        }
        await db.query('UPDATE genres SET name = ? WHERE id = ?', [name, genreId]);
        res.json({ success: true, message: 'Жанр обновлён' });
    } catch (error) {
        console.error('Ошибка изменения жанра:', error);
        res.status(500).json({ success: false, message: 'Не удалось изменить жанр' });
    }
});

router.delete('/genres/:id', requireAdmin, async (req, res) => {
    let transaction;
    try {
        const genreId = Number(req.params.id);
        if (!Number.isInteger(genreId) || genreId < 1) {
            return res.status(400).json({ success: false, message: 'Некорректный ID жанра' });
        }
        const connection = await db.getConnection();
        transaction = connection;
        await connection.beginTransaction();
        const [genres] = await connection.query('SELECT * FROM genres WHERE id = ? FOR UPDATE', [genreId]);
        if (!genres.length) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Жанр не найден' });
        }
        const [references] = await connection.query(
            'SELECT COUNT(*) AS total FROM articles WHERE genreId = ?',
            [genreId]
        );
        if (Number(references[0].total) > 0) {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                message: 'Нельзя удалить жанр: он назначен книгам или статьям. Сначала измените их жанр.'
            });
        }
        const [userGenres] = await connection.query(
            'SELECT * FROM user_genres WHERE genreId = ? FOR UPDATE', [genreId]
        );
        await saveToTrash(connection, 'genre', genres[0], genres[0].name || `#${genreId}`, { userGenres });
        await connection.query('DELETE FROM user_genres WHERE genreId = ?', [genreId]);
        await connection.query('DELETE FROM genres WHERE id = ?', [genreId]);
        await connection.commit();
        res.json({ success: true, message: 'Жанр удалён' });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Ошибка удаления жанра:', error);
        res.status(500).json({ success: false, message: 'Не удалось удалить жанр' });
    } finally {
        if (transaction) transaction.release();
    }
});

function getClassifierConfig(type) {
    if (type === 'bbk') return { table: 'bbk_classifiers', maxCodeLength: 50, label: 'ББК' };
    if (type === 'isbn') return { table: 'isbn_classifiers', maxCodeLength: 32, label: 'ISBN' };
    return null;
}

router.get('/classifiers/:type', requireAdmin, async (req, res) => {
    const config = getClassifierConfig(req.params.type);
    if (!config) return res.status(404).json({ success: false, message: 'Неизвестный классификатор.' });
    try {
        const [records] = await db.query(
            `SELECT id, code, title FROM ${config.table} ORDER BY code, title`
        );
        res.json({ success: true, records });
    } catch (error) {
        console.error('Classifier list error:', error);
        res.status(500).json({ success: false, message: 'Не удалось загрузить классификатор.' });
    }
});

router.post('/classifiers/:type', requireAdmin, async (req, res) => {
    const config = getClassifierConfig(req.params.type);
    if (!config) return res.status(404).json({ success: false, message: 'Неизвестный классификатор.' });
    const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    if (!code || !title || code.length > config.maxCodeLength || title.length > 255) {
        return res.status(400).json({ success: false, message: 'Укажите код и название допустимой длины.' });
    }
    try {
        const [result] = await db.query(
            `INSERT INTO ${config.table} (code, title) VALUES (?, ?)`, [code, title]
        );
        res.status(201).json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Classifier create error:', error);
        res.status(500).json({ success: false, message: 'Не удалось добавить запись классификатора.' });
    }
});

router.get('/classifiers/:type/:id', requireAdmin, async (req, res) => {
    const config = getClassifierConfig(req.params.type);
    const id = Number(req.params.id);
    if (!config) return res.status(404).json({ success: false, message: 'Неизвестный классификатор.' });
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ success: false, message: 'Некорректный ID.' });
    try {
        const [records] = await db.query(`SELECT id, code, title FROM ${config.table} WHERE id = ? LIMIT 1`, [id]);
        if (!records.length) return res.status(404).json({ success: false, message: 'Запись не найдена.' });
        res.json({ success: true, record: records[0] });
    } catch (error) {
        console.error('Classifier lookup error:', error);
        res.status(500).json({ success: false, message: 'Не удалось загрузить запись.' });
    }
});

router.put('/classifiers/:type/:id', requireAdmin, async (req, res) => {
    const config = getClassifierConfig(req.params.type);
    const id = Number(req.params.id);
    const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    if (!config) return res.status(404).json({ success: false, message: 'Неизвестный классификатор.' });
    if (!Number.isInteger(id) || id < 1 || !code || !title || code.length > config.maxCodeLength || title.length > 255) {
        return res.status(400).json({ success: false, message: 'Проверьте ID, код и название.' });
    }
    try {
        const [result] = await db.query(
            `UPDATE ${config.table} SET code = ?, title = ? WHERE id = ?`, [code, title, id]
        );
        if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Запись не найдена.' });
        res.json({ success: true });
    } catch (error) {
        console.error('Classifier update error:', error);
        res.status(500).json({ success: false, message: 'Не удалось изменить запись.' });
    }
});

router.delete('/classifiers/:type/:id', requireAdmin, async (req, res) => {
    const config = getClassifierConfig(req.params.type);
    const id = Number(req.params.id);
    if (!config) return res.status(404).json({ success: false, message: 'Неизвестный классификатор.' });
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ success: false, message: 'Некорректный ID.' });
    let transaction;
    try {
        transaction = await db.getConnection();
        await transaction.beginTransaction();
        const [records] = await transaction.query(`SELECT * FROM ${config.table} WHERE id = ? FOR UPDATE`, [id]);
        if (!records.length) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Запись не найдена.' });
        }
        await saveToTrash(transaction, 'classifier', records[0], `${config.label}: ${records[0].code} ${records[0].title}`, { classifierType: req.params.type });
        await transaction.query(`DELETE FROM ${config.table} WHERE id = ?`, [id]);
        await transaction.commit();
        res.json({ success: true });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Classifier delete error:', error);
        res.status(500).json({ success: false, message: 'Не удалось удалить запись.' });
    } finally {
        if (transaction) transaction.release();
    }
});

module.exports = router;
