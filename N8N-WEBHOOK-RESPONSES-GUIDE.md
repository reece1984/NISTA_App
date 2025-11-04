# N8N Webhook Response Guide

This guide explains exactly what your N8N workflows need to do to properly update the frontend.

---

## Overview: Two Workflows

### 1. Document Upload Workflow
**Trigger:** File uploaded via FileUpload component
**Frontend Behavior:** Fire-and-forget (doesn't wait for response)
**N8N Must:** Process document, create embeddings, return 200 OK

### 2. Run Assessment Workflow
**Trigger:** "Run Assessment" button clicked
**Frontend Behavior:** Polls for completion (checks every 3 seconds)
**N8N Must:** Generate assessments, update project status, create summary, return 200 OK

---

## Workflow 1: Document Upload

### What the Frontend Sends

```json
{
  "identifier": "document_upload",
  "projectId": 1,
  "fileName": "Business_Case.pdf",
  "fileUrl": "https://yondkevazznqclmrkidl.supabase.co/storage/v1/object/public/project-documents/...",
  "fileKey": "projects/1/business_case_1234567890.pdf"
}
```

### What N8N Must Do

1. **Receive webhook** with CORS headers
2. **Download the PDF** from `fileUrl`
3. **Extract text** from PDF (use pdf-parse or similar)
4. **Split into chunks** (500-1000 characters each)
5. **Generate embeddings** for each chunk (OpenAI text-embedding-ada-002)
6. **Insert embeddings** into `document_embeddings` table:
   ```sql
   INSERT INTO document_embeddings (project_id, file_id, content, embedding)
   VALUES (1, 1, 'chunk content...', '[0.123, 0.456, ...]')
   ```
7. **Respond with 200 OK** and CORS headers

### Required Response Format

```json
{
  "success": true,
  "message": "Document processed successfully",
  "projectId": 1,
  "fileName": "Business_Case.pdf",
  "chunksCreated": 15
}
```

### CRITICAL: CORS Headers Required

Add these headers to your "Respond to Webhook" node:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Frontend Behavior

- ✅ Frontend does NOT wait for this response
- ✅ Frontend immediately shows file as "uploaded"
- ✅ If webhook fails, frontend still works (graceful degradation)

---

## Workflow 2: Run Assessment

### What the Frontend Sends

```json
{
  "identifier": "run_assessment",
  "projectId": 1,
  "files": [
    {
      "fileId": 1,
      "fileName": "Business_Case.pdf",
      "fileType": "business_case",
      "fileUrl": "https://...",
      "fileKey": "..."
    }
  ]
}
```

### What N8N Must Do

1. **Receive webhook** with CORS headers
2. **Fetch assessment criteria** (5 criteria from database)
3. **Loop through each criterion:**
   - Build semantic search query
   - Generate query embedding
   - Search `document_embeddings` using vector similarity
   - Build context from top 10 chunks
   - Generate AI assessment (GPT-4)
   - Parse AI response
   - Insert into `assessments` table
4. **Generate project summary** using AI:
   - Aggregate all 5 assessments
   - Create executive summary, key strengths, critical issues, overall recommendation
   - Insert into `project_summaries` table
5. **Update project status to 'completed'**
6. **Respond with 200 OK** and CORS headers

### Required Response Format

```json
{
  "success": true,
  "message": "Assessment completed successfully",
  "projectId": 1,
  "assessmentsGenerated": 5,
  "summaryCreated": true
}
```

### CRITICAL: Status Update Node

**Add this node BEFORE "Respond to Webhook":**

**Node Type:** Supabase
**Operation:** Update Rows
**Table:** projects

**Filter by:**
- Column: `id`
- Operator: `equals`
- Value: `{{ $('Webhook').item.json.body.projectId }}`

**Update:**
- Column: `status`
- Value: `completed`
- Column: `updatedAt`
- Value: `{{ new Date().toISOString() }}`

### NEW: Project Summary Node

**Add this node AFTER assessments are complete:**

**Node Type:** Supabase
**Operation:** Insert Row
**Table:** project_summaries

**Insert Values:**
- `project_id`: `{{ $('Webhook').item.json.body.projectId }}`
- `overall_rating`: `green` or `amber` or `red` (calculated from assessments)
- `executive_summary`: AI-generated summary text
- `key_strengths`: AI-generated strengths text
- `critical_issues`: AI-generated issues text
- `overall_recommendation`: AI-generated recommendation text

### CRITICAL: CORS Headers Required

Add these headers to your "Respond to Webhook" node:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Frontend Behavior

- ✅ Frontend sets project status to 'processing' immediately
- ✅ Frontend shows loading spinner and toast
- ✅ Frontend polls project status every 3 seconds
- ✅ When status = 'completed', frontend:
  - Stops polling
  - Refetches project data (including new assessments and summary)
  - Shows success toast
  - Displays assessment results and executive summary

---

## Workflow Structure

### Document Upload Workflow
```
[Webhook: document_upload]
  ↓
[IF: Check if OPTIONS request]
  ├─ True → [Respond 200 with CORS]
  └─ False → [Download PDF]
               ↓
             [Extract Text]
               ↓
             [Split into Chunks]
               ↓
             [Loop Over Chunks]
               ├─ Generate Embedding (OpenAI)
               └─ Insert into document_embeddings
               ↓
             [Respond with CORS headers]
```

### Run Assessment Workflow
```
[Webhook: run_assessment]
  ↓
[IF: Check if OPTIONS request]
  ├─ True → [Respond 200 with CORS]
  └─ False → [Get Assessment Criteria] (5 criteria)
               ↓
             [Loop Over Criteria]
               ├─ Build RAG Query
               ├─ Generate Query Embedding
               ├─ Search document_embeddings (vector similarity)
               ├─ Build Context from Chunks
               ├─ Generate AI Assessment (GPT-4)
               ├─ Parse AI Response
               └─ Insert into assessments table
               ↓
             [Generate Project Summary] (NEW!)
               ├─ Aggregate all assessments
               ├─ Call GPT-4 to create summary
               └─ Insert into project_summaries table
               ↓
             [Update Project Status] → status = 'completed'
               ↓
             [Respond with CORS headers]
```

---

## CORS Handling (IMPORTANT!)

Both workflows need to handle CORS preflight requests.

### Add IF Node After Webhook

**IF Node Configuration:**
- **Condition:** `{{ $json.httpMethod }}` equals `OPTIONS`
- **OR:** `{{ $json.headers['request-method'] }}` equals `OPTIONS`

**True Branch (OPTIONS request):**
- Connect to **Respond to Webhook** node
- Response Code: `200`
- Response Headers:
  ```
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS
  Access-Control-Allow-Headers: Content-Type
  ```

**False Branch (POST request):**
- Continue with normal workflow logic

---

## Testing Your Webhooks

### Test Document Upload

1. Go to http://localhost:5173
2. Upload a PDF file
3. Check N8N execution log:
   - ✅ Webhook received
   - ✅ PDF downloaded
   - ✅ Text extracted
   - ✅ Embeddings created
   - ✅ Rows inserted into document_embeddings
4. Check Supabase `document_embeddings` table:
   ```sql
   SELECT COUNT(*) FROM document_embeddings WHERE project_id = 1;
   ```

### Test Run Assessment

1. Go to http://localhost:5173
2. Open a project with uploaded documents
3. Click "Run Assessment"
4. Watch the frontend:
   - ✅ Toast: "Assessment in progress... This may take 30-60 seconds"
   - ✅ Button shows spinner
   - ✅ After ~30-60 seconds: "Assessment completed successfully!"
   - ✅ Executive Summary section appears
   - ✅ Detailed assessments appear below
5. Check N8N execution log:
   - ✅ Webhook received
   - ✅ 5 criteria fetched
   - ✅ 5 assessments generated
   - ✅ 5 rows inserted into assessments table
   - ✅ 1 row inserted into project_summaries table
   - ✅ Project status updated to 'completed'
6. Check Supabase:
   ```sql
   SELECT * FROM assessments WHERE "projectId" = 1;
   SELECT * FROM project_summaries WHERE project_id = 1;
   SELECT status FROM projects WHERE id = 1;
   ```

---

## Troubleshooting

### Issue: Frontend shows CORS error

**Cause:** Missing CORS headers in N8N response
**Fix:** Add CORS headers to "Respond to Webhook" node AND handle OPTIONS requests

### Issue: Frontend keeps spinning forever

**Cause:** Project status not updated to 'completed'
**Fix:** Add "Update Project Status" node before final response

### Issue: Assessment results don't appear

**Cause:** Data not inserted into assessments table
**Fix:** Check N8N execution log, verify Service Role Key is used

### Issue: Executive Summary doesn't appear

**Cause:** No row in project_summaries table
**Fix:** Add node to insert summary after assessments complete

### Issue: Frontend shows success but no data

**Cause:** Frontend polls but doesn't refetch data
**Fix:** Already implemented - frontend refetches on completion

---

## Summary: What You Need to Add to N8N

### Document Upload Workflow
- ✅ CORS handling (IF node for OPTIONS)
- ✅ PDF text extraction
- ✅ Chunk splitting
- ✅ Embedding generation (OpenAI)
- ✅ Insert into document_embeddings table
- ✅ Return 200 with CORS headers

### Run Assessment Workflow
- ✅ CORS handling (IF node for OPTIONS)
- ✅ Vector search using document_embeddings
- ✅ AI assessment generation (5 criteria)
- ✅ Insert into assessments table (5 rows)
- 🆕 **Generate project summary** (new AI call)
- 🆕 **Insert into project_summaries table** (new node)
- ✅ Update project status to 'completed'
- ✅ Return 200 with CORS headers

---

## Next Steps

1. **Add CORS handling** to both workflows (IF node for OPTIONS)
2. **Add status update node** to Run Assessment workflow
3. **Add project summary generation** to Run Assessment workflow
4. **Test both workflows** end-to-end
5. **Monitor execution logs** for errors

Your frontend is now ready to receive updates from both workflows! 🚀
