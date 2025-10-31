-- =====================================================
-- Row Level Security (RLS) Policies for NISTA App
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- Make sure foreign keys are already created before running this

-- =====================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "files" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assessments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assessment_criteria" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. DROP EXISTING POLICIES (if any)
-- =====================================================

DROP POLICY IF EXISTS "users_select_own" ON "users";
DROP POLICY IF EXISTS "users_insert_own" ON "users";
DROP POLICY IF EXISTS "users_update_own" ON "users";

DROP POLICY IF EXISTS "projects_select_own" ON "projects";
DROP POLICY IF EXISTS "projects_insert_own" ON "projects";
DROP POLICY IF EXISTS "projects_update_own" ON "projects";
DROP POLICY IF EXISTS "projects_delete_own" ON "projects";

DROP POLICY IF EXISTS "files_select_own" ON "files";
DROP POLICY IF EXISTS "files_insert_own" ON "files";
DROP POLICY IF EXISTS "files_update_own" ON "files";
DROP POLICY IF EXISTS "files_delete_own" ON "files";

DROP POLICY IF EXISTS "assessments_select_own" ON "assessments";
DROP POLICY IF EXISTS "assessments_insert_own" ON "assessments";
DROP POLICY IF EXISTS "assessments_update_own" ON "assessments";
DROP POLICY IF EXISTS "assessments_delete_own" ON "assessments";

DROP POLICY IF EXISTS "assessment_criteria_select_all" ON "assessment_criteria";

-- =====================================================
-- 3. USERS TABLE POLICIES
-- =====================================================

-- Users can view their own record
CREATE POLICY "users_select_own" ON "users"
  FOR SELECT
  USING (auth.uid() = "openId");

-- Users can insert their own record (for first-time signup)
CREATE POLICY "users_insert_own" ON "users"
  FOR INSERT
  WITH CHECK (auth.uid() = "openId");

-- Users can update their own record
CREATE POLICY "users_update_own" ON "users"
  FOR UPDATE
  USING (auth.uid() = "openId")
  WITH CHECK (auth.uid() = "openId");

-- =====================================================
-- 4. PROJECTS TABLE POLICIES
-- =====================================================

-- Users can view their own projects
CREATE POLICY "projects_select_own" ON "projects"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."id" = "projects"."userId"
        AND "users"."openId" = auth.uid()
    )
  );

-- Users can create projects for themselves
CREATE POLICY "projects_insert_own" ON "projects"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."id" = "projects"."userId"
        AND "users"."openId" = auth.uid()
    )
  );

-- Users can update their own projects
CREATE POLICY "projects_update_own" ON "projects"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."id" = "projects"."userId"
        AND "users"."openId" = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."id" = "projects"."userId"
        AND "users"."openId" = auth.uid()
    )
  );

-- Users can delete their own projects
CREATE POLICY "projects_delete_own" ON "projects"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."id" = "projects"."userId"
        AND "users"."openId" = auth.uid()
    )
  );

-- =====================================================
-- 5. FILES TABLE POLICIES
-- =====================================================

-- Users can view files for their own projects
CREATE POLICY "files_select_own" ON "files"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "projects"
      INNER JOIN "users" ON "users"."id" = "projects"."userId"
      WHERE "projects"."id" = "files"."projectId"
        AND "users"."openId" = auth.uid()
    )
  );

-- Users can upload files to their own projects
CREATE POLICY "files_insert_own" ON "files"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "projects"
      INNER JOIN "users" ON "users"."id" = "projects"."userId"
      WHERE "projects"."id" = "files"."projectId"
        AND "users"."openId" = auth.uid()
    )
  );

-- Users can update files in their own projects
CREATE POLICY "files_update_own" ON "files"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "projects"
      INNER JOIN "users" ON "users"."id" = "projects"."userId"
      WHERE "projects"."id" = "files"."projectId"
        AND "users"."openId" = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "projects"
      INNER JOIN "users" ON "users"."id" = "projects"."userId"
      WHERE "projects"."id" = "files"."projectId"
        AND "users"."openId" = auth.uid()
    )
  );

-- Users can delete files from their own projects
CREATE POLICY "files_delete_own" ON "files"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "projects"
      INNER JOIN "users" ON "users"."id" = "projects"."userId"
      WHERE "projects"."id" = "files"."projectId"
        AND "users"."openId" = auth.uid()
    )
  );

-- =====================================================
-- 6. ASSESSMENTS TABLE POLICIES
-- =====================================================

-- Users can view assessments for their own projects
CREATE POLICY "assessments_select_own" ON "assessments"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "projects"
      INNER JOIN "users" ON "users"."id" = "projects"."userId"
      WHERE "projects"."id" = "assessments"."projectId"
        AND "users"."openId" = auth.uid()
    )
  );

-- Allow system/N8N to insert assessments (we'll use service role key for this)
-- Users typically won't create assessments directly
CREATE POLICY "assessments_insert_own" ON "assessments"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "projects"
      INNER JOIN "users" ON "users"."id" = "projects"."userId"
      WHERE "projects"."id" = "assessments"."projectId"
        AND "users"."openId" = auth.uid()
    )
  );

-- Users can update assessments for their own projects
CREATE POLICY "assessments_update_own" ON "assessments"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "projects"
      INNER JOIN "users" ON "users"."id" = "projects"."userId"
      WHERE "projects"."id" = "assessments"."projectId"
        AND "users"."openId" = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "projects"
      INNER JOIN "users" ON "users"."id" = "projects"."userId"
      WHERE "projects"."id" = "assessments"."projectId"
        AND "users"."openId" = auth.uid()
    )
  );

-- Users can delete assessments from their own projects
CREATE POLICY "assessments_delete_own" ON "assessments"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "projects"
      INNER JOIN "users" ON "users"."id" = "projects"."userId"
      WHERE "projects"."id" = "assessments"."projectId"
        AND "users"."openId" = auth.uid()
    )
  );

-- =====================================================
-- 7. ASSESSMENT_CRITERIA TABLE POLICIES
-- =====================================================

-- Everyone can read assessment criteria (it's static reference data)
CREATE POLICY "assessment_criteria_select_all" ON "assessment_criteria"
  FOR SELECT
  USING (true);

-- Only admins/system should be able to modify criteria (via service role)
-- No INSERT/UPDATE/DELETE policies for regular users

-- =====================================================
-- 8. STORAGE POLICIES (for project-documents bucket)
-- =====================================================

-- Note: You need to run these in the Supabase Dashboard > Storage > Policies
-- Or via SQL if you have the storage schema access

-- Users can upload files to their own project folders
-- CREATE POLICY "Users can upload to own projects" ON storage.objects
--   FOR INSERT
--   WITH CHECK (
--     bucket_id = 'project-documents' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Users can view files from their own project folders
-- CREATE POLICY "Users can view own project files" ON storage.objects
--   FOR SELECT
--   USING (
--     bucket_id = 'project-documents' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Users can delete files from their own project folders
-- CREATE POLICY "Users can delete own project files" ON storage.objects
--   FOR DELETE
--   USING (
--     bucket_id = 'project-documents' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. These policies assume auth.uid() returns the Supabase Auth user UUID
-- 2. The 'openId' column in users table should match auth.uid()
-- 3. N8N webhook should use the Supabase SERVICE ROLE key to bypass RLS
-- 4. Storage policies need to be configured separately in Dashboard
-- 5. Test thoroughly after applying these policies!
