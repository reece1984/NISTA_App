# N8N Simple Test Workflow - Fix CORS First

## Goal
Get the webhook responding with proper CORS headers so the app can connect.

## Step-by-Step N8N Workflow Setup

### Step 1: Create New Workflow

1. Go to N8N: https://n8n-reeceai-u56804.vm.elestio.app
2. Click "Create new workflow"
3. Name it: "Run Assessment - Test"

---

### Step 2: Add Webhook Node

1. Click the "+" button
2. Search for "Webhook"
3. Select "Webhook" node
4. Configure:
   - **HTTP Method**: Select ALL methods (GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD)
   - **Path**: `webhook-test/run-assessment`
   - **Authentication**: None
   - **Response Mode**: "Respond Immediately" (NOT "When Last Node Finishes")
   - **Response Code**: 200

5. In **Options** (expand if collapsed):
   - Enable "Raw Body"
   - Set "Binary Property" to `data`

---

### Step 3: Add Respond to Webhook Node

1. Click "+" after the Webhook node
2. Search for "Respond to Webhook"
3. Select "Respond to Webhook" node
4. Configure:

   **Response Code**: `200`

   **Response Body**: Select "JSON" and enter:
   ```json
   {
     "success": true,
     "message": "CORS test successful",
     "received": "{{ $json }}"
   }
   ```

5. Click "Add Option" → Select "Response Headers"

6. Add these headers one by one:

   **Header 1:**
   - Name: `Access-Control-Allow-Origin`
   - Value: `*`

   **Header 2:**
   - Name: `Access-Control-Allow-Methods`
   - Value: `GET, POST, OPTIONS, PUT, DELETE`

   **Header 3:**
   - Name: `Access-Control-Allow-Headers`
   - Value: `Content-Type, Authorization, X-Requested-With`

   **Header 4:**
   - Name: `Access-Control-Max-Age`
   - Value: `86400`

---

### Step 4: Save and Activate

1. Click "Save" in the top right
2. Toggle the workflow to **ACTIVE** (switch should be green/on)
3. Make sure it says "Active" at the top

---

### Step 5: Test from Your App

1. Go back to your app at http://localhost:5178
2. Open a project
3. Click "Run Assessment"
4. Check browser console (F12)

**Expected Result:**
- No CORS error
- Response: `{"success": true, "message": "CORS test successful", ...}`
- Network tab shows status 200

**If you still get CORS error:**
- Verify workflow is ACTIVE in N8N
- Check the webhook path matches exactly: `webhook-test/run-assessment`
- Make sure "Response Mode" is set to "Respond Immediately" in Webhook node

---

## Alternative: Simpler 2-Node Workflow

If the above doesn't work, try this even simpler version:

### Node 1: Webhook
- HTTP Method: **POST, OPTIONS**
- Path: `webhook-test/run-assessment`
- Response Mode: **When Last Node Finishes**
- Authentication: None

### Node 2: Set
Use a "Set" node to create response with headers:

1. Add "Set" node
2. Mode: "Manual Mapping"
3. Add these fields:

**Field 1:**
- Name: `headers`
- Value:
```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
}
```

**Field 2:**
- Name: `body`
- Value:
```json
{
  "success": true,
  "message": "Test successful"
}
```

**Field 3:**
- Name: `statusCode`
- Value: `200`

---

## Troubleshooting

### Issue: Still getting CORS error

**Check 1:** Is the workflow active?
- Go to N8N workflows list
- Make sure toggle switch is ON (green)

**Check 2:** Is the path correct?
- Webhook path should be: `webhook-test/run-assessment`
- Full URL: `https://n8n-reeceai-u56804.vm.elestio.app/webhook-test/run-assessment`

**Check 3:** Response Mode
- In Webhook node, under "Options"
- Set "Response Mode" to "Respond Immediately"
- This is crucial for CORS to work

**Check 4:** Test with Postman/cURL first
```bash
curl -X OPTIONS https://n8n-reeceai-u56804.vm.elestio.app/webhook-test/run-assessment -v
```

Should return CORS headers in response.

**Check 5:** N8N Version
- Some older N8N versions have CORS issues
- Make sure you're on a recent version (1.0+)

---

## Screenshot Reference

Your N8N workflow should look like this:

```
[Webhook] → [Respond to Webhook]
```

That's it. Just 2 nodes.

---

## Once CORS is Working

After you get a successful response without CORS errors, we can then:
1. Add the actual assessment logic nodes
2. Keep the CORS headers in the final Respond to Webhook node
3. Build out the full RAG workflow

But first, let's just get the basic webhook responding properly.
