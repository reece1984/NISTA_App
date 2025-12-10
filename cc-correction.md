# Gateway Success - Database State Corrections

**Context:** Your technical audit from December 8, 2025 contained some inaccuracies regarding the database state. This document provides corrections based on direct Supabase query results.

---

## 1. Assessment Criteria — CORRECTION REQUIRED

### Your Audit Said:
> "No seed data SQL found... likely manually seeded or imported"
> "Status: Templates referenced in code but actual criterion data population not verified"

### Actual State:
**174 assessment criteria ARE populated** across all 7 gates:

| Gate | Criteria Count | Blockers | Critical |
|------|----------------|----------|----------|
| Gate 0 (Strategic Assessment) | 20 | 4 | 5 |
| Gate 1 (Business Justification) | 54 | 3 | 30 |
| Gate 2 (Delivery Strategy) | 20 | 3 | 11 |
| Gate 3 (Investment Decision) | 20 | 5 | 15 |
| Gate 4 (Readiness for Service) | 20 | 8 | 17 |
| Gate 5 (Operations Review) | 20 | 1 | 13 |
| PAR (Project Assessment Review) | 20 | 3 | 3 |

**Key Points:**
- Gate 1 is correctly the heaviest (54 criteria) — SOC stage requires comprehensive strategic justification
- Gate 4 has the most blockers (8) — appropriate for final go/no-go before service
- All Five Case Model categories (Strategic, Economic, Commercial, Financial, Management) are represented across all gates
- `is_gateway_blocker` and `is_critical` flags are properly assigned

---

## 2. Assessment Templates — FULLY POPULATED

### Actual State:
All 7 IPA gates are properly defined with correct business case stage alignment:

```
gate_0  → Programme Business Case (PBC)
gate_1  → Strategic Outline Case (SOC)
gate_2  → Outline Business Case (OBC)
gate_3  → Full Business Case (FBC) - Draft
gate_4  → Full Business Case (FBC) - Approved
gate_5  → FBC with Post-Implementation Annexure
par     → Current approved business case
```

Each template has `key_documents` arrays populated (4-7 documents per gate).

---

## 3. Evidence Requirements — CRITICAL GAP (Not Surfaced in Audit)

### Actual State:
**Only 3% of criteria have evidence requirements populated:**

| Gate | Criteria | Evidence Requirements | Coverage |
|------|----------|----------------------|----------|
| Gate 0 | 20 | 0 | 0% |
| Gate 1 | 54 | 12 | 22% |
| Gate 2 | 20 | 0 | 0% |
| Gate 3 | 20 | 0 | 0% |
| Gate 4 | 20 | 0 | 0% |
| Gate 5 | 20 | 0 | 0% |
| PAR | 20 | 0 | 0% |

**Impact:** This is the root cause of the calibration problem. The AI cannot distinguish "document exists" from "evidence is adequate" because quality indicators and red flags are not populated.

Gate 1's 12 evidence requirements DO have:
- `quality_indicators` arrays populated
- `red_flags` arrays populated
- `is_mandatory` flags set

All other gates have zero evidence requirements.

---

## 4. Quality Rubrics — DEFINITIONAL ONLY

### Your Audit Said:
> "Supports weighting and critical flags"

### Actual State:
The `quality_rubric` JSONB field exists and is populated, but contains **definitional descriptions only**, not diagnostic criteria:

```json
{
  "RED": "Strategic outcomes at risk or no longer achievable",
  "AMBER": "Achievable but concerns or delays",
  "GREEN": "Strategic outcomes on track with positive indicators and alignment confirmed"
}
```

**What's Missing for Proper Calibration:**
```json
{
  "GREEN": {
    "definition": "Strategic outcomes on track...",
    "evidence_indicators": [
      "Benefits realisation plan with quantified targets",
      "Baseline measurements documented",
      "Tracking mechanism demonstrated in operation"
    ],
    "document_signals": ["Benefits Register", "BRM Strategy"]
  },
  "AMBER": {
    "definition": "Achievable but concerns...",
    "evidence_indicators": [
      "Plan exists but targets vague or unquantified",
      "Baselines incomplete or estimated"
    ]
  },
  "RED": {
    "definition": "...",
    "red_flags": [
      "No benefits register found",
      "Benefits described only in narrative without metrics"
    ]
  }
}
```

---

## 5. IPA Categories — CONFIRMED CORRECT

Five Case Model alignment is properly implemented:

| Code | Name | Five Case Alignment |
|------|------|---------------------|
| strategic | Strategic | Strategic Case |
| economic | Economic | Economic Case |
| commercial | Commercial | Commercial Case |
| financial | Financial | Financial Case |
| management | Management | Management Case |

---

## 6. Document Types — NOT MENTIONED IN AUDIT

### Actual State:
**40 document types** are populated across 7 categories:

- **business_case** (9 types): Full Business Case, OBC, SOC, Strategic/Economic/Commercial/Financial/Management Cases
- **delivery** (4 types): PEP, PMP, Delivery Strategy, Implementation Plan
- **governance** (8 types): Risk Register, Risk Management Strategy, Governance Framework, Benefits Realisation Plan, Benefits Register, Stakeholder Engagement Plan, Change Management Strategy, Quality Management Plan
- **technical** (6 types): Project Schedule, Cost Estimate, Technical Specifications, Design Documentation, Resource Plan, Technical Feasibility Study
- **commercial** (3 types): Procurement Strategy, Contract Strategy, Market Analysis
- **financial** (3 types): Financial Model, Funding Strategy, Budget Documentation
- **assurance** (3 types): Previous Gateway Review, Assurance Review Report, Audit Report
- **other** (4 types): Options Appraisal, Feasibility Study, Environmental Impact Assessment, Other Document

Each document type has `typical_for_gates` arrays mapping them to relevant gates.

---

## 7. Embeddings State — QUANTIFIED

### Your Audit Said:
> "Vector embeddings operational"

### Actual State:
Proof-of-concept only:

| Metric | Value |
|--------|-------|
| Total embeddings | 366 |
| Files with embeddings | 1 |
| Projects with embeddings | 1 |
| Average chunk length | ~801 characters |
| Vectors populated | 366 (100%) |

The RAG pipeline works, but has only processed a single test file.

---

## 8. Usage Statistics — NOT QUANTIFIED IN AUDIT

### Actual State:

| Entity | Count |
|--------|-------|
| Projects | 3 |
| Assessment Runs | 1 |
| Assessments (criterion-level) | 20 |
| Files Uploaded | 1 |
| Actions Created | 0 |

This is minimal test usage — the action management system is unused.

---

## Summary: Corrected Assessment

| Layer | Your Assessment | Corrected Status |
|-------|-----------------|------------------|
| IPA Framework | "Not verified" | ✅ Complete (7 gates, 174 criteria) |
| Evidence Requirements | Not mentioned | ⚠️ Critical gap (3% populated) |
| Quality Rubrics | "Supports weighting" | ⚠️ Definitional only, no diagnostics |
| Document Types | Not mentioned | ✅ Complete (40 types, gate-mapped) |
| RAG Pipeline | "Operational" | ✅ Working but minimal test data |
| Usage | Not quantified | ⚠️ 3 projects, 1 assessment, 0 actions |

**Root Cause of Generous AI Ratings:**
The AI defaults to optimistic interpretation because:
1. Evidence requirements are 97% unpopulated
2. Quality rubrics lack evidence indicators and red flags
3. No diagnostic criteria exist to distinguish "document exists" from "evidence is adequate"

This is a content gap, not a code gap.
