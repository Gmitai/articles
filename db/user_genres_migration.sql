CREATE TABLE IF NOT EXISTS user_genres (
    userId INT NOT NULL,
    genreId INT NOT NULL,
    PRIMARY KEY (userId, genreId),
    INDEX idx_user_genres_genreId (genreId)
);
