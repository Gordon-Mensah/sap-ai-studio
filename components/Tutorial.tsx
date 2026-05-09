'use client'

import { useState } from 'react'

interface TutorialProps {
  onComplete: () => void
}

const STEPS = [
  {
    title: 'You\'re all set.',
    subtitle: 'Here\'s how the studio works',
    body: 'SAP AI Orchestration Studio lets you build AI pipelines visually — no code needed. You connect modules together and run them with real LLM calls. This tour covers the five things you need to know.',
    icon: '⬡',
    color: '#0070F3',
    tag: 'Welcome',
  },
  {
    title: 'Add modules from the left panel.',
    subtitle: 'The Module Palette',
    body: 'Click any module on the left to add it to the canvas. You have 9 to choose from — LLM Call, Prompt Template, Grounding, Data Masking, Content Filter, Translation, Summariser, Sentiment, and JSON Parser. Each one maps to a real concept in SAP\'s AI Foundation course.',
    icon: '[ ]',
    color: '#0070F3',
    tag: 'Step 1',
    tip: 'Try adding a Prompt Template → LLM Call to start.',
  },
  {
    title: 'Connect nodes to build a pipeline.',
    subtitle: 'The Canvas',
    body: 'Drag from the right side of one node to the left side of the next. That connection defines the execution order — output from one step becomes input to the next. Click any node to configure it in the right panel.',
    icon: '◈',
    color: '#00D4AA',
    tag: 'Step 2',
    tip: 'Nodes execute left to right in the order you connect them.',
  },
  {
    title: 'Type your input and hit Execute.',
    subtitle: 'Running the Pipeline',
    body: 'Click ▶ Run in the top bar, type your input text, and press Execute. Each step runs in sequence. For LLM steps you\'ll see tokens stream in live. The result panel shows the exact input and output for every step so you can see what happened at each stage.',
    icon: '▶',
    color: '#00D4AA',
    tag: 'Step 3',
    tip: 'Stream mode is on by default — uncheck it for faster batch runs.',
  },
  {
    title: 'Load a template to skip the setup.',
    subtitle: 'Enterprise Templates',
    body: 'Click Templates in the top bar to browse 12 pre-built pipelines — customer support triage, legal clause analysis, CV screening, GDPR compliance, invoice extraction, and more. One click loads the full pipeline onto the canvas, ready to run.',
    icon: '⊞',
    color: '#A78BFA',
    tag: 'Step 4',
    tip: 'Templates are a good way to see how complex pipelines are structured.',
  },
  {
    title: 'Save your work. Come back to it.',
    subtitle: 'Saving & History',
    body: 'Click Save (↑) to name your pipeline and add tags. It saves instantly to your browser — no account needed. Every run is logged in the History page with the full step trace, timing, and output. You can reload any saved pipeline with one click.',
    icon: '↑',
    color: '#10B981',
    tag: 'Step 5',
    tip: 'Use the Compare page to run the same prompt on two models side by side.',
  },
]

export function Tutorial({ onComplete }: TutorialProps) {
  const [step, setStep] = useState(0)
  const [exiting, setExiting] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  const next = () => {
    if (isLast) { finish(); return }
    setStep(s => s + 1)
  }

  const back = () => setStep(s => Math.max(0, s - 1))

  const finish = () => {
    setExiting(true)
    localStorage.setItem('sap_studio_toured', '1')
    setTimeout(onComplete, 200)
  }

  const mono = { fontFamily: "'IBM Plex Mono', monospace" }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(4,6,12,0.82)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: exiting ? 0 : 1,
      transition: 'opacity 0.2s ease',
      ...mono,
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#0A0E1A',
        border: `1px solid #1E2B3C`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
      }}>

        {/* Progress bar */}
        <div style={{ height: 2, background: '#111827' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: `linear-gradient(90deg, #0070F3, #00D4AA)`,
            transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>

        {/* Step tag */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: 10, color: current.color,
            textTransform: 'uppercase', letterSpacing: '0.18em',
            padding: '3px 8px', borderRadius: 4,
            background: current.color + '18',
            border: `1px solid ${current.color}33`,
          }}>
            {current.tag}
          </span>
          <button onClick={finish} style={{
            fontSize: 11, color: '#2A3A50', background: 'transparent',
            border: 'none', cursor: 'pointer', padding: '2px 6px',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#5A7A90')}
            onMouseLeave={e => (e.currentTarget.style.color = '#2A3A50')}>
            skip
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 24px 24px' }}>

          {/* Icon + title */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: current.color + '18',
              border: `1px solid ${current.color}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: current.color, fontWeight: 700,
            }}>
              {current.icon}
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#3A4A60', margin: '0 0 5px' }}>{current.subtitle}</p>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.25 }}>
                {current.title}
              </h2>
            </div>
          </div>

          {/* Body */}
          <p style={{ fontSize: 12.5, lineHeight: 1.8, color: '#4A6A80', margin: '0 0 16px' }}>
            {current.body}
          </p>

          {/* Tip */}
          {current.tip && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 20,
              background: '#0D1420', border: '1px solid #1A2535',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <span style={{ color: '#00D4AA', fontSize: 11, flexShrink: 0, marginTop: 1 }}>→</span>
              <p style={{ fontSize: 11, color: '#3A5A70', margin: 0, lineHeight: 1.6 }}>{current.tip}</p>
            </div>
          )}

          {/* Dot navigation */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => setStep(i)} style={{
                width: i === step ? 18 : 6, height: 6, borderRadius: 3,
                background: i === step ? current.color : i < step ? '#1E3A4A' : '#131C28',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.25s ease',
              }} />
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button onClick={back} style={{
                flex: 1, padding: '10px', borderRadius: 7, fontSize: 12,
                background: 'transparent', color: '#3A5A70',
                border: '1px solid #1A2535', cursor: 'pointer', ...mono,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2A3A50'; e.currentTarget.style.color = '#7A9AB0' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A2535'; e.currentTarget.style.color = '#3A5A70' }}>
                ← Back
              </button>
            )}
            <button onClick={next} style={{
              flex: 2, padding: '10px', borderRadius: 7, fontSize: 12, fontWeight: 700,
              background: isLast
                ? 'linear-gradient(135deg, #0070F3, #00D4AA)'
                : current.color + '20',
              color: isLast ? '#fff' : current.color,
              border: `1px solid ${isLast ? 'transparent' : current.color + '40'}`,
              cursor: 'pointer', ...mono,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { if (!isLast) e.currentTarget.style.background = current.color + '30' }}
              onMouseLeave={e => { if (!isLast) e.currentTarget.style.background = current.color + '20' }}>
              {isLast ? '✓  Start Building' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
