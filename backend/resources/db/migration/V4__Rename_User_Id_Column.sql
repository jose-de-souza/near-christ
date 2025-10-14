-- ==============================================================
-- V4__Rename_User_Id_Column.sql
-- Renames the primary key column in the 'users' table to match the JPA entity.
-- ==============================================================

ALTER TABLE users RENAME COLUMN user_id TO id;
