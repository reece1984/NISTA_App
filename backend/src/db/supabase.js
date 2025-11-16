/**
 * Supabase Client Configuration
 * Uses Supabase REST API for database operations (works with Vercel serverless)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY_NEW || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('⚠️  Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY');
}

// Create Supabase client with service role key (bypasses RLS for backend operations)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test connection on startup (non-blocking)
supabase
  .from('actions')
  .select('count', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      console.error('⚠️  Initial Supabase connection test failed:', error.message);
      console.error('⚠️  Server will continue running. Database connections will be attempted per-request.');
    } else {
      console.log('✅ Supabase client connected successfully');
    }
  });

export default supabase;
