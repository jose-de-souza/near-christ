-- ==============================================================
-- V9__Prevent_Diocese_Deletion_With_Parishes.sql
-- Ensures that dioceses cannot be deleted if they have associated parishes
-- and adds an index on parishes.diocese_id for performance.
-- ==============================================================

-- Add an index on parishes.diocese_id to improve performance of queries checking for associated parishes
CREATE INDEX idx_parishes_diocese_id ON parishes (diocese_id);

-- Note: The existing FOREIGN KEY constraint on parishes.diocese_id with ON DELETE RESTRICT
-- already prevents deletion of a diocese with associated parishes at the database level.
-- No further schema changes are required.