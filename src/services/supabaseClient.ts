import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://pvgmtufzvwkdvtbtcijn.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2Z210dWZ6dndrZHZ0YnRjaWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NDgwMTYsImV4cCI6MjEwNjAyNDAxNn0.Pbn4vm5Zk2evWEhzEiV5buq4g9yLbu8t1orziq5UDeo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});
