-- Comprehensive schema check for action plan system

-- 1. List all action-related tables
SELECT 'Existing Tables:' as check_type, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND (
    table_name LIKE '%action%' 
    OR table_name IN ('users', 'assessments', 'assessment_runs', 'projects')
  )
ORDER BY table_name;

-- 2. Show structure of critical tables
\echo '\n=== action_plan_drafts schema ==='
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'action_plan_drafts'
ORDER BY ordinal_position;

\echo '\n=== actions schema ==='
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'actions'
ORDER BY ordinal_position;
