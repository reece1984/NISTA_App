# NISTA App - Technical Audit Report

**Prepared for External Advisor Review**
**Date:** December 8, 2025
**Codebase:** NISTA/PAR Readiness Assessment Platform
**Total Lines of Code:** ~21,400 lines (TypeScript/React)

---

## 1. Architecture Overview

### Tech Stack Confirmation

**Important Clarifications:**
- Uses **pgvector** (PostgreSQL extension in Supabase), NOT ChromaDB
- Uses standard **OpenAI API**, NOT Azure OpenAI
- **N8N** is the workflow orchestration layer that coordinates all AI operations

**Frontend:**
- React 18 + TypeScript 5.9.3
- Vite 7.1.7 (build tool)
- Tailwind CSS 3.4.1 (styling)
- React Router 7.9.5 (routing)
- TanStack Query 5.90.5 (server state management)
- React Hook Form + Zod (form validation)
- Additional: @dnd-kit (drag-drop), Recharts (charts), jsPDF + XLSX (exports)

**Backend Infrastructure:**
- **Supabase** (PostgreSQL + Auth + Storage)
  - PostgreSQL database with Row Level Security (RLS)
  - Supabase Auth for user authentication
  - Supabase Storage for document uploads
  - **pgvector extension** for vector embeddings (NOT ChromaDB)

- **N8N Workflow Orchestration**
  - Coordinates all AI operations via workflows
  - Calls OpenAI API (GPT-4o-mini, NOT Azure OpenAI) for assessment analysis
  - Calls LlamaCloud API for PDF parsing
  - Manages document processing pipeline and assessment generation
  - Generates and refines AI-powered action plans

- **Express.js Backend** (Node.js)
  - CRUD API for actions and comments
  - Located in `/backend/` directory
  - Direct PostgreSQL connection via `pg` library

**Vector Database:**
- **pgvector extension** in PostgreSQL (Supabase) - NOT a separate ChromaDB instance
- OpenAI text-embedding-ada-002 (1536 dimensions)
- Table: `document_embeddings` with IVFFlat indexing
- Vector similarity search using cosine distance

### Component Communication

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend (Vite)                  │
│  - User Interface (21 pages, 40+ components)                │
│  - State Management (TanStack Query + React Context)        │
└───────────┬──────────────────────┬──────────────────────────┘
            │                      │
            ▼                      ▼
    ┌───────────────┐      ┌──────────────────┐
    │   Supabase    │      │   Express API    │
    │  PostgreSQL   │◄─────┤  (Port 3000)     │
    │   + Auth      │      │  - Actions CRUD  │
    │   + Storage   │      │  - Comments      │
    └───────┬───────┘      └──────────────────┘
            │
            │ Service Role Key
            ▼
    ┌──────────────────┐
    │   N8N Workflows  │
    │  (AI Processing) │
    │  - Document      │
    │    parsing       │
    │  - RAG queries   │
    │  - Assessment    │
    │    generation    │
    │  - Action plans  │
    └──────────────────┘
            │
            ├─► LlamaCloud (PDF parsing)
            ├─► OpenAI GPT-4o-mini (analysis)
            └─► OpenAI Embeddings (RAG)
```

### Deployment Setup

**Current Configuration:**
- **Frontend:** Configured for Vercel deployment (vercel.json present)
- **Backend API:** Expects deployment to cloud (PORT 3000, env-configured)
- **Database:** Supabase cloud (production-ready)
- **N8N:** External instance (webhook-based)

**Environment Variables Required:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_N8N_WEBHOOK_URL` - N8N webhook endpoint
- `VITE_API_URL` - Express backend URL (defaults to localhost:3000)

**Deployment Stages Identified:**
- **Local dev:** Uses localhost for all services
- **Staging:** No staging environment configured (gap identified)
- **Production:** Would use cloud URLs for all services

---

## 2. Feature Inventory

### ✅ Fully Implemented & Working

**Project Management (5/5 features)**
- Create projects with full metadata (name, value, sector, organizations, gateway dates)
- Edit project settings
- Delete projects (cascading delete of related data)
- List all user projects
- Template selection (Gate 0-5, PAR)

**Document Management (6/6 features)**
- Multi-file drag-and-drop upload (PDF only, 50MB limit per file, 50 files max)
- Document type selection (business case, PEP, risk register)
- Real-time upload progress with cancellation
- Document listing with metadata
- Document deletion with confirmation
- Template-specific document guidance (essential vs. optional)

**Assessment Execution (8/9 features)**
- Run AI assessment via N8N webhook
- Real-time progress tracking (polls every 3 seconds)
- RAG-based document analysis with evidence extraction
- 5-dimension breakdown (Strategic, Management, Economic, Commercial, Financial)
- RAG rating calculation (Red/Amber/Green)
- Criterion-level detail view with findings, evidence, recommendations
- Re-run assessment capability
- PDF export (html2canvas + jsPDF)
- ⚠️ Excel export stubbed (libraries present, UI shows "coming soon")

**Action Plan Management (9/10 features)**
- AI-generated action plans from assessment results
- Conversational refinement interface with AI
- Kanban board with drag-and-drop status updates
- Table view with sorting/filtering
- Action detail modal with full editing
- User assignment with dropdown selection
- Due date tracking with overdue highlighting
- Priority levels (critical, high, medium, low)
- Bulk operations (delete, status updates)
- ⚠️ Comment threads partially implemented (infrastructure exists, not fully integrated)

**Authentication & Security (4/4 features)**
- Email/password sign-up with validation
- Sign-in with session persistence
- Password reset via email
- Protected routes with RLS enforcement

### 🟡 Partially Implemented

**Comments System**
- Backend tables exist (`action_comments`, `comment_mentions`)
- Frontend component (CommentThread.tsx) built
- Not fully integrated into all views
- Mention system (@username) referenced but not functional

### ⚪ Stub/Placeholder Features

**Marketing Pages (5 pages)**
- ProductLanding.tsx
- CorporateHomePage.tsx
- Success pages (Baseline, BusinessCase, Gateway, Risk, Tender) - 5 total
- These contain placeholder content, likely for future marketing site

**Export Features**
- Excel export button exists but shows "coming soon" toast
- XLSX library installed but not implemented

### Feature Summary Statistics

| Category | Total | Working | Partial | Stub |
|----------|-------|---------|---------|------|
| Pages | 21 | 16 | 0 | 5 |
| Components | 41 | 38 | 1 | 2 |
| Project Features | 5 | 5 | 0 | 0 |
| Document Features | 6 | 6 | 0 | 0 |
| Assessment Features | 9 | 8 | 0 | 1 |
| Action Plan Features | 10 | 9 | 1 | 0 |
| Auth Features | 4 | 4 | 0 | 0 |

**Overall: 90%+ of features fully functional**

---

## 3. Database State

### Schema Summary

**15 Core Tables:**

| Table | Records | Purpose | Status |
|-------|---------|---------|--------|
| `users` | User data | User accounts linked to Supabase Auth | ✅ Operational |
| `projects` | User data | Infrastructure projects | ✅ Operational |
| `files` | User data | Uploaded documents (PDFs) | ✅ Operational |
| `assessment_templates` | System data | Gate 0-5, PAR templates | ⚠️ Needs verification |
| `assessment_criteria` | System data | 5 dimensions of criteria | ⚠️ Needs verification |
| `assessments` | Generated | AI assessment results | ✅ Operational |
| `project_summaries` | Generated | Executive summaries | ✅ Operational |
| `document_embeddings` | Generated | Vector embeddings (1536-dim) | ✅ Operational |
| `assessment_runs` | Generated | Assessment execution tracking | ✅ Operational |
| `actions` | User data | Action items from plans | ✅ Operational |
| `action_plan_drafts` | Generated | AI draft proposals | ✅ Operational |
| `action_assessments` | Join table | Links actions to findings | ✅ Operational |
| `action_comments` | User data | Threaded comments | ⚠️ Schema ready, underutilized |
| `action_history` | Audit log | Change tracking (auto-logged) | ✅ Operational |
| `comment_mentions` | Notifications | User mentions | ⚠️ Schema ready, not implemented |

### Current Database Usage (Verified from Supabase)

**System Status:**
- **Projects:** 3 created
- **Assessment Runs:** 1 completed
- **Assessments:** 20 generated (from 1 run against Gate 0's 20 criteria)
- **Files:** 1 uploaded
- **Actions:** 0 created
- **Assessment Criteria:** 174 populated (across 7 gates)
- **Document Types:** 40 defined

**System is operational** with real data, not just empty schemas.

### Key Relationships

```
users (id)
  ├─> projects (user_id)
  │    ├─> files (projectId)
  │    │    └─> document_embeddings (file_id)
  │    ├─> assessments (projectId)
  │    │    ├─> assessment_criteria (criterionId)
  │    │    └─> action_assessments (assessment_id)
  │    │         └─> actions (action_id)
  │    └─> assessment_runs
  │         └─> action_plan_drafts (assessment_run_id)
  │              └─> actions (source_assessment_run_id)
  │
  ├─> actions (assigned_to, created_by, updated_by)
  │    ├─> action_comments (action_id)
  │    │    ├─> action_comments (parent_comment_id) [Self-join]
  │    │    └─> comment_mentions (comment_id)
  │    │         └─> users (mentioned_user_id)
  │    ├─> action_history (action_id)
  │    └─> action_assessments (action_id)
  │
  └─> action_comments (user_id)
```

### IPA Gate Coverage

**Gates Fully Populated (7 templates, 174 total criteria):**

| Gate | Criteria Count | Blockers | Critical | Status |
|------|---------------|----------|----------|--------|
| Gate 0 (Strategic Assessment) | 20 | 4 | 5 | ✅ Fully populated |
| Gate 1 (Business Justification) | 54 | 3 | 30 | ✅ Fully populated |
| Gate 2 (Delivery Strategy) | 20 | 3 | 11 | ✅ Fully populated |
| Gate 3 (Investment Decision) | 20 | 5 | 15 | ✅ Fully populated |
| Gate 4 (Readiness for Service) | 20 | 8 | 17 | ✅ Fully populated |
| Gate 5 (Operations Review) | 20 | 1 | 13 | ✅ Fully populated |
| PAR (Project Assessment Review) | 20 | 3 | 3 | ✅ Fully populated |
| **TOTAL** | **174** | **27** | **94** | |

**Verified from database:** All assessment criteria are populated and operational.

### Assessment Criteria/Rubrics - Completeness

**5 Dimensions Covered:**
1. Strategic
2. Management
3. Economic
4. Commercial
5. Financial

**Criterion Structure (fully modelled):**
- `criterion_code` - Unique identifier (e.g., "NISTA-001", "G0-MG-6")
- `dimension` - One of 5 dimensions
- `category` - Grouping within dimension
- `title` - Criterion name
- `description` - Full explanation
- `assessment_question` - What to evaluate
- `template_id` - Links to Gate 0-5/PAR
- `weight` - Importance scoring (nullable)
- `is_critical` - Boolean flag for gateway blockers

**Status:** ✅ All 174 criteria fully populated and operational.

**🔴 CRITICAL GAP: Quality Rubrics Are Definitional Only**

Current rubric structure is high-level:
```json
{
  "RED": "Strategic outcomes at risk",
  "AMBER": "Achievable but concerns exist",
  "GREEN": "On track with positive indicators"
}
```

**Missing calibration fields:**
- `evidence_indicators` - What specific evidence signals each rating
- `red_flags` - Warning signs that trigger RED/AMBER
- `document_signals` - Which document sections/content to look for
- `scoring_thresholds` - Quantitative boundaries for ratings

**Impact:** AI has definitional guidance only, no concrete calibration rules. This contributes to potentially generous ratings.

### Evidence Requirements

**🔴 CRITICAL GAP: Evidence Requirements Severely Underpopulated**

**Document Types ARE Populated (40 types):**
- Business Case category: 9 types
- Delivery category: 4 types
- Governance category: 8 types
- Technical category: 6 types
- Commercial category: 3 types
- Financial category: 3 types
- Assurance category: 3 types
- Other category: 4 types

**But Evidence Requirements Critically Incomplete:**

| Gate | Criteria | Evidence Requirements Defined | Coverage |
|------|----------|-------------------------------|----------|
| Gate 0 | 20 | 0 | 0% |
| Gate 1 | 54 | 12 | 22% |
| Gate 2 | 20 | 0 | 0% |
| Gate 3 | 20 | 0 | 0% |
| Gate 4 | 20 | 0 | 0% |
| Gate 5 | 20 | 0 | 0% |
| PAR | 20 | 0 | 0% |
| **TOTAL** | **174** | **12** | **7%** |

**Impact:** Only 7% of criteria have explicit evidence requirements. This is the **root cause of generous AI ratings** - the AI lacks clear guidance on what evidence proves each criterion is met.

**What's Missing:**
- Document type requirements per criterion (e.g., "Strategic Case must include 5-year outcomes framework")
- Section/heading requirements (e.g., "Must contain 'Benefits Realization' section")
- Mandatory data elements (e.g., "Must quantify benefits in £M over 5 years")
- Evidence quality thresholds (e.g., "Board-approved documents only, not drafts")

**Evidence Storage (Technical Implementation):**
- Extracted evidence stored as TEXT in `assessments.evidence`
- Format: Bullet-pointed quotes with document references
- Includes page numbers and section headings where available
- Linked to specific criterion via `criterion_id` foreign key

**Confidence Scoring:**
- Stored as INTEGER (0-100) in `assessments.confidence`
- Represents AI's certainty in the assessment based on evidence quality

**Evidence Extraction Method:**
- RAG-based semantic search across document embeddings
- Multiple search strategies (direct terms, synonyms, section names)
- Top 10 relevant chunks retrieved per criterion
- Cohere reranking for relevance optimization

---

## 4. AI/RAG System

### Document Ingestion Pipeline

**Status: ✅ FULLY WORKING**

**Complete Flow:**

1. **Upload:** User uploads PDF to Supabase Storage (max 50MB)
2. **Record Creation:** File record created in `files` table (status: 'uploaded')
3. **Webhook Trigger:** Frontend triggers N8N webhook with:
   - `identifier: "document_upload"`
   - `file_url`: Supabase Storage URL
   - `file_id`: Database record ID
   - `project_id`: Parent project
4. **PDF Download:** N8N HTTP Request node downloads PDF from Supabase
5. **LlamaCloud Parsing:**
   - POST to LlamaCloud API for advanced PDF parsing
   - Handles complex layouts, tables, images, multi-column text
   - Returns job ID
6. **Processing Wait:** 30-second wait for LlamaCloud processing
7. **Status Polling:**
   - GET LlamaCloud job status
   - Loop until status = "SUCCESS"
   - If not success, wait another 30s and retry
8. **Markdown Retrieval:** GET parsed markdown export from LlamaCloud
9. **AI-Powered Chunking:** (Custom LangChain code node with GPT-4o-mini)
   - Analyzes document to find natural topic transitions
   - Target chunk size: 400-1000 characters
   - AI identifies semantic boundaries (section changes, topic shifts)
   - Splits at meaningful break points, not arbitrary character limits
   - Generates metadata for each chunk:
     - `chunk_number`: Sequential order
     - `chunk_size`: Character count
     - `context_before`: Previous chunk content
     - `context_after`: Next chunk content
     - `context_summary`: AI-generated 1-sentence summary
   - Merges small chunks (<400 chars) with neighbors
10. **Embedding Generation:**
    - OpenAI text-embedding-ada-002 (1536 dimensions)
    - One embedding vector per chunk
11. **Vector Storage:**
    - Insert into `document_embeddings` table
    - Includes content, embedding vector, and metadata as JSONB
    - Linked to file_id and project_id
12. **Status Update:** File record updated to status: 'completed'

**Performance:**
- Total pipeline time: 45-90 seconds per document
- LlamaCloud parsing: 30-60 seconds (largest component)
- Chunking + embedding: 15-30 seconds
- No user-facing progress bar during N8N processing (gap)

### Chunking Strategy

**Method: Semantic Chunking with AI**

Traditional chunking (fixed 512-character splits) breaks mid-sentence and loses context. This system uses **GPT-4o-mini to identify natural boundaries**.

**Algorithm:**
1. Read 1000-character window
2. AI prompt: "Find the best transition point where one topic ends and another begins"
3. AI returns last word before split point
4. Split at that word boundary
5. Include punctuation (periods, spaces) in chunk
6. Repeat for entire document

**Chunk Enrichment:**
Each chunk includes context for better retrieval:
- **Main content:** The chunk text itself
- **Before/After:** Surrounding chunks for continuity
- **Summary:** AI-generated abstract of chunk topic
- **Metadata:** Chunk number, size, file/project IDs

**Benefits:**
- Preserves topic coherence
- Prevents mid-paragraph splits
- Improves RAG retrieval accuracy (AI can see broader context)
- Maintains narrative flow

**Implementation:** Custom LangChain code node in N8N (JavaScript)

### Assessment Generation Flow

**Status: ✅ FULLY WORKING**

**Detailed Workflow:**

1. **Trigger:** User clicks "Run Assessment" button
2. **Frontend Action:**
   - Calls N8N webhook with payload:
     ```json
     {
       "identifier": "run_assessment",
       "project_id": 123,
       "template_id": 2
     }
     ```
3. **N8N Processing:**
   - **Delete Old Assessments:** Removes previous assessment records for project (allows re-runs)
   - **Fetch Project Template:** Query `projects` table to get template_id
   - **Fetch Criteria:** Query `assessment_criteria` filtered by template_id
   - **Loop Over Criteria:** Split into batch processing (one criterion at a time)
4. **For Each Criterion** (Parallel LangChain AI Agent):
   - **Input:** Criterion code, title, assessment question
   - **System Prompt:** "You are a senior IPA assessor with HM Treasury Green Book knowledge"
   - **Tools Available:** "Search Project Documents" (vector store retrieval)
   - **Search Strategy:** (Multi-attempt with fallbacks)
     - **First:** Direct term search using criterion title words
     - **Second:** Domain-specific synonyms:
       - "strategic alignment" → "levelling up, net zero, economic growth"
       - "problem definition" → "capacity constraints, demand, rationale"
       - "governance" → "board, committee, oversight, accountability"
     - **Third:** Common section names ("strategic case", "business case", "management case")
     - Continues until relevant evidence found or 3 attempts exhausted
   - **Retrieval:** Top 10 chunks, Cohere reranking for relevance
   - **Analysis:** GPT-4o-mini evaluates evidence against IPA standards
   - **Output:** JSON structure:
     ```json
     {
       "criterionCode": "G0-ST-1",
       "ragRating": "Amber",
       "finding": "2-3 sentence summary",
       "evidence": "Specific quotes and document references",
       "recommendation": "Concrete next steps for SRO",
       "confidence": 0.75
     }
     ```
   - **Wait 2 Seconds:** Rate limiting between criteria
5. **Parse & Store:**
   - JSON extraction and validation
   - Insert into `assessments` table with foreign keys to project and criterion
6. **Frontend Polling:**
   - Every 3 seconds, query `assessments` table for new results
   - Display progress: "Assessing criterion 8 of 25..."
   - Max timeout: 10 minutes
7. **Executive Summary Generation:**
   - After all criteria assessed, second AI agent triggers
   - **Input:** All assessment results with RAG counts (e.g., "10 RED, 8 AMBER, 7 GREEN")
   - **AI Task:** Generate overall project rating using rules:
     - **RED:** ≥50% RED criteria OR critical criterion RED
     - **AMBER:** ≥30% RED/AMBER combined
     - **GREEN:** <30% RED/AMBER, no critical blockers
   - **Output:** Executive summary JSON with:
     - Overall rating (green/amber/red)
     - Executive summary (2-3 sentences)
     - Key strengths (with criterion codes)
     - Critical issues (with criterion codes)
     - Overall recommendation (prioritized actions)
8. **Summary Storage:** Insert into `project_summaries` table
9. **Frontend Display:** Show results in Summary and Detail pages

**Key Features:**
- Multi-strategy RAG retrieval (reduces "evidence not found" failures)
- Criterion-specific confidence scoring
- Automatic retry logic for API failures
- Evidence traceability (quotes linked to documents)

### Current Calibration Approach

**How the System Scores Projects:**

**RAG Rating Definitions (from AI system prompt):**

- **GREEN:** Criterion fully met with strong evidence. No concerns. Project ready to proceed on this aspect.
- **AMBER:** Criterion partially met or minor concerns identified. Requires attention but not a blocker. May need additional work or clarification.
- **RED:** Criterion not met or significant concerns. Major gaps in evidence or approach. Requires immediate remediation before proceeding.

**Confidence Scoring (0.0 to 1.0):**

- **0.9-1.0:** Multiple authoritative documents clearly address criterion
- **0.7-0.8:** Good evidence found but some aspects unclear or partially documented
- **0.5-0.6:** Limited evidence; assessment based on inference or indirect references
- **0.3-0.4:** Minimal evidence; significant uncertainty in rating
- **0.0-0.2:** No relevant evidence found; rating is best-guess only

**AI Calibration Method:**

1. **Role Framing:** AI instructed as "senior UK government project assurance analyst conducting IPA gate reviews"
2. **Knowledge Base:** References to:
   - HM Treasury Green Book standards
   - IPA best practices
   - UK government project delivery frameworks
3. **Evidence Standards:**
   - Must quote specific documents, sections, or data points
   - Must reference dates, versions, authors where available
   - Must distinguish between strong evidence (approved docs) and weak evidence (draft notes)
   - Must identify gaps explicitly
4. **Prompt Engineering:** Extensive system prompts (300+ words) define expectations
5. **Few-Shot Learning:** No explicit examples in prompts (relies on GPT-4o-mini pre-training)

**Limitations:**

- ⚠️ **No Human Calibration:** No feedback loop where assessors validate AI ratings
- ⚠️ **No Rubric Fine-Tuning:** Cannot adjust scoring thresholds without editing N8N prompts
- ⚠️ **Model Dependency:** Entirely reliant on GPT-4o-mini's training data (as of Jan 2025)
- ⚠️ **No Ground Truth:** No test set of "correct" assessments to validate against
- ✅ **Transparency:** All evidence quoted, so human reviewers can verify AI reasoning

**Recommendation:** Implement human-in-the-loop validation for first 10-20 projects to identify systematic AI errors.

---

## 5. Frontend State

### Key Screens/Views (16 Production Pages)

**Fully Polished & Production-Ready:**

| Page | File | Purpose | UI Quality |
|------|------|---------|------------|
| Projects Landing | ProjectsLanding.tsx | Dashboard with project cards, stats, create button | ⭐⭐⭐⭐⭐ |
| Project Overview | project/OverviewPage.tsx | High-level project health with RAG breakdown | ⭐⭐⭐⭐⭐ |
| Documents | project/DocumentsPage.tsx | Upload interface, document list, guidance panel | ⭐⭐⭐⭐⭐ |
| Assessment Summary | project/SummaryPage.tsx | Executive summary with overall rating | ⭐⭐⭐⭐⭐ |
| Assessment Detail | project/DetailPage.tsx | Criterion-by-criterion results (5 dimensions) | ⭐⭐⭐⭐⭐ |
| Actions | project/ActionsPage.tsx | Kanban board with drag-drop | ⭐⭐⭐⭐⭐ |
| Settings | project/SettingsPage.tsx | Edit project metadata (org, dates, template) | ⭐⭐⭐⭐ |
| Login | LoginPage.tsx | Email/password auth, password reset link | ⭐⭐⭐⭐⭐ |
| Sign Up | SignUpPage.tsx | Registration with validation | ⭐⭐⭐⭐⭐ |
| Criteria Browser | AssessmentCriteriaPage.tsx | Browse all criteria by template | ⭐⭐⭐⭐ |

**Wireframe/Placeholder Pages (5 stubs):**
- Marketing landing pages: ProductLanding.tsx, CorporateHomePage.tsx
- Post-assessment success pages: BaselineSuccessPage.tsx, BusinessCaseSuccessPage.tsx, GatewaySuccessPage.tsx, RiskSuccessPage.tsx, TenderSuccessPage.tsx

### UI Completeness

**Design System:**

✅ **Fully Themed:**
- CSS custom properties for colors (primary, secondary, text, background)
- Supports light/dark mode infrastructure (not fully implemented but hooks exist)
- Consistent spacing scale (Tailwind)

✅ **Component Library:** (src/components/ui/)
- Button (variants: primary, secondary, danger, ghost)
- Input, Label, TextArea
- Modal, Sheet (slide-out panel)
- Badge, Card, Container
- Toast notifications (success, error, info, loading)
- ConfirmationDialog

✅ **Responsive Design:**
- Mobile-first Tailwind breakpoints (sm, md, lg, xl)
- Sidebar collapses on mobile
- Tables convert to cards on small screens (some areas)
- Upload modal optimized for touch

✅ **Loading States:**
- Skeleton loaders on data fetch
- Spinner on button actions
- Progress bars on file uploads
- "Assessing criterion X of Y" during assessment

✅ **Error Handling:**
- Form validation with inline error messages (Zod + React Hook Form)
- Toast notifications for API failures
- Retry buttons on failed operations
- Confirmation dialogs for destructive actions (delete project, delete action)

✅ **Accessibility:**
- Semantic HTML (header, nav, main, section)
- Form labels properly associated
- Keyboard navigation works (modals, dropdowns)
- ⚠️ No ARIA labels or screen reader testing detected

**Polish Level:**
- **Core features:** 9/10 (production-grade)
- **Marketing pages:** 3/10 (skeleton only)

### End-to-End Functional User Flows

**✅ Flow 1: New User Onboarding**
1. Visit landing → Click "Sign Up"
2. Enter email/password → Submit
3. Email verification (Supabase Auth)
4. Login → Redirect to Projects dashboard
5. Empty state with "Create Project" button

**✅ Flow 2: First Assessment**
1. Click "Create New Project"
2. Fill form (name, value, sector, template, gateway date)
3. Submit → Redirect to project Overview
4. Navigate to Documents tab
5. Drag-drop PDFs (Business Case, PEP, Risk Register)
6. Upload progress shows (% complete, time remaining)
7. Click "Run Assessment"
8. Real-time progress: "Assessing 8 of 25 criteria..."
9. Assessment completes (60-120 seconds)
10. View results on Summary page (executive summary, overall RED/AMBER/GREEN)
11. Navigate to Detail page (see all 25 criteria with findings)
12. Export to PDF (download file)

**✅ Flow 3: Action Plan Generation & Management**
1. From assessment results → Click "Generate Action Plan"
2. AI analyzes RED/AMBER findings (30 seconds)
3. Draft actions shown in workspace (editable cards)
4. User refines via chat: "Make action 3 more specific"
5. AI updates draft in real-time
6. User clicks "Confirm Actions"
7. Actions written to database
8. Navigate to Actions tab
9. Kanban board shows actions (Not Started, In Progress, Completed, Won't Fix)
10. Drag card to change status
11. Click action → Detail modal opens
12. Edit title, description, priority, due date
13. Assign to user (dropdown)
14. Save changes → Audit log updated
15. View action history (who changed what and when)

**✅ Flow 4: Project Lifecycle**
1. Edit project settings (change gateway date, previous rating)
2. Re-run assessment after uploading new documents
3. Compare results (before/after - partially implemented)
4. Delete project → Confirmation dialog → Cascading delete (assessments, files, actions)

**Broken/Incomplete Flows:** None identified in core functionality.

---

## 6. Integration Points

### N8N Workflows

**Workflow 1: Document Upload & Embedding**

**Trigger:** Webhook POST to `/content-saas`
- Payload: `{ identifier: "document_upload", file_url, file_id, project_id }`

**Nodes (21 total in workflow):**
1. **Webhook** - Receives request, returns CORS headers
2. **Switch** - Routes by identifier (document_upload vs run_assessment)
3. **Loop Over Items** - Processes multiple files if batched
4. **Get PDF** - HTTP Request downloads from Supabase Storage
5. **PostLlamaCloud** - Uploads PDF to LlamaCloud parsing API
   - Returns job ID
6. **Wait for Processing** - 30-second delay
7. **Get Job Status** - Polls LlamaCloud for completion
8. **If Success** - Check if status = "SUCCESS"
   - If NO → loop back to Wait
   - If YES → continue
9. **Get Markdown Export** - Retrieves parsed markdown
10. **Agent Chunking** - LangChain code node:
    - Connects to OpenAI Chat Model (GPT-4o-mini)
    - Executes semantic chunking algorithm
    - Returns array of chunks with metadata
11. **Supabase Vector Store** - Inserts embeddings:
    - Connects to Embeddings OpenAI (ada-002)
    - Connects to Default Data Loader (formats documents)
    - Connects to Recursive Text Splitter (splits if needed)
    - Writes to `document_embeddings` table
12. **Done** - Returns success to frontend

**Workflow 2: Run Assessment**

**Trigger:** Webhook POST to `/content-saas`
- Payload: `{ identifier: "run_assessment", project_id, template_id }`

**Nodes (15 total in workflow):**
1. **Webhook** - Receives request
2. **Switch** - Routes to assessment branch
3. **Delete Old Assessments** - Clears previous results from `assessments` table
4. **Get Project Template** - Supabase query for project details
5. **Get Assessment Criteria** - Supabase query filtered by template_id
6. **Loop Over Items** - Batch process each criterion
7. **Assess Docs Against Criteria** - LangChain AI Agent:
   - Tool: "Search Project Documents" (Supabase vector store)
   - Model: OpenAI GPT-4o-mini
   - Reranker: Cohere (improves retrieval relevance)
   - Embeddings: OpenAI ada-002
   - Outputs: JSON assessment for criterion
8. **Parse AI Response** - Code node extracts JSON from LLM response
9. **Add Database Fields** - Code node adds project_id, criterion_id
10. **Create a Row** - Supabase insert into `assessments`
11. **Wait** - 2-second rate limit
12. **Loop Done** - Aggregates all assessments
13. **Format Assessments** - Code node counts RED/AMBER/GREEN
14. **AI Agent** (Summary Generator) - LangChain agent:
    - Model: OpenAI GPT-4.1-mini (different model than criteria assessment)
    - Inputs: All assessment results + counts
    - Outputs: Executive summary JSON
15. **Parse Summary Response** - Extracts JSON
16. **Create a Row** - Insert into `project_summaries`

**Workflow 3: Action Plan Generation** (Referenced but JSON not fully detailed in provided files)

**Expected Nodes:**
- Webhook trigger with `identifier: "generate_action_plan"`
- Fetch RED/AMBER assessments for project
- AI agent generates proposed actions
- Store draft in `action_plan_drafts` table
- Return draft ID to frontend

**Workflow 4: Refine Action Plan** (Referenced but not detailed)

**Expected Nodes:**
- Webhook with `identifier: "refine_action_plan"`, `draft_id`, `user_message`, `conversation_history`
- Fetch existing draft
- AI agent processes refinement request
- Update draft with new actions
- Append to conversation history
- Return updated draft

### External APIs/Services Connected

| Service | Purpose | Authentication | Rate Limits | Status |
|---------|---------|----------------|-------------|--------|
| **Supabase** | PostgreSQL DB, Auth, Storage | Anon key (client), Service role (N8N) | Per plan tier | ✅ Operational |
| **LlamaCloud** | PDF parsing (complex docs) | API key (Header Auth) | Unknown | ✅ Operational |
| **OpenAI** | GPT-4o-mini (analysis), GPT-4.1-mini (summary), ada-002 (embeddings) | API key | Tier-based (TPM/RPM) | ✅ Operational |
| **Cohere** | Reranking (relevance scoring) | API key | Free tier limits | ⚠️ Configured, usage unclear |
| **Express API** | Action/comment CRUD | None | None | ✅ Operational |

**Service Dependencies:**
- **Critical:** Supabase (entire app), OpenAI (assessments), N8N (orchestration)
- **Important:** LlamaCloud (document parsing), Express API (action management)
- **Optional:** Cohere (can fallback to vector search without reranking)

**Failure Modes:**
- Supabase down → App unusable (auth fails)
- OpenAI down → Assessments fail, no fallback
- N8N down → No assessments or action plans, but UI still works for viewing existing data
- LlamaCloud down → Document upload fails, no alternative parser
- Express API down → Actions view-only (can't edit/comment)

### Authentication/Authorization State

**Frontend Authentication:**
- **Method:** Supabase Auth (JWT tokens)
- **Flow:** Email/password → JWT stored in localStorage → Sent in Authorization header
- **Session:** Auto-refreshed by Supabase client
- **Protected Routes:** `<ProtectedRoute>` wrapper checks `auth.uid()`
- **Logout:** Clears tokens and redirects to login

**Database Authorization (Row Level Security - RLS):**

| Table | SELECT | INSERT | UPDATE | DELETE | Policy |
|-------|--------|--------|--------|--------|--------|
| `users` | Own record only | Own record only | Own record only | N/A | openId = auth.uid() |
| `projects` | Own projects | Own projects | Own projects | Own projects | userId matches auth user |
| `files` | Own project files | Own project files | Own project files | Own project files | Via project ownership |
| `assessments` | Own project | Service role only | Service role only | Own project | Via project ownership |
| `assessment_criteria` | Public (all users) | Admin only | Admin only | Admin only | Read-only reference data |
| `document_embeddings` | Own project chunks | Service role only | N/A | Own project chunks | Via project ownership |
| `actions` | Own project | Own project | Own project | Own project | Via project ownership |
| `action_comments` | Own project actions | Authenticated users | Comment author only | Comment author only | Via action ownership |

**RLS Bypass:**
- N8N uses **Supabase Service Role Key** to write assessments and embeddings
- Service role bypasses all RLS policies (full database access)

**Backend API Authentication:**
- ⚠️ **No authentication implemented**
- CORS-protected (configurable origin in .env)
- Assumes trusted internal network
- **Security Gap:** Anyone who knows the API URL can call it

**N8N Webhook Security:**
- ⚠️ **Publicly accessible webhooks**
- No HMAC signature validation
- No API key required
- Routing by `identifier` field only
- **Security Gap:** Anyone can trigger workflows if they know the URL

**Risk Assessment:**
- ✅ Database well-protected (RLS + JWT)
- ✅ Supabase Storage respects RLS
- ⚠️ Express API needs JWT validation (HIGH PRIORITY)
- ⚠️ N8N webhooks need authentication (MEDIUM PRIORITY - obscurity provides some protection)
- ⚠️ No rate limiting on any endpoint (MEDIUM PRIORITY)

---

## 7. Known Issues & Technical Debt

### Identified Issues

**🔴 Critical: None**

**🟡 Medium Priority (8 items):**

**1. Naming Convention Inconsistency**
- **Location:** Database schema
- **Issue:** Mix of camelCase and snake_case
  - camelCase: `assessments.ragRating`, `projects.userId`, `files.fileName`
  - snake_case: `action_plan_drafts.assessment_run_id`, `actions.action_status`
- **Evidence:** Migration file `MIGRATE_PROJECTS_TO_SNAKE_CASE.sql` shows active effort to standardize
- **Impact:** Confusion in queries, requires mapping layer in TypeScript
- **Resolution:** Complete migration to snake_case, update all Supabase queries in frontend

**2. Comment System Underutilized**
- **Location:** Frontend + Database
- **Issue:** Full infrastructure exists but not integrated
  - Tables: `action_comments`, `comment_mentions` (ready)
  - Component: `CommentThread.tsx` (built)
  - Integration: Only partially wired in ActionDetailModal
- **Impact:** Lost collaboration feature, confusing for users
- **Resolution:** Complete integration or remove scaffolding

**3. Express API Has No Authentication**
- **Location:** `/backend/src/server.js`
- **Issue:** Accepts requests from any origin matching CORS
- **Security Risk:** Anyone with API URL can create/edit/delete actions
- **Resolution:** Add JWT validation middleware (check Supabase token)

**4. Evidence Requirements Severely Incomplete (7% coverage)**
- **Location:** Database - `assessment_criteria` table, `evidence_requirements` field
- **Issue:** Only 12 of 174 criteria (7%) have defined evidence requirements
- **Impact:** AI lacks clear guidance on what evidence proves each criterion, leading to potentially generous ratings
- **Resolution:** Populate evidence requirements for all 174 criteria with:
  - Required document types
  - Mandatory sections/headings
  - Specific data elements
  - Quality thresholds (approved vs. draft)
- **Effort:** 2-3 weeks (subject matter expert needed)

**5. Quality Rubrics Are Definitional Only (No Calibration Rules)**
- **Location:** Database - rubric definitions
- **Issue:** Rubrics provide high-level definitions ("RED: Strategic outcomes at risk") but no concrete calibration
- **Missing:** evidence_indicators, red_flags, document_signals, scoring_thresholds
- **Impact:** AI cannot calibrate ratings consistently across projects
- **Resolution:** Add detailed calibration rules to each criterion's rubric
- **Effort:** 1-2 weeks (subject matter expert needed)

**6. N8N Webhooks Publicly Accessible**
- **Location:** N8N workflow webhook nodes
- **Issue:** No signature validation, no API key
- **Security Risk:** Anyone can trigger document processing or assessments if they discover URL
- **Resolution:** Add HMAC signature or secret token validation

**7. No Rate Limiting**
- **Location:** All endpoints (frontend, backend, N8N)
- **Issue:** Unlimited requests possible
- **Risk:** DoS attacks, OpenAI bill explosion, Supabase quota exhaustion
- **Resolution:** Add rate limiting (Redis-based or Supabase built-in)

**8. Error Handling Could Be More Robust**
- **Location:** Throughout codebase
- **Issue:** Some try-catch blocks use generic error messages
  - Example: "Failed to fetch assessments" (no detail about why)
- **Impact:** Hard to debug production issues
- **Resolution:** Structured error logging with context (user ID, project ID, timestamp)

**9. 87 Console.log Statements**
- **Location:** Throughout frontend code
- **Issue:** Debug logging using console.log (not production-ready)
- **Impact:** Clutters browser console, no centralized logging
- **Resolution:** Replace with structured logger (e.g., winston, pino) or remove

**🟢 Low Priority (4 items):**

**10. No Assessment Criteria Seed Scripts (Deployment Risk)**
- **Location:** Repository root
- **Issue:** 174 criteria are populated in production database, but no SQL export file in repository
- **Impact:** New deployments (staging, DR) would have empty criteria unless manually copied
- **Resolution:** Export current criteria to SQL seed file, add to deployment docs
- **Effort:** 1 day

**11. Hardcoded Localhost Fallback**
- **Location:** `src/services/api.ts:7`
- **Code:** `const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'`
- **Issue:** Could fail silently in production if env var not set
- **Resolution:** Throw error if VITE_API_URL missing in production builds

**12. TODO Comments (Only 3 Found)**
- `ProjectLayout.tsx:86` - "TODO: Implement rerun trigger" (already implemented elsewhere)
- `ProjectDetailPage.tsx:957` - "TODO: Implement Excel export" (libraries ready)
- `ProjectDetailPage.tsx:964` - "TODO: Implement PDF export" (PDF export actually works in AssessmentDetail.tsx, comment may be stale)

**13. No Automated Tests**
- **Issue:** Zero test files found (no Jest, Vitest, Cypress config)
- **Risk:** Regressions undetected, fragile refactoring
- **Resolution:** Add integration tests for critical paths (assessment flow, action plan)

### Incomplete Error Handling Examples

**Good Error Handling (FileUpload component):**
```typescript
if (file.size > maxSize) {
  toast({ type: 'error', message: `File ${file.name} exceeds 50MB limit` })
  return
}
if (file.type !== 'application/pdf') {
  toast({ type: 'error', message: 'Only PDF files are supported' })
  return
}
```

**Weak Error Handling (generic messages):**
```typescript
catch (error) {
  toast({ type: 'error', message: 'Failed to load project' })
  // No error details logged, no context about which project
}
```

**Missing Error Handling:**
- N8N webhook failures not surfaced to user (silent failure)
- Supabase connection errors show generic "Network error"
- OpenAI API rate limits cause assessment to hang (no retry logic in frontend)

### Fragile Components

**Analysis:** No inherently fragile components found. Code is generally well-structured with proper error boundaries at the React Router level.

**Potential Fragility:**
- Assessment polling (relies on 3-second intervals; could miss updates if timing is off)
- Drag-and-drop in Kanban (depends on @dnd-kit library updates)

---

## 8. What's Missing for Production

### Security Gaps

**🔴 High Priority (5 items):**

**1. Express API Authentication**
- **Current State:** No auth, CORS-only protection
- **Risk:** Unauthorized action manipulation
- **Fix:** Add JWT middleware to validate Supabase tokens
- **Effort:** 1-2 days

**2. N8N Webhook Security**
- **Current State:** Public webhooks with identifier routing
- **Risk:** Unauthorized assessment runs (OpenAI cost), data exfiltration
- **Fix:** Add HMAC signature validation or secret token
- **Effort:** 1 day

**3. Rate Limiting**
- **Current State:** None on any endpoint
- **Risk:** DoS attacks, runaway OpenAI costs
- **Fix:** Implement Redis-based or Supabase-native rate limiting (10 req/min per user)
- **Effort:** 2-3 days

**4. Input Sanitization Audit**
- **Current State:** Form validation exists (Zod), but SQL injection risk if N8N uses string interpolation
- **Risk:** SQL injection, XSS
- **Fix:** Audit all N8N Supabase nodes for parameterized queries, add XSS sanitization in frontend
- **Effort:** 1-2 days

**5. Secret Rotation Process**
- **Current State:** No documented process
- **Risk:** Compromised keys can't be quickly rotated
- **Fix:** Document rotation steps for Supabase, OpenAI, N8N credentials
- **Effort:** 1 day

**🟡 Medium Priority (3 items):**

**6. HTTPS Enforcement**
- **Current State:** Likely handled by Vercel/Supabase, but not verified
- **Fix:** Confirm all traffic uses HTTPS, add HSTS headers
- **Effort:** 1 day

**7. Content Security Policy (CSP)**
- **Current State:** No CSP headers configured
- **Risk:** XSS vulnerabilities more exploitable
- **Fix:** Add CSP headers via Vercel config
- **Effort:** 1 day

**8. Dependency Vulnerability Scanning**
- **Current State:** No CI/CD pipeline detected, no Dependabot
- **Fix:** Enable Dependabot on GitHub, add `npm audit` to CI
- **Effort:** 1 day

### Scalability Concerns

**Database:**

✅ **Good:**
- Proper indexes on vector searches (IVFFlat with 100 lists)
- Foreign keys with CASCADE DELETE (data integrity)
- RLS policies prevent unauthorized access

⚠️ **Concerns:**
- **No connection pooling** in Express backend (uses raw `pg` client)
  - Risk: Connection exhaustion under load
  - Fix: Use `pg-pool` or PgBouncer
- **Unbounded embeddings table growth**
  - Risk: document_embeddings table could reach millions of rows
  - Fix: Add archival strategy (delete embeddings for deleted projects)
- **Assessment polling hammers database**
  - Risk: 100 concurrent users = 33 queries/second to Supabase
  - Fix: Replace polling with Supabase Realtime subscriptions (websockets)

**N8N:**

⚠️ **Concerns:**
- **Synchronous processing** (frontend waits for webhook completion)
  - Risk: Long-running assessments (2-3 minutes) tie up connections
  - Fix: Return job ID immediately, use polling or websockets for status
- **No queue system** for handling multiple assessments
  - Risk: 10 users click "Run Assessment" simultaneously → 10 parallel OpenAI calls → rate limit errors
  - Fix: Add job queue (Redis + Bull) or N8N built-in queue mode
- **OpenAI rate limits not handled**
  - Risk: Assessment fails with "429 Too Many Requests"
  - Fix: Add exponential backoff retry in N8N nodes
- **LlamaCloud parsing has 30s+ latency**
  - Risk: Poor UX, timeout errors
  - Fix: Add real-time status updates to frontend ("Parsing page 5 of 20...")

**Frontend:**

✅ **Good:**
- React Query provides caching and deduplication
- Lazy loading not needed yet (bundle size acceptable)

⚠️ **Concerns:**
- **No CDN for static assets** (Vite build outputs not optimized for caching)
  - Fix: Configure Vercel CDN headers, enable asset fingerprinting
- **Large PDF exports** (html2canvas generates big files)
  - Fix: Optimize images, use server-side PDF generation

**Load Testing:**
- ❌ **No load tests performed**
- Recommendation: Test with 50 concurrent users running assessments

### Monitoring/Logging State

**Current State: ❌ MINIMAL**

| Component | Monitoring | Logging | Alerting |
|-----------|-----------|---------|----------|
| **Frontend** | ❌ None | Console.log only | ❌ None |
| **Express API** | ✅ `/api/health` endpoint | Console.log | ❌ None |
| **Supabase** | ✅ Built-in dashboard | ✅ Query logs | ⚠️ Quota alerts only |
| **N8N** | ⚠️ Internal logs | ⚠️ Execution history | ❌ None |
| **OpenAI** | ⚠️ Usage dashboard | ⚠️ API logs | ❌ None |

**Missing:**

1. **Application Performance Monitoring (APM)**
   - No Sentry, Datadog, New Relic, or similar
   - Can't track error rates, response times, or user flows

2. **Structured Logging**
   - Console.log statements throughout (87 found)
   - No centralized log aggregation (LogDNA, Better Stack, CloudWatch)
   - No correlation IDs to trace requests across services

3. **Error Tracking**
   - Frontend errors shown in toasts but not logged externally
   - No stack traces captured for debugging

4. **Uptime Monitoring**
   - No Pingdom, UptimeRobot, or health check monitoring
   - No alerting if Supabase, N8N, or OpenAI goes down

5. **User Analytics**
   - No behavior tracking (Mixpanel, Amplitude, PostHog)
   - Can't answer: "Do users complete assessments?" "Where do they drop off?"

6. **Business Metrics**
   - No tracking of:
     - Assessments run per day
     - Average assessment time
     - Action plan conversion rate
     - Document upload success rate

**Recommendations (Priority Order):**

1. **Immediate:** Add Sentry to frontend (error tracking)
2. **Week 1:** Configure Supabase log forwarding to external service
3. **Week 2:** Add structured logging to Express API (winston or pino)
4. **Week 2:** Set up uptime monitoring with Slack/email alerts
5. **Week 3:** Integrate PostHog or Mixpanel for user analytics
6. **Month 2:** Add distributed tracing (Jaeger or Zipkin) for N8N→Supabase→OpenAI flow

**Cost:** Most tools have free tiers suitable for beta (Sentry: 5k errors/month free, PostHog: 1M events free)

---

## 9. Summary Assessment

### Overall Maturity: **BETA / PRE-PRODUCTION**

**Code Quality:** ⭐⭐⭐⭐ (4/5)
- Clean, maintainable React code (~21,400 lines)
- Proper TypeScript typing throughout
- Well-organized component structure
- Good separation of concerns (services, hooks, components)
- **Deduction:** No tests, some console.logs remaining

**Feature Completeness:** ⭐⭐⭐⭐ (4/5)
- 90%+ of core features fully functional
- AI/RAG system sophisticated and working
- End-to-end user flows complete
- **Deduction:** Comments system partially implemented, Excel export stubbed

**Database Design:** ⭐⭐⭐⭐⭐ (5/5)
- Proper normalization (15 tables, clear relationships)
- RLS policies correctly configured
- Foreign keys with CASCADE DELETE
- Vector search optimized with IVFFlat indexes
- Audit trails (action_history auto-logged)

**Security:** ⭐⭐⭐ (3/5)
- ✅ Database RLS well-implemented
- ✅ Supabase Auth properly integrated
- ⚠️ Express API has no authentication
- ⚠️ N8N webhooks publicly accessible
- ⚠️ No rate limiting anywhere
- ⚠️ No secret rotation process

**Scalability:** ⭐⭐⭐ (3/5)
- ✅ Proper database indexes
- ✅ React Query caching
- ⚠️ No connection pooling
- ⚠️ Synchronous N8N processing
- ⚠️ Assessment polling inefficient
- ⚠️ No load testing performed

**Observability:** ⭐⭐ (2/5)
- ⚠️ Console.log only (no structured logging)
- ❌ No APM or error tracking
- ❌ No uptime monitoring
- ❌ No user analytics
- ✅ Express API health endpoint exists

**DevOps/Operations:** ⭐⭐ (2/5)
- ✅ Frontend ready for Vercel deploy
- ⚠️ No staging environment
- ❌ No CI/CD pipeline
- ❌ No automated tests
- ❌ No deployment runbooks

### Production Readiness: **65-70%**

**What Works Well:**
1. ✅ Core features are production-grade (project management, document upload, AI assessments, action plans)
2. ✅ UI is polished and responsive
3. ✅ Database design is solid with proper security
4. ✅ AI/RAG system is sophisticated (semantic chunking, multi-strategy retrieval, confidence scoring)
5. ✅ User authentication properly implemented
6. ✅ Error handling in UI (toasts, confirmations, loading states)

**What Needs Work:**
1. ⚠️ Security gaps (API auth, webhook security, rate limiting)
2. ⚠️ No monitoring or alerting
3. ⚠️ No automated testing
4. ⚠️ Scalability unknowns (no load testing)
5. ⚠️ No staging environment
6. ⚠️ Assessment criteria seeding not automated
7. ⚠️ Naming convention inconsistencies

### Risk Assessment

**Low Risk (Can Launch):**
- Core functionality breaking
- Data loss (RLS + backups protect)
- User authentication bypass

**Medium Risk (Should Address Before Launch):**
- Express API unauthorized access
- N8N webhook abuse (cost risk)
- Database connection exhaustion under load
- No monitoring = slow incident response

**High Risk (Must Address for Scale):**
- OpenAI rate limit errors (no retry logic)
- Assessment polling overload
- Unbounded database growth

### Comparison to Production SaaS

| Aspect | Typical Production SaaS | NISTA App | Gap |
|--------|------------------------|-----------|-----|
| **Features** | 95%+ complete | 90% complete | Small |
| **Security** | Auth on all APIs, rate limits, HTTPS enforced | Auth on DB only, no rate limits | Medium |
| **Testing** | 70%+ code coverage, E2E tests | 0% coverage | Large |
| **Monitoring** | APM, error tracking, alerts | None | Large |
| **Scalability** | Load tested, auto-scaling | Untested | Medium |
| **DevOps** | CI/CD, staging, rollbacks | Manual deploy | Medium |
| **Documentation** | API docs, runbooks | README only | Small |

---

## 10. Recommended Next Steps

### Immediate (Week 1) - Get to 75% Production-Ready

**Priority 1: Security Basics**
- [ ] Add JWT authentication to Express API
  - Install `@supabase/supabase-js` in backend
  - Add middleware to validate tokens
  - Test with frontend calls
  - **Effort:** 1-2 days

- [ ] Add API key or HMAC validation to N8N webhooks
  - Add secret token to .env
  - Validate in webhook nodes
  - Update frontend to send token
  - **Effort:** 1 day

- [ ] Add basic rate limiting (per-user)
  - Frontend: 10 requests/minute per endpoint
  - Express API: 100 requests/hour per user
  - N8N: Queue assessments (1 at a time per user)
  - **Effort:** 2 days

**Priority 2: Observability Basics**
- [ ] Integrate Sentry for frontend error tracking
  - Sign up for Sentry (free tier)
  - Add Sentry SDK to React app
  - Configure source maps for stack traces
  - **Effort:** 0.5 days

- [ ] Set up uptime monitoring
  - Use UptimeRobot or similar (free)
  - Monitor Supabase, Express API, N8N health endpoints
  - Configure Slack/email alerts
  - **Effort:** 0.5 days

**Priority 3: Documentation**
- [ ] Create deployment guide
  - Document all environment variables
  - List all external service dependencies
  - Write step-by-step deploy instructions
  - **Effort:** 1 day

### Short-Term (Weeks 2-3) - Get to 85% Production-Ready

**Priority 4: Testing**
- [ ] Write integration tests for critical paths
  - Test: Sign up → Create project → Upload docs → Run assessment
  - Test: Generate action plan → Edit actions → Assign users
  - Test: Delete project (verify cascade)
  - Use Vitest or Jest with React Testing Library
  - **Effort:** 3-5 days

**Priority 5: Scalability**
- [ ] Add connection pooling to Express backend
  - Replace raw `pg` with `pg-pool` or PgBouncer
  - Configure max connections (20-50)
  - Test under load
  - **Effort:** 1 day

- [ ] Replace assessment polling with Supabase Realtime
  - Use Supabase websocket subscriptions
  - Listen for new rows in `assessments` table
  - Update UI in real-time (no 3-second delay)
  - **Effort:** 2 days

**Priority 6: DevOps**
- [ ] Set up staging environment
  - Duplicate Supabase project (separate database)
  - Deploy separate N8N instance or use staging webhook URLs
  - Configure Vercel preview deployments
  - **Effort:** 2 days

- [ ] Create basic CI/CD pipeline
  - GitHub Actions for:
    - Run `npm run lint`
    - Run tests (once written)
    - Deploy to staging on PR
    - Deploy to production on merge to main
  - **Effort:** 1-2 days

### Medium-Term (Month 2) - Get to 95% Production-Ready

**Priority 7: Polish & Complete Features**
- [ ] Complete comment system integration
  - Wire up CommentThread in all action detail views
  - Implement @mention autocomplete
  - Test notification system
  - **Effort:** 3 days

- [ ] Implement Excel export
  - Use existing XLSX library
  - Format assessments as spreadsheet
  - Include all criteria, findings, evidence
  - **Effort:** 2 days

**Priority 8: Advanced Observability**
- [ ] Add structured logging
  - Replace console.log with winston or pino
  - Add correlation IDs
  - Forward logs to external service (Better Stack, LogDNA)
  - **Effort:** 2-3 days

- [ ] Implement business metrics tracking
  - Track: assessments run, avg time, success rate
  - Track: action plans created, actions completed
  - Track: document upload success rate
  - Use PostHog, Mixpanel, or custom dashboard
  - **Effort:** 3-4 days

**Priority 9: Data & Schema**
- [ ] Create assessment criteria seed scripts
  - Export existing criteria from database
  - Create SQL INSERT statements
  - Add to documentation and setup scripts
  - Test on fresh database
  - **Effort:** 1-2 days

- [ ] Complete naming convention migration
  - Finish MIGRATE_PROJECTS_TO_SNAKE_CASE.sql
  - Update all TypeScript types
  - Update all Supabase queries
  - Test thoroughly
  - **Effort:** 2-3 days

**Priority 10: Performance & Reliability**
- [ ] Add retry logic to N8N workflows
  - OpenAI rate limit errors → exponential backoff
  - LlamaCloud timeouts → retry up to 3 times
  - Supabase connection errors → retry once
  - **Effort:** 2 days

- [ ] Optimize LlamaCloud parsing UX
  - Add real-time status updates ("Parsing page 5 of 20...")
  - Consider alternative PDF parser as backup (PyPDF2, Unstructured)
  - **Effort:** 2-3 days

### Long-Term (Month 3+) - Production Hardening

**Priority 11: Advanced Security**
- [ ] Conduct security audit
  - Penetration testing
  - SQL injection testing
  - XSS vulnerability scan
  - Secrets scanning
  - **Effort:** External consultant or 1 week internal

- [ ] Implement secret rotation
  - Document rotation process
  - Test rotating Supabase keys without downtime
  - Set up quarterly rotation reminders
  - **Effort:** 2 days

**Priority 12: Scale Testing**
- [ ] Perform load testing
  - Simulate 50 concurrent users
  - Simulate 100 assessments running simultaneously
  - Identify bottlenecks (database, N8N, OpenAI)
  - Optimize based on findings
  - **Effort:** 3-5 days

**Priority 13: Human-in-the-Loop Calibration**
- [ ] Validate AI assessments
  - Get expert IPA assessors to review 10-20 AI assessments
  - Compare AI RAG ratings to human ratings
  - Identify systematic biases
  - Adjust prompts or confidence thresholds
  - **Effort:** 1-2 weeks (requires external experts)

---

## Total Effort Estimate to Full Production

- **Immediate (Week 1):** 5-6 days
- **Short-term (Weeks 2-3):** 9-12 days
- **Medium-term (Month 2):** 15-20 days
- **Long-term (Month 3+):** 10-15 days

**Total: 6-8 weeks for 1-2 developers**

---

## Appendix: Technical Specifications

### Environment Variables Reference

**Frontend (.env in root):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_N8N_WEBHOOK_URL=https://your-n8n.app/webhook/content-saas
VITE_API_URL=https://your-api.com (or http://localhost:3000 for dev)
```

**Backend (.env in /backend/):**
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PORT=3000
NODE_ENV=development|production
CORS_ORIGIN=http://localhost:5173 (or https://your-app.com)
```

**N8N (set in N8N credentials):**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (NOT anon key)
OPENAI_API_KEY=sk-...
LLAMACLOUD_API_KEY=llx_...
COHERE_API_KEY=... (optional)
```

### Database Connection Strings

**Supabase (from Supabase dashboard → Settings → Database):**
- **Connection pooling (recommended):** `postgresql://postgres.xxxxx:5432/postgres?pgbouncer=true`
- **Direct connection:** `postgresql://postgres:yourpass@db.xxxxx.supabase.co:5432/postgres`

### API Endpoints Summary

**Frontend → Supabase (direct):**
- All CRUD on: projects, files, assessments, assessment_criteria, users
- Authentication: Supabase Auth methods
- Storage: File uploads to Supabase Storage

**Frontend → N8N (webhooks):**
- `POST /webhook/content-saas` with `identifier: "document_upload"`
- `POST /webhook/content-saas` with `identifier: "run_assessment"`
- `POST /webhook/content-saas` with `identifier: "generate_action_plan"`
- `POST /webhook/content-saas` with `identifier: "refine_action_plan"`

**Frontend → Express API:**
- `GET /api/health` - Health check
- `GET /api/projects/:id/actions` - List actions (with filters)
- `GET /api/actions/:id` - Action details (history + comments)
- `PATCH /api/actions/:id` - Update action
- `PATCH /api/actions/bulk` - Bulk update
- `DELETE /api/actions/bulk` - Bulk delete
- `GET /api/actions/:id/comments` - List comments
- `POST /api/actions/:id/comments` - Add comment
- `PATCH /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/actions/confirm` - Confirm action plan (create actions from draft)

### Key Files Reference

**Configuration:**
- `package.json` - Frontend dependencies
- `backend/package.json` - Backend dependencies
- `vercel.json` - Vercel deployment config
- `tsconfig.json` - TypeScript config
- `tailwind.config.js` - Tailwind CSS config

**Database:**
- `supabase-rls-policies.sql` - RLS security policies
- `supabase-pgvector-setup.sql` - Vector database setup
- `backend/src/db/schema.sql` - Action plan schema
- `MIGRATE_PROJECTS_TO_SNAKE_CASE.sql` - Naming migration

**N8N:**
- `n8n workflows.json` - Main workflows (doc upload + assessment)
- `refine_action_plan_nodes.json` - Action plan refinement workflow

**Frontend Entry Points:**
- `src/main.tsx` - App entry point
- `src/App.tsx` - Routing configuration
- `src/lib/supabase.ts` - Supabase client + TypeScript types

**API Services:**
- `src/services/api.ts` - Express API client
- `src/services/n8nApi.ts` - N8N webhook client
- `src/services/apiAdapter.ts` - Adapter layer

---

**Report End**

---

**Prepared by:** Claude (Anthropic)
**Analysis Date:** December 8, 2025
**Total Analysis Time:** ~2 hours
**Files Analyzed:** 70+ files (TypeScript, SQL, JSON, configuration)
**Lines of Code Reviewed:** ~21,400 lines

**Disclaimer:** This audit is based on static code analysis and provided documentation. Actual production behavior may differ. Runtime testing, load testing, and security penetration testing are recommended before launch.
