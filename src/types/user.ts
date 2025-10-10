export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  monthly_tokens_used: number;
  monthly_tokens_limit: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserData {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
}


