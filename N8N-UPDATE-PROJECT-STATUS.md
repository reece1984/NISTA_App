# Update N8N Workflow to Set Project Status

## Add Status Update Node

To properly complete the assessment flow, add a node at the END of your N8N "Run Assessment" workflow to update the project status from "processing" to "completed".

---

## Where to Add It

After your **"Loop Over Items"** completes and all 5 assessments are inserted, add this before the final "Respond to Webhook" node:

```
[Loop Over Items] → [Update Project Status] → [Respond to Webhook]
```

---

## Node Configuration

### Node Type: Supabase

**Operation:** Update Rows
**Table:** projects
**Credentials:** Supabase (Service Role Key)

**Filter by:**
- Column: `id`
- Operator: `equals`
- Value: `{{ $('Webhook').item.json.body.projectId }}`

**Update:**
- Column: `status`
- Value: `completed`

**Update:**
- Column: `updatedAt`
- Value: `{{ new Date().toISOString() }}`

---

## Alternative: HTTP Request Method

If you prefer using HTTP Request instead of Supabase node:

**Type:** HTTP Request
**Method:** PATCH
**URL:** `https://yondkevazznqclmrkidl.supabase.co/rest/v1/projects`
**Query Parameters:**
- `id`: `eq.{{ $('Webhook').item.json.body.projectId }}`

**Headers:**
- `apikey`: `<YOUR_SERVICE_ROLE_KEY>`
- `Authorization`: `Bearer <YOUR_SERVICE_ROLE_KEY>`
- `Content-Type`: `application/json`
- `Prefer`: `return=representation`

**Body (JSON):**
```json
{
  "status": "completed",
  "updatedAt": "{{ new Date().toISOString() }}"
}
```

---

## Complete Workflow Structure

```
[Webhook]
  ↓
[Get Assessment Criteria]
  ↓
[Loop Over Items] (5 criteria)
  ├─ Build RAG Query
  ├─ Generate Embedding
  ├─ Search Documents
  ├─ Generate AI Assessment
  ├─ Parse Response
  └─ Insert Assessment
  ↓
[Update Project Status] ← ADD THIS NODE
  ↓
[Respond to Webhook]
```

---

## Why This Matters

Without this node, the project will remain in "processing" status forever. The frontend polling logic:

1. ✅ Sets status to "processing" when button clicked
2. ✅ Polls every 3 seconds checking for "completed" status
3. ❌ Without this node, status never becomes "completed"
4. ✅ With this node, frontend detects completion and shows success toast

---

## Test It

1. Add the "Update Project Status" node in N8N
2. Save and activate the workflow
3. In your app, click "Run Assessment"
4. You should see:
   - Loading toast: "Assessment in progress... This may take 30-60 seconds"
   - Spinner on button
   - After ~30-60 seconds: Success toast "Assessment completed successfully!"
   - Results appear automatically

Without the status update, the spinner will run for 2 minutes (polling timeout) then show success even if workflow failed.

With the status update, the spinner stops as soon as assessments are done!
