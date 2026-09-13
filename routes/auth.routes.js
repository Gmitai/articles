const express = require('express');
const crypto = require('crypto');
const connection = require('../db/db');

const router = express.Router();

const TOKEN_COOKIE = 'authToken';

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');

    const hash = crypto
        .scryptSync(password, salt, 64)
        .toString('hex');

    return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
    if (!storedPassword) return false;

    if (storedPassword.includes(':')) {
        const [salt, storedHash] = storedPassword.split(':');

        try {
            const hash = crypto
                .scryptSync(password, salt, 64)
                .toString('hex');

            return crypto.timingSafeEqual(
                Buffer.from(hash, 'hex'),
                Buffer.from(storedHash, 'hex')
            );
        } catch (error) {
            return false;
        }
    }

    return password === storedPassword;
}

function createAuthToken() {
    return crypto.randomBytes(32).toString('hex');
}

router.get('/', (req, res) => {
    res.sendFile(
        require('path').join(__dirname, '..', 'Public', 'user-index.html')
    );
});

router.get('/auth/me', async (req, res) => {
    try {
        const token = req.headers.cookie
            ?.split(';')
            .map(item => item.trim())
            .find(item => item.startsWith(`${TOKEN_COOKIE}=`))
            ?.split('=')[1];

        if (!token) {
            return res.json({
                loggedIn: false
            });
        }

        const [rows] = await connection.execute(
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
                 profilePhoto,
                 createdAt,
                 role
             FROM users
             WHERE authToken = ?`,
            [token]
        );

        if (rows.length === 0) {
            return res.json({
                loggedIn: false
            });
        }

        res.json({
            loggedIn: true,
            user: rows[0]
        });

    } catch (error) {
        console.error('Ошибка /auth/me:', error);

        res.status(500).json({
            error: 'Ошибка сервера'
        });
    }
});

router.post('/auth/register', async (req, res) => {
    try {
        const {
            eMail,
            login,
            password,
            firstName,
            lastName,
            familyName,
            birthDate,
            mobilePhone,
            cityId,
            address,
            pseudonym
        } = req.body;

        if (!eMail || !login || !password) {
            return res.status(400).json({
                success: false,
                message: 'Заполните email, логин и пароль'
            });
        }

        const [existingUsers] = await connection.execute(
            `SELECT id, login, eMail
             FROM users
             WHERE login = ? OR eMail = ?`,
            [login, eMail]
        );

        if (existingUsers.length > 0) {
            const loginExists = existingUsers.some(
                user => user.login === login
            );

            const emailExists = existingUsers.some(
                user => user.eMail === eMail
            );

            if (loginExists && emailExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Пользователь с таким логином и email уже существует'
                });
            }

            if (loginExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Пользователь с таким логином уже существует'
                });
            }

            if (emailExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Пользователь с таким email уже существует'
                });
            }
        }

        const hashedPassword = hashPassword(password);
        const authToken = createAuthToken();

        const profilePhoto = req.file
            ? req.file.filename
            : null;

        const [result] = await connection.execute(
            `INSERT INTO users
             (
                 eMail,
                 login,
                 password,
                 firstName,
                 lastName,
                 familyName,
                 birthDate,
                 mobilePhone,
                 cityId,
                 address,
                 pseudonym,
                 profilePhoto,
                 authToken
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                eMail,
                login,
                hashedPassword,
                firstName || null,
                lastName || null,
                familyName || null,
                birthDate || null,
                mobilePhone || null,
                cityId || null,
                address || null,
                pseudonym || null,
                profilePhoto,
                authToken
            ]
        );

        res.cookie(TOKEN_COOKIE, authToken, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            success: true,
            message: 'Регистрация успешно завершена',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Ошибка регистрации:', error);

        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при регистрации'
        });
    }
});

router.post('/auth/login', async (req, res) => {
    try {
        const {
            login,
            password
        } = req.body;

        if (!login || !password) {
            return res.status(400).json({
                success: false,
                message: 'Введите логин и пароль'
            });
        }

        const [rows] = await connection.execute(
            `SELECT *
             FROM users
             WHERE login = ?
                 LIMIT 1`,
            [login]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                needRegister: true,
                message: 'Пользователь с таким логином не найден. Зарегистрироваться?'
            });
        }

        const user = rows[0];

        const passwordCorrect = verifyPassword(
            password,
            user.password
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                success: false,
                needRegister: false,
                message: 'Неверный пароль'
            });
        }

        const authToken = createAuthToken();

        await connection.execute(
            `UPDATE users
             SET authToken = ?
             WHERE id = ?`,
            [authToken, user.id]
        );

        res.cookie(TOKEN_COOKIE, authToken, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: 'Вход выполнен успешно',
            user: {
                id: user.id,
                login: user.login,
                eMail: user.eMail,
                firstName: user.firstName,
                lastName: user.lastName,
                familyName: user.familyName,
                profilePhoto: user.profilePhoto,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Ошибка входа:', error);

        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при входе'
        });
    }
});

router.post('/auth/logout', async (req, res) => {
    try {
        const token = req.headers.cookie
            ?.split(';')
            .map(item => item.trim())
            .find(item => item.startsWith(`${TOKEN_COOKIE}=`))
            ?.split('=')[1];

        if (token) {
            await connection.execute(
                `UPDATE users
                 SET authToken = NULL
                 WHERE authToken = ?`,
                [token]
            );
        }

        res.clearCookie(TOKEN_COOKIE);

        res.json({
            success: true,
            message: 'Вы вышли из аккаунта'
        });

    } catch (error) {
        console.error('Ошибка выхода:', error);

        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
});

router.get('/auth/cities', async (req, res) => {
    try {
        const [rows] = await connection.execute(
            `SELECT id, title
             FROM cities
             WHERE typeOf = 1`
        );

        res.json(rows);

    } catch (error) {
        console.error('Ошибка загрузки городов:', error);

        res.status(500).json({
            error: 'Ошибка загрузки городов'
        });
    }
});

module.exports = router;