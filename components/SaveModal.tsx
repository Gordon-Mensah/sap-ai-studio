'use client'
import { useState } from 'react'

interface SaveModalProps {
  initialName?: string
  onSave: (name: string, description: string, tags: string[]) => void
  onClose: () => void
}

const SUGGESTED_TAGS = ['production', 'draft', 'rag', 'compliance', 'translation', 'summarisation', 'analysis', 'customer-support']

export function SaveModal({ initialName = '', onSave, onClose }: SaveModalProps) {
  const [name, setName] = useState(initialName || '')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const addCustomTag = () => {
    const t = customTag.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !tags.includes(t)) { setTags(prev => [...prev, t]); setCustomTag('') }
  }

  const inputStyle = {
    background: '#0D1420', color: '#fff', fontSize: '12px', padding: '8px 12px',
    borderRadius: '6px', border: '1px solid #1A2333', width: '100%',
    fontFamily: "'IBM Plex Mono', monospace", outline: 'none',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-96 rounded-lg overflow-hidden" style={{ background: '#090D1A', border: '1px solid #1A2333', fontFamily: "'IBM Plex Mono', monospace" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#1A2333' }}>
          <div>
            <p className="text-white text-sm font-semibold">Save Pipeline</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#3A4A60' }}>Save your current canvas to history</p>
          </div>
          <button onClick={onClose} className="text-xs w-6 h-6 flex items-center justify-center rounded"
            style={{ color: '#3A4A60', border: '1px solid #1A2333' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#3A4A60' }}>
            ×
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: '#3A4A60' }}>Pipeline Name *</label>
            <input style={inputStyle} placeholder="e.g. Customer Support RAG Pipeline" value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onSave(name.trim(), description, tags) }} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: '#3A4A60' }}>Description</label>
            <textarea rows={2} style={{ ...inputStyle, resize: 'none' } as any}
              placeholder="What does this pipeline do?" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: '#3A4A60' }}>Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SUGGESTED_TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className="text-[10px] px-2 py-1 rounded transition-all"
                  style={{
                    background: tags.includes(tag) ? '#00D4AA22' : 'transparent',
                    border: `1px solid ${tags.includes(tag) ? '#00D4AA44' : '#1A2333'}`,
                    color: tags.includes(tag) ? '#00D4AA' : '#3A4A60',
                  }}>
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input style={{ ...inputStyle, flex: 1 }} placeholder="custom-tag" value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addCustomTag() }} />
              <button onClick={addCustomTag} className="text-xs px-3 rounded"
                style={{ background: '#1A2333', color: '#3A4A60', border: '1px solid #1A2333' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#3A4A60' }}>
                +
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2 rounded text-xs transition-all"
            style={{ background: 'transparent', border: '1px solid #1A2333', color: '#3A4A60' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#3A4A60' }}>
            Cancel
          </button>
          <button onClick={() => { if (name.trim()) onSave(name.trim(), description, tags) }}
            disabled={!name.trim()}
            className="flex-1 py-2 rounded text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #0070F3, #00D4AA)', color: '#fff', border: 'none' }}>
            Save Pipeline
          </button>
        </div>
      </div>
    </div>
  )
}
