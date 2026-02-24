/**
 * [Infrastructure Layer]
 * Supabase 클라이언트 싱글톤 인스턴스
 * 환경변수 기반으로 초기화합니다.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
