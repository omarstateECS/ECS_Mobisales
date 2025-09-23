-- Reset the Salesman ID sequence to start from 1000000
ALTER SEQUENCE "Salesman_id_seq" RESTART WITH 1000000;

-- Update any existing salesmen to have IDs starting from 1000000 if needed
-- This is optional and only if you want to update existing records
