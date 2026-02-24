'use client';

import { createClient } from '@supabase/supabase-js';

let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // dev에서만 메시지 자세히
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Supabase] NEXT_PUBLIC_ 변수 누락');
    }
    throw new Error('Supabase NEXT_PUBLIC env missing in browser bundle');
  }

  if (!browserClient) {
    browserClient = createClient(url, key);
  }
  return browserClient;
}
