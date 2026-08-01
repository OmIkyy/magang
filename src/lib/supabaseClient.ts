import { createClient } from '@supabase/supabase-js';

// Get Supabase URL & Key from Environment Variables (e.g. Vercel) or LocalStorage
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const getSupabaseCredentials = () => {
  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey, isEnv: true };
  }

  try {
    const local = localStorage.getItem('jurnal_magang_supabase_v1');
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url, anonKey: parsed.anonKey, isEnv: false };
      }
    }
  } catch {
    // ignore
  }

  return { url: '', anonKey: '', isEnv: false };
};

const credentials = getSupabaseCredentials();

export const supabase = credentials.url && credentials.anonKey
  ? createClient(credentials.url, credentials.anonKey)
  : null;
