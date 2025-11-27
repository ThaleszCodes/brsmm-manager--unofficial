import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const SUPABASE_URL = 'https://chbazlqioifvryilslun.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoYmF6bHFpb2lmdnJ5aWxzbHVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMDMwMjksImV4cCI6MjA3OTc3OTAyOX0.l_vjo0e1RwsgTP_B73P0c98fuY_Q7SppvneHQUVmrRA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);