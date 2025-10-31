# Database Schema Reference

Quick reference for your actual Supabase database schema.

## Tables Overview

### 1. document_embeddings (snake_case)

```sql
CREATE TABLE document_embeddings (
  id int4 PRIMARY KEY,
  file_id int4,              -- FK to files.id
  project_id int4,           -- FK to projects.id
  content text,              -- Chunk text content
  metadata jsonb,            -- Additional metadata
  embedding vector(1536),    -- OpenAI embedding (1536 dimensions)
  created_at timestamp       -- Auto-generated
);
```

**Key Points:**
- Uses **snake_case** (file_id, project_id, created_at)
- Vector dimension: **1536** (OpenAI text-embedding-ada-002)
- No foreign key constraints visible in schema, but logically references files and projects

---

### 2. files (camelCase)

```sql
CREATE TABLE files (
  id int4 PRIMARY KEY,
  projectId int4,                    -- FK to projects.id
  fileName varchar,
  fileType varchar,                  -- 'business_case', 'pep', 'risk_register'
  fileUrl text,
  fileKey text,
  status file_status,                -- ENUM: 'pending', 'processing', 'completed', 'failed'
  uploadedAt timestamp,
  processedAt timestamp
);
```

**File Types:**
- `business_case`: Business Case document
- `pep`: Project Execution Plan
- `risk_register`: Risk Register

---

### 3. projects (camelCase)

```sql
CREATE TABLE projects (
  id int4 PRIMARY KEY,
  userId int4,                       -- FK to users.id
  projectName varchar,
  projectValue int4,                 -- Value in millions
  projectSector varchar,
  status project_status,             -- ENUM: 'draft', 'processing', 'completed'
  createdAt timestamp,
  updatedAt timestamp
);
```

**Project Statuses:**
- `draft`: Initial state
- `processing`: Assessment running
- `completed`: Assessment finished

---

### 4. users (camelCase)

```sql
CREATE TABLE users (
  id int4 PRIMARY KEY,
  openId varchar,                    -- Supabase Auth UUID (as string)
  name text,
  email varchar,
  loginMethod varchar,
  role role,                         -- ENUM: 'user', 'admin' (likely)
  createdAt timestamp,
  updatedAt timestamp,
  lastSignedIn timestamp
);
```

**Important:** `openId` matches `auth.uid()::text` from Supabase Auth

---

### 5. assessments (camelCase)

```sql
CREATE TABLE assessments (
  id int4 PRIMARY KEY,
  projectId int4,                    -- FK to projects.id
  criterionId int4,                  -- FK to assessment_criteria.id
  ragRating rag_rating,              -- ENUM: 'green', 'amber', 'red'
  finding text,                      -- Single paragraph (NOT array)
  evidence text,                     -- Bullet points as text (NOT array)
  recommendation text,               -- Single paragraph (NOT array)
  confidence int4,                   -- Integer 0-100 (NOT float)
  createdAt timestamp,
  updatedAt timestamp
);
```

**Key Differences from Initial Design:**
- `finding` is **text**, not `findings` array
- `evidence` is **text**, not `evidence` array
- `recommendation` is **text**, not `recommendations` array
- `confidence` is **int4** (0-100), not float (0-1)
- `ragRating` enum: **'green', 'amber', 'red'** (lowercase)

---

### 6. assessment_criteria (camelCase)

```sql
CREATE TABLE assessment_criteria (
  id int4 PRIMARY KEY,
  criterionCode varchar,
  dimension varchar,                 -- 'Strategic', 'Management', 'Economic', etc.
  category varchar,
  title varchar,
  description text,
  assessmentQuestion text,
  createdAt timestamp
);
```

**5 Dimensions:**
1. Strategic
2. Management
3. Economic
4. Commercial
5. Financial

---

## N8N Workflow Mappings

### Vector Search Query (document_embeddings)

```sql
SELECT
  id,
  file_id,
  content,
  1 - (embedding <=> '[...]'::vector(1536)) AS similarity
FROM document_embeddings
WHERE project_id = $projectId
  AND 1 - (embedding <=> '[...]'::vector(1536)) > 0.5
ORDER BY embedding <=> '[...]'::vector(1536)
LIMIT 10;
```

### Insert Assessment

```javascript
{
  projectId: 1,
  criterionId: 1,
  ragRating: 'green',        // lowercase: 'green', 'amber', or 'red'
  confidence: 85,            // integer 0-100
  finding: 'Paragraph text',
  evidence: '• Quote 1\n• Quote 2',
  recommendation: 'Paragraph text'
}
```

---

## ENUM Types

### file_status
- `pending`
- `processing`
- `completed`
- `failed`

### project_status
- `draft`
- `processing`
- `completed`

### rag_rating
- `green`
- `amber`
- `red`

### role
- `user`
- `admin` (likely)

---

## Foreign Key Relationships

```
users (id)
  └─> projects (userId)
       ├─> files (projectId)
       │    └─> document_embeddings (file_id)
       └─> assessments (projectId)
            └─> assessment_criteria (criterionId)
```

---

## Important Notes for N8N

1. **document_embeddings uses snake_case**:
   - `file_id`, `project_id`, `created_at`

2. **Other tables use camelCase**:
   - `projectId`, `criterionId`, `createdAt`

3. **Assessment fields are singular text**, not arrays:
   - Use single paragraphs for finding and recommendation
   - Format evidence as bullet points with `\n`

4. **Confidence is integer 0-100**, not float 0-1

5. **RAG rating must be lowercase**: 'green', 'amber', 'red'

6. **Use Service Role Key** for N8N to bypass RLS policies
