# File Upload Webhook Failures - Fix Summary

## Problem

Silent webhook failures in the file upload process were causing documents to appear "uploaded" even when N8N processing failed. Users had no visibility into these failures.

**Symptoms:**
- Files showing status 'uploaded' even though embeddings were never created
- Webhook errors only logged to console, not visible to users
- No way to retry failed uploads
- Assessment runs would fail silently because documents weren't actually processed

## Solution Implemented

### 1. Database Schema Update

**File:** `ADD_ERROR_MESSAGE_COLUMN.sql`

Added `error_message` column to the `files` table to store webhook processing errors.

```sql
ALTER TABLE files
ADD COLUMN IF NOT EXISTS error_message TEXT;
```

**Action Required:** Run this SQL in Supabase SQL Editor

---

### 2. FileUpload.tsx - Single File Upload

**Changes:**
- Set file status to `'processing'` initially (line 78) instead of `'uploaded'`
- Only update to `'uploaded'` after successful webhook call (line 125)
- Throw error if webhook fails or returns non-2xx status (lines 113-116)
- Update file status to `'failed'` with error message on failure (lines 134-141)
- Added `file_id` to webhook payload for N8N processing

**Flow:**
1. Upload file to Supabase Storage
2. Create file record with status `'processing'`
3. Call N8N webhook with file details
4. **Success:** Update status to `'uploaded'`
5. **Failure:** Update status to `'failed'` with error message

---

### 3. UploadDocumentsModal.tsx - Multi-File Upload

**Changes:**
- Set file status to `'processing'` initially (line 220) instead of `'uploaded'`
- Throw error if webhook fails or returns non-2xx status (lines 269-273)
- Update file status to `'failed'` with error message on failure (lines 359-367)
- Webhook is now required (throws error if not configured)

**Flow:** Same as single file upload, but handles multiple files in queue

---

### 4. DocumentCard.tsx - Retry Functionality

**New Features:**
- **Retry Button:** Blue refresh icon appears for failed files (lines 198-211)
- **Error Display:** Red error box shows error message (lines 187-193)
- **Retry Logic:**
  - Sets status back to `'processing'`
  - Re-triggers N8N webhook
  - Updates status to `'uploaded'` on success or `'failed'` on retry failure

**Visual Indicators:**
- Failed files show red "Error" badge with AlertCircle icon
- Error message displayed in red box below file info
- Retry button with loading spinner during retry

---

### 5. Type Definition Update

**File:** `src/hooks/useDocuments.ts`

Added `error_message: string | null` to `ProjectDocument` interface (line 17)

---

## Status Values

The files table now uses these status values consistently:

- **`'processing'`** - File uploaded to storage, webhook triggered, waiting for embeddings
- **`'uploaded'`** - Webhook successful, file is being embedded (or embeddings complete)
- **`'embedded'`** - Embeddings have been created (set by N8N or polling)
- **`'completed'`** - Processing fully complete
- **`'failed'`** - Webhook or processing failed, see error_message field

---

## Files Modified

1. ✅ `ADD_ERROR_MESSAGE_COLUMN.sql` - SQL migration (NEW)
2. ✅ `src/components/FileUpload.tsx` - Single file upload error handling
3. ✅ `src/components/UploadDocumentsModal.tsx` - Multi-file upload error handling + fixed polling table name
4. ✅ `src/components/DocumentCard.tsx` - Retry button and error display
5. ✅ `src/hooks/useDocuments.ts` - Type definition update

**Important Fix:** Updated UploadDocumentsModal.tsx line 283 to query the correct table:
- Changed from: `document_embeddings` table with `file_id` column
- Changed to: `document_chunks` table with `fileId` column (matches schema)

---

## Testing Checklist

### Before Testing
- [ ] Run `ADD_ERROR_MESSAGE_COLUMN.sql` in Supabase SQL Editor
- [ ] Ensure `VITE_N8N_DOCUMENT_UPLOAD_WEBHOOK` is configured in `.env`
- [ ] Verify N8N workflow is running

### Test Cases

#### 1. Successful Upload
- [ ] Upload a PDF file
- [ ] Verify file shows "Processing" status initially
- [ ] Verify file updates to "Uploaded" or "Embedded" after webhook succeeds
- [ ] No error message displayed

#### 2. Webhook Failure (N8N Down)
- [ ] Stop N8N temporarily
- [ ] Upload a PDF file
- [ ] Verify file shows "Error" badge
- [ ] Verify error message is displayed in red box
- [ ] Verify retry button appears
- [ ] Click retry button and verify it works when N8N is back up

#### 3. Webhook Failure (Invalid File)
- [ ] Upload a file that will cause N8N processing to fail
- [ ] Verify error is captured and displayed
- [ ] Verify retry button appears

#### 4. Multi-File Upload
- [ ] Upload multiple files simultaneously
- [ ] Stop N8N during upload to cause some to fail
- [ ] Verify failed files show error state
- [ ] Verify successful files complete normally

#### 5. Retry Functionality
- [ ] Find a failed file (or create one)
- [ ] Click retry button
- [ ] Verify status changes to "Processing"
- [ ] Verify file completes successfully after retry

---

## Related Issues

### Issue 1: Projects Stuck in "Processing"

**Problem:** Projects showing "Processing" status even after assessments complete

**Solution:** See `N8N-UPDATE-PROJECT-STATUS.md` and `FIX_STUCK_PROJECTS.sql`

**Status:** Documented, requires N8N workflow update

---

## User Experience Improvements

**Before:**
- ❌ Webhook failures were silent
- ❌ Files showed as "uploaded" even when they failed
- ❌ No way to know if processing failed
- ❌ No way to retry failed uploads
- ❌ Had to re-upload the entire file

**After:**
- ✅ Webhook failures are visible to users
- ✅ Files show accurate status ('processing', 'uploaded', 'failed')
- ✅ Error messages explain what went wrong
- ✅ Retry button allows re-processing without re-uploading
- ✅ Visual indicators (red badge, error box) make failures obvious

---

## Deployment Steps

1. **Database Migration:**
   ```sql
   -- Run in Supabase SQL Editor
   ALTER TABLE files
   ADD COLUMN IF NOT EXISTS error_message TEXT;
   ```

2. **Deploy Code:**
   - Pull latest from `feature/ui-improvements` branch
   - No environment variable changes needed (uses existing `VITE_N8N_DOCUMENT_UPLOAD_WEBHOOK`)

3. **Verify:**
   - Test file upload succeeds
   - Test file upload fails gracefully when N8N is down
   - Test retry button works

---

## Future Enhancements

### Potential Improvements:
1. **Auto-retry:** Automatically retry failed webhooks after a delay
2. **Batch retry:** Retry all failed files at once
3. **Status polling:** Auto-refresh file status while processing
4. **Progress indicators:** Show embedding progress (X out of Y chunks created)
5. **Webhook timeout:** Set reasonable timeout for webhook calls
6. **N8N health check:** Ping N8N before uploading to warn users early

---

## Notes

- The `file_id` is now passed to N8N webhook payload - ensure N8N workflow handles this field
- Files are marked `'processing'` immediately after upload, before webhook call
- The polling mechanism in UploadDocumentsModal still checks for embeddings to determine completion
- Webhook URL is now required (will throw error if not configured)
- Error messages are user-friendly (no stack traces exposed)

---

## Support

If you encounter issues:
1. Check browser console for detailed error logs
2. Check Supabase logs for database errors
3. Check N8N workflow execution logs
4. Verify webhook URL is correct in `.env`
5. Run `ADD_ERROR_MESSAGE_COLUMN.sql` if not already done
