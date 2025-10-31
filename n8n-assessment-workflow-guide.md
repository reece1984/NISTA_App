# N8N Assessment Workflow Guide

## Overview

This workflow receives the "run_assessment" webhook trigger and performs RAG-based analysis to generate NISTA/PAR assessments across 5 dimensions.

## Webhook URL

`https://n8n-reeceai-u56804.vm.elestio.app/webhook-test/run-assessment`

## Workflow Architecture

```
1. Webhook Trigger
   ↓
2. Get Assessment Criteria (from database)
   ↓
3. Loop through each criterion (5 times)
   ↓
4. For each criterion:
   a. Build RAG query (semantic search question)
   b. Generate query embedding (OpenAI)
   c. Search document chunks (Supabase pgvector)
   d. Build context from top chunks
   e. Generate assessment with AI (OpenAI GPT-4)
   f. Parse AI response (RAG rating, findings, evidence, recommendations)
   g. Insert assessment into database
   ↓
5. Update project status to 'completed'
   ↓
6. Return success response
```

## Detailed Node Configuration

### Node 1: Webhook Trigger

**Type:** Webhook
**Method:** POST
**Path:** `/webhook-test/run-assessment`
**Authentication:** None

**Expected Input:**
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

---

### Node 2: Get Assessment Criteria

**Type:** Supabase
**Operation:** Get Rows
**Table:** assessment_criteria
**Credentials:** Supabase (Service Role Key)

**Purpose:** Fetch all 5 assessment criteria to loop through

**SQL Alternative (if using Code node):**
```sql
SELECT * FROM assessment_criteria ORDER BY id ASC;
```

**Expected Output:** Array of 5 criteria:
- Strategic
- Management
- Economic
- Commercial
- Financial

---

### Node 3: Loop Start (Split In Batches)

**Type:** Split In Batches
**Batch Size:** 1

**Purpose:** Process each assessment criterion one at a time

---

### Node 4: Build RAG Query

**Type:** Code (JavaScript)
**Purpose:** Create a semantic search question for this criterion

```javascript
const criterion = $('Get Assessment Criteria').item.json;
const projectId = $('Webhook').first().json.body.projectId;

// Map criterion names to semantic search queries
const queryMap = {
  'Strategic': 'What are the strategic objectives, business needs, and alignment with organizational goals mentioned in the documents?',
  'Management': 'What project management approaches, governance structures, and delivery methodologies are described?',
  'Economic': 'What is the economic case, cost-benefit analysis, and value for money assessment?',
  'Commercial': 'What are the commercial strategy, procurement approach, and contract management plans?',
  'Financial': 'What are the financial projections, budget breakdown, and funding arrangements?'
};

const ragQuery = queryMap[criterion.criterionName] ||
  `What does the document say about ${criterion.criterionName}?`;

return {
  json: {
    criterionId: criterion.id,
    criterionName: criterion.criterionName,
    criterionDescription: criterion.description,
    projectId: projectId,
    ragQuery: ragQuery
  }
};
```

---

### Node 5: Generate Query Embedding

**Type:** OpenAI
**Operation:** Create Embedding
**Model:** text-embedding-ada-002 (1536 dimensions)
**Input:** `{{ $json.ragQuery }}`

**Output:** 1536-dimension vector

---

### Node 6: Search Document Embeddings

**Type:** Supabase
**Operation:** Execute SQL
**Credentials:** Supabase (Service Role Key)

**SQL Query:**
```sql
SELECT
  id,
  file_id,
  content,
  1 - (embedding <=> '{{ $json.vectorString }}'::vector(1536)) AS similarity
FROM document_embeddings
WHERE project_id = {{ $('Build RAG Query').item.json.projectId }}
  AND 1 - (embedding <=> '{{ $json.vectorString }}'::vector(1536)) > 0.5
ORDER BY embedding <=> '{{ $json.vectorString }}'::vector(1536)
LIMIT 10;
```

**Purpose:** Use vector similarity search to find relevant document chunks from your document_embeddings table

**Note:** The embedding needs to be formatted as a PostgreSQL vector array: `[0.123, 0.456, ...]`
**Note:** Using `<=>` operator for cosine distance. Similarity = 1 - distance.

---

### Node 7: Format Embedding for SQL

**Type:** Code (JavaScript)
**Purpose:** Convert OpenAI embedding array to PostgreSQL vector format

```javascript
const embedding = $('Generate Query Embedding').first().json.data[0].embedding;
const projectId = $('Build RAG Query').item.json.projectId;

// Format as PostgreSQL vector: '[0.123, 0.456, ...]'
const vectorString = '[' + embedding.join(',') + ']';

return {
  json: {
    vectorString: vectorString,
    projectId: projectId,
    criterionId: $('Build RAG Query').item.json.criterionId,
    criterionName: $('Build RAG Query').item.json.criterionName,
    criterionDescription: $('Build RAG Query').item.json.criterionDescription,
    ragQuery: $('Build RAG Query').item.json.ragQuery
  }
};
```

---

### Node 8: Search Embeddings (Alternative: HTTP Request)

**Note:** This node can be skipped if you use Node 6 (Supabase SQL) directly. This is an alternative method.

**Type:** HTTP Request
**Method:** POST
**URL:** `https://yondkevazznqclmrkidl.supabase.co/rest/v1/document_embeddings`
**Headers:**
- `apikey`: `<YOUR_SERVICE_ROLE_KEY>`
- `Authorization`: `Bearer <YOUR_SERVICE_ROLE_KEY>`
- `Content-Type`: `application/json`
- `Prefer`: `return=representation`

**Query Parameters:**
- `select`: `id,fileId,content,embedding`
- `projectId`: `eq.{{ $json.projectId }}`

**Note:** For vector search via REST API, you'll need to filter in a subsequent Code node. Direct SQL (Node 6) is more efficient.

---

### Node 9: Build Context from Chunks

**Type:** Code (JavaScript)
**Purpose:** Combine retrieved chunks into context for AI

```javascript
const chunks = $('Search Chunks').all();
const criterionName = $('Format Embedding').item.json.criterionName;
const criterionDescription = $('Format Embedding').item.json.criterionDescription;

// Check if we have any relevant chunks
if (!chunks || chunks.length === 0) {
  return {
    json: {
      context: "No relevant information found in uploaded documents.",
      hasContext: false,
      criterionId: $('Format Embedding').item.json.criterionId,
      criterionName: criterionName,
      projectId: $('Format Embedding').item.json.projectId
    }
  };
}

// Build context from chunks
let context = "# Relevant Document Excerpts\n\n";
chunks.forEach((chunk, index) => {
  context += `## Excerpt ${index + 1} (Similarity: ${(chunk.json.similarity * 100).toFixed(1)}%)\n`;
  context += `${chunk.json.content}\n\n`;
});

return {
  json: {
    context: context,
    hasContext: true,
    chunkCount: chunks.length,
    criterionId: $('Format Embedding').item.json.criterionId,
    criterionName: criterionName,
    criterionDescription: criterionDescription,
    projectId: $('Format Embedding').item.json.projectId
  }
};
```

---

### Node 10: Generate Assessment with AI

**Type:** OpenAI
**Operation:** Chat Completion
**Model:** gpt-4 or gpt-4-turbo
**Temperature:** 0.3 (more deterministic)

**System Prompt:**
```
You are an expert infrastructure project assessor for the UK Infrastructure and Projects Authority (IPA).
You evaluate government projects against NISTA/PAR criteria.

Your task is to assess the {{ $json.criterionName }} dimension based on provided document excerpts.

Criterion Description:
{{ $json.criterionDescription }}

You must provide:
1. RAG Rating: Red, Amber, or Green
   - Green: Strong evidence of meeting requirements
   - Amber: Partial evidence or some concerns
   - Red: Weak evidence or significant concerns

2. Finding: A comprehensive paragraph (3-5 sentences) summarizing key observations about this criterion

3. Evidence: Direct quotes from documents supporting your findings (formatted as bullet points)

4. Recommendation: A detailed paragraph (3-5 sentences) with specific actions to improve

5. Confidence: Integer percentage from 0-100

Respond ONLY in this JSON format:
{
  "rating": "Green|Amber|Red",
  "confidence": 85,
  "finding": "A comprehensive paragraph summarizing key observations...",
  "evidence": "• Quote 1 from document\n• Quote 2 from document\n• Quote 3 from document",
  "recommendation": "A detailed paragraph with specific actions to improve..."
}
```

**User Prompt:**
```
Assess the following document excerpts for the {{ $json.criterionName }} criterion:

{{ $json.context }}

Provide your assessment in the JSON format specified.
```

---

### Node 11: Parse AI Response

**Type:** Code (JavaScript)
**Purpose:** Extract and validate AI response

```javascript
const aiResponse = $('Generate Assessment with AI').first().json;
const messageContent = aiResponse.choices[0].message.content;

try {
  // Parse JSON from AI response
  const assessment = JSON.parse(messageContent);

  // Map rating to database enum (lowercase)
  const ratingMap = {
    'Green': 'green',
    'Amber': 'amber',
    'Red': 'red'
  };

  return {
    json: {
      projectId: $('Build Context').item.json.projectId,
      criterionId: $('Build Context').item.json.criterionId,
      ragRating: ratingMap[assessment.rating] || 'amber',
      confidence: parseInt(assessment.confidence) || 50,
      finding: assessment.finding || 'No findings available',
      evidence: assessment.evidence || 'No evidence found',
      recommendation: assessment.recommendation || 'No recommendations available'
    }
  };
} catch (error) {
  // If AI doesn't return valid JSON, create a fallback
  return {
    json: {
      projectId: $('Build Context').item.json.projectId,
      criterionId: $('Build Context').item.json.criterionId,
      ragRating: 'amber',
      confidence: 30,
      finding: 'Unable to parse AI response. The assessment could not be completed.',
      evidence: 'AI response was not in expected format.',
      recommendation: 'Please retry the assessment or check the document quality.'
    }
  };
}
```

---

### Node 12: Insert Assessment into Database

**Type:** Supabase
**Operation:** Insert Row
**Table:** assessments
**Credentials:** Supabase (Service Role Key)

**Columns to Insert:**
- `projectId`: `{{ $json.projectId }}`
- `criterionId`: `{{ $json.criterionId }}`
- `ragRating`: `{{ $json.ragRating }}`
- `confidence`: `{{ $json.confidence }}`
- `finding`: `{{ $json.finding }}`
- `evidence`: `{{ $json.evidence }}`
- `recommendation`: `{{ $json.recommendation }}`

**Note:**
- Use Service Role Key to bypass RLS policies
- `createdAt` and `updatedAt` will be set automatically by database defaults
- Make sure `ragRating` is one of: 'green', 'amber', 'red' (lowercase)
- `confidence` should be an integer (0-100)

---

### Node 13: Loop End

**Type:** Loop End (from Split In Batches node)

**Purpose:** Continue until all 5 criteria are processed

---

### Node 14: Update Project Status

**Type:** Supabase
**Operation:** Update Row
**Table:** projects
**Credentials:** Supabase (Service Role Key)

**Filter:**
- Column: `id`
- Operator: `equals`
- Value: `{{ $('Webhook').first().json.body.projectId }}`

**Update:**
- `status`: `completed`
- `updatedAt`: `{{ new Date().toISOString() }}`

---

### Node 15: Return Success

**Type:** Respond to Webhook
**Response Code:** 200
**Body:**
```json
{
  "success": true,
  "message": "Assessment completed successfully",
  "projectId": "{{ $('Webhook').first().json.body.projectId }}",
  "assessmentsGenerated": 5
}
```

---

## Error Handling

Add error handling nodes after critical operations:

1. **After Search Chunks**: Check if chunks were found
2. **After AI Generation**: Validate JSON response
3. **After Database Insert**: Verify successful insert

**Error Response Node:**
```json
{
  "success": false,
  "error": "{{ $json.error }}",
  "projectId": "{{ $('Webhook').first().json.body.projectId }}"
}
```

---

## Testing Checklist

- [ ] Webhook receives correct payload from frontend
- [ ] All 5 assessment criteria are fetched
- [ ] Embeddings are generated correctly (1536 dimensions)
- [ ] Vector search returns relevant chunks
- [ ] AI generates valid JSON responses
- [ ] All 5 assessments are inserted into database
- [ ] Project status updates to 'completed'
- [ ] Frontend displays assessment results

---

## Required Credentials

1. **Supabase Service Role Key**: For bypassing RLS and writing assessments
2. **OpenAI API Key**: For embeddings (ada-002) and completions (GPT-4)

---

## Expected Performance

- **Total Time**: 30-60 seconds (5 criteria × 6-12 seconds each)
- **API Calls**:
  - 5 × OpenAI Embedding calls
  - 5 × Supabase vector searches
  - 5 × OpenAI GPT-4 calls
  - 5 × Supabase inserts
- **Cost per Assessment**: ~$0.15-0.25 USD (depending on GPT-4 model)

---

## Troubleshooting

### Issue: No chunks returned from vector search

**Cause:** Documents not yet embedded, or threshold too high
**Fix:** Lower match_threshold to 0.3, verify embeddings exist in document_embeddings table

### Issue: AI returns invalid JSON

**Cause:** Model creativity or parsing errors
**Fix:** Add JSON validation in Parse node, implement retry logic

### Issue: RLS prevents insert

**Cause:** Using anon key instead of service role key
**Fix:** Ensure all N8N Supabase nodes use Service Role Key

### Issue: Frontend doesn't show results

**Cause:** Frontend polling timeout or data not refetched
**Fix:** Increase polling duration in ProjectDetailPage.tsx or implement webhooks
