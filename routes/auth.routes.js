const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const connection = require('../db/db');

const router = express.Router();

const TOKEN_COOKIE = 'authToken';

async function hashPassword(password) {
    return bcrypt.hash(password, 12);
}

async function verifyPassword(password, storedPassword) {
    if (typeof storedPassword !== 'string' || !storedPassword) {
        return { valid: false, needsRehash: false };
    }

    // bcrypt hashes are used for new passwords. Keep recognition for existing
    // bcrypt hashes too, so deployments that already used bcrypt remain valid.
    if (/^\$2[aby]\$\d{2}\$/.test(storedPassword)) {
        try {
            return {
                valid: await bcrypt.compare(password, storedPassword),
                needsRehash: false
            };
        } catch (error) {
            return { valid: false, needsRehash: false };
        }
    }

    if (storedPassword.includes(':')) {
        const separator = storedPassword.indexOf(':');
        const salt = storedPassword.slice(0, separator);
        const storedHash = storedPassword.slice(separator + 1);

        try {
            const expected = Buffer.from(storedHash, 'hex');
            const actual = crypto.scryptSync(password, salt, expected.length);

            return {
                valid: expected.length > 0 && crypto.timingSafeEqual(actual, expected),
                needsRehash: true
            };
        } catch (error) {
            return { valid: false, needsRehash: false };
        }
    }

    // Legacy plaintext passwords are accepted once, then upgraded after login.
    return {
        valid: password === storedPassword,
        needsRehash: true
    };
}

function createAuthToken() {
    return crypto.randomBytes(32).toString('hex');
}

function normalizeGenreIds(value) {
    const values = Array.isArray(value) ? value : value == null ? [] : [value];
    return [...new Set(values.map(Number).filter(id => Number.isInteger(id) && id > 0))];
}

async function saveUserGenres(userId, genreIds) {
    if (genreIds.length) {
        const placeholders = genreIds.map(() => '?').join(', ');
        const [genres] = await connection.execute(
            `SELECT id FROM genres WHERE id IN (${placeholders})`,
            genreIds
        );
        if (genres.length !== genreIds.length) return false;
    }

    for (const genreId of genreIds) {
        await connection.execute(
            'INSERT INTO user_genres (userId, genreId) VALUES (?, ?)',
            [userId, genreId]
        );
    }
    return true;
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
            pseudonym,
            genreIds: submittedGenreIds
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

        const hashedPassword = await hashPassword(password);
        const authToken = createAuthToken();
        const genreIds = normalizeGenreIds(submittedGenreIds);

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
                 pseudonym,
                 profilePhoto,
                 authToken
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                eMail,
                login,
                hashedPassword,
                firstName || null,
                lastName || null,
                familyName || null,
                birthDate || null,
                mobilePhone || null,
                pseudonym || null,
                profilePhoto,
                authToken
            ]
        );

        if (!(await saveUserGenres(result.insertId, genreIds))) {
            await connection.execute('DELETE FROM user_genres WHERE userId = ?', [result.insertId]);
            await connection.execute('DELETE FROM users WHERE id = ?', [result.insertId]);
            return res.status(400).json({
                success: false,
                message: 'Выбран один или несколько неизвестных жанров'
            });
        }

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

        const passwordCheck = await verifyPassword(
            password,
            user.password
        );

        if (!passwordCheck.valid) {
            return res.status(401).json({
                success: false,
                needRegister: false,
                message: 'Неверный пароль'
            });
        }

        const authToken = createAuthToken();

        if (passwordCheck.needsRehash) {
            const upgradedPassword = await hashPassword(password);
            await connection.execute(
                `UPDATE users
                 SET password = ?
                 WHERE id = ?`,
                [upgradedPassword, user.id]
            );
        }

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

router.get('/auth/genres', async (req, res) => {
    try {
        const [genres] = await connection.execute(
            'SELECT id, name FROM genres ORDER BY name'
        );
        res.json(genres);
    } catch (error) {
        console.error('Ошибка загрузки жанров:', error);
        res.status(500).json({ message: 'Не удалось загрузить жанры' });
    }
});

module.exports = router;
