'use client'
import { useState, useEffect } from 'react'
import { Node } from 'reactflow'

interface StepConfigPanelProps {
  node: Node
  onUpdate: (nodeId: string, config: Record<string, any>, name: string) => void
  onClose: () => void
}

const TYPE_META: Record<string, { color: string; icon: string }> = {
  template:    { color: '#0070F3', icon: '[ ]' },
  llm:         { color: '#00D4AA', icon: '◈' },
  grounding:   { color: '#A78BFA', icon: '⊕' },
  masking:     { color: '#F59E0B', icon: '◫' },
  filter:      { color: '#EF4444', icon: '⊘' },
  translation: { color: '#10B981', icon: '⇄' },
  summariser:  { color: '#F97316', icon: '≡' },
  sentiment:   { color: '#EC4899', icon: '◉' },
  'json-parser': { color: '#8B5CF6', icon: '{ }' },
}

// NOTE: Check https://console.groq.com/docs/deprecations for current model IDs
const MODEL_OPTIONS = [
  { value: 'llama-3.3-70b-versatile',   label: 'LLaMA 3.3 70B — Best Quality' },
  { value: 'llama-3.1-8b-instant',      label: 'LLaMA 3.1 8B — Fastest' },
  { value: 'openai/gpt-oss-120b',       label: 'GPT-OSS 120B — Reasoning' },
  { value: 'qwen/qwen3-32b',            label: 'Qwen 3 32B — Efficient' },
]

export function StepConfigPanel({ node, onUpdate, onClose }: StepConfigPanelProps) {
  const [name, setName] = useState(node.data.name)
  const [config, setConfig] = useState<Record<string, any>>(node.data.config)

  useEffect(() => { setName(node.data.name); setConfig(node.data.config) }, [node.id])

  const meta = TYPE_META[node.data.type] || { color: '#666', icon: '?' }
  const save = () => onUpdate(node.id, config, name)
  const inputBase = {
    background: '#0D1420', color: '#fff', fontSize: '12px', padding: '8px 12px',
    borderRadius: '6px', border: '1px solid #1A2333', width: '100%',
    fontFamily: "'IBM Plex Mono', monospace", outline: 'none', resize: 'vertical' as const,
  }
  const labelClass = 'text-[10px] uppercase tracking-widest mb-1 block'

  return (
    <div className="w-72 flex flex-col border-l overflow-y-auto"
      style={{ background: '#090D1A', borderColor: '#1A2333', fontFamily: "'IBM Plex Mono', monospace" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#1A2333' }}>
        <div className="flex items-center gap-2">
          <span style={{ color: meta.color, fontWeight: 'bold' }}>{meta.icon}</span>
          <span className="text-white text-xs font-semibold">Configure</span>
        </div>
        <button onClick={onClose} className="text-xs w-6 h-6 flex items-center justify-center rounded"
          style={{ color: '#3A4A60', border: '1px solid #1A2333' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#3A4A60' }}>
          ×
        </button>
      </div>

      <div className="flex flex-col gap-5 p-4 flex-1">
        <div>
          <label className={labelClass} style={{ color: '#3A4A60' }}>Node Label</label>
          <input style={inputBase} value={name} onChange={(e) => setName(e.target.value)} onBlur={save} />
        </div>
        <ConfigFields type={node.data.type} config={config} setConfig={setConfig} onBlur={save} color={meta.color} inputBase={inputBase} labelClass={labelClass} />
      </div>

      <div className="p-4 border-t" style={{ borderColor: '#1A2333' }}>
        <button onClick={save} className="w-full py-2 rounded text-xs font-semibold transition-all"
          style={{ background: meta.color + '22', color: meta.color, border: `1px solid ${meta.color}44` }}
          onMouseEnter={(e) => { e.currentTarget.style.background = meta.color + '33' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = meta.color + '22' }}>
          Apply Changes
        </button>
      </div>
    </div>
  )
}

function ModelSelect({ value, onChange, inputBase }: { value: string; onChange: (v: string) => void; inputBase: any }) {
  return (
    <select style={{ ...inputBase, cursor: 'pointer' }} value={value} onChange={(e) => onChange(e.target.value)}>
      {MODEL_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
    </select>
  )
}

function ConfigFields({ type, config, setConfig, onBlur, color, inputBase, labelClass }: {
  type: string; config: Record<string, any>; setConfig: (c: Record<string, any>) => void
  onBlur: () => void; color: string; inputBase: any; labelClass: string
}) {
  const set = (key: string, val: any) => setConfig({ ...config, [key]: val })

  switch (type) {
    case 'template':
      return (<>
        <div>
          <label className={labelClass} style={{ color: '#3A4A60' }}>Template <span style={{ color }}>— use {'{{input}}'}</span></label>
          <textarea rows={6} style={inputBase} value={config.template || ''} onChange={(e) => set('template', e.target.value)} onBlur={onBlur} />
        </div>
        <div>
          <label className={labelClass} style={{ color: '#3A4A60' }}>Variables <span style={{ color: '#2A3A50' }}>(key=value, one per line)</span></label>
          <textarea rows={3} style={inputBase} placeholder="name=Gordon&#10;role=Engineer"
            value={Object.entries(config.variables || {}).map(([k, v]) => `${k}=${v}`).join('\n')}
            onChange={(e) => {
              const vars: Record<string, string> = {}
              e.target.value.split('\n').forEach((line) => { const [k, ...rest] = line.split('='); if (k?.trim()) vars[k.trim()] = rest.join('=').trim() })
              set('variables', vars)
            }} onBlur={onBlur} />
        </div>
      </>)

    case 'llm':
      return (<>
        <div>
          <label className={labelClass} style={{ color: '#3A4A60' }}>System Prompt</label>
          <textarea rows={5} style={inputBase} value={config.systemPrompt || ''} onChange={(e) => set('systemPrompt', e.target.value)} onBlur={onBlur} />
        </div>
        <div>
          <label className={labelClass} style={{ color: '#3A4A60' }}>Model</label>
          <ModelSelect value={config.model || 'llama-3.3-70b-versatile'} onChange={(v) => { set('model', v); onBlur() }} inputBase={inputBase} />
        </div>
      </>)

    case 'grounding':
      return (
        <div>
          <label className={labelClass} style={{ color: '#3A4A60' }}>Context Document</label>
          <textarea rows={10} style={inputBase} placeholder="Paste your reference document here." value={config.document || ''} onChange={(e) => set('document', e.target.value)} onBlur={onBlur} />
        </div>
      )

    case 'masking':
      return (
        <div className="rounded p-3 text-xs" style={{ background: '#0D1420', border: '1px solid #1A2333', color: '#3A5A70' }}>
          <p className="font-semibold mb-2" style={{ color: '#F59E0B' }}>Auto-masked patterns:</p>
          <ul className="space-y-1">
            <li>• Email addresses → [EMAIL MASKED]</li>
            <li>• Phone numbers → [PHONE MASKED]</li>
            <li>• Credit card numbers → [CARD MASKED]</li>
            <li>• Government IDs → [ID MASKED]</li>
          </ul>
        </div>
      )

    case 'filter':
      return (
        <div>
          <label className={labelClass} style={{ color: '#3A4A60' }}>Custom Blocklist <span style={{ color: '#2A3A50' }}>(one per line)</span></label>
          <textarea rows={6} style={inputBase} placeholder="competitor&#10;confidential&#10;internal"
            value={(config.blocklist || []).join('\n')} onChange={(e) => set('blocklist', e.target.value.split('\n').filter(Boolean))} onBlur={onBlur} />
        </div>
      )

    case 'translation':
      return (
        <div>
          <label className={labelClass} style={{ color: '#3A4A60' }}>Target Language</label>
          <select style={{ ...inputBase, cursor: 'pointer' }} value={config.targetLanguage || 'German'} onChange={(e) => { set('targetLanguage', e.target.value); onBlur() }}>
            {['German','French','Spanish','Italian','Portuguese','Dutch','Polish','Japanese','Chinese','Korean','Arabic','Hindi','Russian','Turkish','Swedish'].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      )

    case 'summariser':
      return (<>
        <div>
          <label className={labelClass} style={{ color: '#3A4A60' }}>Summary Style</label>
          <select style={{ ...inputBase, cursor: 'pointer' }} value={config.style || 'bullet'} onChange={(e) => { set('style', e.target.value); onBlur() }}>
            <option value="bullet">Bullet Points</option>
            <option value="paragraph">Paragraph</option>
            <option value="tldr">TL;DR</option>
            <option value="executive">Executive Summary</option>
          </select>
        </div>
        <div>
          <label className={labelClass} style={{ color: '#3A4A60' }}>Max Points / Sentences</label>
          <input type="number" min={1} max={20} style={inputBase} value={config.maxPoints || 5}
            onChange={(e) => set('maxPoints', parseInt(e.target.value))} onBlur={onBlur} />
        </div>
        <div>
          <label className={labelClass} style={{ color: '#3A4A60' }}>Model</label>
          <ModelSelect value={config.model || 'llama-3.3-70b-versatile'} onChange={(v) => { set('model', v); onBlur() }} inputBase={inputBase} />
        </div>
      </>)

    case 'sentiment':
      return (<>
        <div className="rounded p-3 text-xs" style={{ background: '#0D1420', border: '1px solid #1A2333', color: '#3A5A70' }}>
          <p className="font-semibold mb-2" style={{ color: '#EC4899' }}>Outputs:</p>
          <ul className="space-y-1">
            <li>• Sentiment: positive / negative / neutral / mixed</li>
            <li>• Confidence score (0–100%)</li>
            <li>• Polarity score (-1.0 to +1.0)</li>
            <li>• Detected emotions</li>
            <li>• One-line analysis</li>
          </ul>
        </div>
        <div>
          <label className={labelClass} style={{ color: '#3A4A60' }}>Model</label>
          <ModelSelect value={config.model || 'llama-3.1-8b-instant'} onChange={(v) => { set('model', v); onBlur() }} inputBase={inputBase} />
        </div>
      </>)

    case 'json-parser':
      return (<>
        <div>
          <label className={labelClass} style={{ color: '#3A4A60' }}>JSON Schema <span style={{ color: '#2A3A50' }}>(optional)</span></label>
          <textarea rows={6} style={inputBase}
            placeholder={'{\n  "name": "string",\n  "date": "string",\n  "amount": "number"\n}'}
            value={config.schema || ''} onChange={(e) => set('schema', e.target.value)} onBlur={onBlur} />
          <p className="text-[10px] mt-1" style={{ color: '#2A3A50' }}>Leave empty to auto-extract all fields.</p>
        </div>
        <div>
          <label className={labelClass} style={{ color: '#3A4A60' }}>Model</label>
          <ModelSelect value={config.model || 'llama-3.3-70b-versatile'} onChange={(v) => { set('model', v); onBlur() }} inputBase={inputBase} />
        </div>
      </>)

    default:
      return null
  }
}
