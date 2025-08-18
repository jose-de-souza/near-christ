-- ==============================================================
-- V8__Remove_State_From_Diocese.sql
-- This script removes the state reference from the Diocese table to support dioceses that span multiple states.
-- States will now be inferred from associated parishes.
-- ==============================================================

-- 1) Drop the foreign key constraint on state_id (assuming default constraint name; adjust if necessary).
ALTER TABLE dioceses DROP CONSTRAINT IF EXISTS dioceses_state_id_fkey;

-- 2) Drop the state_id column from the dioceses table.
ALTER TABLE dioceses DROP COLUMN IF EXISTS state_id;