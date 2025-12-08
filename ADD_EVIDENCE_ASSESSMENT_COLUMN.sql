-- =====================================================
-- Add evidence_assessment column to criterion_assessments
-- =====================================================
-- This column stores the AI's assessment of which evidence
-- requirements were found, partially found, or missing

ALTER TABLE criterion_assessments
ADD COLUMN IF NOT EXISTS evidence_assessment jsonb DEFAULT '[]'::jsonb;

-- Add comment to document the column structure
COMMENT ON COLUMN criterion_assessments.evidence_assessment IS
'Array of EvidenceAssessmentItem objects:
[{
  "evidence_requirement_id": number,
  "status": "found" | "partial" | "missing",
  "found_indicators": string[],
  "missing_indicators": string[],
  "source_refs": [{ "doc": string, "page": number }]
}]';

-- Verification query
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'criterion_assessments'
  AND column_name = 'evidence_assessment';
