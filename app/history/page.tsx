'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAllPipelines, getAllRuns, deletePipeline, deleteRun, getStats, SavedPipeline, PipelineRun } from '@/lib/storage'

const TYPE_COLORS: Record<string, string> = {
  template: '#0070F3', llm: '#00D4AA', grounding: '#A78BFA',
  masking: '#F59E0B', filter: '#EF4444', translation: '#10B981',
  summariser: '#F97316', sentiment: '#EC4899', 'json-parser': '#8B5CF6',
}

export default function HistoryPage() {
  const router = useRouter()
  const [pipelines, setPipelines] = useState<SavedPipeline[]>([])
  const [runs, setRuns] = useState<PipelineRun[]>([])
  const [stats, setStats] = useState({ totalPipelines: 0, totalRuns: 0, successRate: 0, avgDurationMs: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pipelines' | 'runs'>('pipelines')
  const [expandedRun, setExpandedRun] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [pl, ru, st] = await Promise.all([getAllPipelines(), getAllRuns(), getStats()])
    setPipelines(pl)
    setRuns(ru)
    setStats(st)
    setLoading(false)
  }

  function loadPipeline(pipeline: SavedPipeline) {
    localStorage.setItem('loadPipeline', JSON.stringify(pipeline))
    router.push('/')
  }

  async function handleDeletePipeline(id: string) {
    await deletePipeline(id)
    setPipelines(prev => prev.filter(p => p.id !== id))
    setRuns(prev => prev.filter(r => r.pipelineId !== id))
    setDeleteConfirm(null)
  }

  async function handleDeleteRun(id: string) {
    await deleteRun(id)
    setRuns(prev => prev.filter(r => r.id !== id))
  }

  const mono = { fontFamily: "'IBM Plex Mono', monospace" }

  return (
    <div className="min-h-screen" style={{ background: '#080B14', ...mono }}>
      {/* Header */}
      <div className="border-b px-8 py-4 flex items-center justify-between"
        style={{ borderColor: '#1A2333', background: '#090D1A' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #0070F3, #00D4AA)', color: '#fff' }}>⬡</div>
          <span className="text-white text-sm font-semibold">SAP AI Orchestration Studio</span>
          <span className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: '#F59E0B22', color: '#F59E0B', border: '1px solid #F59E0B33' }}>
            History
          </span>
        </div>
        <button onClick={() => router.push('/')}
          className="text-xs px-4 py-2 rounded transition-all"
          style={{ background: '#0070F322', color: '#0070F3', border: '1px solid #0070F344' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#0070F333' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#0070F322' }}>
          ← Back to Studio
        </button>
      </div>

      <div className="px-8 py-8 max-w-6xl mx-auto">
        {/* Title */}
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: '#3A4A60' }}>Dashboard</p>
          <h1 className="text-2xl font-bold text-white mb-1">Pipeline Library & Run History</h1>
          <p className="text-sm" style={{ color: '#3A5A70' }}>
            All your saved pipelines and execution logs. Stored locally, synced to Supabase when configured.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Saved Pipelines', value: stats.totalPipelines, color: '#0070F3', icon: '⬡' },
            { label: 'Total Runs',      value: stats.totalRuns,      color: '#00D4AA', icon: '▶' },
            { label: 'Success Rate',    value: `${stats.successRate}%`, color: '#10B981', icon: '✓' },
            { label: 'Avg Duration',    value: stats.avgDurationMs > 0 ? `${(stats.avgDurationMs / 1000).toFixed(1)}s` : '—', color: '#F59E0B', icon: '◷' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl p-4"
              style={{ background: '#090D1A', border: `1px solid ${stat.color}22` }}>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: stat.color, fontSize: '12px' }}>{stat.icon}</span>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: '#3A4A60' }}>{stat.label}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>
                {loading ? '…' : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 mb-6 border-b" style={{ borderColor: '#1A2333' }}>
          {(['pipelines', 'runs'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="text-xs px-5 py-3 transition-colors"
              style={{
                color: activeTab === tab ? '#00D4AA' : '#3A4A60',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${activeTab === tab ? '#00D4AA' : 'transparent'}`,
              }}>
              {tab === 'pipelines'
                ? `⬡  Saved Pipelines (${pipelines.length})`
                : `▶  Run History (${runs.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20" style={{ color: '#3A4A60' }}>
            <p className="text-xs animate-pulse">Loading…</p>
          </div>

        ) : activeTab === 'pipelines' ? (
          pipelines.length === 0 ? (
            <div className="text-center py-20" style={{ color: '#2A3A50' }}>
              <p className="text-4xl mb-4 opacity-20">⬡</p>
              <p className="text-sm mb-4">No saved pipelines yet.</p>
              <button onClick={() => router.push('/')}
                className="text-xs px-4 py-2 rounded"
                style={{ background: '#0070F322', color: '#0070F3', border: '1px solid #0070F344' }}>
                Build your first pipeline →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pipelines.map(pipeline => (
                <div key={pipeline.id} className="rounded-xl p-5 flex flex-col gap-3 group"
                  style={{ background: '#090D1A', border: '1px solid #1A2333', transition: 'border-color 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0070F344' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1A2333' }}>

                  {/* Name + run count */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-sm font-semibold leading-tight">{pipeline.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: '#00D4AA22', color: '#00D4AA', border: '1px solid #00D4AA33' }}>
                      {pipeline.runCount || 0} runs
                    </span>
                  </div>

                  {pipeline.description && (
                    <p className="text-xs leading-relaxed" style={{ color: '#3A5A70' }}>{pipeline.description}</p>
                  )}

                  {/* Tags */}
                  {pipeline.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {pipeline.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded"
                          style={{ background: '#1A2333', color: '#3A5A70', border: '1px solid #1E2B3C' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Node type flow */}
                  {pipeline.nodes?.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {pipeline.nodes.map((node: any, i: number) => {
                        const c = TYPE_COLORS[node.data?.type] || '#666'
                        return (
                          <div key={node.id} className="flex items-center gap-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded"
                              style={{ background: c + '18', color: c, border: `1px solid ${c}33` }}>
                              {node.data?.type}
                            </span>
                            {i < pipeline.nodes.length - 1 && (
                              <span style={{ color: '#1A2333', fontSize: '10px' }}>→</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Dates */}
                  <p className="text-[10px]" style={{ color: '#2A3A50' }}>
                    Updated {new Date(pipeline.updatedAt).toLocaleDateString()} · {pipeline.nodes?.length || 0} nodes
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-3 border-t" style={{ borderColor: '#1A2333' }}>
                    <button onClick={() => loadPipeline(pipeline)}
                      className="flex-1 py-1.5 rounded text-xs font-semibold transition-all"
                      style={{ background: '#0070F322', color: '#0070F3', border: '1px solid #0070F344' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#0070F333' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#0070F322' }}>
                      ↗ Open in Studio
                    </button>
                    {deleteConfirm === pipeline.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDeletePipeline(pipeline.id)}
                          className="px-2 py-1 rounded text-xs"
                          style={{ background: '#EF444422', color: '#EF4444', border: '1px solid #EF444444' }}>
                          Confirm
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 rounded text-xs"
                          style={{ background: 'transparent', color: '#3A4A60', border: '1px solid #1A2333' }}>
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(pipeline.id)}
                        className="px-3 py-1.5 rounded text-xs transition-all opacity-0 group-hover:opacity-100"
                        style={{ background: 'transparent', color: '#3A4A60', border: '1px solid #1A2333' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = '#EF444444' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#3A4A60'; e.currentTarget.style.borderColor = '#1A2333' }}>
                        del
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )

        ) : (
          // ── Run History tab ────────────────────────────────────────────
          runs.length === 0 ? (
            <div className="text-center py-20" style={{ color: '#2A3A50' }}>
              <p className="text-4xl mb-4 opacity-20">▶</p>
              <p className="text-sm">No runs recorded yet. Execute a pipeline to see logs here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {runs.map(run => {
                const isOpen = expandedRun === run.id
                return (
                  <div key={run.id} className="rounded-xl overflow-hidden group"
                    style={{ background: '#090D1A', border: `1px solid ${run.status === 'success' ? '#00D4AA22' : '#EF444422'}` }}>
                    <button className="w-full flex items-center justify-between px-5 py-3 text-left"
                      onClick={() => setExpandedRun(isOpen ? null : run.id)}>
                      <div className="flex items-center gap-3">
                        <span style={{ color: run.status === 'success' ? '#00D4AA' : '#EF4444', fontSize: '10px' }}>
                          {run.status === 'success' ? '✓' : '✗'}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-white">{run.pipelineName}</p>
                          <p className="text-[10px] mt-0.5 truncate max-w-xs" style={{ color: '#3A5A70' }}>
                            {run.input}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[10px]" style={{ color: '#3A4A60' }}>
                        <span>{run.stepCount} steps</span>
                        <span>{run.totalDuration ? `${(run.totalDuration / 1000).toFixed(1)}s` : '—'}</span>
                        <span>
                          {new Date(run.ranAt).toLocaleDateString()} {new Date(run.ranAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteRun(run.id) }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded"
                          style={{ background: '#EF444422', color: '#EF4444', border: '1px solid #EF444433' }}>
                          del
                        </button>
                        <span>{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 border-t" style={{ borderColor: '#1A2333' }}>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#2A3A50' }}>Input</p>
                            <pre className="text-xs whitespace-pre-wrap break-words rounded p-3"
                              style={{ background: '#0D1420', color: '#5A7A90', fontFamily: "'IBM Plex Mono', monospace", maxHeight: '120px', overflowY: 'auto' }}>
                              {run.input}
                            </pre>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#2A3A50' }}>Final Output</p>
                            <pre className="text-xs whitespace-pre-wrap break-words rounded p-3"
                              style={{ background: '#0D1420', color: '#8AAAC0', fontFamily: "'IBM Plex Mono', monospace", maxHeight: '120px', overflowY: 'auto' }}>
                              {run.finalOutput || '(no output)'}
                            </pre>
                          </div>
                        </div>

                        {run.results?.length > 0 && (
                          <div className="mt-4">
                            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#2A3A50' }}>Step Trace</p>
                            <div className="flex flex-wrap gap-2">
                              {run.results.map((step: any, i: number) => {
                                const c = TYPE_COLORS[step.type] || '#666'
                                return (
                                  <div key={step.stepId}
                                    className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded"
                                    style={{ background: c + '15', border: `1px solid ${c}33`, color: c }}>
                                    <span>{i + 1}.</span>
                                    <span>{step.stepName}</span>
                                    <span style={{ color: step.status === 'success' ? '#00D4AA' : '#EF4444' }}>
                                      {step.status === 'success' ? '✓' : '✗'}
                                    </span>
                                    <span style={{ color: '#3A4A60' }}>{step.duration}ms</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        )}

        <div className="mt-10 pt-6 border-t" style={{ borderColor: '#1A2333' }}>
          <p className="text-[11px] text-center" style={{ color: '#1E2B3C' }}>
            SAP AI Orchestration Studio — Pipeline History Dashboard
          </p>
        </div>
      </div>
    </div>
  )
}