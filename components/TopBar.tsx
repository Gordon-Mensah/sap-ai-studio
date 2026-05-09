'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { hasApiKey } from '@/lib/api-key'

interface TopBarProps {
  nodeCount: number
  pipelineName: string
  onRun: () => void
  onSave: () => void
  onSaveAs: () => void
  onClear: () => void
  onExportCode: () => void
  onManageKey: () => void
  onTour: () => void
}

export function TopBar({ nodeCount, pipelineName, onRun, onSave, onSaveAs, onClear, onExportCode, onManageKey, onTour }: TopBarProps) {
  const router = useRouter()
  const [keySet, setKeySet] = useState(false)

  useEffect(() => { setKeySet(hasApiKey()) }, [])

  return (
    <div
      className="flex items-center justify-between px-5 py-3 border-b"
      style={{ background: '#090D1A', borderColor: '#1A2333', fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {/* Left: Logo + pipeline name */}
      <div className="flex items-center gap-3">
        <div
          className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold"
          style={{ background: 'linear-gradient(135deg, #0070F3, #00D4AA)', color: '#fff' }}
        >
          ⬡
        </div>
        <div>
          <span className="text-white text-sm font-semibold tracking-tight">SAP AI Orchestration Studio</span>
          <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: '#0070F322', color: '#0070F3', border: '1px solid #0070F333' }}>v0.2</span>
        </div>
        {pipelineName && (
          <>
            <span style={{ color: '#1A2333' }}>·</span>
            <span className="text-xs" style={{ color: '#3A5A70' }}>{pipelineName}</span>
          </>
        )}
      </div>

      {/* Centre: node count */}
      <div className="flex items-center gap-2 text-xs" style={{ color: '#3A4A60' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: nodeCount > 0 ? '#00D4AA' : '#3A4A60' }} />
        {nodeCount === 0 ? 'No nodes' : `${nodeCount} node${nodeCount !== 1 ? 's' : ''} in pipeline`}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <button onClick={() => router.push('/templates')} className="text-xs px-3 py-1.5 rounded transition-colors"
          style={{ background: '#A78BFA22', border: '1px solid #A78BFA33', color: '#A78BFA' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#A78BFA33' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#A78BFA22' }}>
          Templates
        </button>
        <button onClick={() => router.push('/compare')} className="text-xs px-3 py-1.5 rounded transition-colors"
          style={{ background: '#0070F322', border: '1px solid #0070F333', color: '#0070F3' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#0070F333' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#0070F322' }}>
          Compare
        </button>
        <button onClick={() => router.push('/history')} className="text-xs px-3 py-1.5 rounded transition-colors"
          style={{ background: '#F59E0B22', border: '1px solid #F59E0B33', color: '#F59E0B' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F59E0B33' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#F59E0B22' }}>
          History
        </button>

        <button onClick={onManageKey}
          className="text-xs px-3 py-1.5 rounded transition-colors flex items-center gap-1.5"
          style={{
            background: keySet ? '#00D4AA11' : '#EF444411',
            border: `1px solid ${keySet ? '#00D4AA33' : '#EF444433'}`,
            color: keySet ? '#00D4AA' : '#EF4444',
          }}
          title={keySet ? 'API key configured — click to update' : 'No API key — click to add'}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}>
          <span>{keySet ? '🔑' : '⚠'}</span>
          <span>{keySet ? 'Key set' : 'Add key'}</span>
        </button>

        <div className="w-px h-4 mx-1" style={{ background: '#1A2333' }} />

        <button onClick={onExportCode} disabled={nodeCount === 0} className="text-xs px-3 py-1.5 rounded transition-colors disabled:opacity-30"
          style={{ background: '#10B98122', border: '1px solid #10B98133', color: '#10B981' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#10B98133' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#10B98122' }}>
          {'</>'}
        </button>
        <button onClick={onSave} disabled={nodeCount === 0} className="text-xs px-3 py-1.5 rounded transition-colors disabled:opacity-30"
          style={{ background: 'transparent', border: '1px solid #1A2333', color: '#3A4A60' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00D4AA'; e.currentTarget.style.color = '#00D4AA' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1A2333'; e.currentTarget.style.color = '#3A4A60' }}>
          Save
        </button>
        <button onClick={onClear} className="text-xs px-3 py-1.5 rounded transition-colors"
          style={{ background: 'transparent', border: '1px solid #1A2333', color: '#3A4A60' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF4444'; e.currentTarget.style.color = '#FF4444' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1A2333'; e.currentTarget.style.color = '#3A4A60' }}>
          Clear
        </button>
        <button onClick={onTour} title="Take the tour"
          className="text-xs w-7 h-7 flex items-center justify-center rounded transition-colors"
          style={{ background: 'transparent', border: '1px solid #1A2333', color: '#3A4A60' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0070F3'; e.currentTarget.style.color = '#0070F3' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1A2333'; e.currentTarget.style.color = '#3A4A60' }}>
          ?
        </button>
        <button onClick={onRun} disabled={nodeCount === 0}
          className="text-xs px-4 py-1.5 rounded font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: nodeCount > 0 ? 'linear-gradient(135deg, #0070F3, #00D4AA)' : '#1A2333', color: '#fff', border: 'none' }}>
          ▶ Run
        </button>
      </div>
    </div>
  )
}