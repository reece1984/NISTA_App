# N8N Switch Node Configuration

## Current Setup

You have a single webhook endpoint with a Switch node that routes based on `identifier`:

**Webhook URL:** `https://n8n-reeceai-u56804.vm.elestio.app/webhook-test/content-saas`

**Switch Routes:**
- `document_upload` → Document processing workflow (already working ✅)
- `run_assessment` → Assessment workflow (needs to be added)

---

## Step 1: Verify Switch Node Configuration

1. Open your N8N workflow
2. Find the **Switch** node after the Webhook
3. Make sure it's checking the `identifier` field

**Switch Node Settings:**
- Mode: "Rules"
- Data Type: "String"
- Value 1: `{{ $json.body.identifier }}`

---

## Step 2: Add run_assessment Route

In your Switch node, you should have (or add) these outputs:

### Output 1: document_upload
- **Rule**: Equals
- **Value**: `document_upload`
- This routes to your document processing workflow (already working)

### Output 2: run_assessment
- **Rule**: Equals
- **Value**: `run_assessment`
- This will route to the new assessment workflow

---

## Step 3: Build Assessment Workflow Branch

After the Switch node, on the **run_assessment** output:

### Simple Test First (Verify Routing Works)

Connect these nodes to the `run_assessment` output:

**Node 1: Code** (Test Response)
```javascript
// Simple test to verify routing works
return [{
  json: {
    success: true,
    message: "Run Assessment route working!",
    received: $input.all()[0].json.body
  }
}];
```

**Node 2: Respond to Webhook**
- Response Code: `200`
- Response Body: `{{ $json }}`
- **Add Response Headers**:
  - `Access-Control-Allow-Origin`: `*`
  - `Access-Control-Allow-Methods`: `POST, OPTIONS`
  - `Access-Control-Allow-Headers`: `Content-Type`

---

## Step 4: CORS Handling

**IMPORTANT:** Your webhook needs to handle CORS preflight (OPTIONS) requests.

Add an **IF node** right after your Webhook node, BEFORE the Switch:

**IF Node:**
- **Condition**: `{{ $json.httpMethod }}` equals `OPTIONS`
- OR: `{{ $json.headers['request-method'] }}` equals `OPTIONS`

**True Branch** (OPTIONS request):
- Connect to a **Respond to Webhook** node
- Response Code: `200`
- Response Headers:
  - `Access-Control-Allow-Origin`: `*`
  - `Access-Control-Allow-Methods`: `GET, POST, OPTIONS`
  - `Access-Control-Allow-Headers`: `Content-Type`

**False Branch** (POST request):
- Connect to your Switch node (existing logic)

---

## Complete Workflow Structure

```
[Webhook: content-saas]
    ↓
[IF: Check if OPTIONS request]
    ├─ True → [Respond 200 with CORS]
    └─ False → [Switch on identifier]
                 ├─ document_upload → [Document Processing] → [Respond]
                 └─ run_assessment → [Assessment Logic] → [Respond with CORS]
```

---

## Step 5: Test the Connection

1. **Save and Activate** the workflow in N8N
2. Go to your app at **http://localhost:5179** (new port!)
3. Open a project
4. Click "Run Assessment"

**Expected Result:**
```json
{
  "success": true,
  "message": "Run Assessment route working!",
  "received": {
    "identifier": "run_assessment",
    "projectId": 1,
    "files": [...]
  }
}
```

**If you still get CORS error:**
- Make sure the IF node is handling OPTIONS requests
- Verify webhook accepts OPTIONS method
- Check Response Headers are added to BOTH CORS response branches

---

## Payload the App Sends

When you click "Run Assessment", the app sends this to your webhook:

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

Your Switch node should route this to the `run_assessment` branch based on `identifier`.

---

## Once Routing Works

After you confirm the routing works with the simple test response:

1. Replace the test Code node with the full assessment workflow
2. Follow the **n8n-assessment-workflow-guide.md** for detailed steps
3. Keep the CORS headers in the final Respond to Webhook node

---

## Quick Checklist

- [ ] Webhook accepts OPTIONS method
- [ ] IF node handles OPTIONS → Returns 200 with CORS headers
- [ ] Switch node has `run_assessment` output
- [ ] Switch checks `{{ $json.body.identifier }}`
- [ ] Test response connected to `run_assessment` output
- [ ] Test response includes CORS headers
- [ ] Workflow is ACTIVE (green toggle)
- [ ] App updated to port 5179

---

## Debugging Tips

### Check what the webhook receives:
Add a "Set" node right after Webhook to log the full payload:
```javascript
return [{
  json: {
    fullRequest: $input.all()[0].json,
    body: $json.body,
    headers: $json.headers,
    method: $json.httpMethod || $json.method
  }
}];
```

### Test with cURL:
```bash
curl -X POST https://n8n-reeceai-u56804.vm.elestio.app/webhook-test/content-saas \
  -H "Content-Type: application/json" \
  -d '{"identifier":"run_assessment","projectId":1,"files":[]}'
```

Should return your test response without CORS issues.
