'use client'

import { useState } from 'react'

interface RunPanelProps {
  isRunning: boolean
  results: any
  onRun: (input: string) => void
  onClose: () => void
  stepCount: number
}

const TYPE_META: Record<string, { color: string; icon: string }> = {
  template:      { color: '#0070F3', icon: '[ ]' },
  llm:           { color: '#00D4AA', icon: '◈' },
  grounding:     { color: '#A78BFA', icon: '⊕' },
  masking:       { color: '#F59E0B', icon: '◫' },
  filter:        { color: '#EF4444', icon: '⊘' },
  translation:   { color: '#10B981', icon: '⇄' },
  summariser:    { color: '#F97316', icon: '≡' },
  sentiment:     { color: '#EC4899', icon: '◉' },
  'json-parser': { color: '#8B5CF6', icon: '{ }' },
}

function MetadataBadge({ type, metadata }: { type: string; metadata?: Record<string, any> }) {
  if (!metadata) return null
  if (type === 'summariser' && metadata.reductionPercent !== undefined)
    return <span className="text-[9px] px-1.5 py-0.5 rounded ml-1" style={{ background: '#F9731622', color: '#F97316', border: '1px solid #F9731633' }}>{metadata.reductionPercent}% reduction</span>
  if (type === 'sentiment' && metadata.sentiment) {
    const c = metadata.sentiment === 'positive' ? '#10B981' : metadata.sentiment === 'negative' ? '#EF4444' : '#F59E0B'
    return <span className="text-[9px] px-1.5 py-0.5 rounded ml-1" style={{ background: c + '22', color: c, border: `1px solid ${c}33` }}>{metadata.sentiment}</span>
  }
  if (type === 'json-parser')
    return <span className="text-[9px] px-1.5 py-0.5 rounded ml-1" style={{ background: metadata.valid ? '#8B5CF622' : '#EF444422', color: metadata.valid ? '#8B5CF6' : '#EF4444', border: `1px solid ${metadata.valid ? '#8B5CF633' : '#EF444433'}` }}>{metadata.valid ? `${metadata.keyCount} fields` : 'parse err'}</span>
  return null
}

export function RunPanel({ isRunning, results, onRun, onClose, stepCount }: RunPanelProps) {
  const [input, setInput] = useState('')
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  const handleRun = () => {
    if (!input.trim() || stepCount === 0) return
    onRun(input.trim())
  }

  return (
    <div
      className="border-t flex flex-col"
      style={{
        background: '#090D1A',
        borderColor: '#1A2333',
        fontFamily: "'IBM Plex Mono', monospace",
        height: results ? '380px' : '180px',
        transition: 'height 0.3s ease',
        minHeight: '180px',
      }}
    >
      {/* Panel Header */}
      <div
        className="flex items-center justify-between px-5 py-2 border-b"
        style={{ borderColor: '#1A2333' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs tracking-widest uppercase" style={{ color: '#3A4A60' }}>
            Pipeline Runner
          </span>
          {isRunning && (
            <span className="text-xs flex items-center gap-1" style={{ color: '#00D4AA' }}>
              <span className="animate-pulse">●</span> Executing…
            </span>
          )}
          {results && !isRunning && (
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                background: results.success ? '#00D4AA22' : '#EF444422',
                color: results.success ? '#00D4AA' : '#EF4444',
                border: `1px solid ${results.success ? '#00D4AA44' : '#EF444444'}`,
              }}
            >
              {results.success ? `✓ ${results.results?.length || 0} steps completed` : '✗ Error'}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-xs"
          style={{ color: '#3A4A60' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#3A4A60')}
        >
          ✕ close
        </button>
      </div>

      {/* Input row */}
      <div className="flex items-stretch gap-3 px-5 py-3 border-b" style={{ borderColor: '#1A2333' }}>
        <input
          className="flex-1 bg-[#0D1420] text-white text-xs px-3 py-2 rounded outline-none border border-[#1A2333]"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          placeholder={
            stepCount === 0
              ? 'Add nodes to the canvas first…'
              : 'Enter pipeline input text…'
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={stepCount === 0 || isRunning}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRun() } }}
        />
        <button
          onClick={handleRun}
          disabled={!input.trim() || stepCount === 0 || isRunning}
          className="px-5 py-2 rounded text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #0070F3, #00D4AA)', color: '#fff', border: 'none' }}
        >
          {isRunning ? '…' : '▶ Execute'}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {results.success ? (
            <>
              {/* Step-by-step trace */}
              <div className="flex flex-col gap-2">
                {results.results?.map((step: any, i: number) => {
                  const meta = TYPE_META[step.type] || { color: '#666', icon: '?' }
                  const isExpanded = expandedStep === step.stepId
                  return (
                    <div
                      key={step.stepId}
                      className="rounded overflow-hidden"
                      style={{ border: `1px solid ${meta.color}33`, background: meta.color + '08' }}
                    >
                      <button
                        className="w-full flex items-center justify-between px-3 py-2 text-left"
                        onClick={() => setExpandedStep(isExpanded ? null : step.stepId)}
                      >
                        <div className="flex items-center gap-2">
                          <span style={{ color: meta.color, fontSize: '11px' }}>{meta.icon}</span>
                          <span className="text-xs font-semibold text-white">
                            Step {i + 1}: {step.stepName}
                          </span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{
                              background: step.status === 'success' ? '#00D4AA22' : '#EF444422',
                              color: step.status === 'success' ? '#00D4AA' : '#EF4444',
                            }}
                          >
                            {step.status}
                          </span>
                          <MetadataBadge type={step.type} metadata={step.metadata} />
                        </div>
                        <div className="flex items-center gap-3">
                          <span style={{ color: '#2A3A50', fontSize: '10px' }}>{step.duration}ms</span>
                          <span style={{ color: '#3A4A60', fontSize: '10px' }}>{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div
                          className="px-3 pb-3 border-t text-[11px] space-y-2"
                          style={{ borderColor: meta.color + '22', color: '#5A7A90' }}
                        >
                          <div className="mt-2">
                            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#2A3A50' }}>
                              Input
                            </p>
                            <pre
                              className="rounded p-2 whitespace-pre-wrap break-words"
                              style={{ background: '#0D1420', color: '#5A7A90', fontSize: '10px', maxHeight: '80px', overflowY: 'auto' }}
                            >
                              {step.input}
                            </pre>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#2A3A50' }}>
                              Output
                            </p>
                            <pre
                              className="rounded p-2 whitespace-pre-wrap break-words"
                              style={{ background: '#0D1420', color: '#8AAAC0', fontSize: '10px', maxHeight: '100px', overflowY: 'auto' }}
                            >
                              {step.output}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Final output */}
              {results.finalOutput && (
                <div
                  className="rounded p-3"
                  style={{ background: '#00D4AA08', border: '1px solid #00D4AA33' }}
                >
                  <p
                    className="text-[10px] uppercase tracking-widest mb-2"
                    style={{ color: '#00D4AA88' }}
                  >
                    Final Pipeline Output
                  </p>
                  <pre
                    className="text-xs whitespace-pre-wrap break-words"
                    style={{ color: '#C0DDE8', fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {results.finalOutput}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div
              className="rounded p-3"
              style={{ background: '#EF444408', border: '1px solid #EF444433' }}
            >
              <p className="text-xs" style={{ color: '#EF4444' }}>
                ✗ {results.error || 'Unknown error'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}