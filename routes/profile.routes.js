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
            cityId,
            address,
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
    let cityTitle = null;

    if (user.cityId) {
        const [cities] = await db.query(
            `SELECT title
             FROM cities
             WHERE id = ?
             LIMIT 1`,
            [user.cityId]
        );

        if (cities.length > 0) {
            cityTitle = cities[0].title;
        }
    }

    return {
        id: user.id,
        eMail: user.eMail,
        login: user.login,
        firstName: user.firstName,
        lastName: user.lastName,
        familyName: user.familyName,
        birthDate: user.birthDate,
        mobilePhone: user.mobilePhone,
        cityId: user.cityId,
        city: cityTitle,
        address: user.address,
        pseudonym: user.pseudonym,
        profilePhoto: user.profilePhoto
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

router.get('/cities', async (req, res) => {
    try {
        const [cities] = await db.query(
            `SELECT id, title
             FROM cities
             WHERE typeOf = 3
             ORDER BY title`
        );

        res.json({
            success: true,
            cities
        });
    } catch (error) {
        console.error('Ошибка получения городов:', error);

        res.status(500).json({
            success: false,
            message: 'Не удалось загрузить города'
        });
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
            cityId,
            address,
            pseudonym,
            eMail
        } = req.body || {};

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

        if (cityId) {
            const [cities] = await db.query(
                `SELECT id
                 FROM cities
                 WHERE id = ? AND typeOf = 3
                 LIMIT 1`,
                [cityId]
            );

            if (cities.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Выбранный город не найден'
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
                cityId = ?,
                address = ?,
                pseudonym = ?,
                eMail = ?
             WHERE id = ?`,
            [
                firstName || null,
                lastName || null,
                familyName || null,
                birthDate || null,
                mobilePhone || null,
                cityId || null,
                address || null,
                pseudonym || null,
                eMail || null,
                user.id
            ]
        );

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