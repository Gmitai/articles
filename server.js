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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
        fileSize: 10 * 1024 * 1024
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

app.use('/', authRoutes);
app.use('/profile', profileRoutes);
app.use('/', mainRoutes);
app.use('/loadDt', loadDtToFormRoutes);

app.listen(port, '192.168.31.134', () => {
    console.log(`Сервер запущен на порту ${port}`);
});