const express = require('express');
const router = express.Router();
const db = require('../db/db');

function getAuthToken(req) {
    const cookies = req.headers.cookie;
    if (!cookies) {
        return null;
    }

    const tokenCookie = cookies
        .split(';')
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith('authToken='));

    if (!tokenCookie) {
        return null;
    }

    return decodeURIComponent(
        tokenCookie.substring('authToken='.length)
    );
}

async function getUserByToken(authToken) {
    const [users] = await db.query(
        `SELECT
            id,
            eMail,
            login,
            firstName,
            lastName,
            familyName,
            birthDate,
            mobilePhone,
            pseudonym,
            profilePhoto
         FROM users
         WHERE authToken = ?
         LIMIT 1`,
        [authToken]
    );

    if (users.length === 0) {
        return null;
    }

    const user = users[0];
    const [userGenres] = await db.query(
        `SELECT g.id, g.name
         FROM user_genres ug
         JOIN genres g ON g.id = ug.genreId
         WHERE ug.userId = ?
         ORDER BY g.name`,
        [user.id]
    );

    return {
        id: user.id,
        eMail: user.eMail,
        login: user.login,
        firstName: user.firstName,
        lastName: user.lastName,
        familyName: user.familyName,
        birthDate: user.birthDate,
        mobilePhone: user.mobilePhone,
        pseudonym: user.pseudonym,
        profilePhoto: user.profilePhoto,
        genreIds: userGenres.map(genre => genre.id),
        genres: userGenres.map(genre => genre.name)
    };
}

router.get('/me', async (req, res) => {
    try {
        const authToken = getAuthToken(req);

        if (!authToken) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не авторизован'
            });
        }

        const user = await getUserByToken(authToken);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Ошибка получения профиля:', error);

        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
});

router.get('/genres', async (req, res) => {
    try {
        const [genres] = await db.query('SELECT id, name FROM genres ORDER BY name');
        res.json({ success: true, genres });
    } catch (error) {
        console.error('Ошибка получения жанров:', error);
        res.status(500).json({ success: false, message: 'Не удалось загрузить жанры' });
    }
});

router.put('/update', async (req, res) => {
    try {
        const authToken = getAuthToken(req);

        if (!authToken) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не авторизован'
            });
        }

        const user = await getUserByToken(authToken);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        const {
            firstName,
            lastName,
            familyName,
            birthDate,
            mobilePhone,
            pseudonym,
            eMail,
            genreIds: submittedGenreIds
        } = req.body || {};
        const rawGenreIds = Array.isArray(submittedGenreIds)
            ? submittedGenreIds
            : submittedGenreIds == null ? [] : [submittedGenreIds];
        const genreIds = [...new Set(rawGenreIds.map(Number).filter(id => Number.isInteger(id) && id > 0))];

        if (genreIds.length !== rawGenreIds.length) {
            return res.status(400).json({ success: false, message: 'Некорректный список жанров' });
        }
        if (genreIds.length) {
            const placeholders = genreIds.map(() => '?').join(', ');
            const [genres] = await db.query(
                `SELECT id FROM genres WHERE id IN (${placeholders})`,
                genreIds
            );
            if (genres.length !== genreIds.length) {
                return res.status(400).json({ success: false, message: 'Выбран неизвестный жанр' });
            }
        }

        if (eMail && eMail !== user.eMail) {
            const [emailUsers] = await db.query(
                `SELECT id
                 FROM users
                 WHERE eMail = ? AND id <> ?
                 LIMIT 1`,
                [eMail, user.id]
            );

            if (emailUsers.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Этот email уже используется другим пользователем'
                });
            }
        }
        await db.query(
            `UPDATE users
             SET
                firstName = ?,
                lastName = ?,
                familyName = ?,
                birthDate = ?,
                mobilePhone = ?,
                pseudonym = ?,
                eMail = ?
             WHERE id = ?`,
            [
                firstName || null,
                lastName || null,
                familyName || null,
                birthDate || null,
                mobilePhone || null,
                pseudonym || null,
                eMail || null,
                user.id
            ]
        );

        await db.query('DELETE FROM user_genres WHERE userId = ?', [user.id]);
        for (const genreId of genreIds) {
            await db.query(
                'INSERT INTO user_genres (userId, genreId) VALUES (?, ?)',
                [user.id, genreId]
            );
        }

        const updatedUser = await getUserByToken(authToken);

        res.json({
            success: true,
            message: 'Профиль успешно обновлён',
            user: updatedUser
        });
    } catch (error) {
        console.error('Ошибка обновления профиля:', error);

        res.status(500).json({
            success: false,
            message: 'Не удалось обновить профиль'
        });
    }
});

router.post('/photo', async (req, res) => {
    try {
        const authToken = getAuthToken(req);

        if (!authToken) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не авторизован'
            });
        }

        const user = await getUserByToken(authToken);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Фотография не выбрана'
            });
        }

        const fileName = req.file.filename;

        await db.query(
            `UPDATE users
             SET profilePhoto = ?
             WHERE id = ?`,
            [fileName, user.id]
        );

        const updatedUser = await getUserByToken(authToken);

        res.json({
            success: true,
            message: 'Фото профиля успешно изменено',
            user: updatedUser
        });
    } catch (error) {
        console.error('Ошибка загрузки фото:', error);

        res.status(500).json({
            success: false,
            message: 'Не удалось загрузить фото'
        });
    }
});

module.exports = router;
