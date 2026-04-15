import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Duo = {
  id: string
  name: string
  image_url: string
  vote_count: number
  created_at: string
}

export type Vote = {
  id: string
  duo_id: string
  voter_token: string
  created_at: string
}
