-- =====================================================
-- Supabase pgvector Setup for NISTA RAG System
-- =====================================================
-- Run this script in your Supabase SQL Editor

-- =====================================================
-- 1. ENABLE PGVECTOR EXTENSION
-- =====================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- 2. CREATE DOCUMENT_CHUNKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS "document_chunks" (
  "id" BIGSERIAL PRIMARY KEY,
  "fileId" INTEGER NOT NULL,
  "projectId" INTEGER NOT NULL,
  "chunkIndex" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "embedding" vector(1536), -- OpenAI ada-002 uses 1536 dimensions
  "metadata" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Foreign key constraints
  CONSTRAINT "document_chunks_fileId_fkey"
    FOREIGN KEY ("fileId")
    REFERENCES "files"("id")
    ON DELETE CASCADE,

  CONSTRAINT "document_chunks_projectId_fkey"
    FOREIGN KEY ("projectId")
    REFERENCES "projects"("id")
    ON DELETE CASCADE
);

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for vector similarity search (cosine distance)
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
  ON "document_chunks"
  USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 100);

-- Index for filtering by file
CREATE INDEX IF NOT EXISTS document_chunks_fileId_idx
  ON "document_chunks"("fileId");

-- Index for filtering by project
CREATE INDEX IF NOT EXISTS document_chunks_projectId_idx
  ON "document_chunks"("projectId");

-- Composite index for chunk ordering
CREATE INDEX IF NOT EXISTS document_chunks_file_chunk_idx
  ON "document_chunks"("fileId", "chunkIndex");

-- =====================================================
-- 4. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to search similar chunks by embedding
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_project_id int DEFAULT NULL
)
RETURNS TABLE (
  id bigint,
  "fileId" integer,
  "projectId" integer,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc."fileId",
    dc."projectId",
    dc.content,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE
    (filter_project_id IS NULL OR dc."projectId" = filter_project_id)
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get chunks for a specific file
CREATE OR REPLACE FUNCTION get_file_chunks(
  file_id int
)
RETURNS TABLE (
  id bigint,
  "chunkIndex" integer,
  content text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc."chunkIndex",
    dc.content,
    dc.metadata
  FROM document_chunks dc
  WHERE dc."fileId" = file_id
  ORDER BY dc."chunkIndex" ASC;
END;
$$;

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on document_chunks
ALTER TABLE "document_chunks" ENABLE ROW LEVEL SECURITY;

-- Users can view chunks for their own projects
CREATE POLICY "document_chunks_select_own" ON "document_chunks"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "projects"
      INNER JOIN "users" ON "users"."id" = "projects"."userId"
      WHERE "projects"."id" = "document_chunks"."projectId"
        AND "users"."openId" = auth.uid()::text
    )
  );

-- Allow service role (N8N) to insert chunks
CREATE POLICY "document_chunks_insert_service" ON "document_chunks"
  FOR INSERT
  WITH CHECK (true);

-- Users can delete chunks for their own projects
CREATE POLICY "document_chunks_delete_own" ON "document_chunks"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "projects"
      INNER JOIN "users" ON "users"."id" = "projects"."userId"
      WHERE "projects"."id" = "document_chunks"."projectId"
        AND "users"."openId" = auth.uid()::text
    )
  );

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Grant usage on vector extension
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant permissions on document_chunks table
GRANT ALL ON "document_chunks" TO postgres, service_role;
GRANT SELECT ON "document_chunks" TO anon, authenticated;

-- Grant permissions on sequence
GRANT USAGE, SELECT ON SEQUENCE document_chunks_id_seq TO postgres, service_role;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if pgvector is enabled
-- SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check table structure
-- \d document_chunks

-- Test the match function (after inserting some data)
-- SELECT * FROM match_document_chunks('[0,0,0...]'::vector(1536), 0.5, 5, 1);

-- =====================================================
-- NOTES FOR N8N WORKFLOW
-- =====================================================
--
-- When inserting chunks from N8N, use this format:
--
-- INSERT INTO document_chunks ("fileId", "projectId", "chunkIndex", "content", "embedding", "metadata")
-- VALUES (
--   1,                                    -- fileId from webhook
--   1,                                    -- projectId from webhook
--   0,                                    -- chunk index (0, 1, 2, ...)
--   'Document chunk text here...',        -- extracted text chunk
--   '[0.123, 0.456, ...]'::vector(1536), -- embedding from OpenAI
--   '{"fileName": "business_case.pdf", "page": 1}'::jsonb  -- metadata
-- );
--
-- Important: Use Supabase SERVICE ROLE KEY in N8N to bypass RLS policies
--
-- Embedding Models:
-- - OpenAI text-embedding-ada-002: 1536 dimensions (recommended)
-- - OpenAI text-embedding-3-small: 1536 dimensions
-- - OpenAI text-embedding-3-large: 3072 dimensions (update vector size if using this)
