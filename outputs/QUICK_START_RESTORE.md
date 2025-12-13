# Quick Start: Database Restore Guide

## 🚨 Disaster Recovery - Fast Path

If your database is lost and you need to restore quickly, follow these steps:

### Step 1: Create New Supabase Project (5 minutes)

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name it (e.g., "NISTA-Recovery")
4. Select region (EU Central recommended)
5. Set a strong database password
6. Wait for project to initialize

### Step 2: Enable Required Extensions (2 minutes)

In the Supabase SQL Editor, run:

```sql
-- Enable vector extension for RAG functionality
CREATE EXTENSION IF NOT EXISTS vector;
```

### Step 3: Recreate Database Schema (Method A or B)

#### Method A: From Git Repository (Recommended)
```bash
# If you have migrations in your git repo
cd NISTA_App
# Apply migrations from Supabase Dashboard or CLI
```

#### Method B: Manual Table Creation
You'll need to recreate tables. Key tables:

```sql
-- Create in this order (respecting foreign keys)
1. users
2. project_types
3. assessment_templates
4. projects
5. assessment_criteria
6. evidence_requirements
7. assessment_runs
8. assessments
9. files
10. document_embeddings
11. actions
... etc
```

*Note: Table definitions are in your codebase. The OpenAPI schema in the backup shows structure but not CREATE statements.*

### Step 4: Import CRITICAL Seed Data (5 minutes)

**Using Supabase Dashboard:**

1. Go to Table Editor
2. For each table below, click "Import data from CSV"
3. Upload files in this order:

```
1. seed-data/assessment_templates.csv    (7 rows)
2. seed-data/project_types.csv           (5 rows)
3. seed-data/assessment_criteria.csv     (211 rows)
4. seed-data/evidence_requirements.csv   (646 rows)
```

**Using psql (faster for large files):**

```bash
# Extract the backup zip
unzip db-backup-2025-12-13_23-04-47.zip

# Connect to your new database
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Import seed data
\copy assessment_templates FROM 'db-backup-2025-12-13_23-04-47/seed-data/assessment_templates.csv' CSV HEADER;
\copy project_types FROM 'db-backup-2025-12-13_23-04-47/seed-data/project_types.csv' CSV HEADER;
\copy assessment_criteria FROM 'db-backup-2025-12-13_23-04-47/seed-data/assessment_criteria.csv' CSV HEADER;
\copy evidence_requirements FROM 'db-backup-2025-12-13_23-04-47/seed-data/evidence_requirements.csv' CSV HEADER;
```

### Step 5: Recreate Database Functions (5 minutes)

These functions are critical for RAG (document search):

```sql
-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_project_id bigint DEFAULT NULL
)
RETURNS TABLE (
  id bigint,
  file_id bigint,
  project_id bigint,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_embeddings.id,
    document_embeddings.file_id,
    document_embeddings.project_id,
    document_embeddings.content,
    document_embeddings.metadata,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity
  FROM document_embeddings
  WHERE
    (filter_project_id IS NULL OR document_embeddings.project_id = filter_project_id)
    AND 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

*Note: Check your codebase for other custom functions.*

### Step 6: Update Application Config (2 minutes)

Update your `.env` files with new Supabase credentials:

```env
# Frontend (.env)
VITE_SUPABASE_URL=https://[NEW-PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=[NEW-ANON-KEY]

# Backend (backend/.env)
SUPABASE_URL=https://[NEW-PROJECT-REF].supabase.co
SUPABASE_SERVICE_KEY=[NEW-SERVICE-ROLE-KEY]
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[NEW-PROJECT-REF].supabase.co:5432/postgres
```

### Step 7: (Optional) Import Current Data

If you want to restore test projects and data:

```bash
\copy users FROM 'db-backup-2025-12-13_23-04-47/current-data/users.csv' CSV HEADER;
\copy projects FROM 'db-backup-2025-12-13_23-04-47/current-data/projects.csv' CSV HEADER;
\copy files FROM 'db-backup-2025-12-13_23-04-47/current-data/files.csv' CSV HEADER;
\copy assessment_runs FROM 'db-backup-2025-12-13_23-04-47/current-data/assessment_runs.csv' CSV HEADER;
\copy assessments FROM 'db-backup-2025-12-13_23-04-47/current-data/assessments.csv' CSV HEADER;
\copy document_embeddings FROM 'db-backup-2025-12-13_23-04-47/current-data/document_embeddings.csv' CSV HEADER;
\copy actions FROM 'db-backup-2025-12-13_23-04-47/current-data/actions.csv' CSV HEADER;
```

### Step 8: Verify and Test (5 minutes)

1. Start your application
2. Check that assessment criteria load
3. Try creating a test project
4. Verify RAG search works (if you restored embeddings)

---

## ⏱️ Total Recovery Time: ~30 minutes

**What's Restored:**
- ✅ All IPA assessment criteria (211 items)
- ✅ All evidence requirements (646 items)
- ✅ Gate templates (7 gates)
- ✅ Project types (5 types)
- ✅ Optionally: Test projects and data

**What Needs Manual Work:**
- Schema recreation (tables, indexes, constraints)
- Database functions (match_documents, etc.)
- RLS policies (if used)
- Triggers (if any)

---

## 🔒 Security Notes

After restore, ensure:
1. RLS policies are recreated (check Supabase Dashboard > Authentication > Policies)
2. API keys are rotated if this is a security incident
3. Review user access and permissions

---

## 📞 Need Help?

1. Check the main README.md in the backup for detailed instructions
2. See BACKUP_SUMMARY.md for complete backup contents
3. Review your git repository for schema migrations
4. Check Supabase documentation: https://supabase.com/docs

---

**Backup Date:** 2025-12-13 23:04:47
**Backup Size:** 6.04 MB
**Total Rows:** 1,720 rows
