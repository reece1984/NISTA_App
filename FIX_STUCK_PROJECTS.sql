-- SQL to fix projects stuck in "processing" status
-- Run this in Supabase SQL Editor to fix existing stuck projects

-- This query updates any project that:
-- 1. Is currently in "processing" status
-- 2. Has all assessment criteria completed for the most recent assessment run

UPDATE projects
SET status = 'completed', updated_at = NOW()
WHERE status = 'processing'
  AND id IN (
    -- Only update projects that have completed assessments
    SELECT DISTINCT p.id
    FROM projects p
    WHERE p.status = 'processing'
      AND (
        -- Count of assessments for the most recent run
        SELECT COUNT(*)
        FROM assessments a
        INNER JOIN assessment_runs ar ON a.assessment_run_id = ar.id
        WHERE a.project_id = p.id
          AND ar.id = (
            SELECT id FROM assessment_runs
            WHERE project_id = p.id
            ORDER BY created_at DESC
            LIMIT 1
          )
      ) >= (
        -- Total number of criteria for this project's template
        SELECT COUNT(*)
        FROM assessment_criteria
        WHERE template_id = p.template_id
      )
  );

-- To see which projects will be affected before running the UPDATE, use this query:
/*
SELECT
  p.id,
  p.project_name,
  p.status,
  p.template_id,
  (SELECT COUNT(*) FROM assessments a
   INNER JOIN assessment_runs ar ON a.assessment_run_id = ar.id
   WHERE a.project_id = p.id
     AND ar.id = (SELECT id FROM assessment_runs WHERE project_id = p.id ORDER BY created_at DESC LIMIT 1)
  ) as completed_assessments,
  (SELECT COUNT(*) FROM assessment_criteria WHERE template_id = p.template_id) as total_criteria
FROM projects p
WHERE p.status = 'processing';
*/
