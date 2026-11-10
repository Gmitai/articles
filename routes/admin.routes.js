const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const db = require('../db/db');

const router = express.Router();

function getAuthToken(req) {
    const cookie = req.headers.cookie
        ?.split(';')
        .map(value => value.trim())
        .find(value => value.startsWith('authToken='));
    return cookie ? decodeURIComponent(cookie.slice('authToken='.length)) : null;
}

async function requireAdmin(req, res, next) {
    try {
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
            'SELECT id, filePath, coverPath FROM articles WHERE id = ? FOR UPDATE',
            [articleId]
        );
        if (!articles.length) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Запись не найдена.' });
        }

        await connection.query('DELETE FROM article_authors WHERE id_article = ?', [articleId]);
        await connection.query('DELETE FROM articles WHERE id = ?', [articleId]);
        await connection.commit();
        await removeUnusedArticleFiles([articles[0].filePath, articles[0].coverPath]).catch(error => {
            console.error('Could not clean up article files:', error);
        });
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
        const [authors] = await connection.query('SELECT id FROM authors WHERE id = ? FOR UPDATE', [authorId]);
        if (!authors.length) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Автор не найден.' });
        }

        await connection.query('DELETE FROM article_authors WHERE id_author = ?', [authorId]);
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
        const [publishers] = await connection.query('SELECT id FROM publishers WHERE id = ? FOR UPDATE', [publisherId]);
        if (!publishers.length) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Издательство не найдено.' });
        }

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
            'SELECT id FROM directions WHERE id = ? FOR UPDATE',
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
            'SELECT id FROM users WHERE id = ? FOR UPDATE',
            [userId]
        );
        if (!targets.length) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }

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
        const [genres] = await connection.query('SELECT id FROM genres WHERE id = ? FOR UPDATE', [genreId]);
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

module.exports = router;
