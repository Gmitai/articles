const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { pathToFileURL } = require('url');
const PDFDocument = require('pdfkit');
const execFileAsync = promisify(execFile);

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const MAX_PAGES = 500;
const MAX_TOTAL_BYTES = 500 * 1024 * 1024;
const A4 = { width: 595.28, height: 841.89 };

function fileFormat(file) {
    const extension = path.extname(file.originalname || file.filename || '').toLowerCase();
    if (extension === '.pdf') return 'pdf';
    if (['.doc', '.docx'].includes(extension)) return 'word';
    if (['.djvu', '.djv'].includes(extension)) return 'djvu';
    if (['.jpg', '.jpeg'].includes(extension)) return 'jpeg';
    if (extension === '.png') return 'png';
    return null;
}

function hasValidSignature(file, format) {
    const handle = fs.openSync(file.path, 'r');
    try {
        const header = Buffer.alloc(8);
        const bytesRead = fs.readSync(handle, header, 0, header.length, 0);
        if (format === 'pdf') return header.subarray(0, bytesRead).includes(Buffer.from('%PDF-'));
        if (format === 'word' && path.extname(file.originalname).toLowerCase() === '.doc') {
            return header.subarray(0, bytesRead).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
        }
        if (format === 'word') return bytesRead >= 4 && header[0] === 0x50 && header[1] === 0x4b;
        if (format === 'djvu') {
            if (bytesRead < 8 || header.toString('ascii', 0, 8) !== 'AT&TFORM') return false;
            const form = Buffer.alloc(4);
            fs.readSync(handle, form, 0, form.length, 12);
            return ['DJVU', 'DJVM', 'PM44', 'BM44'].includes(form.toString('ascii'));
        }
        if (format === 'jpeg') return bytesRead >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
        if (format === 'png') return header.subarray(0, bytesRead).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
        return false;
    } finally {
        fs.closeSync(handle);
    }
}

function createPdfFromImages(files) {
    return new Promise((resolve, reject) => {
        const filename = `book-scans-${Date.now()}-${crypto.randomBytes(5).toString('hex')}.pdf`;
        const outputPath = path.join(UPLOADS_DIR, filename);
        const output = fs.createWriteStream(outputPath);
        const document = new PDFDocument({ autoFirstPage: false, compress: true });
        let settled = false;

        const fail = error => {
            if (settled) return;
            settled = true;
            output.once('close', () => fs.promises.unlink(outputPath).catch(() => {}));
            output.destroy();
            reject(error);
        };

        output.once('error', fail);
        document.once('error', fail);
        output.once('finish', () => {
            if (settled) return;
            settled = true;
            resolve({ filename, outputPath, generated: true });
        });

        document.pipe(output);
        try {
            for (const file of files) {
                document.addPage({ size: 'A4', margin: 0 });
                document.image(file.path, 0, 0, {
                    fit: [A4.width, A4.height],
                    align: 'center',
                    valign: 'center'
                });
            }
            document.end();
        } catch (error) {
            fail(error);
        }
    });
}

function findExecutable(configuredPath, command, windowsPaths = []) {
    return [configuredPath, command, ...windowsPaths]
        .filter(Boolean)
        .find(candidate => candidate === command || fs.existsSync(candidate));
}

async function convertDocument(file, format) {
    const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'book-convert-'));
    const outputFilename = `book-${Date.now()}-${crypto.randomBytes(5).toString('hex')}.pdf`;
    const outputPath = path.join(UPLOADS_DIR, outputFilename);
    const tempPdfPath = path.join(tempDir, `${path.parse(file.originalname).name}.pdf`);

    try {
        if (format === 'word') {
            const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
            const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
            const soffice = findExecutable(process.env.LIBREOFFICE_PATH, 'soffice', [
                path.join(programFiles, 'LibreOffice', 'program', 'soffice.exe'),
                path.join(programFilesX86, 'LibreOffice', 'program', 'soffice.exe')
            ]);
            if (!soffice) throw new Error('Для конвертации Word установите LibreOffice на сервере.');
            const profile = pathToFileURL(path.join(tempDir, 'lo-profile')).href;
            await execFileAsync(soffice, [
                '--headless', '--convert-to', 'pdf', '--outdir', tempDir,
                `-env:UserInstallation=${profile}`, file.path
            ], { timeout: 180000, windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
        } else {
            const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
            const ddjvu = findExecutable(process.env.DDJVU_PATH, 'ddjvu', [
                path.join(programFiles, 'DjVuLibre', 'ddjvu.exe'),
                path.join(programFiles, 'DjVuLibre', 'bin', 'ddjvu.exe')
            ]);
            if (!ddjvu) throw new Error('Для конвертации DjVu установите DjVuLibre на сервере.');
            await execFileAsync(ddjvu, ['-format=pdf', file.path, tempPdfPath], {
                timeout: 180000, windowsHide: true, maxBuffer: 4 * 1024 * 1024
            });
        }

        if (!fs.existsSync(tempPdfPath) || fs.statSync(tempPdfPath).size === 0) {
            throw new Error('Не удалось создать PDF из выбранного файла.');
        }
        await fs.promises.copyFile(tempPdfPath, outputPath);
        return { filename: outputFilename, outputPath, generated: true };
    } catch (error) {
        await fs.promises.unlink(outputPath).catch(() => {});
        if (error.code === 'ETIMEDOUT') throw new Error('Конвертация заняла слишком много времени.');
        if (error.code === 'ENOENT') {
            throw new Error(format === 'word'
                ? 'Для конвертации Word установите LibreOffice на сервере.'
                : 'Для конвертации DjVu установите DjVuLibre на сервере.');
        }
        throw error;
    } finally {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
    }
}

async function prepareBookUpload(files, { keepOriginal = false } = {}) {
    if (!files.length) throw new Error('Выберите PDF-файл или изображения страниц книги.');
    if (files.length > MAX_PAGES) throw new Error(`Можно выбрать не более ${MAX_PAGES} файлов за раз.`);

    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_TOTAL_BYTES) throw new Error('Общий размер выбранных файлов не должен превышать 500 МБ.');

    const formats = files.map(fileFormat);
    if (formats.some(format => !format)) {
        throw new Error('?????????????? PDF, Word (DOC/DOCX), DjVu, JPG ? PNG.');
    }
    if (formats.some(format => ['pdf', 'word', 'djvu'].includes(format)) && files.length !== 1) {
        throw new Error('???????? ???? PDF/Word/DjVu ???? ???? ????????? ???????????.');
    }

    for (let index = 0; index < files.length; index += 1) {
        if (!hasValidSignature(files[index], formats[index])) {
            throw new Error(`Файл «${files[index].originalname}» не соответствует своему формату.`);
        }
    }

    if (keepOriginal && files.length === 1) {
        return { filename: files[0].filename, generated: false };
    }

    if (['word', 'djvu'].includes(formats[0])) {
        return convertDocument(files[0], formats[0]);
    }

    if (formats[0] === 'pdf') {
        return { filename: files[0].filename, generated: false };
    }

    return createPdfFromImages(files);
}

module.exports = { prepareBookUpload, MAX_PAGES, MAX_TOTAL_BYTES };
