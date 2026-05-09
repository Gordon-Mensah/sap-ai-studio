import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Typed database schema
export interface Database {
  public: {
    Tables: {
      pipelines: {
        Row: {
          id: string
          name: string
          description: string | null
          nodes: any[]
          edges: any[]
          tags: string[]
          run_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['pipelines']['Row'], 'created_at' | 'updated_at' | 'run_count'>
        Update: Partial<Database['public']['Tables']['pipelines']['Insert']>
      }
      pipeline_runs: {
        Row: {
          id: string
          pipeline_id: string
          pipeline_name: string
          input: string
          final_output: string
          results: any[]
          status: 'success' | 'error'
          total_duration: number
          step_count: number
          ran_at: string
        }
        Insert: Omit<Database['public']['Tables']['pipeline_runs']['Row'], 'ran_at'>
        Update: never
      }
    }
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-project-url' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key'
  )
}