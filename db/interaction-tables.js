const db = require('./db');

let tablesReady;

async function ensureInteractionTables() {
    if (!tablesReady) {
        tablesReady = (async () => {
            await db.execute('ALTER TABLE articles MODIFY COLUMN createAt DATETIME DEFAULT CURRENT_TIMESTAMP');
            const [articleColumns] = await db.query(`
                SELECT COLUMN_NAME AS columnName
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'articles'
                  AND COLUMN_NAME IN ('bbk', 'isbn')
            `);
            const existingArticleColumns = new Set(articleColumns.map(column => column.columnName));
            if (!existingArticleColumns.has('bbk')) await db.execute('ALTER TABLE articles ADD COLUMN bbk VARCHAR(50) NULL');
            if (!existingArticleColumns.has('isbn')) await db.execute('ALTER TABLE articles ADD COLUMN isbn VARCHAR(32) NULL');
            await db.execute(`
                CREATE TABLE IF NOT EXISTS bbk_classifiers (
                    id INT NOT NULL AUTO_INCREMENT,
                    code VARCHAR(50) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    PRIMARY KEY (id),
                    KEY idx_bbk_code (code)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
            `);
            await db.execute(`
                CREATE TABLE IF NOT EXISTS isbn_classifiers (
                    id INT NOT NULL AUTO_INCREMENT,
                    code VARCHAR(32) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    PRIMARY KEY (id),
                    KEY idx_isbn_code (code)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
            `);
            await db.execute(`
                CREATE TABLE IF NOT EXISTS ratings (
                    id INT NOT NULL AUTO_INCREMENT,
                    userId INT NOT NULL,
                    targetType VARCHAR(16) NOT NULL,
                    targetId INT NOT NULL,
                    score TINYINT UNSIGNED NOT NULL,
                    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    UNIQUE KEY uq_rating_user_target (userId, targetType, targetId),
                    KEY idx_rating_target (targetType, targetId),
                    KEY idx_rating_userId (userId)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
            `);
            await db.execute(`
                CREATE TABLE IF NOT EXISTS favorite_authors (
                    userId INT NOT NULL,
                    authorId INT NOT NULL,
                    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (userId, authorId),
                    KEY idx_favorite_authors_author (authorId),
                    KEY idx_favorite_authors_user (userId)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
            `);

            const removableConstraints = {
                favorites: new Set(['fk_favorite_article', 'fk_favorite_user']),
                ratings: new Set(['fk_rating_user']),
                favorite_authors: new Set(['fk_favorite_author_user', 'fk_favorite_author_author'])
            };
            const [constraints] = await db.query(`
                SELECT TABLE_NAME AS tableName, CONSTRAINT_NAME AS constraintName
                FROM information_schema.REFERENTIAL_CONSTRAINTS
                WHERE CONSTRAINT_SCHEMA = DATABASE()
                  AND TABLE_NAME IN ('favorites', 'ratings', 'favorite_authors')
            `);
            for (const item of constraints) {
                const allowed = removableConstraints[item.tableName];
                if (!allowed?.has(item.constraintName)) continue;
                await db.query(
                    `ALTER TABLE \`${item.tableName}\` DROP FOREIGN KEY \`${item.constraintName}\``
                );
            }
        })().catch(error => {
            tablesReady = null;
            throw error;
        });
    }
    return tablesReady;
}

module.exports = ensureInteractionTables;
