-- Add error_message column to files table
-- Run this in Supabase SQL Editor

-- Add the error_message column to store webhook processing errors
ALTER TABLE files
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add a comment to document what this column is for
COMMENT ON COLUMN files.error_message IS 'Stores error messages from webhook processing failures';

-- Optional: View current files with errors to verify the column
-- SELECT id, file_name, status, error_message
-- FROM files
-- WHERE status = 'failed';
