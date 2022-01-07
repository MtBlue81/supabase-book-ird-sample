import { createClient } from '@supabase/supabase-js';


const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL or env.NEXT_PUBLIC_SUPABASE_KEY');
}

export const client = createClient(SUPABASE_URL, SUPABASE_KEY);
