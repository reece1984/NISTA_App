/**
 * Database Setup Script
 * Run this to create all tables and triggers
 * Usage: npm run db:setup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log('🔧 Setting up database schema...\n');

  try {
    // Read schema.sql file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await pool.query(schema);

    console.log('✅ Database schema created successfully!\n');
    console.log('Tables created:');
    console.log('  - action_plan_drafts');
    console.log('  - actions');
    console.log('  - action_assessments');
    console.log('  - action_history');
    console.log('  - action_comments');
    console.log('  - comment_mentions');
    console.log('\nTriggers created:');
    console.log('  - action_audit_trigger (automatic history logging)');
    console.log('  - update timestamps triggers');

    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE '%action%'
      ORDER BY table_name
    `);

    console.log('\n📊 Verified tables in database:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
