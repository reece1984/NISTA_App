# N8N: Generate Project Summary

This guide shows you how to add the new project summary generation step to your Run Assessment workflow.

---

## Overview

After all 5 assessments are complete, you need to:
1. Aggregate the assessment results
2. Call GPT-4 to generate an executive summary
3. Parse the AI response
4. Insert into `project_summaries` table

---

## Workflow Position

Add these nodes AFTER the assessment loop completes and BEFORE updating project status:

```
[Loop Over 5 Criteria] → [Insert Assessments]
  ↓
[Aggregate Assessment Results] (NEW)
  ↓
[Generate Project Summary with AI] (NEW)
  ↓
[Parse Summary Response] (NEW)
  ↓
[Insert into project_summaries] (NEW)
  ↓
[Update Project Status to 'completed']
  ↓
[Respond to Webhook]
```

---

## Node 1: Aggregate Assessment Results

**Type:** Code (JavaScript)
**Purpose:** Gather all 5 assessment results to pass to AI

```javascript
// Get all assessment results from the loop
const assessments = $('Insert Assessment').all();
const projectId = $('Webhook').first().json.body.projectId;

// Build a summary of all assessments
let assessmentSummary = "# Assessment Results\n\n";

assessments.forEach((assessment, index) => {
  const data = assessment.json;
  assessmentSummary += `## Criterion ${index + 1}: ${data.criterionName || 'Unknown'}\n`;
  assessmentSummary += `**RAG Rating:** ${data.ragRating}\n`;
  assessmentSummary += `**Confidence:** ${data.confidence}%\n`;
  assessmentSummary += `**Finding:** ${data.finding}\n`;
  assessmentSummary += `**Evidence:** ${data.evidence}\n`;
  assessmentSummary += `**Recommendation:** ${data.recommendation}\n\n`;
});

// Calculate overall RAG rating
const ragCounts = {
  green: 0,
  amber: 0,
  red: 0
};

assessments.forEach(a => {
  const rating = a.json.ragRating?.toLowerCase();
  if (rating === 'green') ragCounts.green++;
  else if (rating === 'amber') ragCounts.amber++;
  else if (rating === 'red') ragCounts.red++;
});

// Determine overall rating (simple logic: most common rating)
let overallRating = 'amber'; // default
if (ragCounts.green >= 3) {
  overallRating = 'green';
} else if (ragCounts.red >= 3) {
  overallRating = 'red';
} else if (ragCounts.red >= 2) {
  overallRating = 'red';
} else if (ragCounts.green >= 2 && ragCounts.amber <= 2) {
  overallRating = 'green';
}

return {
  json: {
    projectId: projectId,
    assessmentSummary: assessmentSummary,
    overallRating: overallRating,
    ragCounts: ragCounts,
    totalAssessments: assessments.length
  }
};
```

---

## Node 2: Generate Project Summary with AI

**Type:** OpenAI
**Operation:** Chat Completion
**Model:** gpt-4-turbo or gpt-4
**Temperature:** 0.5

### System Prompt

```
You are an expert infrastructure project assessor for the UK Infrastructure and Projects Authority (IPA).

Based on the completed NISTA/PAR assessments below, generate a comprehensive executive summary for decision-makers.

You must provide:

1. **Executive Summary**: A high-level overview (3-4 sentences) that captures the project's overall readiness and key considerations for approval.

2. **Key Strengths**: A paragraph (3-4 sentences) highlighting the strongest aspects of the project. Focus on green-rated criteria and positive findings.

3. **Critical Issues**: A paragraph (3-4 sentences) identifying the most significant concerns and red-rated criteria. Be specific about risks and gaps.

4. **Overall Recommendation**: A paragraph (3-4 sentences) providing clear guidance on whether to proceed, what conditions to attach, or what improvements are needed before approval.

Respond ONLY in this JSON format:
{
  "executive_summary": "A high-level overview paragraph...",
  "key_strengths": "A paragraph highlighting strongest aspects...",
  "critical_issues": "A paragraph identifying significant concerns...",
  "overall_recommendation": "Clear guidance on next steps..."
}
```

### User Prompt

```
Based on the following NISTA/PAR assessment results, generate an executive summary for decision-makers:

{{ $json.assessmentSummary }}

---

Overall RAG Distribution:
- Green: {{ $json.ragCounts.green }}
- Amber: {{ $json.ragCounts.amber }}
- Red: {{ $json.ragCounts.red }}

Provide your executive summary in the JSON format specified.
```

---

## Node 3: Parse Summary Response

**Type:** Code (JavaScript)
**Purpose:** Extract and validate AI response

```javascript
const aiResponse = $('Generate Project Summary with AI').first().json;
const messageContent = aiResponse.choices[0].message.content;
const projectId = $('Aggregate Assessment Results').item.json.projectId;
const overallRating = $('Aggregate Assessment Results').item.json.overallRating;

try {
  // Parse JSON from AI response
  const summary = JSON.parse(messageContent);

  return {
    json: {
      project_id: projectId,
      overall_rating: overallRating,
      executive_summary: summary.executive_summary || 'No executive summary available',
      key_strengths: summary.key_strengths || 'No strengths identified',
      critical_issues: summary.critical_issues || 'No critical issues identified',
      overall_recommendation: summary.overall_recommendation || 'No recommendation available'
    }
  };
} catch (error) {
  // Fallback if AI doesn't return valid JSON
  console.error('Failed to parse AI summary response:', error);

  return {
    json: {
      project_id: projectId,
      overall_rating: overallRating,
      executive_summary: 'The project has completed assessment across all NISTA/PAR dimensions.',
      key_strengths: 'Assessment results are available in the detailed criteria breakdown.',
      critical_issues: 'Please review individual criterion assessments for specific concerns.',
      overall_recommendation: 'Detailed recommendations are provided for each assessment criterion.'
    }
  };
}
```

---

## Node 4: Insert into project_summaries

**Type:** Supabase
**Operation:** Insert Row
**Table:** project_summaries
**Credentials:** Supabase (Service Role Key)

### Columns to Insert

- `project_id`: `{{ $json.project_id }}`
- `overall_rating`: `{{ $json.overall_rating }}`
- `executive_summary`: `{{ $json.executive_summary }}`
- `key_strengths`: `{{ $json.key_strengths }}`
- `critical_issues`: `{{ $json.critical_issues }}`
- `overall_recommendation`: `{{ $json.overall_recommendation }}`

**Note:**
- `created_at` and `updated_at` will be set automatically by database defaults
- Use Service Role Key to bypass RLS policies
- If a summary already exists for this project, you may want to update instead of insert

---

## Alternative: Upsert (Update or Insert)

If you want to replace an existing summary instead of creating duplicates, use HTTP Request:

**Type:** HTTP Request
**Method:** POST
**URL:** `https://yondkevazznqclmrkidl.supabase.co/rest/v1/project_summaries`

**Headers:**
- `apikey`: `<YOUR_SERVICE_ROLE_KEY>`
- `Authorization`: `Bearer <YOUR_SERVICE_ROLE_KEY>`
- `Content-Type`: `application/json`
- `Prefer`: `resolution=merge-duplicates`

**Body:**
```json
{
  "project_id": {{ $json.project_id }},
  "overall_rating": "{{ $json.overall_rating }}",
  "executive_summary": "{{ $json.executive_summary }}",
  "key_strengths": "{{ $json.key_strengths }}",
  "critical_issues": "{{ $json.critical_issues }}",
  "overall_recommendation": "{{ $json.overall_recommendation }}",
  "updated_at": "{{ new Date().toISOString() }}"
}
```

This will create a new summary or update the existing one if it already exists.

---

## Complete Workflow Flow

```
[Webhook: run_assessment]
  ↓
[Get 5 Assessment Criteria]
  ↓
[Loop Over Criteria]
  ├─ Build RAG Query
  ├─ Generate Embedding
  ├─ Search Vectors
  ├─ Generate Assessment (GPT-4)
  ├─ Parse Response
  └─ Insert Assessment
  ↓
[Aggregate Assessment Results] ← YOU ARE HERE
  ↓
[Generate Project Summary (GPT-4)]
  ↓
[Parse Summary Response]
  ↓
[Insert into project_summaries]
  ↓
[Update Project Status to 'completed']
  ↓
[Respond to Webhook with CORS]
```

---

## Testing

### 1. Run the workflow
Click "Run Assessment" in your frontend

### 2. Check N8N execution log
Look for these nodes:
- ✅ Aggregate Assessment Results
- ✅ Generate Project Summary with AI
- ✅ Parse Summary Response
- ✅ Insert into project_summaries

### 3. Verify database
```sql
SELECT * FROM project_summaries WHERE project_id = 1;
```

Expected result:
```
| id | project_id | overall_rating | executive_summary | key_strengths | critical_issues | overall_recommendation |
|----|------------|----------------|-------------------|---------------|-----------------|------------------------|
| 1  | 1          | green          | The project...    | Strong...     | Minor...        | Recommend approval...  |
```

### 4. Check frontend
Navigate to the project detail page:
- ✅ "Executive Summary" section appears
- ✅ Overall Rating badge shows (green/amber/red)
- ✅ Executive Summary text displays
- ✅ Key Strengths (green box)
- ✅ Critical Issues (red box)
- ✅ Overall Recommendation (blue box)

### 5. Test PDF export
Click "Export to PDF":
- ✅ PDF includes project summary on first page
- ✅ Executive summary, strengths, issues, and recommendation all present

### 6. Test Excel export
Click "Export to Excel":
- ✅ Excel file has "Project Summary" sheet
- ✅ Sheet contains all summary fields

---

## Troubleshooting

### Issue: AI returns invalid JSON

**Symptom:** Parse node fails or returns fallback text
**Cause:** GPT-4 response not properly formatted
**Fix:**
1. Check the System Prompt is clear about JSON format
2. Add `"response_format": { "type": "json_object" }` to OpenAI node (if supported)
3. Increase temperature to 0.3 for more consistent formatting

### Issue: Duplicate summaries created

**Symptom:** Multiple rows in project_summaries for same project
**Cause:** Insert creates new row every time
**Fix:** Use HTTP Request with `Prefer: resolution=merge-duplicates` header (upsert)

### Issue: Summary not showing in frontend

**Symptom:** Assessments show but no Executive Summary section
**Cause:** Frontend query returns null for projectSummary
**Fix:**
1. Check if row was inserted: `SELECT * FROM project_summaries WHERE project_id = 1`
2. Check frontend console for errors
3. Verify project_id matches (integer type)

### Issue: Overall rating incorrect

**Symptom:** Overall rating doesn't match assessment results
**Cause:** Logic in Aggregate node needs adjustment
**Fix:** Modify the rating calculation logic in Node 1 based on your criteria

---

## Cost Estimate

Adding this feature will add one more GPT-4 API call per assessment:

- **Previous cost per assessment:** ~$0.15-0.25
- **Additional cost for summary:** ~$0.03-0.05
- **New total per assessment:** ~$0.18-0.30

The summary generation is relatively cheap because it's processing structured data, not large documents.

---

## Summary

To enable the Executive Summary feature:

1. ✅ Add "Aggregate Assessment Results" code node
2. ✅ Add "Generate Project Summary with AI" OpenAI node
3. ✅ Add "Parse Summary Response" code node
4. ✅ Add "Insert into project_summaries" Supabase node
5. ✅ Place BEFORE "Update Project Status" node
6. ✅ Test end-to-end

The frontend is already configured to display the summary - it just needs the data in the database! 🎉
