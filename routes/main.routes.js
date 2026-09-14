const express = require('express');
const router = express.Router();
const urlencodedParser = express.urlencoded({extended: false});
const {extname} = require("node:path");
const fs = require('fs');
const path = require("path");
const connection = require('../db/db');
const multer = require("multer");

const articleStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniSufix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = extname(file.originalname).toLowerCase();

        if (file.fieldname === 'coverImage') {
            cb(null, 'cover-' + uniSufix + extension);
            return;
        }

        const originalName = path.parse(file.originalname).name;

        cb(null, originalName + '-' + uniSufix + extension);
    }
});

const articleUpload = multer({
    storage: articleStorage,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
}).fields([
    {
        name: 'fileData',
        maxCount: 1
    },
    {
        name: 'coverImage',
        maxCount: 1
    }
]);

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../uploads');
    },
    filename:(req, file, cb) => {
        const uniSufix=Date.now()+'-'+Math.round(Math.random()*1E9);
        cb(null, file.originalname.substring(0, file.originalname.length-4)+'-'+uniSufix+extname(file.originalname));
    }
});

let selected_menuId = 0;

router.use(express.json());
router.use(express.static(path.join(__dirname, '..', 'Public')));
router.use(express.static(path.join(__dirname, '..', 'js')))
router.use(express.static(path.join(__dirname, '..', 'css')))
router.use(express.static(path.join(__dirname, '..', 'icons')))
router.use(express.static(path.join(__dirname, '..', 'uploads')))

router.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../Public/index.html'));
});

//статьи
router.get('/articles', async (req, res) => {
    const [result] = await connection.execute("SELECT a.id, a.title_tj AS 'Название', CONCAT(d.udc,' ', d.title_ru) AS 'Направление (УДК)', p.title_tj AS 'Издательство', DATE_FORMAT(a.publishYear, '%d.%m.%Y') AS 'Год издания', IF(a.typeOf=1, 'Статья', 'Книга') AS 'Тип' FROM articles a LEFT JOIN directions d ON a.directionId=d.id LEFT JOIN genres g ON a.genreId=g.id LEFT JOIN publishers p  ON a.publisherId=p.id WHERE a.typeOf=1");

    try {
        selected_menuId = 0;
        flgBook = 1;
        let subresult;
        [subresult] = await connection.execute("SELECT a.id AS id, CONCAT(ath.lastName,' ', ath.firstName, ' ', IFNULL(ath.familyName, '')) AS author FROM articles a JOIN article_authors au JOIN authors ath ON au.id_article=a.id AND au.id_author=ath.id");

        subresult.forEach(item => {
            const indx = result.findIndex(v => v.id === item.id)
            if (indx > -1) {
                if (!('Автор' in result[indx])) {
                    result[indx] = Object.assign(result[indx], {"Автор": item.author});
                } else {
                    result[indx]['Автор'] += ', ' + item.author;
                }
            }
        });

        res.send([result, selected_menuId]);
    } catch (err) {
        console.log(err);
    }

});

//книги
router.get('/books', async (req, res) => {
    const [result] = await connection.execute("SELECT a.id, a.title_tj AS 'Название', CONCAT(d.udc, ' ', d.title_ru) AS 'Направление (УДК)', p.title_tj AS 'Издательство', DATE_FORMAT(a.publishYear, '%d.%m.%Y') AS 'Год издания' FROM articles a LEFT JOIN directions d ON a.directionId=d.id LEFT JOIN genres g ON a.genreId=g.id LEFT JOIN publishers p  ON a.publisherId=p.id WHERE a.typeOf=0");
    try {
        selected_menuId = 0;
        flgBook = 0;
        let subresult;
        [subresult] = await connection.execute("SELECT a.id AS id, CONCAT(ath.lastName,' ', ath.firstName, ' ', IFNULL(ath.familyName, '')) AS author FROM articles a JOIN article_authors au JOIN authors ath ON au.id_article=a.id AND au.id_author=ath.id");

        subresult.forEach(item => {
            const indx = result.findIndex(v => v.id === item.id)
            if (indx > -1) {
                if (!('Автор' in result[indx])) {
                    result[indx] = Object.assign(result[indx], {"Автор": item.author});
                } else {
                    result[indx]['Автор'] += ', ' + item.author;
                }
            }
        });

        res.send([result, selected_menuId]);

    } catch (err) {
        console.log(err);
    }
});

//авторы
router.get('/authors', async (req, res) => {
    const [result] = await connection.execute("SELECT a.id, CONCAT(a.lastName,' ', a.firstName, ' ', IFNULL(a.familyName, '')) AS 'ФИО', DATE_FORMAT(a.birthDate, '%d.%m.%Y') AS 'Дата рождения', c.title AS 'Город', a.address AS 'Адрес' FROM authors a LEFT JOIN cities c ON a.cityId=c.id");
    try {
        selected_menuId = 1;
        res.send([result, selected_menuId]);
    } catch (err) {
        console.log(err);
    }
});

//издательства
router.get('/publishers', async (req, res) => {
    const [result] = await connection.execute("SELECT p.id, p.title_tj as 'Название издательства', c.title as 'Город', address as 'Адрес' from publishers p left join cities c on p.cityId=c.id");
    try {
        selected_menuId=2;
        res.send([result, selected_menuId]);
    }
    catch (err) {
        console.log(err);
    }
});

//Классификаторы
router.get('/directions', async (req, res) => {
    const [result] = await connection.execute("SELECT title_ru as 'Направление', udc as 'УДК' FROM directions order by udc");
    try {
        selected_menuId=4;
        res.send([result, selected_menuId]);
    }
    catch (err) {
        console.log(err);
    }
});

//Жанр
router.get('/genres', async (req, res) => {
    const [result] = await connection.execute("SELECT `name` AS 'Жанр' FROM genres");
    try {
        selected_menuId=5;
        res.send([result, selected_menuId]);
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/users', async (req, res) => {
    const [result] = await connection.execute("SELECT u.id, CONCAT(u.lastName,' ', u.firstName, ' ', IFNULL(u.familyName, '')) AS 'ФИО', u.login AS 'Логин', u.eMail AS 'Эл-почта', u.mobilePhone AS 'Номер телефона', DATE_FORMAT(u.birthDate, '%d.%m.%Y') AS 'Дата рождения', c.title AS 'Город', u.address AS 'Адрес', u.pseudonym AS 'Псевдоним', DATE_FORMAT(u.createdAt, '%d.%m.%Y') AS 'Дата регистрации' FROM users u left join cities c on u.cityId=c.id");
    try{
        selected_menuId=6;
        res.send([result, selected_menuId]);
    }
    catch (err) {
        console.log(err);
    }
})

//------------download-----------

router.get('/articleFileName/:id', async (req, res) => {
    const articleId = req.params.id;
    const [result] = await connection.execute(`SELECT filePath FROM articles WHERE id = ${articleId}`);
    try {

        res.send(result);
    }

    catch (err) {
        console.log(err);
    }
});

router.get('/download/:filename' , (req, res) => {
    const fileName = req.params.filename;
    const filepath = path.join(__dirname, '..', 'uploads', fileName);
    res.set('Content-Disposition', 'attachment; filename=' + fileName);
    res.set('Content-Type', 'application/octet-stream');


    if (!fs.existsSync(filepath)){
        return res.status(404).json({ error: 'Файл не найден' });
        console.log(filepath +'не найден');
    }

    res.download(filepath,"myfile.pdf", (err) => {
        if (err) {
            res.status(500).send('Ошибка скачивания');
        }
    });
});

//-----------POST------------

router.post('/addArticle', urlencodedParser, async (req, res) => {
    const title = req.body.aricleName;
    const pageCount = req.body.pCount;
    const publishDate = req.body.publishYear;
    const direction = req.body.selDirect;
    const publisher = req.body.selPublisher;
    const authors = req.body.authors;

    try {
        const [result] = await connection.query(
            "SELECT * FROM articles WHERE title_tj = ? AND pagesCount = ?",
            [title, pageCount]
        );

        if (result.length > 0) {
            return res.send("Такая статья уже существует в БМ!");
        }

        const files = Array.isArray(req.files) ? req.files : [];

        const filedata = files.find(file => file.fieldname === 'fileData');
        const coverdata = files.find(file => file.fieldname === 'coverImage');

        if (!filedata) {
            return res.send("Ошибка при загрузке файла");
        }

        if (coverdata) {
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/webp'
            ];

            if (!allowedTypes.includes(coverdata.mimetype)) {
                return res.send("Неверный формат обложки");
            }
        }

        const sql = `
            INSERT INTO articles
            (title_tj, pagesCount, publishYear, directionId, publisherId, typeOf, filePath, coverPath)
            VALUES (?,?,?,?,?,?,?,?)
        `;

        const [insertResult] = await connection.query(sql, [
            title,
            pageCount,
            publishDate,
            direction || null,
            publisher || null,
            flgBook,
            filedata.filename,
            coverdata ? coverdata.filename : null
        ]);

        const articleId = insertResult.insertId;

        if (Array.isArray(authors)) {
            for (const author of authors) {
                await connection.query(
                    "INSERT INTO article_authors (id_article, id_author) VALUES (?,?)",
                    [articleId, author]
                );
            }
        } else if (authors) {
            await connection.query(
                "INSERT INTO article_authors (id_article, id_author) VALUES (?,?)",
                [articleId, authors]
            );
        }

        return res.sendFile(
            path.join(__dirname, '..', 'Public', 'addArticle.html')
        );

    } catch (err) {
        console.log(err);
        return res.status(500).send("Server error");
    }
});

router.post('/updateArticle', urlencodedParser, async (req, res) => {
    const id = req.body.rowId;
    const title = req.body.aricleName;
    const pageCount = req.body.pCount;
    const publishDate = req.body.publishYear;
    const direction = req.body.selDirect;
    const publisher = req.body.selPublisher;
    const authors = req.body.authors;

    try {
        const files = Array.isArray(req.files) ? req.files : [];

        const filedata = files.find(file => file.fieldname === 'fileData');
        const coverdata = files.find(file => file.fieldname === 'coverImage');

        const [oldArticle] = await connection.query(
            "SELECT filePath, coverPath FROM articles WHERE id = ?",
            [id]
        );

        if (oldArticle.length === 0) {
            return res.status(404).send("Статья не найдена!");
        }

        let sql = `
            UPDATE articles
            SET title_tj=?,
                pagesCount=?,
                publishYear=?,
                directionId=?,
                publisherId=?,
                typeOf=?
        `;

        const sqlparams = [
            title,
            pageCount,
            publishDate,
            direction || null,
            publisher || null,
            flgBook
        ];

        if (filedata) {
            sql += `, filePath=?`;
            sqlparams.push(filedata.filename);
        }

        if (coverdata) {
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/webp'
            ];

            if (!allowedTypes.includes(coverdata.mimetype)) {
                return res.send("Неверный формат обложки");
            }

            sql += `, coverPath=?`;
            sqlparams.push(coverdata.filename);
        }

        sql += ` WHERE id=?`;
        sqlparams.push(id);

        await connection.query(sql, sqlparams);

        if (coverdata && oldArticle[0].coverPath) {
            const oldCoverPath = path.join(
                __dirname,
                '..',
                'uploads',
                oldArticle[0].coverPath
            );

            if (fs.existsSync(oldCoverPath)) {
                fs.unlink(oldCoverPath, err => {
                    if (err) {
                        console.log("Ошибка удаления старой обложки:", err);
                    }
                });
            }
        }

        await connection.query(
            "DELETE FROM article_authors WHERE id_article=?",
            [id]
        );

        if (Array.isArray(authors)) {
            for (const author of authors) {
                await connection.query(
                    "INSERT INTO article_authors (id_article, id_author) VALUES (?,?)",
                    [id, author]
                );
            }
        } else if (authors) {
            await connection.query(
                "INSERT INTO article_authors (id_article, id_author) VALUES (?,?)",
                [id, authors]
            );
        }

        return res.send("Статья успешно обновлена!");

    } catch (err) {
        console.log(err);
        return res.status(500).send("Server error");
    }
});

router.post('/updateAuthor', express.json(), async (req, res) => {
    const {
        rowId,
        lastName,
        firstName,
        familyName,
        birthDate,
        phone,
        cityId,
        address
    } = req.body;

    try {

        const sql = `UPDATE authors SET lastName=?, firstName=?, familyName=?, birthDate=?, mobilePhone=?, cityId=?, address=? WHERE id=?`;

        const [result] = await connection.query(sql, [
            lastName,
            firstName,
            familyName,
            birthDate || null,
            phone || null,
            cityId || null,
            address || null,
            rowId
        ]);

        return res.json({
            message: "Автор успешно обновлен!"
        });

    } catch (err) {
        console.log("UPDATE AUTHOR ERROR:", err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
});

router.post('/addAuthor', urlencodedParser, async (req, res) => {
    const fullName = req.body.authorsName.split(' ');
    const birthDate=req.body.birthDate;
    const phoneNumber=req.body.phoneNum;
    const selCity=req.body.selCity;
    const address=req.body.address;
    const lastName=fullName[0].charAt(0).toUpperCase() + fullName[0].substring(1).toLowerCase();
    const firstName=fullName[1].charAt(0).toUpperCase() + fullName[1].substring(1).toLowerCase();
    let familyName=null;
    if (fullName.length>2) {
        familyName=fullName[2].charAt(0).toUpperCase() + fullName[2].substring(1).toLowerCase();
    }

    const [result] = await connection.query(`SELECT * FROM authors WHERE firstName = '${firstName}' AND lastName='${lastName}'`);
    try{
        if(result.length > 0){
            res.sendFile(path.join(__dirname, '..', 'Public', 'addAuthors.html'));
        }
        else {
            const sql="Insert into authors (firstName, lastName, familyName, birthDate, mobilePhone, cityId, address) VALUES (?,?,?,?,?,?,?)";
            connection.query(sql, [firstName, lastName, familyName, birthDate, phoneNumber, selCity, address], (err, result) => {
                if (err) {console.log(err)}
            });
            res.sendFile(path.join(__dirname, '..', 'Public', 'addAuthors.html'));
        }
    }catch (err) {
        console.log(err);
        return res.status(500).send("Server error");
    }
})

router.post('/addPublisher', urlencodedParser, async (req, res) => {
    const publisher = req.body.publisherName;
    const selCity=req.body.selCity;
    const address=req.body.address;
    const [result] = await connection.query(`SELECT * FROM publishers WHERE title_tj = '${publisher}' AND cityId='${selCity}'`);
    try{
        if(result.length > 0){
            res.send("Такое издательство уже существует в БМ!");
            res.sendFile(path.join(__dirname, '..', 'Public', 'addPublisher.html'));
        }
        else {
            const sql="Insert into publishers (title_tj, cityId, address) VALUES (?,?,?)";
            connection.query(sql, [publisher, selCity, address], (err, result) => {
                if (err) {console.log(err)}
            });
            res.sendFile(path.join(__dirname, '..', 'Public', 'addPublisher.html'));
        }
    }catch (err) {
        console.log(err);
        return res.status(500).send("Server error");
    }
})

router.get('/userCatalog', async (req, res) => {
    try {
        const [rows] = await connection.execute(`
            SELECT
                a.id,
                a.title_tj AS title,
                a.pagesCount,
                a.publishYear,
                a.typeOf,
                a.filePath,
                CONCAT(IFNULL(d.udc, ''), ' ', IFNULL(d.title_ru, '')) AS udc,
                IFNULL(g.name, '') AS genre,
                IFNULL(p.title_tj, '') AS publisher,
                GROUP_CONCAT(
                    DISTINCT CONCAT(
                        ath.lastName, ' ',
                        ath.firstName, ' ',
                        IFNULL(ath.familyName, '')
                    )
                    SEPARATOR ', '
                ) AS authors
            FROM articles a
            LEFT JOIN directions d ON a.directionId = d.id
            LEFT JOIN genres g ON a.genreId = g.id
            LEFT JOIN publishers p ON a.publisherId = p.id
            LEFT JOIN article_authors aa ON aa.id_article = a.id
            LEFT JOIN authors ath ON aa.id_author = ath.id
            GROUP BY
                a.id,
                a.title_tj,
                a.pagesCount,
                a.publishYear,
                a.typeOf,
                a.filePath,
                d.udc,
                d.title_ru,
                g.name,
                p.title_tj
            ORDER BY a.typeOf, a.title_tj
        `);

        res.json(rows);
    } catch (err) {
        console.error('userCatalog error:', err);
        res.status(500).json({
            error: 'Ошибка загрузки каталога'
        });
    }
});

router.get('/userSearchHints', async (req, res) => {
    try {
        const [titleRows] = await connection.execute(`
            SELECT DISTINCT title_tj AS value
            FROM articles
            WHERE title_tj IS NOT NULL AND title_tj <> ''
            ORDER BY title_tj
        `);

        const [authorRows] = await connection.execute(`
            SELECT DISTINCT
                TRIM(CONCAT(
                        lastName, ' ',
                        firstName, ' ',
                        IFNULL(familyName, '')
                     )) AS value
            FROM authors
            WHERE lastName IS NOT NULL
               OR firstName IS NOT NULL
            ORDER BY value
        `);

        const [genreRows] = await connection.execute(`
            SELECT DISTINCT name AS value
            FROM genres
            WHERE name IS NOT NULL AND name <> ''
            ORDER BY name
        `);

        const [udcRows] = await connection.execute(`
            SELECT DISTINCT udc AS value
            FROM directions
            WHERE udc IS NOT NULL AND udc <> ''
            ORDER BY udc
        `);

        res.json({
            titles: titleRows,
            authors: authorRows,
            genres: genreRows,
            udc: udcRows
        });
    } catch (err) {
        console.error('userSearchHints error:', err);
        res.status(500).json({
            error: 'Ошибка загрузки подсказок'
        });
    }
});

router.get('/userSearch', async (req, res) => {
    const title = (req.query.title || '').trim();
    const author = (req.query.author || '').trim();
    const genre = (req.query.genre || '').trim();
    const udc = (req.query.udc || '').trim();

    try {
        const conditions = [];
        const params = [];

        if (title) {
            const words = title
                .split(/\s+/)
                .map(word => word.trim())
                .filter(Boolean);

            const titleConditions = words.map(() => 'LOWER(a.title_tj) LIKE LOWER(?)');

            conditions.push(`(${titleConditions.join(' OR ')})`);

            words.forEach(word => {
                params.push(`%${word}%`);
            });
        }

        if (author) {
            conditions.push(`
                EXISTS (
                    SELECT 1
                    FROM article_authors aa2
                    JOIN authors ath2 ON ath2.id = aa2.id_author
                    WHERE aa2.id_article = a.id
                    AND LOWER(
                        CONCAT(
                            ath2.lastName, ' ',
                            ath2.firstName, ' ',
                            IFNULL(ath2.familyName, '')
                        )
                    ) LIKE LOWER(?)
                )
            `);
            params.push(`%${author}%`);
        }

        if (genre) {
            conditions.push('LOWER(g.name) LIKE LOWER(?)');
            params.push(`%${genre}%`);
        }

        if (udc) {
            conditions.push('d.udc = ?');
            params.push(udc);
        }

        let sql = `
            SELECT
                a.id,
                a.title_tj AS title,
                a.pagesCount,
                a.publishYear,
                a.typeOf,
                a.filePath,
                CONCAT(IFNULL(d.udc, ''), ' ', IFNULL(d.title_ru, '')) AS udc,
                IFNULL(g.name, '') AS genre,
                IFNULL(p.title_tj, '') AS publisher,
                GROUP_CONCAT(
                    DISTINCT CONCAT(
                        ath.lastName, ' ',
                        ath.firstName, ' ',
                        IFNULL(ath.familyName, '')
                    )
                    SEPARATOR ', '
                ) AS authors
            FROM articles a
                     LEFT JOIN directions d ON a.directionId = d.id
                     LEFT JOIN genres g ON a.genreId = g.id
                     LEFT JOIN publishers p ON a.publisherId = p.id
                     LEFT JOIN article_authors aa ON aa.id_article = a.id
                     LEFT JOIN authors ath ON aa.id_author = ath.id
        `;

        if (conditions.length > 0) {
            sql += ` WHERE ${conditions.join(' AND ')}`;
        }

        sql += `
            GROUP BY
                a.id,
                a.title_tj,
                a.pagesCount,
                a.publishYear,
                a.typeOf,
                a.filePath,
                d.udc,
                d.title_ru,
                g.name,
                p.title_tj
            ORDER BY a.typeOf, a.title_tj
        `;

        const [rows] = await connection.execute(sql, params);

        res.json(rows);
    } catch (err) {
        console.error('userSearch error:', err);
        res.status(500).json({
            error: 'Ошибка поиска'
        });
    }
});

function getAuthToken(req) {
    return req.headers.cookie
        ?.split(';')
        .map(item => item.trim())
        .find(item => item.startsWith('authToken='))
        ?.split('=')[1];
}

async function getCurrentUserId(req) {
    const token = getAuthToken(req);

    if (!token) {
        return null;
    }

    const [rows] = await connection.execute(
        `SELECT id
         FROM users
         WHERE authToken = ?
         LIMIT 1`,
        [token]
    );

    if (rows.length === 0) {
        return null;
    }

    return rows[0].id;
}

router.get('/favorites', async (req, res) => {
    try {
        const userId = await getCurrentUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Необходимо войти в аккаунт'
            });
        }

        const [rows] = await connection.execute(`
            SELECT
                a.id,
                a.title_tj AS title,
                a.pagesCount,
                a.publishYear,
                a.typeOf,
                a.filePath,
                a.coverPath,
                CONCAT(
                    IFNULL(d.udc, ''),
                    ' ',
                    IFNULL(d.title_ru, '')
                ) AS udc,
                IFNULL(g.name, '') AS genre,
                IFNULL(p.title_tj, '') AS publisher,
                GROUP_CONCAT(
                    DISTINCT CONCAT(
                        ath.lastName,
                        ' ',
                        ath.firstName,
                        ' ',
                        IFNULL(ath.familyName, '')
                    )
                    SEPARATOR ', '
                ) AS authors
            FROM favorites f
            JOIN articles a ON a.id = f.articleId
            LEFT JOIN directions d ON a.directionId = d.id
            LEFT JOIN genres g ON a.genreId = g.id
            LEFT JOIN publishers p ON a.publisherId = p.id
            LEFT JOIN article_authors aa ON aa.id_article = a.id
            LEFT JOIN authors ath ON aa.id_author = ath.id
            WHERE f.userId = ?
            GROUP BY
                a.id,
                a.title_tj,
                a.pagesCount,
                a.publishYear,
                a.typeOf,
                a.filePath,
                a.coverPath,
                d.udc,
                d.title_ru,
                g.name,
                p.title_tj
            ORDER BY MAX(f.createdAt) DESC
        `, [userId]);

        res.json(rows);

    } catch (error) {
        console.error('Ошибка загрузки избранного:', error);

        res.status(500).json({
            success: false,
            message: 'Ошибка загрузки избранного'
        });
    }
});

router.get('/favorite/:articleId', async (req, res) => {
    try {
        const userId = await getCurrentUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Необходимо войти в аккаунт'
            });
        }

        const articleId = Number(req.params.articleId);

        const [rows] = await connection.execute(
            `SELECT id
             FROM favorites
             WHERE userId = ?
             AND articleId = ?
             LIMIT 1`,
            [userId, articleId]
        );

        res.json({
            success: true,
            favorite: rows.length > 0
        });

    } catch (error) {
        console.error('Ошибка проверки избранного:', error);

        res.status(500).json({
            success: false,
            message: 'Ошибка проверки избранного'
        });
    }
});

router.post('/favorite/:articleId', async (req, res) => {
    try {
        const userId = await getCurrentUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Необходимо войти в аккаунт'
            });
        }

        const articleId = Number(req.params.articleId);

        const [articleRows] = await connection.execute(
            `SELECT id
             FROM articles
             WHERE id = ?
             LIMIT 1`,
            [articleId]
        );

        if (articleRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Книга не найдена'
            });
        }

        const [favoriteRows] = await connection.execute(
            `SELECT id
             FROM favorites
             WHERE userId = ?
             AND articleId = ?
             LIMIT 1`,
            [userId, articleId]
        );

        if (favoriteRows.length > 0) {
            await connection.execute(
                `DELETE FROM favorites
                 WHERE userId = ?
                 AND articleId = ?`,
                [userId, articleId]
            );

            return res.json({
                success: true,
                favorite: false
            });
        }

        await connection.execute(
            `INSERT INTO favorites
             (userId, articleId)
             VALUES (?, ?)`,
            [userId, articleId]
        );

        res.json({
            success: true,
            favorite: true
        });

    } catch (error) {
        console.error('Ошибка изменения избранного:', error);

        res.status(500).json({
            success: false,
            message: 'Ошибка изменения избранного'
        });
    }
});

module.exports = router;