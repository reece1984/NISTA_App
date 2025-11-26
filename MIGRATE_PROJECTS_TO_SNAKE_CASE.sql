-- =====================================================
-- MIGRATE PROJECTS TABLE TO SNAKE_CASE
-- =====================================================

-- Rename columns to snake_case
DO $$
BEGIN
  -- userId -> user_id
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'userId') THEN
    ALTER TABLE projects RENAME COLUMN "userId" TO user_id;
  END IF;

  -- projectName -> project_name
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'projectName') THEN
    ALTER TABLE projects RENAME COLUMN "projectName" TO project_name;
  END IF;

  -- projectValue -> project_value
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'projectValue') THEN
    ALTER TABLE projects RENAME COLUMN "projectValue" TO project_value;
  END IF;

  -- projectSector -> project_sector
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'projectSector') THEN
    ALTER TABLE projects RENAME COLUMN "projectSector" TO project_sector;
  END IF;

  -- createdAt -> created_at
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'createdAt') THEN
    ALTER TABLE projects RENAME COLUMN "createdAt" TO created_at;
  END IF;

  -- updatedAt -> updated_at
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'updatedAt') THEN
    ALTER TABLE projects RENAME COLUMN "updatedAt" TO updated_at;
  END IF;
END $$;

-- Verify the migration
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'projects' AND table_schema = 'public'
ORDER BY ordinal_position;
