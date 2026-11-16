const express = require('express');
const port = process.env.PORT || 3001;
const { extname } = require('node:path');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'Public'), {
    index: false
}));

app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/icons', express.static(path.join(__dirname, 'icons')));
app.use('/uploads', async (req, res, next) => {
    try {
        const requestedFile = path.basename(decodeURIComponent(req.path));
        const [references] = await db.query(`
            SELECT 1 AS active FROM articles
            WHERE recordStatus = 1 AND (filePath = ? OR coverPath = ?)
            UNION ALL
            SELECT 1 AS active FROM users WHERE recordStatus = 1 AND profilePhoto = ?
            LIMIT 1
        `, [requestedFile, requestedFile, requestedFile]);
        if (!references.length) return res.sendStatus(404);
        next();
    } catch (error) {
        console.error('Ошибка проверки файла загрузки:', error);
        res.sendStatus(500);
    }
}, express.static(path.join(__dirname, 'uploads')));

const multer = require('multer');

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        const uniSufix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = extname(file.originalname).toLowerCase();

        if (file.fieldname === 'coverImage') {
            cb(null, 'cover-' + uniSufix + extension);
            return;
        }

        const originalName = path.parse(file.originalname).name;

        cb(
            null,
            originalName + '-' + uniSufix + extension
        );
    }
});

const upload = multer({
    storage: storageConfig,
    limits: {
        fileSize: 500 * 1024 * 1024,
        files: 500
    }
}).any();

app.use(upload);

app.use((req, res, next) => {
    if (Array.isArray(req.files)) {
        req.file =
            req.files.find(file => file.fieldname === 'fileData') ||
            req.files.find(file => file.fieldname === 'profilePhoto') ||
            req.files[0] ||
            undefined;
    }

    next();
});

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const mainRoutes = require('./routes/main.routes');
const loadDtToFormRoutes = require('./routes/load_data_to_form.routes');
const adminRoutes = require('./routes/admin.routes');
const ensureInteractionTables = require('./db/interaction-tables');
const ensureRecordStatusColumns = require('./db/record-status');
const db = require('./db/db');

app.use('/', authRoutes);
app.use('/profile', profileRoutes);
app.use('/admin-api', adminRoutes);
app.use('/', mainRoutes);
app.use('/loadDt', loadDtToFormRoutes);

async function startServer() {
    await ensureInteractionTables();
    await ensureRecordStatusColumns();
    app.listen(port, '192.168.0.8', () => {
        console.log(`Сервер запущен на порту ${port}`);
    });
}

startServer().catch(error => {
    console.error('Не удалось подготовить базу данных перед запуском:', error);
    process.exit(1);
});

//192.168.0.8
