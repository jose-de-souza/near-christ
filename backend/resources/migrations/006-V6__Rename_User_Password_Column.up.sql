-- ==============================================================
-- 006-V6__Rename_User_Password_Column.up.sql
-- Renames the password column in the 'users' table to match the JPA entity.
-- ==============================================================

ALTER TABLE users RENAME COLUMN user_password TO password;
