-- ==============================================================
-- V7__Rename_To_UserFullName.sql
-- Renames the user_name column to user_full_name to avoid naming conflicts.
-- ==============================================================

ALTER TABLE users RENAME COLUMN user_name TO user_full_name;
