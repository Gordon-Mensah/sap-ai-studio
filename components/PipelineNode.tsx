'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

const TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  template:    { icon: '[ ]', color: '#0070F3', bg: '#0070F315' },
  llm:         { icon: '◈',   color: '#00D4AA', bg: '#00D4AA15' },
  grounding:   { icon: '⊕',   color: '#A78BFA', bg: '#A78BFA15' },
  masking:     { icon: '◫',   color: '#F59E0B', bg: '#F59E0B15' },
  filter:      { icon: '⊘',   color: '#EF4444', bg: '#EF444415' },
  translation: { icon: '⇄',   color: '#10B981', bg: '#10B98115' },
}

export const PipelineNode = memo(({ data, selected }: NodeProps) => {
  const meta = TYPE_META[data.type] || { icon: '?', color: '#666', bg: '#66666615' }

  return (
    <div
      style={{
        background: meta.bg,
        border: `1px solid ${selected ? meta.color : meta.color + '44'}`,
        borderRadius: '8px',
        minWidth: '180px',
        fontFamily: "'IBM Plex Mono', monospace",
        boxShadow: selected
          ? `0 0 0 1px ${meta.color}44, 0 4px 20px ${meta.color}22`
          : '0 2px 8px rgba(0,0,0,0.4)',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: meta.color,
          border: '2px solid #080B14',
          width: 10,
          height: 10,
        }}
      />

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: meta.color + '33' }}
      >
        <span style={{ color: meta.color, fontSize: '14px', fontWeight: 'bold' }}>
          {meta.icon}
        </span>
        <div>
          <p className="text-white text-xs font-semibold leading-tight">{data.name}</p>
          <p style={{ color: meta.color, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {data.type}
          </p>
        </div>
      </div>

      {/* Config preview */}
      <div className="px-3 py-2">
        <NodeConfigPreview type={data.type} config={data.config} color={meta.color} />
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: meta.color,
          border: '2px solid #080B14',
          width: 10,
          height: 10,
        }}
      />
    </div>
  )
})

PipelineNode.displayName = 'PipelineNode'

function NodeConfigPreview({
  type,
  config,
  color,
}: {
  type: string
  config: Record<string, any>
  color: string
}) {
  const textStyle = { color: '#3A5A70', fontSize: '10px', lineHeight: '1.4' }
  const valStyle = { color: '#7A9AB0', fontSize: '10px', lineHeight: '1.4' }

  switch (type) {
    case 'template':
      return (
        <p style={valStyle} className="truncate max-w-[150px]">
          {config.template?.slice(0, 40) || 'No template'}…
        </p>
      )
    case 'llm':
      return (
        <div>
          <p style={textStyle}>model: <span style={valStyle}>{config.model?.replace('llama-', 'llama-') || '—'}</span></p>
        </div>
      )
    case 'grounding':
      return (
        <p style={valStyle}>
          {config.document ? `${config.document.slice(0, 30)}…` : 'No document set'}
        </p>
      )
    case 'masking':
      return <p style={valStyle}>email · phone · card · id</p>
    case 'filter':
      return (
        <p style={valStyle}>
          {config.blocklist?.length
            ? `+${config.blocklist.length} custom terms`
            : 'default blocklist'}
        </p>
      )
    case 'translation':
      return <p style={valStyle}>→ {config.targetLanguage || 'English'}</p>
    default:
      return null
  }
}