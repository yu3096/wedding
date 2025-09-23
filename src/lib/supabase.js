import { createClient } from "@supabase/supabase-js";

// 공개 사용 가능한 anon 키 (RLS에 의해 안전)
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);