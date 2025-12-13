# NISTA App Database Backup Summary

**Backup Created:** 2025-12-13 23:04:47
**Backup File:** `db-backup-2025-12-13_23-04-47.zip` (6.04 MB)
**Location:** `outputs/db-backup-2025-12-13_23-04-47.zip`

## What Was Backed Up

### ✅ Seed/Reference Data (CRITICAL - 869 rows)
These are the configuration tables that would take significant time to recreate:

| Table | Rows | Description |
|-------|------|-------------|
| **assessment_criteria** | 211 | IPA Gateway criteria definitions |
| **evidence_requirements** | 646 | Evidence requirements per criterion |
| **assessment_templates** | 7 | Gate templates (Gate 0, 1, 2, 3, etc.) |
| **project_types** | 5 | Project type classifications |

### ✅ Current State Data (851 rows)
Working data for reference (not critical for disaster recovery):

| Table | Rows | Description |
|-------|------|-------------|
| **projects** | 4 | Current test projects |
| **assessment_runs** | 4 | Assessment execution history |
| **assessments** | 50 | Assessment results |
| **files** | 4 | Uploaded document metadata |
| **actions** | 5 | Action items |
| **document_embeddings** | 786 | Vector embeddings for RAG |
| **users** | 2 | User accounts |
| **action_comments** | 0 | (empty) |
| **action_history** | 0 | (empty) |
| **action_plan_drafts** | 0 | (empty) |
| **project_members** | 0 | (empty) |

### ✅ Schema Metadata
- OpenAPI schema definition (complete API structure)
- Schema notes and limitations
- Database functions documentation

## Backup Contents

```
db-backup-2025-12-13_23-04-47/
├── schema/
│   ├── openapi-schema.json       # Complete REST API schema
│   ├── SCHEMA_NOTES.md           # Important notes on limitations
│   └── FUNCTIONS_NOTES.md        # Database functions documentation
├── seed-data/
│   ├── assessment_criteria.csv   # 211 rows - IPA criteria
│   ├── evidence_requirements.csv # 646 rows - Evidence requirements
│   ├── assessment_templates.csv  # 7 rows - Gate templates
│   └── project_types.csv         # 5 rows - Project types
├── current-data/
│   ├── projects.csv              # 4 rows
│   ├── assessment_runs.csv       # 4 rows
│   ├── assessments.csv           # 50 rows
│   ├── files.csv                 # 4 rows
│   ├── actions.csv               # 5 rows
│   ├── document_embeddings.csv   # 786 rows
│   └── users.csv                 # 2 rows
└── README.md                     # Detailed restore instructions
```

## Disaster Recovery Priority

### CRITICAL (Must Restore)
1. **assessment_templates** - Gate definitions
2. **project_types** - Project classifications
3. **assessment_criteria** - IPA criteria (211 items)
4. **evidence_requirements** - Evidence requirements (646 items)

### OPTIONAL (Current State)
- Projects, assessments, files (can be recreated if needed)
- Document embeddings (can be regenerated from documents)

## Important Limitations

⚠️ **This backup does NOT include:**
- CREATE TABLE SQL statements (schema DDL)
- Database functions (match_documents, etc.)
- Triggers
- RLS (Row Level Security) policies
- Indexes definitions
- pgvector extension setup

**Why?** The Supabase REST API doesn't provide direct SQL DDL export. For complete schema backup, you need `pg_dump` with direct PostgreSQL access.

## How to Use This Backup

### For Disaster Recovery (New Supabase Project)

1. **Create New Supabase Project**
   - Go to supabase.com
   - Create new project
   - Enable pgvector extension

2. **Recreate Schema**
   - Use your git repository migrations
   - Or manually recreate tables from your codebase
   - Recreate database functions (see FUNCTIONS_NOTES.md)

3. **Import Seed Data** (in this order)
   ```bash
   # Using Supabase Dashboard:
   # 1. Go to Table Editor
   # 2. Select each table
   # 3. Import corresponding CSV from seed-data/

   # Or using psql:
   \copy assessment_templates FROM 'seed-data/assessment_templates.csv' CSV HEADER;
   \copy project_types FROM 'seed-data/project_types.csv' CSV HEADER;
   \copy assessment_criteria FROM 'seed-data/assessment_criteria.csv' CSV HEADER;
   \copy evidence_requirements FROM 'seed-data/evidence_requirements.csv' CSV HEADER;
   ```

4. **Optionally Import Current Data**
   - Import from current-data/ if you need test projects
   - Or start fresh (recommended for production)

### For Complete SQL Backup

For a complete backup including schema DDL, use pg_dump:

```bash
# Connection details
export PGHOST="db.yondkevazznqclmrkidl.supabase.co"
export PGPORT="5432"
export PGDATABASE="postgres"
export PGUSER="postgres"
export PGPASSWORD="nwMvJBk9dJm5LQ8b"

# Full backup
pg_dump --no-owner --no-privileges > full-backup.sql

# Schema only
pg_dump --schema-only > schema-only.sql

# Data only
pg_dump --data-only > data-only.sql
```

## Database Connection Info

- **Supabase URL:** https://yondkevazznqclmrkidl.supabase.co
- **Database Host:** db.yondkevazznqclmrkidl.supabase.co
- **Port:** 5432
- **Database:** postgres
- **User:** postgres

## Next Steps

1. ✅ **Store this backup securely** - Copy to cloud storage, external drive, etc.
2. ✅ **Test restore process** - Try restoring to a test Supabase project
3. ✅ **Schedule regular backups** - Run this script weekly/monthly
4. ✅ **Consider pg_dump** - For complete schema backup with DDL

## Backup Statistics

- **Total Tables Backed Up:** 16
- **Total Rows Exported:** 1,720 rows
- **Seed Data:** 869 rows (CRITICAL)
- **Current Data:** 851 rows
- **Backup Size:** 6.04 MB (compressed)
- **Backup Time:** < 1 minute

---

**Generated by NISTA App Database Backup Script**
*Script location: `backup-database.js`*
