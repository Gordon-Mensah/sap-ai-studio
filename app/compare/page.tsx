'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const MODELS = [
  { id: 'llama-3.3-70b-versatile', label: 'LLaMA 3.3 70B', badge: 'Best Quality', color: '#00D4AA' },
  { id: 'llama-3.1-8b-instant', label: 'LLaMA 3.1 8B', badge: 'Fastest', color: '#0070F3' },
  { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B', badge: 'Reasoning', color: '#A78BFA' },
  { id: 'qwen/qwen3-32b', label: 'Qwen 3 32B', badge: 'Efficient', color: '#10B981' },
]

const SAMPLE_PROMPTS = [
  'Summarise the key risks of investing in emerging markets in 3 bullet points.',
  'Write a professional email declining a meeting request due to a scheduling conflict.',
  'Explain what a REST API is to a non-technical business stakeholder.',
  'List 5 best practices for GDPR compliance in a SaaS company.',
  'What are the main differences between SQL and NoSQL databases?',
]

interface ModelResult {
  model: string
  label: string
  output: string
  duration: number
  status: 'idle' | 'running' | 'done' | 'error'
  tokenEstimate: number
}

export default function ComparePage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.')
  const [modelA, setModelA] = useState(MODELS[0].id)
  const [modelB, setModelB] = useState(MODELS[1].id)
  const [results, setResults] = useState<{ a: ModelResult | null; b: ModelResult | null }>({ a: null, b: null })
  const [isRunning, setIsRunning] = useState(false)

  const getModelMeta = (id: string) => MODELS.find(m => m.id === id) || MODELS[0]

  async function runComparison() {
    if (!prompt.trim()) return
    setIsRunning(true)
    setResults({ a: null, b: null })

    const runModel = async (modelId: string, side: 'a' | 'b') => {
      const meta = getModelMeta(modelId)
      const start = Date.now()
      try {
        const res = await fetch('/api/pipeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            steps: [{ id: '1', type: 'llm', name: 'LLM Call', config: { systemPrompt, model: modelId } }],
            input: prompt,
          }),
        })
        const data = await res.json()
        const duration = Date.now() - start
        const output = data.finalOutput || ''
        setResults(prev => ({
          ...prev,
          [side]: {
            model: modelId,
            label: meta.label,
            output,
            duration,
            status: 'done',
            tokenEstimate: Math.round(output.split(' ').length * 1.3),
          }
        }))
      } catch (err: any) {
        setResults(prev => ({
          ...prev,
          [side]: {
            model: modelId,
            label: meta.label,
            output: err.message,
            duration: Date.now() - start,
            status: 'error',
            tokenEstimate: 0,
          }
        }))
      }
    }

    await Promise.all([runModel(modelA, 'a'), runModel(modelB, 'b')])
    setIsRunning(false)
  }

  const metaA = getModelMeta(modelA)
  const metaB = getModelMeta(modelB)

  return (
    <div
      className="min-h-screen"
      style={{ background: '#080B14', fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {/* Header */}
      <div
        className="border-b px-8 py-4 flex items-center justify-between"
        style={{ borderColor: '#1A2333', background: '#090D1A' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #0070F3, #00D4AA)', color: '#fff' }}
          >
            ⬡
          </div>
          <span className="text-white text-sm font-semibold">SAP AI Orchestration Studio</span>
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{ background: '#A78BFA22', color: '#A78BFA', border: '1px solid #A78BFA33' }}
          >
            Model Comparison
          </span>
        </div>
        <button
          onClick={() => router.push('/')}
          className="text-xs px-4 py-2 rounded transition-all"
          style={{ background: '#0070F322', color: '#0070F3', border: '1px solid #0070F344' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#0070F333' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#0070F322' }}
        >
          ← Back to Studio
        </button>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">

        {/* Page Title */}
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: '#3A4A60' }}>
            Model Leaderboard
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
            Side-by-Side Model Comparison
          </h1>
          <p className="text-sm" style={{ color: '#3A5A70' }}>
            Run the same prompt against two models simultaneously. Inspired by SAP's Model Leaderboard in the Generative AI Hub.
          </p>
        </div>

        {/* Model Selector */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { side: 'A', value: modelA, setter: setModelA, meta: metaA },
            { side: 'B', value: modelB, setter: setModelB, meta: metaB },
          ].map(({ side, value, setter, meta }) => (
            <div
              key={side}
              className="rounded-xl p-4"
              style={{ background: '#090D1A', border: `1px solid ${meta.color}33` }}
            >
              <p className="text-xs mb-2" style={{ color: '#3A4A60' }}>
                Model {side}
              </p>
              <select
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded outline-none"
                style={{
                  background: '#0D1420',
                  color: meta.color,
                  border: `1px solid ${meta.color}44`,
                  fontFamily: "'IBM Plex Mono', monospace",
                  cursor: 'pointer',
                }}
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.label} — {m.badge}</option>
                ))}
              </select>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: meta.color }}
                />
                <span className="text-[10px]" style={{ color: meta.color }}>{meta.badge}</span>
              </div>
            </div>
          ))}
        </div>

        {/* System Prompt */}
        <div className="mb-4">
          <label className="text-[10px] uppercase tracking-widest mb-2 block" style={{ color: '#3A4A60' }}>
            System Prompt
          </label>
          <input
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full text-xs px-4 py-3 rounded-lg outline-none"
            style={{
              background: '#090D1A',
              color: '#7A9AB0',
              border: '1px solid #1A2333',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
            placeholder="System prompt applied to both models..."
          />
        </div>

        {/* Prompt Input */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] uppercase tracking-widest" style={{ color: '#3A4A60' }}>
              User Prompt
            </label>
            <div className="flex gap-2">
              {SAMPLE_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(p)}
                  className="text-[10px] px-2 py-1 rounded transition-all"
                  style={{ background: '#0D1420', color: '#3A5A70', border: '1px solid #1A2333' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#00D4AA'; e.currentTarget.style.borderColor = '#00D4AA44' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#3A5A70'; e.currentTarget.style.borderColor = '#1A2333' }}
                >
                  Sample {i + 1}
                </button>
              ))}
            </div>
          </div>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full text-xs px-4 py-3 rounded-lg outline-none resize-none"
            style={{
              background: '#090D1A',
              color: '#fff',
              border: '1px solid #1A2333',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
            placeholder="Enter a prompt to run against both models simultaneously..."
          />
        </div>

        {/* Run Button */}
        <button
          onClick={runComparison}
          disabled={!prompt.trim() || isRunning}
          className="w-full py-3 rounded-lg text-sm font-semibold mb-8 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #0070F3, #00D4AA)', color: '#fff', border: 'none' }}
        >
          {isRunning ? '⟳ Running comparison...' : '▶ Run Comparison'}
        </button>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { side: 'A', result: results.a, meta: metaA },
            { side: 'B', result: results.b, meta: metaB },
          ].map(({ side, result, meta }) => (
            <div
              key={side}
              className="rounded-xl overflow-hidden"
              style={{ background: '#090D1A', border: `1px solid ${result ? meta.color + '44' : '#1A2333'}` }}
            >
              {/* Result Header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: '#1A2333', background: meta.color + '08' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: result?.status === 'done' ? meta.color : result?.status === 'error' ? '#EF4444' : '#3A4A60' }}
                  />
                  <span className="text-xs font-semibold" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded"
                    style={{ background: meta.color + '22', color: meta.color, border: `1px solid ${meta.color}33` }}
                  >
                    {meta.badge}
                  </span>
                </div>
                {result?.status === 'done' && (
                  <div className="flex items-center gap-3">
                    <span className="text-[10px]" style={{ color: '#3A5A70' }}>
                      {result.duration}ms
                    </span>
                    <span className="text-[10px]" style={{ color: '#3A5A70' }}>
                      ~{result.tokenEstimate} tokens
                    </span>
                  </div>
                )}
              </div>

              {/* Result Body */}
              <div className="p-4 min-h-[300px]">
                {!result && !isRunning && (
                  <div className="flex items-center justify-center h-full min-h-[260px]">
                    <p className="text-xs" style={{ color: '#1E2B3C' }}>
                      Output will appear here
                    </p>
                  </div>
                )}
                {isRunning && !result && (
                  <div className="flex items-center justify-center h-full min-h-[260px]">
                    <div className="text-center">
                      <p className="text-xs animate-pulse" style={{ color: meta.color }}>
                        ● Generating...
                      </p>
                    </div>
                  </div>
                )}
                {result && (
                  <pre
                    className="text-xs whitespace-pre-wrap break-words leading-relaxed"
                    style={{
                      color: result.status === 'error' ? '#EF4444' : '#C0DDE8',
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {result.output}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Summary */}
        {results.a?.status === 'done' && results.b?.status === 'done' && (
          <div
            className="mt-6 rounded-xl p-5"
            style={{ background: '#090D1A', border: '1px solid #00D4AA33' }}
          >
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#00D4AA88' }}>
              Performance Summary
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#3A4A60' }}>Speed</p>
                <p className="text-sm font-semibold" style={{ color: results.a.duration < results.b.duration ? metaA.color : metaB.color }}>
                  {results.a.duration < results.b.duration ? metaA.label : metaB.label}
                </p>
                <p className="text-[10px]" style={{ color: '#3A5A70' }}>
                  {Math.min(results.a.duration, results.b.duration)}ms vs {Math.max(results.a.duration, results.b.duration)}ms
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#3A4A60' }}>Output Length</p>
                <p className="text-sm font-semibold" style={{ color: results.a.tokenEstimate > results.b.tokenEstimate ? metaA.color : metaB.color }}>
                  {results.a.tokenEstimate > results.b.tokenEstimate ? metaA.label : metaB.label}
                </p>
                <p className="text-[10px]" style={{ color: '#3A5A70' }}>
                  {results.a.tokenEstimate} vs {results.b.tokenEstimate} tokens
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#3A4A60' }}>Models Compared</p>
                <p className="text-sm font-semibold" style={{ color: '#00D4AA' }}>2 / {MODELS.length}</p>
                <p className="text-[10px]" style={{ color: '#3A5A70' }}>from model library</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t" style={{ borderColor: '#1A2333' }}>
          <p className="text-[11px] text-center" style={{ color: '#1E2B3C' }}>
            SAP AI Orchestration Studio — Model Comparison inspired by SAP Generative AI Hub Leaderboard
          </p>
        </div>
      </div>
    </div>
  )
}