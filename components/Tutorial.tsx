'use client'

import { useState, useEffect } from 'react'

interface TutorialProps {
  onComplete: () => void
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to SAP AI Orchestration Studio',
    body: 'This is a visual AI pipeline builder inspired by SAP\'s AI Foundation Orchestration Service. You connect modules together to build AI workflows — no code required. This tour takes about 60 seconds.',
    icon: '⬡',
    color: '#0070F3',
    target: null,
    position: 'center',
  },
  {
    id: 'palette',
    title: 'The Module Palette',
    body: 'On the left you have 9 pipeline modules — Prompt Template, LLM Call, Grounding, Data Masking, Content Filter, Translation, Summariser, Sentiment, and JSON Parser. Click any module to add it to the canvas. Each one maps to a real SAP Orchestration Service concept.',
    icon: '⬡',
    color: '#0070F3',
    target: 'palette',
    position: 'right',
    highlight: { left: 0, top: 56, width: 224, bottom: 0 },
  },
  {
    id: 'canvas',
    title: 'The Pipeline Canvas',
    body: 'Nodes you add appear on this canvas. Drag them to reposition. Connect them by dragging from the right handle (output) of one node to the left handle (input) of the next. The order they\'re connected is the order they execute.',
    icon: '◈',
    color: '#00D4AA',
    target: 'canvas',
    position: 'center',
  },
  {
    id: 'config',
    title: 'Configure Any Node',
    body: 'Click any node on the canvas to open its configuration panel on the right. You can set the system prompt for LLM nodes, define template variables, set a target language for translation, upload a grounding document, and more.',
    icon: '◫',
    color: '#F59E0B',
    target: null,
    position: 'center',
  },
  {
    id: 'run',
    title: 'Run Your Pipeline',
    body: 'Click the ▶ Run button in the top bar, type your input text, and hit Execute. Each step runs in sequence — you\'ll see live streaming output for LLM steps. The result panel shows input → output for every step so you can debug exactly what happened.',
    icon: '▶',
    color: '#00D4AA',
    target: 'topbar',
    position: 'bottom',
    highlight: { top: 0, left: 0, right: 0, height: 56 },
  },
  {
    id: 'templates',
    title: '12 Enterprise Templates',
    body: 'Don\'t want to build from scratch? Click Templates in the top bar. You\'ll find 12 pre-built pipelines across 10 categories — customer support, legal analysis, CV screening, GDPR compliance, invoice extraction, sentiment analysis, and more. One click loads them onto the canvas.',
    icon: '⊞',
    color: '#A78BFA',
    target: null,
    position: 'center',
  },
  {
    id: 'save',
    title: 'Save & Reload Pipelines',
    body: 'Click Save (↑) in the top bar to name your pipeline, add a description and tags. It saves to localStorage immediately — no account needed. If you\'ve set up Supabase, it syncs to the cloud too. Load any saved pipeline from the History page.',
    icon: '↑',
    color: '#10B981',
    target: null,
    position: 'center',
  },
  {
    id: 'compare',
    title: 'Model Comparison',
    body: 'Click Compare in the top bar to open a side-by-side model comparison page. Run the same prompt against LLaMA 70B, LLaMA 8B, Qwen, and Gemma simultaneously. See speed and quality differences at a glance — useful for picking the right model for your pipeline.',
    icon: '⇌',
    color: '#F97316',
    target: null,
    position: 'center',
  },
  {
    id: 'apikey',
    title: 'API Key',
    body: 'The studio uses Groq to run your LLM steps. Your API key is stored locally in your browser — it\'s never sent to our servers, only directly to Groq. Get a free key at console.groq.com. You can update your key anytime from the top bar.',
    icon: '🔑',
    color: '#F59E0B',
    target: null,
    position: 'center',
  },
  {
    id: 'done',
    title: 'You\'re ready.',
    body: 'Start by clicking any module in the left palette to add it to the canvas. Connect two or three nodes, hit Run, and watch your pipeline execute. If you ever want to see this tour again, click the ? button in the top bar.',
    icon: '✓',
    color: '#00D4AA',
    target: null,
    position: 'center',
  },
]

export function Tutorial({ onComplete }: TutorialProps) {
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  const go = (dir: 1 | -1) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setStep(s => Math.max(0, Math.min(STEPS.length - 1, s + dir)))
      setAnimating(false)
    }, 150)
  }

  const finish = () => {
    localStorage.setItem('sap_studio_toured', '1')
    onComplete()
  }

  const skip = () => {
    localStorage.setItem('sap_studio_toured', '1')
    onComplete()
  }

  const mono = { fontFamily: "'IBM Plex Mono', monospace" }

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(4, 6, 12, 0.88)',
        backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>

        {/* Highlight box for palette step */}
        {current.id === 'palette' && (
          <div style={{
            position: 'fixed', left: 0, top: 56, width: 224, bottom: 0,
            border: '2px solid #0070F3',
            boxShadow: '0 0 0 4px #0070F322, inset 0 0 40px #0070F311',
            borderRadius: 0, pointerEvents: 'none', zIndex: 201,
            animation: 'tutorialPulse 2s ease-in-out infinite',
          }} />
        )}

        {/* Highlight box for topbar step */}
        {current.id === 'run' && (
          <div style={{
            position: 'fixed', left: 0, top: 0, right: 0, height: 56,
            border: '2px solid #00D4AA',
            boxShadow: '0 0 0 4px #00D4AA22, inset 0 0 40px #00D4AA11',
            pointerEvents: 'none', zIndex: 201,
            animation: 'tutorialPulse 2s ease-in-out infinite',
          }} />
        )}

        {/* Card */}
        <div style={{
          width: '100%', maxWidth: 520,
          background: '#0D1420',
          border: `1px solid ${current.color}44`,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${current.color}22`,
          ...mono,
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateY(6px)' : 'translateY(0)',
          transition: 'opacity 0.15s, transform 0.15s',
        }}>

          {/* Progress bar */}
          <div style={{ height: 3, background: '#1A2333' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: `linear-gradient(90deg, #0070F3, ${current.color})`,
              transition: 'width 0.3s ease',
            }} />
          </div>

          {/* Header */}
          <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: current.color + '20',
                border: `1px solid ${current.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: current.color,
              }}>
                {current.icon}
              </div>
              <div>
                <p style={{ fontSize: 10, color: '#3A4A60', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 4px' }}>
                  Step {step + 1} of {STEPS.length}
                </p>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                  {current.title}
                </h2>
              </div>
            </div>
            <button onClick={skip} style={{ background: 'transparent', border: 'none', color: '#2A3A50', cursor: 'pointer', fontSize: 11, padding: '4px 8px', borderRadius: 4 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#2A3A50')}>
              skip tour
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 28px 28px' }}>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: '#5A7A90', margin: '0 0 28px' }}>
              {current.body}
            </p>

            {/* Step dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
              {STEPS.map((_, i) => (
                <button key={i} onClick={() => setStep(i)} style={{
                  width: i === step ? 20 : 6,
                  height: 6, borderRadius: 3,
                  background: i === step ? current.color : i < step ? current.color + '66' : '#1A2333',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all 0.2s ease',
                }} />
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              {step > 0 && (
                <button onClick={() => go(-1)} style={{
                  flex: 1, padding: '11px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: 'transparent', color: '#3A5A70',
                  border: '1px solid #1A2333', cursor: 'pointer',
                  ...mono,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#3A5A70'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A2333'; e.currentTarget.style.color = '#3A5A70' }}>
                  ← Back
                </button>
              )}
              <button onClick={isLast ? finish : () => go(1)} style={{
                flex: 2, padding: '11px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: isLast ? `linear-gradient(135deg, #0070F3, #00D4AA)` : current.color + '22',
                color: isLast ? '#fff' : current.color,
                border: `1px solid ${isLast ? 'transparent' : current.color + '44'}`,
                cursor: 'pointer', ...mono,
              }}
                onMouseEnter={e => { if (!isLast) e.currentTarget.style.background = current.color + '33' }}
                onMouseLeave={e => { if (!isLast) e.currentTarget.style.background = current.color + '22' }}>
                {isLast ? '✓ Start Building' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tutorialPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </>
  )
}
