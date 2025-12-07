-- Migration: Add new optional fields to projects table
-- Date: 2025-12-07
-- Description: Adds fields for sponsoring/delivery organisations, gateway review dates,
--              previous ratings, and report templates to support the redesigned Create Project modal

-- Add sponsoring organisation field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'sponsoring_organisation'
  ) THEN
    ALTER TABLE projects ADD COLUMN sponsoring_organisation VARCHAR(255) NULL;
    COMMENT ON COLUMN projects.sponsoring_organisation IS 'The organisation sponsoring this project';
  END IF;
END $$;

-- Add delivery organisation field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'delivery_organisation'
  ) THEN
    ALTER TABLE projects ADD COLUMN delivery_organisation VARCHAR(255) NULL;
    COMMENT ON COLUMN projects.delivery_organisation IS 'The organisation delivering this project';
  END IF;
END $$;

-- Add gateway review date field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'gateway_review_date'
  ) THEN
    ALTER TABLE projects ADD COLUMN gateway_review_date DATE NULL;
    COMMENT ON COLUMN projects.gateway_review_date IS 'Scheduled date for gateway review';
  END IF;
END $$;

-- Add previous rating field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'previous_rating'
  ) THEN
    ALTER TABLE projects ADD COLUMN previous_rating VARCHAR(20) NULL;
    COMMENT ON COLUMN projects.previous_rating IS 'Previous gateway rating: green, amber-green, amber, amber-red, or red';
  END IF;
END $$;

-- Add report template URL field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'report_template_url'
  ) THEN
    ALTER TABLE projects ADD COLUMN report_template_url VARCHAR(500) NULL;
    COMMENT ON COLUMN projects.report_template_url IS 'URL to the uploaded organisation document template';
  END IF;
END $$;

-- Add report template name field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'report_template_name'
  ) THEN
    ALTER TABLE projects ADD COLUMN report_template_name VARCHAR(255) NULL;
    COMMENT ON COLUMN projects.report_template_name IS 'Original filename of the organisation document template';
  END IF;
END $$;

-- Create an index on gateway_review_date for faster queries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'projects' AND indexname = 'idx_projects_gateway_review_date'
  ) THEN
    CREATE INDEX idx_projects_gateway_review_date ON projects(gateway_review_date)
    WHERE gateway_review_date IS NOT NULL;
  END IF;
END $$;

-- Verify the migration
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'projects'
  AND column_name IN (
    'sponsoring_organisation',
    'delivery_organisation',
    'gateway_review_date',
    'previous_rating',
    'report_template_url',
    'report_template_name'
  )
ORDER BY column_name;
