-- =====================================================
-- Sample Testing Data for Evidence Assessment Feature
-- =====================================================
-- This SQL provides sample data for testing the new evidence
-- assessment UI components

-- STEP 1: Insert sample evidence requirements for a criterion
-- Replace <criterion_id> with an actual criterion ID from your database

INSERT INTO evidence_requirements (criterion_id, evidence_text, evidence_type, document_types, is_mandatory, quality_indicators, red_flags, display_order)
VALUES
  (
    <criterion_id>, -- Replace with actual criterion ID (e.g., from Gate 3 criterion G3-1.1)
    'Strategic case confirmed at FBC stage',
    'document',
    ARRAY['Strategic Case', 'FBC Chapter'],
    true,
    ARRAY['Case confirmed', 'Rationale unchanged'],
    ARRAY['Case contradicted', 'No confirmation'],
    1
  ),
  (
    <criterion_id>,
    'Strategic benefits still valid',
    'document',
    ARRAY['Benefits Validation', 'Strategic Review'],
    true,
    ARRAY['Benefits valid', 'Achievability confirmed'],
    ARRAY['Benefits changed', 'No validation'],
    2
  ),
  (
    <criterion_id>,
    'Ministerial/sponsor reconfirmation',
    'document',
    ARRAY['Sponsor Confirmation', 'Ministerial Brief'],
    false,
    ARRAY['Reconfirmation obtained', 'Support clear'],
    ARRAY['No reconfirmation', 'Opposition noted'],
    3
  );

-- STEP 2: Update a criterion assessment with sample evidence assessment data
-- Replace <assessment_id> with an actual assessment ID from criterion_assessments

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
WHERE id = <assessment_id>;

-- STEP 3: Verify the data was inserted correctly

-- Check evidence requirements
SELECT
  id,
  criterion_id,
  evidence_text,
  evidence_type,
  is_mandatory,
  quality_indicators,
  display_order
FROM evidence_requirements
WHERE criterion_id = <criterion_id>
ORDER BY display_order;

-- Check assessment with evidence assessment
SELECT
  id,
  criterion_id,
  rating,
  confidence,
  jsonb_pretty(evidence_assessment) as evidence_assessment_pretty
FROM criterion_assessments
WHERE id = <assessment_id>;

-- =====================================================
-- EXAMPLE: To find actual IDs to use above
-- =====================================================

-- Find a criterion ID (e.g., Gate 3 criterion)
SELECT id, criterion_code, title
FROM assessment_criteria
WHERE criterion_code LIKE 'G3%'
LIMIT 5;

-- Find an assessment ID for that criterion
SELECT ca.id, ca.criterion_id, ca.rating, ac.criterion_code, ac.title
FROM criterion_assessments ca
JOIN assessment_criteria ac ON ca.criterion_id = ac.id
WHERE ac.criterion_code LIKE 'G3%'
LIMIT 5;
