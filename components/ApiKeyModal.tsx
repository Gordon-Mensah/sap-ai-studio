'use client'
import { useState } from 'react'
import { setApiKey, isValidKeyFormat } from '@/lib/api-key'

interface ApiKeyModalProps {
  onSave: () => void
  onClose?: () => void
  isFirstTime?: boolean
}

export function ApiKeyModal({ onSave, onClose, isFirstTime = false }: ApiKeyModalProps) {
  const [key, setKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!key.trim()) { setError('Please enter your Groq API key.'); return }
    if (!isValidKeyFormat(key)) { setError('Groq API keys start with gsk_ — check your key and try again.'); return }
    setApiKey(key.trim())
    onSave()
  }

  const inputStyle = {
    background: '#0D1420', color: '#fff', fontSize: '12px', padding: '10px 40px 10px 12px',
    borderRadius: '6px', border: `1px solid ${error ? '#EF4444' : '#1A2333'}`,
    width: '100%', fontFamily: "'IBM Plex Mono', monospace", outline: 'none',
    letterSpacing: showKey ? 'normal' : '0.15em',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="w-[420px] rounded-lg overflow-hidden"
        style={{ background: '#090D1A', border: '1px solid #1A2333', fontFamily: "'IBM Plex Mono', monospace" }}>

        {/* Header */}
        <div className="px-6 py-5 border-b" style={{ borderColor: '#1A2333' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: '#0070F322', border: '1px solid #0070F333', color: '#0070F3' }}>
              ⬡
            </div>
            <p className="text-white text-sm font-semibold">
              {isFirstTime ? 'Welcome to SAP AI Studio' : 'Update Groq API Key'}
            </p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#3A5A70' }}>
            {isFirstTime
              ? 'To run pipelines, you need a free Groq API key. Your key is stored only in your browser — never on any server.'
              : 'Update your Groq API key. It is stored locally in your browser only.'}
          </p>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Key input */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: '#3A4A60' }}>
              Groq API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                style={inputStyle as any}
                placeholder="gsk_••••••••••••••••••••••••••••••••"
                value={key}
                onChange={(e) => { setKey(e.target.value); setError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                autoFocus
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] transition-colors"
                style={{ color: '#3A4A60' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#3A4A60' }}>
                {showKey ? 'hide' : 'show'}
              </button>
            </div>
            {error && <p className="text-[10px] mt-1.5" style={{ color: '#EF4444' }}>{error}</p>}
          </div>

          {/* Where to get key */}
          <div className="rounded-lg p-4" style={{ background: '#0D1420', border: '1px solid #1A2333' }}>
            <p className="text-[10px] font-semibold mb-2" style={{ color: '#00D4AA' }}>How to get your free key:</p>
            <ol className="text-[10px] space-y-1" style={{ color: '#3A5A70' }}>
              <li>1. Go to <span style={{ color: '#0070F3' }}>console.groq.com</span></li>
              <li>2. Sign up for a free account</li>
              <li>3. Go to API Keys → Create API Key</li>
              <li>4. Copy and paste it above</li>
            </ol>
          </div>

          {/* Security note */}
          <p className="text-[10px] leading-relaxed" style={{ color: '#2A3A50' }}>
             Your key is stored in localStorage and sent only to your own Next.js API route — never to any third party.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          {onClose && !isFirstTime && (
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded text-xs transition-all"
              style={{ background: 'transparent', border: '1px solid #1A2333', color: '#3A4A60' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#3A4A60' }}>
              Cancel
            </button>
          )}
          <button onClick={handleSave}
            className="flex-1 py-2.5 rounded text-xs font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg, #0070F3, #00D4AA)', color: '#fff', border: 'none' }}>
            Save Key & Continue
          </button>
        </div>
      </div>
    </div>
  )
}