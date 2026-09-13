const multer = require('multer');
const {extname} = require("node:path");
const fs = require('fs');
const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename:(req, file, cb) => {
        const uniSufix=Date.now()+'-'+Math.round(Math.random()*1E9);
        cb(null, file.originalname.substring(0, file.originalname.length-4)+'-'+uniSufix+extname(file.originalname));
    }
});


const fileFilter = (req, file, cb) => {

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only images allowed'), false);
    }
};

const upload = multer({
    storage: storageConfig,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

module.exports = upload;