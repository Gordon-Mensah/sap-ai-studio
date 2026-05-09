import { NextResponse } from 'next/server'
import { executePipeline, PipelineStep } from '@/lib/pipeline-engine'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })

    const { steps, input, groqApiKey } = body

    // Key resolution: user-supplied key takes priority, then env var (for Vercel deploy)
    const apiKey = groqApiKey || process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'No Groq API key found. Add your key via the ⬡ key button in the toolbar.' },
        { status: 503 }
      )
    }

    if (!steps || !Array.isArray(steps) || steps.length === 0)
      return NextResponse.json({ success: false, error: 'steps must be a non-empty array' }, { status: 400 })
    if (!input || typeof input !== 'string' || !input.trim())
      return NextResponse.json({ success: false, error: 'input must be a non-empty string' }, { status: 400 })
    if (steps.length > 20)
      return NextResponse.json({ success: false, error: 'Pipeline cannot exceed 20 steps' }, { status: 400 })
    if (input.length > 10000)
      return NextResponse.json({ success: false, error: 'Input exceeds 10,000 character limit' }, { status: 400 })

    const results = await executePipeline(steps as PipelineStep[], input, apiKey)
    const finalOutput = results[results.length - 1]?.output || ''
    const success = results.every(r => r.status === 'success')

    return NextResponse.json({ success, results, finalOutput, status: success ? 'success' : 'error' })

  } catch (error: any) {
    console.error('[pipeline/route]', error)
    return NextResponse.json({ success: false, error: error?.message || 'Internal server error' }, { status: 500 })
  }
}