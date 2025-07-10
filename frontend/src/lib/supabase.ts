import { createClient } from '@supabase/supabase-js';

// 테스트를 위한 임시 기본값 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key';

// 임시로 환경 변수 체크 비활성화 (테스트용)
// if (!supabaseUrl || !supabaseKey) {
//   throw new Error('Missing Supabase environment variables');
// }

export const supabase = createClient(supabaseUrl, supabaseKey);

// 타입 정의
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      keywords: {
        Row: {
          id: string;
          user_id: string;
          keyword: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          keyword: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          keyword?: string;
          created_at?: string;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          status: 'draft' | 'published';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          status?: 'draft' | 'published';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          status?: 'draft' | 'published';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}; 