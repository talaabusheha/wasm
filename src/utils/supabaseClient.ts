import { createClient, SupabaseClient } from '@supabase/supabase-js';

const CONFIG_STORAGE_KEY = 'wasm_supabase_config_v1';

// Default project credentials for WASM
const DEFAULT_SUPABASE_URL = 'https://lcmnabegxmedfunleurr.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_8gUEdTSe7miOKQU0CiikjA_QeG_2J5t';

let cachedClient: SupabaseClient | null = null;
let lastUsedConfig = '';

export function getSupabaseConfig(): { url: string; key: string } {
  // 1. Check local storage if user configured custom credentials through Admin UI
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.key) {
        return { url: parsed.url.trim(), key: parsed.key.trim() };
      }
    }
  } catch (e) {
    console.error('Failed to load Supabase config from localStorage', e);
  }

  // 2. Check environment variables
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envUrl && envKey) {
    return { url: envUrl, key: envKey };
  }

  // 3. Fallback to default connected Supabase project
  return {
    url: DEFAULT_SUPABASE_URL,
    key: DEFAULT_SUPABASE_KEY,
  };
}

export function saveSupabaseConfig(url: string, key: string): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({ url: url.trim(), key: key.trim() }));
    cachedClient = null; // Invalidate client cache
  } catch (e) {
    console.error('Failed to save Supabase config to localStorage', e);
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key);
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  const currentConfigKey = `${url}:${key}`;
  if (cachedClient && lastUsedConfig === currentConfigKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key);
    lastUsedConfig = currentConfigKey;
    return cachedClient;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return null;
  }
}
