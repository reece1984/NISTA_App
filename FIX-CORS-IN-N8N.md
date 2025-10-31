# Fix CORS Error in N8N Webhooks

## Problem

You're getting this error when clicking "Run Assessment":

```
Access to fetch at 'https://n8n-reeceai-u56804.vm.elestio.app/webhook-test/run-assessment'
from origin 'http://localhost:5178' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution: Enable CORS in N8N Webhook Node

### Method 1: Use Respond to Webhook Node (RECOMMENDED)

1. **Open your N8N workflow** for run-assessment

2. **Find your Webhook node** (the first node)

3. **Add a "Respond to Webhook" node** at the END of your workflow:
   - Click the "+" button at the end of your workflow
   - Search for "Respond to Webhook"
   - Add this node

4. **Configure the Respond to Webhook node**:
   - **Response Code**: 200
   - **Response Headers**: Click "Add Option" → "Response Headers"
   - Add these headers:

   ```
   Name: Access-Control-Allow-Origin
   Value: *
   ```

   ```
   Name: Access-Control-Allow-Methods
   Value: GET, POST, OPTIONS, PUT, DELETE
   ```

   ```
   Name: Access-Control-Allow-Headers
   Value: Content-Type, Authorization
   ```

5. **For OPTIONS requests** (preflight):
   - Add an "IF" node right after the Webhook
   - Condition: `{{ $json.body.httpMethod === "OPTIONS" }}` or check if webhook method is OPTIONS
   - If OPTIONS → Go directly to "Respond to Webhook" with 200
   - If POST → Continue with normal workflow

6. **Save and Activate** the workflow

---

### Method 2: N8N Global CORS Settings (If Available)

If you have access to N8N environment variables:

1. Edit your N8N `.env` file or environment configuration
2. Add:
   ```
   N8N_WEBHOOK_CORS_ENABLED=true
   N8N_WEBHOOK_CORS_ORIGINS=*
   ```
3. Restart N8N

---

### Method 3: Simple Workflow Structure with CORS

Here's a complete workflow structure that handles CORS:

```
[Webhook] → [IF: Check Method]
              ├─ OPTIONS → [Respond 200 with CORS headers]
              └─ POST → [Your workflow logic] → [Respond with CORS headers + results]
```

**Step-by-step:**

1. **Webhook Node**:
   - Method: GET, POST, OPTIONS (select all)
   - Path: `/webhook-test/run-assessment`

2. **IF Node** (Check request method):
   - Condition 1: `{{ $json.headers['request-method'] }}` equals `OPTIONS`

3. **True Branch** (OPTIONS request):
   - **Respond to Webhook** node:
     - Response Code: 200
     - Headers:
       - `Access-Control-Allow-Origin`: `*`
       - `Access-Control-Allow-Methods`: `GET, POST, OPTIONS`
       - `Access-Control-Allow-Headers`: `Content-Type`

4. **False Branch** (POST request):
   - Your normal workflow (all the assessment logic)
   - End with **Respond to Webhook** node:
     - Response Code: 200
     - Headers: (same CORS headers as above)
     - Body: Your success/error response JSON

---

## Quick Test After Fix

Once you've configured CORS in N8N:

1. Make sure your N8N workflow is **ACTIVE** (green play button in top right)
2. Go back to your app at http://localhost:5178
3. Open a project
4. Click "Run Assessment"
5. Check browser console (F12) - the CORS error should be gone

---

## For Production

When deploying to Vercel, replace `*` with your actual domain:

```
Access-Control-Allow-Origin: https://your-production-domain.vercel.app
```

Or if you want to allow both localhost and production:

```
Access-Control-Allow-Origin: http://localhost:5178, https://your-production-domain.vercel.app
```

---

## Alternative: Test with Simple Response First

To verify CORS is working, create a minimal test workflow:

1. **Webhook** (GET, POST, OPTIONS) → `/webhook-test/run-assessment`
2. **Respond to Webhook**:
   - Response Code: 200
   - Headers:
     - `Access-Control-Allow-Origin`: `*`
     - `Access-Control-Allow-Methods`: `POST, OPTIONS`
     - `Access-Control-Allow-Headers`: `Content-Type`
   - Body:
     ```json
     {
       "success": true,
       "message": "CORS test successful"
     }
     ```

If this works, then add your actual workflow logic between the Webhook and Respond nodes.
