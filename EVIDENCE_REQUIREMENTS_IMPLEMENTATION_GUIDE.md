# Evidence Requirements Feature - Implementation Guide

## Overview

This guide provides step-by-step instructions for integrating the new **Evidence Assessment** and **Path to GREEN** sections into your criterion detail components.

## What's Been Created

### ✅ Completed Files

1. **[tailwind.config.js](tailwind.config.js)** - Added copper colors
2. **[src/types/assessment.ts](src/types/assessment.ts)** - TypeScript types
3. **[ADD_EVIDENCE_ASSESSMENT_COLUMN.sql](ADD_EVIDENCE_ASSESSMENT_COLUMN.sql)** - Database migration
4. **[src/components/assessment/EvidenceAssessmentCard.tsx](src/components/assessment/EvidenceAssessmentCard.tsx)** - Individual evidence card
5. **[src/components/assessment/EvidenceAssessmentSection.tsx](src/components/assessment/EvidenceAssessmentSection.tsx)** - Full evidence section
6. **[src/components/assessment/PathToGreenSection.tsx](src/components/assessment/PathToGreenSection.tsx)** - Path to GREEN section
7. **[TEST_EVIDENCE_ASSESSMENT_DATA.sql](TEST_EVIDENCE_ASSESSMENT_DATA.sql)** - Sample test data

---

## Step 1: Run Database Migration

Execute the SQL migration to add the `evidence_assessment` column:

```bash
# In Supabase SQL Editor, run:
```

```sql
-- Copy contents from ADD_EVIDENCE_ASSESSMENT_COLUMN.sql
ALTER TABLE criterion_assessments
ADD COLUMN IF NOT EXISTS evidence_assessment jsonb DEFAULT '[]'::jsonb;
```

**Verify:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'criterion_assessments'
  AND column_name = 'evidence_assessment';
```

---

## Step 2: Create/Update Your Criterion Detail Component

### Option A: If you DON'T have a CriterionDetail component yet

Create `src/components/assessment/CriterionDetail.tsx` based on the HTML mockup structure:

```tsx
import { EvidenceAssessmentSection } from './EvidenceAssessmentSection'
import { PathToGreenSection } from './PathToGreenSection'
import type { CriterionAssessmentWithEvidence } from '../../types/assessment'

interface Props {
  assessment: CriterionAssessmentWithEvidence
  isExpanded: boolean
  onToggle: () => void
}

export function CriterionDetail({ assessment, isExpanded, onToggle }: Props) {
  const ratingColors = {
    GREEN: 'green',
    AMBER: 'amber',
    RED: 'red'
  }
  const color = ratingColors[assessment.rating]

  if (!isExpanded) {
    return (
      <div className="bg-white rounded-xl border-l-4 border-l-${color}-500 shadow-sm">
        {/* Collapsed header - see HTML mockup lines 328-348 */}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border-l-4 border-l-${color}-500 shadow-sm overflow-hidden">
      {/* Header Row */}
      <div className="px-6 py-5 flex items-center justify-between">
        {/* ... criterion code, title, rating badge, confidence bar ... */}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 border-t border-b border-slate-100">
        {/* ... satisfaction, confidence, weight, critical ... */}
      </div>

      {/* Finding Section */}
      <div className="px-6 py-6">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Finding
        </h4>
        <p className="text-slate-700 leading-relaxed">{assessment.finding}</p>
      </div>

      {/* Evidence Quotes Section */}
      <div className="px-6 pb-6">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Evidence
        </h4>
        <div className="space-y-4">
          {assessment.evidence_quotes.map((quote, idx) => (
            <div key={idx} className="flex gap-4">
              {/* Document icon + quote + source */}
            </div>
          ))}
        </div>
      </div>

      {/* 🆕 NEW: Evidence Assessment Section */}
      {assessment.evidence_requirements?.length > 0 && (
        <EvidenceAssessmentSection
          evidenceRequirements={assessment.evidence_requirements}
          evidenceAssessment={assessment.evidence_assessment ?? []}
        />
      )}

      {/* 🆕 NEW: Path to GREEN Section */}
      <PathToGreenSection
        rating={assessment.rating}
        evidenceRequirements={assessment.evidence_requirements ?? []}
        evidenceAssessment={assessment.evidence_assessment ?? []}
        greenStandard={assessment.criterion.quality_rubric.GREEN}
      />

      {/* Recommendation Section */}
      <div className="mx-6 mb-6 py-5 px-5 bg-amber-50/70 rounded-lg border-l-3 border-l-amber-400">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Recommendation
        </h4>
        <p className="text-slate-700 leading-relaxed">{assessment.recommendation}</p>
      </div>
    </div>
  )
}
```

### Option B: If you ALREADY have a CriterionDetail component

**Find your existing component** (likely in `src/components/` or `src/pages/`):

```bash
# Search for existing component
grep -r "CriterionDetail" src/ --include="*.tsx"
```

**Add the new sections** after your Evidence section and before Recommendation:

```tsx
// Add imports at top
import { EvidenceAssessmentSection } from './assessment/EvidenceAssessmentSection'
import { PathToGreenSection } from './assessment/PathToGreenSection'

// Then in your JSX, add these two sections:

{/* Existing Evidence Quotes Section */}
<div className="px-6 pb-6">
  <h4>Evidence</h4>
  {/* your existing evidence display */}
</div>

{/* 🆕 ADD THIS: Evidence Assessment Section */}
{assessment.evidence_requirements?.length > 0 && (
  <EvidenceAssessmentSection
    evidenceRequirements={assessment.evidence_requirements}
    evidenceAssessment={assessment.evidence_assessment ?? []}
  />
)}

{/* 🆕 ADD THIS: Path to GREEN Section */}
<PathToGreenSection
  rating={assessment.rating}
  evidenceRequirements={assessment.evidence_requirements ?? []}
  evidenceAssessment={assessment.evidence_assessment ?? []}
  greenStandard={assessment.criterion.quality_rubric.GREEN}
/>

{/* Existing Recommendation Section */}
<div className="recommendation">
  {/* your existing recommendation */}
</div>
```

---

## Step 3: Update Data Fetching

### Find Your Assessment Query

Look for where you fetch assessment data:

```bash
# Find the query
grep -r "from('assessments')" src/ --include="*.ts" --include="*.tsx"
# OR
grep -r "from('criterion_assessments')" src/ --include="*.ts" --include="*.tsx"
```

### Update to Fetch Evidence Requirements

**Before:**
```typescript
const { data } = await supabase
  .from('criterion_assessments')
  .select(`
    *,
    criterion:assessment_criteria (
      id,
      criterion_code,
      title,
      quality_rubric
    )
  `)
  .eq('assessment_id', assessmentId)
```

**After:**
```typescript
// Step 1: Fetch assessments with criteria
const { data, error } = await supabase
  .from('criterion_assessments')
  .select(`
    *,
    criterion:assessment_criteria (
      id,
      criterion_code,
      title,
      quality_rubric
    )
  `)
  .eq('assessment_id', assessmentId)

if (error) throw error

// Step 2: Fetch evidence requirements separately
const criterionIds = data.map(d => d.criterion_id)
const { data: evidenceReqs, error: reqError } = await supabase
  .from('evidence_requirements')
  .select('*')
  .in('criterion_id', criterionIds)
  .order('display_order')

if (reqError) throw reqError

// Step 3: Merge evidence requirements into each assessment
const enrichedData = data.map(assessment => ({
  ...assessment,
  evidence_requirements: evidenceReqs.filter(
    er => er.criterion_id === assessment.criterion_id
  )
}))

return enrichedData
```

---

## Step 4: Add Test Data

Use the provided SQL script to add test data:

```sql
-- 1. Find a criterion ID to test with
SELECT id, criterion_code, title
FROM assessment_criteria
WHERE criterion_code LIKE 'G3%'
LIMIT 1;
-- Example result: id = 42, criterion_code = 'G3-1.1'

-- 2. Find an assessment ID for that criterion
SELECT ca.id, ca.criterion_id, ca.rating
FROM criterion_assessments ca
WHERE ca.criterion_id = 42
LIMIT 1;
-- Example result: assessment id = 123

-- 3. Insert evidence requirements
INSERT INTO evidence_requirements (criterion_id, evidence_text, evidence_type, document_types, is_mandatory, quality_indicators, red_flags, display_order)
VALUES
  (
    42, -- Your criterion ID
    'Strategic case confirmed at FBC stage',
    'document',
    ARRAY['Strategic Case', 'FBC Chapter'],
    true,
    ARRAY['Case confirmed', 'Rationale unchanged'],
    ARRAY['Case contradicted', 'No confirmation'],
    1
  ),
  (
    42,
    'Strategic benefits still valid',
    'document',
    ARRAY['Benefits Validation', 'Strategic Review'],
    true,
    ARRAY['Benefits valid', 'Achievability confirmed'],
    ARRAY['Benefits changed', 'No validation'],
    2
  ),
  (
    42,
    'Ministerial/sponsor reconfirmation',
    'document',
    ARRAY['Sponsor Confirmation', 'Ministerial Brief'],
    false,
    ARRAY['Reconfirmation obtained', 'Support clear'],
    ARRAY['No reconfirmation', 'Opposition noted'],
    3
  );

-- 4. Update assessment with evidence assessment data
UPDATE criterion_assessments
SET evidence_assessment = '[
  {
    "evidence_requirement_id": 1,
    "status": "found",
    "found_indicators": ["Case confirmed", "Rationale unchanged"],
    "missing_indicators": [],
    "source_refs": [{"doc": "FBC Document", "page": 20}]
  },
  {
    "evidence_requirement_id": 2,
    "status": "partial",
    "found_indicators": ["Benefits valid"],
    "missing_indicators": ["Achievability confirmed"],
    "source_refs": [{"doc": "FBC Document", "page": 21}]
  },
  {
    "evidence_requirement_id": 3,
    "status": "missing",
    "found_indicators": [],
    "missing_indicators": ["Reconfirmation obtained", "Support clear"],
    "source_refs": []
  }
]'::jsonb
WHERE id = 123; -- Your assessment ID
```

---

## Step 5: Test the UI

1. **Run the app:**
   ```bash
   npm run dev
   ```

2. **Navigate to an assessment detail page** (the one with the test data you added)

3. **Expand a criterion** - You should see:
   - ✅ **Evidence Assessment section** with 3 cards (Found, Partial, Missing)
   - ✅ **What's Needed for GREEN section** with 3 numbered gaps
   - ✅ Copper-colored elements matching the design mockup

4. **Test edge cases:**
   - Navigate to a GREEN-rated criterion → Path to GREEN should NOT show
   - Navigate to a criterion without `evidence_requirements` → Sections should NOT show

---

## Step 6: Styling Verification

Ensure these styles match the design:

### Confidence Bar
Should be a thin gradient bar (6px height):

```css
/* Already styled in the component - no changes needed */
.confidence-track {
  width: 80px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
}
```

### Evidence Quotes
Should have amber left border on document icon:

```tsx
<div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center border-l-2 border-l-amber-400">
  {/* Document icon */}
</div>
<div className="flex-1 border-l-2 border-amber-300 pl-4">
  {/* Quote text */}
</div>
```

### Copper Elements
- Badge numbers: `bg-copper` (in PathToGreenSection)
- "X gaps to address": `text-copper` (in PathToGreenSection)
- Confidence metrics: `text-copper` (in metrics grid)

---

## Troubleshooting

### Issue: "Cannot find module './assessment/Evidence...'"

**Solution:** Ensure the import path is correct relative to your component location:

```tsx
// If your component is in src/components/
import { EvidenceAssessmentSection } from './assessment/EvidenceAssessmentSection'

// If your component is in src/pages/
import { EvidenceAssessmentSection } from '../components/assessment/EvidenceAssessmentSection'
```

### Issue: "evidenceRequirements is undefined"

**Solution:** The data fetch didn't include evidence requirements. Double-check Step 3.

### Issue: Sections not showing

**Solution:**
1. Check that `evidence_requirements` array is populated in your data
2. Check that the assessment has `rating !== 'GREEN'` (Path to GREEN only shows for AMBER/RED)
3. Add console.log to debug:

```tsx
console.log('Assessment data:', assessment)
console.log('Evidence requirements:', assessment.evidence_requirements)
console.log('Evidence assessment:', assessment.evidence_assessment)
```

### Issue: Copper color not showing

**Solution:** Make sure you ran the Tailwind config update and restarted the dev server:

```bash
# Kill and restart
npm run dev
```

---

## Next Steps

### For Production Use

1. **Populate all evidence requirements:**
   - Add evidence requirements for all 174 criteria
   - Use the structure from `TEST_EVIDENCE_ASSESSMENT_DATA.sql`
   - Ensure `display_order` is sequential

2. **Update N8N AI workflow** to populate `evidence_assessment`:
   - After generating assessment, analyze which evidence requirements were met
   - Map found indicators vs missing indicators
   - Store in `evidence_assessment` JSONB column

3. **Add RLS policies** for `evidence_requirements` table:
   ```sql
   -- Public read access (all users can see criteria requirements)
   CREATE POLICY "evidence_requirements_select_all" ON evidence_requirements
     FOR SELECT
     USING (true);
   ```

4. **Export button** (future enhancement):
   - Add "Export Assessment" button that includes the new sections in PDF/Excel

---

## File Checklist

### ✅ Files Created
- [x] `tailwind.config.js` - Added copper colors
- [x] `src/types/assessment.ts` - TypeScript types
- [x] `ADD_EVIDENCE_ASSESSMENT_COLUMN.sql` - Migration
- [x] `src/components/assessment/EvidenceAssessmentCard.tsx`
- [x] `src/components/assessment/EvidenceAssessmentSection.tsx`
- [x] `src/components/assessment/PathToGreenSection.tsx`
- [x] `TEST_EVIDENCE_ASSESSMENT_DATA.sql` - Sample data
- [x] `EVIDENCE_REQUIREMENTS_IMPLEMENTATION_GUIDE.md` - This file

### 🔜 Files You Need to Modify
- [ ] Your criterion detail component (add the two new sections)
- [ ] Your assessment data fetching logic (add evidence requirements query)
- [ ] Database (run migration + add test data)

---

## Support

If you encounter issues:

1. Check the HTML mockup: `criterion-detail-v4.html` (lines 168-310 show the exact structure)
2. Verify data structure matches TypeScript types in `src/types/assessment.ts`
3. Ensure database migration completed successfully

**The design matches the mockup exactly** - use it as reference for spacing, colors, and layout.
