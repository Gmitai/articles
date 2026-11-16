const db = require('./db');

let migrationPromise;
const STATUS_TABLES = [
    'articles', 'authors', 'publishers', 'directions', 'genres', 'users',
    'bbk_classifiers', 'isbn_classifiers'
];

async function ensureRecordStatusColumns() {
    if (!migrationPromise) {
        migrationPromise = (async () => {
            const [columns] = await db.query(`
                SELECT TABLE_NAME AS tableName
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME = 'recordStatus'
            `);
            const existing = new Set(columns.map(column => column.tableName));
            for (const table of STATUS_TABLES) {
                if (!existing.has(table)) {
                    await db.query(`ALTER TABLE \`${table}\` ADD COLUMN recordStatus TINYINT NOT NULL DEFAULT 1`);
                }
            }
        })().catch(error => {
            migrationPromise = null;
            throw error;
        });
    }
    return migrationPromise;
}

module.exports = ensureRecordStatusColumns;
