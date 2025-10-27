// lib/supabase.ts
// ============================================
// 🗄️ Supabase Client Configuration
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser (public operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (server-side only, bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database Types
export interface Pattern {
  id: string;
  task: string;
  architecture: any; // JSON
  rating: number;
  user_id?: string;
  upvotes: number;
  downloads: number;
  shared: boolean;
  usage_count: number;
  last_used: string;
  created_at: string;
  updated_at: string;
}

export interface Error {
  id: string;
  type: string;
  description: string;
  frequency: number;
  solution?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
}

export interface Strategy {
  id: string;
  name: string;
  description?: string;
  success_rate: number;
  applicable_to: string[];
  last_updated: string;
  created_at: string;
}

export interface UserStats {
  user_id: string;
  total_projects: number;
  average_score: number;
  patterns_shared: number;
  patterns_downloaded: number;
  improvement_rate: number;
  created_at: string;
  updated_at: string;
}
