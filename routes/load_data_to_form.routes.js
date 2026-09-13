//load_data_to_form.routes.js
const express = require('express');
const router = express.Router();

const path = require("path");
const connection = require('../db/db');
router.use(express.static(path.join(__dirname, '..', 'css')))
router.use(express.static(path.join(__dirname, '..', 'icons')))
router.use(express.static(path.join(__dirname, '..', 'uploads')))
router.use(express.json());

router.get('/getArticleById', async (req, res) => {
    const id = req.query.id;

    try {
        const [articleRows] = await connection.execute(
            `SELECT
                id,
                title_tj,
                pagesCount,
                publishYear,
                directionId,
                publisherId,
                filePath,
                coverPath
             FROM articles
             WHERE id = ?`,
            [id]
        );

        if (articleRows.length === 0) {
            return res.status(404).json({
                error: "Мақола ёфт нашуд!"
            });
        }

        const [authorsRows] = await connection.execute(
            `SELECT a.id, a.lastName, a.firstName, a.familyName
             FROM authors a
             JOIN article_authors b
             ON b.id_author = a.id
             WHERE b.id_article = ?`,
            [id]
        );

        res.json({
            ...articleRows[0],
            authors: authorsRows
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Server error"
        });
    }
});

router.get('/getAuthors', async (req, res) => {
    const [result] = await connection.execute("SELECT id, CONCAT(lastName, ' ', firstName) AS lastName FROM authors");
    try {
        res.send(result);
    } catch (err) {
        console.error(err);
    }
});



router.get('/getAuthorById', async (req, res) => {
    const id = req.query.id;
    const sqlAuthor = `SELECT a.id,CONCAT(a.lastName, ' ', a.firstName, ' ', IFNULL(a.familyName, '')) AS fullName, DATE_FORMAT(a.birthDate, '%Y-%m-%d') AS birthDate, a.mobilePhone, a.cityId, c.title AS city, a.address FROM authors a LEFT JOIN cities c ON a.cityId = c.id WHERE a.id = ?`;

    const [authorRows] = await connection.execute(sqlAuthor, [id]);
    try {
       if (!authorRows.length) return res.status(404).json({ error: "Автор не найден" });
       res.json(authorRows[0]);
    }
    catch (err) {
        console.error(err);
    }
});

router.get('/getDirections', async (req, res) => {
    const [result] = await connection.execute("SELECT id, parentId, CONCAT(udc,' ', title_ru) AS name FROM directions");
    try {
        res.send(result);
    } catch (err) {
        console.error(err);
    }
});

router.get('/getPublishers', async (req, res) => {
    const [result] = await connection.execute("SELECT id, title_tj FROM publishers");
    try {
        res.send(result);
    } catch (err) {
        console.error(err);
    }
});

router.get('/getCities', async (req, res) => {
    const [result] = await connection.execute("SELECT id, title FROM cities WHERE typeOf = 1")
    try {
        res.send(result);
    } catch (err) {
        console.error(err);
    }
});

module.exports = router;