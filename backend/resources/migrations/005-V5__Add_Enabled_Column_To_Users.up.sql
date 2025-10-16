-- ==============================================================
-- 005-V5__Add_Enabled_Column_To_Users.up.sql
-- Adds the 'enabled' column to the 'users' table to match the JPA entity.
-- All existing users will be enabled by default.
-- ==============================================================

ALTER TABLE users ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT true;
