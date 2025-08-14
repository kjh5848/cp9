import { createClient } from '@supabase/supabase-js';

let serverClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseServer() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase server env missing (SUPABASE_URL / *_KEY)');
  }

  if (!serverClient) {
    serverClient = createClient(url, key, {
      // 서버에서만 필요한 옵션을 넣고 싶다면 여기
    });
  }
  return serverClient;
}
