'use client'
import { PipelineStep } from '@/lib/pipeline-engine'

interface NodePaletteProps {
  onAddNode: (type: PipelineStep['type'], label: string) => void
}

const NODE_TYPES: {
  type: PipelineStep['type']
  label: string
  icon: string
  description: string
  color: string
  accentColor: string
  isNew?: boolean
}[] = [
  { type: 'template',    label: 'Prompt Template', icon: '[ ]', description: 'Inject variables into prompts',         color: '#0070F3', accentColor: '#0070F322' },
  { type: 'llm',         label: 'LLM Call',         icon: '◈',   description: 'Call Groq with a system prompt',       color: '#00D4AA', accentColor: '#00D4AA22' },
  { type: 'grounding',   label: 'Grounding',        icon: '⊕',   description: 'Ground responses with documents',      color: '#A78BFA', accentColor: '#A78BFA22' },
  { type: 'masking',     label: 'Data Masking',     icon: '◫',   description: 'Mask PII: emails, phones, cards',     color: '#F59E0B', accentColor: '#F59E0B22' },
  { type: 'filter',      label: 'Content Filter',   icon: '⊘',   description: 'Block restricted terms',              color: '#EF4444', accentColor: '#EF444422' },
  { type: 'translation', label: 'Translation',      icon: '⇄',   description: 'Translate to any language',           color: '#10B981', accentColor: '#10B98122' },
  { type: 'summariser',  label: 'Summariser',       icon: '≡',   description: 'Bullet, TL;DR, or executive summary', color: '#F97316', accentColor: '#F9731622', isNew: true },
  { type: 'sentiment',   label: 'Sentiment',        icon: '◉',   description: 'Score tone & emotion in text',        color: '#EC4899', accentColor: '#EC489922', isNew: true },
  { type: 'json-parser', label: 'JSON Parser',      icon: '{ }', description: 'Extract structured JSON from text',   color: '#8B5CF6', accentColor: '#8B5CF622', isNew: true },
]

export function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <div className="w-56 flex flex-col border-r overflow-y-auto"
      style={{ background: '#090D1A', borderColor: '#1A2333', fontFamily: "'IBM Plex Mono', monospace" }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: '#1A2333' }}>
        <p className="text-xs tracking-[0.2em] uppercase" style={{ color: '#3A4A60' }}>Pipeline Modules</p>
      </div>

      <div className="flex flex-col gap-1 p-3">
        {NODE_TYPES.map((node) => (
          <button key={node.type} onClick={() => onAddNode(node.type, node.label)}
            className="w-full text-left p-3 rounded-lg transition-all relative"
            style={{ background: 'transparent', border: '1px solid #1A2333' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = node.accentColor; e.currentTarget.style.borderColor = node.color + '44' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#1A2333' }}>
            {node.isNew && (
              <span className="absolute top-1.5 right-1.5 text-[8px] px-1 py-0.5 rounded"
                style={{ background: '#00D4AA22', color: '#00D4AA', border: '1px solid #00D4AA33' }}>
                NEW
              </span>
            )}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold w-5 text-center" style={{ color: node.color }}>{node.icon}</span>
              <span className="text-xs font-semibold text-white truncate">{node.label}</span>
            </div>
            <p className="text-[10px] leading-tight ml-7" style={{ color: '#3A4A60' }}>{node.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-auto p-4 border-t" style={{ borderColor: '#1A2333' }}>
        <p className="text-[10px] leading-relaxed" style={{ color: '#1E2B3C' }}>
          SAP AI Foundation<br />Orchestration Service<br />
          <span style={{ color: '#2A3A50' }}>— Inspired by</span>
        </p>
      </div>
    </div>
  )
}
