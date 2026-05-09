'use client'

import { useState, useEffect, useRef } from 'react'

interface TutorialProps {
  onComplete: () => void
}

interface Rect { top: number; left: number; width: number; height: number }

const STEPS = [
  {
    target: null,
    title: "You're all set.",
    subtitle: 'Welcome to SAP AI Orchestration Studio',
    body: "Your API key is saved. Here's a quick tour of the studio — 8 steps, 60 seconds. You'll know exactly where everything is and how to use it.",
    tip: null,
    color: '#0070F3',
    icon: '⬡',
    placement: 'center' as const,
  },
  {
    target: 'palette',
    title: 'The Module Palette',
    subtitle: 'Left sidebar',
    body: 'Every AI module lives here. Click any one to add it to the canvas. You have 9 modules — from LLM calls to translation to JSON extraction. Each one maps to a real concept in SAP\'s AI Foundation Orchestration Service.',
    tip: 'Start with Prompt Template → LLM Call for your first pipeline.',
    color: '#0070F3',
    icon: '[ ]',
    placement: 'right' as const,
  },
  {
    target: 'canvas',
    title: 'The Pipeline Canvas',
    subtitle: 'Main area',
    body: 'Nodes appear here when you add them. Drag from the right handle of one node to the left handle of the next to connect them. The connection order is the execution order — data flows left to right.',
    tip: 'Click any node on the canvas to open its config panel on the right.',
    color: '#00D4AA',
    icon: '◈',
    placement: 'center' as const,
  },
  {
    target: 'btn-run',
    title: 'Run Your Pipeline',
    subtitle: 'Top bar → Run button',
    body: 'Click Run, type your input, and hit Execute. Each step runs in sequence. LLM steps stream tokens live so you can watch the output build in real time. The panel shows input → output for every step.',
    tip: 'The streaming checkbox lets you toggle between live streaming and batch mode.',
    color: '#00D4AA',
    icon: '▶',
    placement: 'bottom' as const,
  },
  {
    target: 'btn-templates',
    title: 'Enterprise Templates',
    subtitle: 'Top bar → Templates',
    body: '12 pre-built pipelines ready to run — customer support triage, legal clause analysis, CV screening, GDPR compliance, invoice extraction, and more. Click Templates, pick one, and it loads onto the canvas instantly.',
    tip: 'Templates are the fastest way to see how a real pipeline is structured.',
    color: '#A78BFA',
    icon: '⊞',
    placement: 'bottom' as const,
  },
  {
    target: 'btn-save',
    title: 'Save Your Pipeline',
    subtitle: 'Top bar → Save (↑)',
    body: 'Give your pipeline a name, description, and tags. It saves to your browser instantly — no account needed. If you\'ve connected Supabase, it syncs to the cloud too.',
    tip: 'Cmd+S (or Ctrl+S on Windows) triggers a quick save.',
    color: '#10B981',
    icon: '↑',
    placement: 'bottom' as const,
  },
  {
    target: 'btn-compare',
    title: 'Model Comparison',
    subtitle: 'Top bar → Compare',
    body: 'Run the same prompt against two models side by side. LLaMA 70B vs LLaMA 8B, Qwen vs Gemma — see speed and quality differences at a glance. Useful for picking the right model for your pipeline.',
    tip: 'Inspired by SAP\'s Generative AI Hub Model Leaderboard.',
    color: '#F97316',
    icon: '⇌',
    placement: 'bottom' as const,
  },
  {
    target: 'btn-history',
    title: 'Pipeline History',
    subtitle: 'Top bar → History',
    body: 'Every run is logged here with the full step trace, timing, and output. Browse all your saved pipelines, see run counts and success rates, and reload any pipeline straight to the canvas.',
    tip: 'The stats dashboard shows total runs, success rate, and average duration.',
    color: '#EC4899',
    icon: '◷',
    placement: 'bottom' as const,
  },
]

const PAD = 10 // padding around spotlight

export function Tutorial({ onComplete }: TutorialProps) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const [cardPos, setCardPos] = useState<{ top: number; left: number } | null>(null)
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  // Find target element and compute positions
  useEffect(() => {
    setVisible(false)
    const timer = setTimeout(() => {
      if (!current.target) {
        setRect(null)
        setCardPos(null)
        setVisible(true)
        return
      }

      const el = document.querySelector(`[data-tour="${current.target}"]`) as HTMLElement
      if (!el) { setRect(null); setCardPos(null); setVisible(true); return }

      const r = el.getBoundingClientRect()
      const spotlight = {
        top: r.top - PAD,
        left: r.left - PAD,
        width: r.width + PAD * 2,
        height: r.height + PAD * 2,
      }
      setRect(spotlight)

      // Position card based on placement
      const cardW = 400
      const cardH = 320
      const vw = window.innerWidth
      const vh = window.innerHeight
      let top = 0, left = 0

      if (current.placement === 'right') {
        top = Math.min(r.top, vh - cardH - 20)
        left = r.right + PAD + 16
        if (left + cardW > vw) left = r.left - cardW - 16
      } else if (current.placement === 'bottom') {
        top = r.bottom + PAD + 16
        left = Math.min(Math.max(r.left + r.width / 2 - cardW / 2, 16), vw - cardW - 16)
        if (top + cardH > vh) top = r.top - cardH - 16
      } else {
        top = vh / 2 - cardH / 2
        left = vw / 2 - cardW / 2
      }

      setCardPos({ top, left })
      setVisible(true)
    }, 120)
    return () => clearTimeout(timer)
  }, [step])

  const go = (dir: 1 | -1) => {
    const next = step + dir
    if (next < 0 || next >= STEPS.length) return
    setStep(next)
  }

  const finish = () => {
    setExiting(true)
    localStorage.setItem('sap_studio_toured', '1')
    setTimeout(onComplete, 250)
  }

  const skip = finish

  const mono = { fontFamily: "'IBM Plex Mono', monospace" }
  const W = window?.innerWidth || 1200
  const H = window?.innerHeight || 800

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      opacity: exiting ? 0 : 1,
      transition: 'opacity 0.2s ease',
      pointerEvents: exiting ? 'none' : 'all',
    }}>

      {/* SVG overlay with spotlight cutout */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left} y={rect.top}
                width={rect.width} height={rect.height}
                rx={8} fill="black"
                style={{ transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)' }}
              />
            )}
          </mask>
        </defs>
        {/* Dark overlay with hole cut out */}
        <rect width="100%" height="100%"
          fill="rgba(4,7,15,0.82)"
          mask="url(#spotlight-mask)"
        />
        {/* Spotlight glow border */}
        {rect && (
          <rect
            x={rect.left} y={rect.top}
            width={rect.width} height={rect.height}
            rx={8} fill="none"
            stroke={current.color}
            strokeWidth="1.5"
            style={{
              filter: `drop-shadow(0 0 8px ${current.color}88)`,
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        )}
      </svg>

      {/* Arrow connector line from spotlight to card */}
      {rect && cardPos && current.placement !== 'center' && visible && (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {(() => {
            const cx = rect.left + rect.width / 2
            const cy = rect.top + rect.height / 2
            const cardCx = cardPos.left + 200
            const cardCy = current.placement === 'bottom' ? cardPos.top : cardPos.top + 160
            return (
              <line
                x1={cx} y1={current.placement === 'bottom' ? rect.top + rect.height : cy}
                x2={cardCx} y2={cardCy}
                stroke={current.color + '44'} strokeWidth="1" strokeDasharray="4 4"
              />
            )
          })()}
        </svg>
      )}

      {/* Tour card */}
      {visible && (
        <div
          ref={cardRef}
          style={{
            position: 'fixed',
            top: cardPos ? cardPos.top : '50%',
            left: cardPos ? cardPos.left : '50%',
            transform: cardPos ? 'none' : 'translate(-50%,-50%)',
            width: 400,
            background: '#08101E',
            border: `1px solid ${current.color}55`,
            borderRadius: 12,
            boxShadow: `0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px ${current.color}22`,
            overflow: 'hidden',
            opacity: visible ? 1 : 0,
            transform: cardPos
              ? (visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)')
              : (visible ? 'translate(-50%,-50%) scale(1)' : 'translate(-50%,-50%) scale(0.97)'),
            transition: 'opacity 0.2s ease, transform 0.2s ease, top 0.3s cubic-bezier(0.4,0,0.2,1), left 0.3s cubic-bezier(0.4,0,0.2,1)',
            ...mono,
          }}
        >
          {/* Progress bar */}
          <div style={{ height: 2, background: '#0D1520' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: `linear-gradient(90deg, #0070F3, ${current.color})`,
              transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>

          {/* Header */}
          <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: current.color + '18', border: `1px solid ${current.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: current.color, fontWeight: 700,
              }}>
                {current.icon}
              </div>
              <div>
                <p style={{ fontSize: 10, color: '#2A3A50', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  {current.subtitle}
                </p>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                  {current.title}
                </h2>
              </div>
            </div>
            <button onClick={skip} style={{
              fontSize: 10, color: '#1E2B3C', background: 'transparent',
              border: 'none', cursor: 'pointer', padding: '3px 6px', borderRadius: 4,
              ...mono,
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#3A5A70')}
              onMouseLeave={e => (e.currentTarget.style.color = '#1E2B3C')}>
              skip
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '14px 20px 18px' }}>
            <p style={{ fontSize: 12, lineHeight: 1.8, color: '#4A6880', margin: '0 0 12px' }}>
              {current.body}
            </p>

            {current.tip && (
              <div style={{
                padding: '9px 12px', borderRadius: 7, marginBottom: 16,
                background: '#0D1824', border: `1px solid ${current.color}22`,
                display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <span style={{ color: current.color, fontSize: 10, flexShrink: 0, marginTop: 2 }}>→</span>
                <p style={{ fontSize: 11, color: '#3A5870', margin: 0, lineHeight: 1.6 }}>{current.tip}</p>
              </div>
            )}

            {/* Step dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 14 }}>
              {STEPS.map((s, i) => (
                <button key={i} onClick={() => setStep(i)} style={{
                  width: i === step ? 16 : 5, height: 5, borderRadius: 3, padding: 0,
                  background: i === step ? current.color : i < step ? current.color + '55' : '#131C2A',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }} />
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              {step > 0 && (
                <button onClick={() => go(-1)} style={{
                  flex: 1, padding: '9px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                  background: 'transparent', color: '#2A3A50',
                  border: '1px solid #1A2535', cursor: 'pointer', ...mono,
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#5A7A90'; e.currentTarget.style.borderColor = '#2A3A50' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#2A3A50'; e.currentTarget.style.borderColor = '#1A2535' }}>
                  ← Back
                </button>
              )}
              <button onClick={isLast ? finish : () => go(1)} style={{
                flex: 2, padding: '9px', borderRadius: 7, fontSize: 11, fontWeight: 700,
                background: isLast
                  ? 'linear-gradient(135deg, #0070F3, #00D4AA)'
                  : current.color + '20',
                color: isLast ? '#fff' : current.color,
                border: `1px solid ${isLast ? 'transparent' : current.color + '40'}`,
                cursor: 'pointer', ...mono,
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => { if (!isLast) e.currentTarget.style.background = current.color + '30' }}
                onMouseLeave={e => { if (!isLast) e.currentTarget.style.background = current.color + '20' }}>
                {isLast ? '✓  Start Building' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}