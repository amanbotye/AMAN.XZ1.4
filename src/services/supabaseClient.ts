import { createClient } from '@supabase/supabase-js';

// Safe environment fallback or local demo storage
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'demo-anon-key-placeholder';

export const isLiveSupabaseConfigured = () => {
  return (
    Boolean((import.meta as any).env?.VITE_SUPABASE_URL) &&
    Boolean((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) &&
    !(import.meta as any).env?.VITE_SUPABASE_URL.includes('demo.supabase')
  );
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
