-- ==============================================================
-- V3__Refactor_Users_And_Roles.sql
-- This script refactors the user and role management to support multiple roles per user.
-- ==============================================================

-- 1) Create the 'roles' table to store role definitions.
CREATE TABLE roles (
                       id BIGSERIAL PRIMARY KEY,
                       name VARCHAR(20) NOT NULL UNIQUE
);

-- 2) Populate the 'roles' table with the standard roles.
INSERT INTO roles (id, name) VALUES
                                 (1, 'ADMIN'),
                                 (2, 'SUPERVISOR'),
                                 (3, 'STANDARD');
-- Reset sequence to avoid conflicts if more roles are added manually.
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));


-- 3) Create the 'user_roles' join table for the many-to-many relationship.
CREATE TABLE user_roles (
                            user_id BIGINT NOT NULL,
                            role_id BIGINT NOT NULL,
                            PRIMARY KEY (user_id, role_id),
                            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- 4) Migrate existing data from the old 'user_role' column into the new 'user_roles' table.
-- This query joins users with roles on their names to link them by their IDs.
INSERT INTO user_roles (user_id, role_id)
SELECT
    u.user_id,
    r.id
FROM
    users u
        JOIN
    roles r ON u.user_role = r.name;

-- 5) Drop the old 'user_role' column from the 'users' table as it is now redundant.
ALTER TABLE users DROP COLUMN user_role;

