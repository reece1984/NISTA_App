# Assessment Progress Bar Feature

## Overview

Added a real-time progress bar that tracks assessment completion as N8N processes up to 50 criteria. The progress bar replaces the static "30-60 seconds" message with dynamic updates.

---

## What Changed

### 1. **Extended Polling Timeout**
- **Before:** 2 minutes (40 polls × 3 seconds)
- **After:** 10 minutes (200 polls × 3 seconds)
- **Why:** To accommodate up to 50 criteria which may take several minutes

### 2. **Progress Tracking**
The frontend now:
1. Fetches the total number of assessment criteria at the start
2. Polls the `assessments` table every 3 seconds to count completed assessments
3. Calculates percentage: (completed / total) × 100
4. Updates the progress bar in real-time

### 3. **Visual Progress Bar**
A gradient progress bar displays:
- Current criteria assessed / Total criteria
- Percentage complete
- "This may take several minutes" message

### 4. **Dynamic Toast Messages**
Toast messages now update with progress:
- **Start:** "Starting assessment of X criteria..."
- **During:** "Assessing criteria... Y of X (Z%)"
- **Complete:** "Assessment completed! Y criteria assessed."

---

## How It Works

### Frontend Flow

```
User clicks "Run Assessment"
  ↓
1. Query assessment_criteria table for total count
2. Initialize progress: { current: 0, total: X }
3. Show toast: "Starting assessment of X criteria..."
4. Display progress bar at 0%
  ↓
Every 3 seconds:
  ↓
5. Count assessments in database for this project
6. Update progress: { current: Y, total: X }
7. Update toast: "Assessing criteria... Y of X (Z%)"
8. Update progress bar to Z%
  ↓
When project status = 'completed':
  ↓
9. Clear progress bar
10. Show success toast: "Assessment completed! Y criteria assessed."
11. Display results
```

### Code Changes

**File:** `src/pages/ProjectDetailPage.tsx`

#### New State Variable
```typescript
const [assessmentProgress, setAssessmentProgress] = useState<{
  current: number;
  total: number;
} | null>(null)
```

#### Updated handleRunAssessment Function
- Lines 94-98: Fetch total criteria count
- Lines 101-107: Initialize progress and toast
- Lines 159-174: Poll assessments and update progress
- Lines 200-203: Clear progress on completion

#### New UI Component (Lines 387-415)
```tsx
{assessmentProgress && (
  <div className="mt-6">
    <div className="flex items-center justify-between mb-2">
      <span>Assessment Progress</span>
      <span>{current} / {total} criteria</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div className="bg-gradient-to-r from-secondary to-accent h-3 rounded-full"
           style={{ width: `${percentage}%` }} />
    </div>
    <p>{percentage}% complete • This may take several minutes</p>
  </div>
)}
```

---

## Visual Design

### Progress Bar Styling
- **Background:** Light gray (`bg-gray-200`)
- **Foreground:** Gradient from secondary blue to accent blue (`from-secondary to-accent`)
- **Height:** 12px (h-3)
- **Border radius:** Fully rounded (`rounded-full`)
- **Animation:** Smooth transition (`transition-all duration-500 ease-out`)

### Layout
```
┌─────────────────────────────────────────────────┐
│ Ready to assess your documents?                 │
│ Run the NISTA/PAR assessment...                 │
│                              [Run Assessment]   │
│                                                 │
│ Assessment Progress          15 / 50 criteria   │
│ ███████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│ 30% complete • This may take several minutes    │
└─────────────────────────────────────────────────┘
```

---

## N8N Workflow Requirements

### For Progress to Work Correctly

1. **N8N must insert assessments progressively**
   - Each assessment should be inserted into the `assessments` table immediately after it's generated
   - Don't batch inserts at the end
   - The frontend polls this table to track progress

2. **N8N workflow structure:**
   ```
   [Loop Over Criteria]
     ├─ Generate Assessment 1
     ├─ Insert Assessment 1  ← Frontend sees progress: 1/50
     ├─ Generate Assessment 2
     ├─ Insert Assessment 2  ← Frontend sees progress: 2/50
     └─ ...
   ```

3. **Project status update:**
   - Only update project status to 'completed' at the END
   - Frontend continues polling until status = 'completed'

---

## Testing

### Test with Different Criteria Counts

**5 Criteria (Original):**
- Progress: 0% → 20% → 40% → 60% → 80% → 100%
- Time: ~30-60 seconds

**25 Criteria:**
- Progress: 0% → 4% → 8% → ... → 96% → 100%
- Time: ~2-5 minutes

**50 Criteria:**
- Progress: 0% → 2% → 4% → ... → 98% → 100%
- Time: ~5-10 minutes

### Verification Steps

1. **Start assessment:**
   - ✅ Progress bar appears
   - ✅ Shows "0 / X criteria"
   - ✅ Toast: "Starting assessment of X criteria..."

2. **During assessment:**
   - ✅ Progress bar fills gradually
   - ✅ Count increases: "5 / 50", "10 / 50", etc.
   - ✅ Percentage updates: "10%", "20%", etc.
   - ✅ Toast updates every 3 seconds

3. **On completion:**
   - ✅ Progress bar disappears
   - ✅ Success toast: "Assessment completed! X criteria assessed."
   - ✅ Results display automatically

4. **Database verification:**
   ```sql
   -- Check total criteria
   SELECT COUNT(*) FROM assessment_criteria;

   -- Check assessment progress during execution
   SELECT COUNT(*) FROM assessments WHERE "projectId" = 1;

   -- Verify all assessments completed
   SELECT
     (SELECT COUNT(*) FROM assessments WHERE "projectId" = 1) as completed,
     (SELECT COUNT(*) FROM assessment_criteria) as total;
   ```

---

## User Experience Benefits

### Before (Static Message)
- ❌ No visibility into progress
- ❌ User doesn't know how long to wait
- ❌ "30-60 seconds" message misleading for 50 criteria
- ❌ User may think it's frozen

### After (Progress Bar)
- ✅ Real-time visibility into progress
- ✅ Clear expectation of completion time
- ✅ Confidence that the system is working
- ✅ Can leave and return to check progress

---

## Edge Cases Handled

### 1. Assessment Criteria Count Fails
```typescript
const total = totalCriteria || 50 // Default to 50
```
If the count query fails, defaults to 50 criteria.

### 2. Polling Timeout (10 minutes)
```typescript
const maxPolls = 200 // 200 × 3 seconds = 10 minutes
if (pollCount >= maxPolls) {
  // Stop polling, show results
}
```
Prevents infinite polling if N8N fails.

### 3. Progress Exceeds 100%
```typescript
width: `${Math.min((current / total) * 100, 100)}%`
```
Caps progress bar at 100% even if database has extra assessments.

### 4. User Navigates Away
Progress state is local - resets if user leaves the page. Assessment continues in background.

---

## Performance Considerations

### Database Queries
- **Every 3 seconds:**
  - `SELECT status FROM projects WHERE id = ?` (1 row)
  - `SELECT COUNT(*) FROM assessments WHERE projectId = ?` (count only)
- **Impact:** Minimal - efficient count query with index on projectId

### Network Traffic
- **Before:** 40 requests over 2 minutes
- **After:** 200 requests over 10 minutes
- **Rate:** Same (1 request per 3 seconds)

### Browser Resources
- **State updates:** Every 3 seconds (no noticeable impact)
- **Rendering:** Progress bar uses CSS transition (GPU accelerated)

---

## Future Enhancements

### Potential Improvements

1. **WebSocket Updates**
   - Replace polling with real-time WebSocket from N8N
   - Instant progress updates without database polling
   - More efficient than REST polling

2. **Detailed Progress Breakdown**
   - Show which criteria are being assessed
   - Display assessment names in progress list
   - Highlight completed criteria in green

3. **Estimated Time Remaining**
   - Calculate avg time per criterion
   - Show "~5 minutes remaining"
   - Update estimate as assessments complete

4. **Cancel Assessment**
   - Add "Cancel" button
   - Stop N8N workflow mid-execution
   - Revert project status to 'draft'

5. **Background Processing Notification**
   - Allow user to navigate away
   - Show notification when complete
   - Link back to results page

---

## Summary

The progress bar provides crucial visibility into long-running assessments:

- ✅ **Real-time progress tracking** (0% to 100%)
- ✅ **Clear metrics** (X of Y criteria assessed)
- ✅ **Extended timeout** (10 minutes for 50 criteria)
- ✅ **Dynamic toast messages** with progress updates
- ✅ **Smooth animations** and professional UI
- ✅ **Edge case handling** (timeouts, errors, navigation)

Users now have full visibility into assessment progress, eliminating uncertainty and improving the overall experience! 🎉
