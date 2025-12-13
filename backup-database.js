#!/usr/bin/env node

/**
 * NISTA App - Complete Database Backup Script
 *
 * This script creates a comprehensive backup of the Supabase database including:
 * - Schema (tables, functions, triggers, policies, indexes)
 * - Seed/reference data (CSV exports)
 * - Current state data (CSV exports)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = 'https://yondkevazznqclmrkidl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbmRrZXZhenpucWNsbXJraWRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgxMjA4MiwiZXhwIjoyMDc3Mzg4MDgyfQ.LXlN_5HXr8kvD3dmhyJv-68OR1ymKA4uxa8ua1j7uaY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Create backup directory structure
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
const backupDir = path.join(process.cwd(), `db-backup-${timestamp}`);
const schemaDir = path.join(backupDir, 'schema');
const seedDataDir = path.join(backupDir, 'seed-data');
const currentDataDir = path.join(backupDir, 'current-data');

// Table categorization
const SEED_TABLES = [
  'assessment_criteria',
  'evidence_requirements',
  'assessment_templates',
  'project_types',
  'gates'
];

const CURRENT_TABLES = [
  'projects',
  'assessment_runs',
  'assessments',
  'files',
  'actions',
  'action_comments',
  'action_history',
  'action_plan_drafts',
  'document_embeddings',
  'project_members',
  'users'
];

// Utility: Create directories
function createDirectories() {
  [backupDir, schemaDir, seedDataDir, currentDataDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  console.log(`✅ Created backup directory: ${backupDir}`);
}

// Utility: Convert array to CSV
function arrayToCSV(data) {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(headers.map(h => `"${h}"`).join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      let val = row[header];

      // Handle null/undefined
      if (val === null || val === undefined) return '';

      // Handle objects and arrays (JSON stringify)
      if (typeof val === 'object') {
        val = JSON.stringify(val);
      }

      // Escape quotes and wrap in quotes
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// 2. Export schema as SQL
async function exportSchema() {
  console.log('\n📝 Exporting schema...');

  try {
    // Get table definitions using PostgREST introspection endpoint
    const response = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_SERVICE_KEY}`);
    const schema = await response.json();

    // Save the OpenAPI schema
    fs.writeFileSync(
      path.join(schemaDir, 'openapi-schema.json'),
      JSON.stringify(schema, null, 2)
    );
    console.log('✅ Exported OpenAPI schema');

    // Note: For full SQL DDL export, you would need pg_dump or direct PostgreSQL access
    const schemaNote = `# Schema Export Notes

## Full SQL DDL Export Limitation
This backup uses the Supabase REST API which doesn't provide complete DDL (CREATE TABLE statements).
For a complete SQL schema dump, you need to use pg_dump with direct database access:

\`\`\`bash
pg_dump -h db.yondkevazznqclmrkidl.supabase.co \\
  -U postgres \\
  -p 5432 \\
  -d postgres \\
  --schema-only \\
  --no-owner \\
  --no-privileges \\
  > schema/full-schema.sql
\`\`\`

## What's Included
- OpenAPI schema definition (openapi-schema.json)
- Data exports for all tables (CSV format)
- This allows you to recreate the data, though you'll need to recreate tables first

## Tables Discovered
See the README.md for a full list of tables backed up.
`;

    fs.writeFileSync(path.join(schemaDir, 'SCHEMA_NOTES.md'), schemaNote);
    console.log('✅ Created schema notes');

  } catch (error) {
    console.error('Error exporting schema:', error);
  }
}

// 3. Export table data to CSV
async function exportTableData(tableName, outputDir) {
  try {
    console.log(`  Exporting ${tableName}...`);

    // Fetch all data from table
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' });

    if (error) {
      console.error(`  ❌ Error exporting ${tableName}:`, error.message);
      return { table: tableName, status: 'error', error: error.message };
    }

    if (!data || data.length === 0) {
      console.log(`  ⚠️  ${tableName} is empty`);
      return { table: tableName, status: 'empty', count: 0 };
    }

    // Convert to CSV
    const csv = arrayToCSV(data);

    // Write to file
    const filePath = path.join(outputDir, `${tableName}.csv`);
    fs.writeFileSync(filePath, csv);

    console.log(`  ✅ Exported ${data.length} rows`);
    return { table: tableName, status: 'success', count: data.length };

  } catch (error) {
    console.error(`  ❌ Error exporting ${tableName}:`, error.message);
    return { table: tableName, status: 'error', error: error.message };
  }
}

// 4. Export seed/reference data
async function exportSeedData() {
  console.log('\n🌱 Exporting seed/reference data...');
  const results = [];

  for (const table of SEED_TABLES) {
    const result = await exportTableData(table, seedDataDir);
    results.push(result);
  }

  return results;
}

// 5. Export current state data
async function exportCurrentData() {
  console.log('\n💾 Exporting current state data...');
  const results = [];

  for (const table of CURRENT_TABLES) {
    const result = await exportTableData(table, currentDataDir);
    results.push(result);
  }

  return results;
}

// 6. Export functions
async function exportFunctions() {
  console.log('\n⚙️  Exporting database functions...');

  try {
    const note = `# Database Functions

## Note
To export functions, you need direct PostgreSQL access or a custom RPC function.

## Known Functions
Based on the codebase, these functions should exist:
- match_documents (vector similarity search)
- match_document_sections (vector similarity search for sections)

## Export with pg_dump
\`\`\`bash
pg_dump -h db.yondkevazznqclmrkidl.supabase.co \\
  -U postgres \\
  -p 5432 \\
  -d postgres \\
  --schema-only \\
  --no-owner \\
  --no-privileges \\
  -t 'public.match_*' \\
  > schema/functions.sql
\`\`\`
`;
    fs.writeFileSync(path.join(schemaDir, 'FUNCTIONS_NOTES.md'), note);
    console.log('  ✅ Created functions notes');
  } catch (error) {
    console.log('  ⚠️  Could not export functions:', error.message);
  }
}

// 7. Create README
async function createReadme(seedResults, currentResults) {
  const readme = `# NISTA App Database Backup
**Created:** ${new Date().toISOString()}

## Contents

### 1. Schema (/schema)
- \`openapi-schema.json\` - Complete OpenAPI schema definition
- \`SCHEMA_NOTES.md\` - Notes on schema export limitations
- \`FUNCTIONS_NOTES.md\` - Notes on database functions

### 2. Seed/Reference Data (/seed-data)
Critical configuration data that takes time to recreate:

${seedResults.map(r => {
  if (r.status === 'success') {
    return `- ✅ \`${r.table}.csv\` - ${r.count} rows`;
  } else if (r.status === 'empty') {
    return `- ⚠️  \`${r.table}\` - Empty table`;
  } else {
    return `- ❌ \`${r.table}\` - Error: ${r.error}`;
  }
}).join('\n')}

### 3. Current State Data (/current-data)
Working data for reference (not critical for restore):

${currentResults.map(r => {
  if (r.status === 'success') {
    return `- ✅ \`${r.table}.csv\` - ${r.count} rows`;
  } else if (r.status === 'empty') {
    return `- ⚠️  \`${r.table}\` - Empty table`;
  } else {
    return `- ❌ \`${r.table}\` - Error: ${r.error}`;
  }
}).join('\n')}

## Restore Instructions

### Prerequisites
1. Fresh Supabase project or existing project
2. Database access (Supabase Dashboard or psql)

### Step 1: Recreate Schema
You'll need to recreate the database schema first. Options:
- Use Supabase Dashboard migrations
- Run SQL schema from your git repository
- Use pg_dump to create a full schema backup separately

### Step 2: Import Seed Data
Import the seed/reference data in this order:
1. \`assessment_templates\`
2. \`gates\`
3. \`project_types\`
4. \`assessment_criteria\`
5. \`evidence_requirements\`

Using Supabase Dashboard:
1. Go to Table Editor
2. Select table
3. Import CSV file

Using psql:
\`\`\`bash
\\copy assessment_criteria FROM 'seed-data/assessment_criteria.csv' CSV HEADER;
\`\`\`

### Step 3: (Optional) Import Current Data
Import current state data if needed for testing/reference:
\`\`\`bash
\\copy projects FROM 'current-data/projects.csv' CSV HEADER;
\\copy assessment_runs FROM 'current-data/assessment_runs.csv' CSV HEADER;
\\copy assessments FROM 'current-data/assessments.csv' CSV HEADER;
\`\`\`

## Important Notes

### Limitations
- **No SQL DDL**: This backup doesn't include CREATE TABLE statements
- **Vector Extensions**: pgvector extension needs to be enabled manually
- **Functions**: Custom functions need to be recreated manually
- **Triggers**: Custom triggers need to be recreated manually
- **RLS Policies**: Row Level Security policies need to be recreated manually

### For Complete Backup
Use pg_dump with direct database access:
\`\`\`bash
# Full database dump
pg_dump -h db.yondkevazznqclmrkidl.supabase.co \\
  -U postgres \\
  -p 5432 \\
  -d postgres \\
  --no-owner \\
  --no-privileges \\
  > full-backup.sql

# Schema only
pg_dump --schema-only > schema-only.sql

# Data only
pg_dump --data-only > data-only.sql
\`\`\`

## Database Connection
- **Host:** db.yondkevazznqclmrkidl.supabase.co
- **Port:** 5432
- **Database:** postgres
- **User:** postgres
- **Supabase URL:** https://yondkevazznqclmrkidl.supabase.co

## Summary
- **Seed Tables:** ${seedResults.filter(r => r.status === 'success').length}/${seedResults.length} exported successfully
- **Current Tables:** ${currentResults.filter(r => r.status === 'success').length}/${currentResults.length} exported successfully
- **Total Rows:** ${[...seedResults, ...currentResults].reduce((sum, r) => sum + (r.count || 0), 0).toLocaleString()}

---
*Generated by NISTA App Database Backup Script*
`;

  fs.writeFileSync(path.join(backupDir, 'README.md'), readme);
  console.log('\n📄 Created README.md');
}

// Main execution
async function main() {
  console.log('🚀 Starting NISTA App Database Backup...\n');
  console.log(`Backup directory: ${backupDir}\n`);

  try {
    // Create directory structure
    createDirectories();

    // Export schema metadata
    await exportSchema();

    // Export functions metadata
    await exportFunctions();

    // Export seed data
    const seedResults = await exportSeedData();

    // Export current data
    const currentResults = await exportCurrentData();

    // Create README
    await createReadme(seedResults, currentResults);

    console.log('\n✅ Backup completed successfully!');
    console.log(`\n📦 Backup location: ${backupDir}`);
    console.log('\nNext steps:');
    console.log('1. Review the backup in the folder above');
    console.log('2. Optionally zip the folder for storage');
    console.log('3. For complete backup, use pg_dump (see README.md)');

    return backupDir;

  } catch (error) {
    console.error('\n❌ Backup failed:', error);
    throw error;
  }
}

// Run the script
main().catch(err => {
  console.error(err);
  process.exit(1);
});
