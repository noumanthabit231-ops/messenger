import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ptwwnnyyfzgrnihyrjsw.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0d3dubnl5Znpncm5paHlyanN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODI1ODcsImV4cCI6MjA5NDg1ODU4N30.gjNBp9SaJRIAq0SKbb91XaMDSBav0TyG2e7bS_X-NjM';

export const isSupabaseConfigured = 
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY && 
  import.meta.env.VITE_SUPABASE_URL !== 'YOUR_SUPABASE_URL';

export const supabase = createClient(supabaseUrl, supabaseKey);
