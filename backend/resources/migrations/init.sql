CREATE TABLE IF NOT EXISTS schema_migrations
(
    version BIGINT PRIMARY KEY,
    dirty   BOOLEAN NOT NULL
);