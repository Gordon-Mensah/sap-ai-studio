'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const MODULES = [
  { icon: '[ ]', label: 'Prompt Template', desc: 'Variable injection', color: '#0070F3' },
  { icon: '◈',   label: 'LLM Call',         desc: 'Groq LLaMA 70B',    color: '#00D4AA' },
  { icon: '⊕',   label: 'Grounding',        desc: 'Doc-grounded RAG',  color: '#A78BFA' },
  { icon: '◫',   label: 'Data Masking',     desc: 'Auto-mask PII',     color: '#F59E0B' },
  { icon: '⊘',   label: 'Content Filter',   desc: 'Safety guardrails', color: '#EF4444' },
  { icon: '⇄',   label: 'Translation',      desc: '15 languages',      color: '#10B981' },
  { icon: '≡',   label: 'Summariser',       desc: 'TL;DR + bullets',   color: '#F97316' },
  { icon: '◉',   label: 'Sentiment',        desc: 'Emotion scoring',   color: '#EC4899' },
  { icon: '{ }', label: 'JSON Parser',      desc: 'Structured output', color: '#8B5CF6' },
]

const PIPELINE_DEMO = [
  { icon: '◫', label: 'Mask PII',       color: '#F59E0B', x: 0 },
  { icon: '⊕', label: 'Ground',         color: '#A78BFA', x: 1 },
  { icon: '◈', label: 'LLM Call',       color: '#00D4AA', x: 2 },
  { icon: '⇄', label: 'Translate → DE', color: '#10B981', x: 3 },
]

const SAP_CONCEPTS = [
  { sap: 'Orchestration Service pipeline', studio: 'Visual canvas with ordered execution' },
  { sap: 'Templating module',              studio: 'Prompt Template node + variable injection' },
  { sap: 'Grounding module',              studio: 'Grounding node with document context' },
  { sap: 'Data masking module',           studio: 'Masking node with PII regex patterns' },
  { sap: 'Content filtering',             studio: 'Filter node with configurable blocklist' },
  { sap: 'Generative AI Hub leaderboard', studio: '/compare — side-by-side model comparison' },
]

export default function LandingPage() {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [activeModule, setActiveModule] = useState(0)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setActiveModule(prev => (prev + 1) % MODULES.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  const mono = { fontFamily: "'IBM Plex Mono', monospace" }

  return (
    <div style={{ background: '#080B14', color: '#fff', minHeight: '100vh', overflowY: 'auto', overflowX: 'hidden', ...mono }}>

      {/* ── Nav ────────────────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,11,20,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1A2333', padding: '0 40px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #0070F3, #00D4AA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>⬡</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>SAP AI Orchestration Studio</span>
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#0070F322', color: '#0070F3', border: '1px solid #0070F333' }}>v0.2</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="https://github.com/Gordon-Mensah/sap-ai-studio" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, color: '#3A5A70', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#3A5A70')}>
            GitHub ↗
          </a>
          <button onClick={() => router.push('/studio')}
            style={{ fontSize: 11, fontWeight: 600, padding: '6px 16px', borderRadius: 6, background: 'linear-gradient(135deg, #0070F3, #00D4AA)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Launch Studio →
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section ref={heroRef} style={{ padding: '100px 40px 80px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: '#00D4AA11', border: '1px solid #00D4AA33', marginBottom: 36 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D4AA', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, color: '#00D4AA', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live · Open Source · Free</span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, lineHeight: 1.05, margin: '0 0 24px', letterSpacing: '-0.02em' }}>
          Visual AI Pipeline Builder<br />
          <span style={{ background: 'linear-gradient(135deg, #0070F3, #00D4AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Inspired by SAP
          </span>
        </h1>

        <p style={{ fontSize: 16, lineHeight: 1.7, color: '#5A7A90', maxWidth: 580, margin: '0 auto 48px' }}>
          Drag, drop, and connect AI modules on a visual canvas.
          Every module mirrors a concept from SAP's AI Foundation Orchestration Service.
          No code required to run — just your Groq API key.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <button onClick={() => router.push('/studio')}
            style={{ fontSize: 13, fontWeight: 700, padding: '14px 32px', borderRadius: 8, background: 'linear-gradient(135deg, #0070F3, #00D4AA)', color: '#fff', border: 'none', cursor: 'pointer', letterSpacing: '0.02em' }}>
            ▶ Launch Studio — Free
          </button>
          <a href="https://github.com/Gordon-Mensah/sap-ai-studio" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, fontWeight: 600, padding: '14px 32px', borderRadius: 8, background: 'transparent', color: '#7A9AB0', border: '1px solid #1A2333', cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            ⭐ Star on GitHub
          </a>
        </div>

        {/* Pipeline demo */}
        <div style={{ background: '#090D1A', border: '1px solid #1A2333', borderRadius: 12, padding: '28px 24px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 10, color: '#2A3A50', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 20 }}>Example pipeline</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 4 }}>
            {PIPELINE_DEMO.map((node, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ padding: '10px 14px', borderRadius: 8, background: node.color + '15', border: `1px solid ${node.color}44`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 90 }}>
                  <span style={{ fontSize: 14, color: node.color, fontWeight: 700 }}>{node.icon}</span>
                  <span style={{ fontSize: 10, color: '#7A9AB0' }}>{node.label}</span>
                </div>
                {i < PIPELINE_DEMO.length - 1 && (
                  <span style={{ color: '#00D4AA', fontSize: 14, margin: '0 2px' }}>→</span>
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#2A3A50', marginTop: 16 }}>
            PII masked → grounded to your docs → LLM processes → translated to German
          </p>
        </div>
      </section>

      {/* ── Module grid ────────────────────────────────────────────── */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 10, color: '#3A4A60', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 12 }}>Pipeline Modules</p>
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>9 modules. Drag. Connect. Run.</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {MODULES.map((mod, i) => (
            <div key={i}
              style={{ padding: '20px', borderRadius: 10, background: activeModule === i ? mod.color + '12' : '#090D1A', border: `1px solid ${activeModule === i ? mod.color + '55' : '#1A2333'}`, transition: 'all 0.4s ease', display: 'flex', alignItems: 'center', gap: 16 }}
              onMouseEnter={e => { e.currentTarget.style.background = mod.color + '12'; e.currentTarget.style.borderColor = mod.color + '55' }}
              onMouseLeave={e => { e.currentTarget.style.background = activeModule === i ? mod.color + '12' : '#090D1A'; e.currentTarget.style.borderColor = activeModule === i ? mod.color + '55' : '#1A2333' }}>
              <span style={{ fontSize: 22, color: mod.color, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{mod.icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: '0 0 3px' }}>{mod.label}</p>
                <p style={{ fontSize: 11, color: '#3A5A70', margin: 0 }}>{mod.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features row ───────────────────────────────────────────── */}
      <section style={{ padding: '80px 40px', borderTop: '1px solid #1A2333', borderBottom: '1px solid #1A2333' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 40 }}>
          {[
            {
              icon: '⬡',
              color: '#0070F3',
              title: 'Visual Pipeline Canvas',
              body: 'React Flow canvas. Drag nodes from the palette, connect them with edges, configure each step. See your entire AI workflow at a glance.',
            },
            {
              icon: '▶',
              color: '#00D4AA',
              title: 'Live Streaming Execution',
              body: 'SSE streaming — watch tokens appear in real time as each step runs. Step-by-step trace shows input → output → duration for every node.',
            },
            {
              icon: '⊞',
              color: '#A78BFA',
              title: '12 Enterprise Templates',
              body: 'Pre-built pipelines for support, legal, HR, compliance, e-commerce, and finance. One click to load and run.',
            },
            {
              icon: '⇌',
              color: '#F97316',
              title: 'Model Comparison',
              body: 'Run the same prompt against two models side by side. LLaMA 70B vs 8B vs Qwen vs Gemma. See speed and quality differences instantly.',
            },
            {
              icon: '◷',
              color: '#EC4899',
              title: 'Pipeline History',
              body: 'Every run logged. Browse history by pipeline, expand any run to see the full step trace, input, and output. Stats dashboard included.',
            },
            {
              icon: '↑',
              color: '#10B981',
              title: 'Save, Tag & Reload',
              body: 'Name your pipelines, add tags, save to localStorage or Supabase. Load any saved pipeline back to the canvas with one click.',
            },
          ].map((f, i) => (
            <div key={i}>
              <div style={{ fontSize: 20, color: f.color, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 10px', color: '#fff' }}>{f.title}</h3>
              <p style={{ fontSize: 12, lineHeight: 1.7, color: '#3A5A70', margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SAP mapping table ──────────────────────────────────────── */}
      <section style={{ padding: '80px 40px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 10, color: '#3A4A60', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 12 }}>Why this exists</p>
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 16px' }}>Every module = an SAP concept</h2>
          <p style={{ fontSize: 13, color: '#3A5A70', maxWidth: 500, margin: '0 auto' }}>
            Built while studying SAP AI Foundation. Every feature in the studio maps directly to a concept in SAP's Orchestration Service specification.
          </p>
        </div>

        <div style={{ border: '1px solid #1A2333', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#090D1A', borderBottom: '1px solid #1A2333', padding: '12px 24px' }}>
            <p style={{ fontSize: 10, color: '#3A4A60', textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>SAP AI Foundation Concept</p>
            <p style={{ fontSize: 10, color: '#3A4A60', textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>Studio Implementation</p>
          </div>
          {SAP_CONCEPTS.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '14px 24px', borderBottom: i < SAP_CONCEPTS.length - 1 ? '1px solid #111827' : 'none', background: i % 2 === 0 ? 'transparent' : '#090D1A08' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0070F308')}
              onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : '#090D1A08')}>
              <p style={{ fontSize: 12, color: '#5A7A90', margin: 0 }}>{row.sap}</p>
              <p style={{ fontSize: 12, color: '#00D4AA', margin: 0 }}>{row.studio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tech stack ─────────────────────────────────────────────── */}
      <section style={{ padding: '60px 40px', borderTop: '1px solid #1A2333' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 10, color: '#3A4A60', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 24 }}>Tech Stack</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {['Next.js 14', 'TypeScript', 'React Flow', 'Groq LLaMA 3.3 70B', 'Supabase', 'Tailwind CSS', 'Vercel'].map(t => (
              <span key={t} style={{ fontSize: 11, padding: '6px 14px', borderRadius: 999, background: '#0D1420', color: '#5A7A90', border: '1px solid #1A2333' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────── */}
      <section style={{ padding: '100px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, margin: '0 0 16px', lineHeight: 1.1 }}>
            Build your first<br />
            <span style={{ background: 'linear-gradient(135deg, #0070F3, #00D4AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI pipeline now
            </span>
          </h2>
          <p style={{ fontSize: 13, color: '#3A5A70', marginBottom: 36, lineHeight: 1.7 }}>
            Free. Open source. No account required.<br />Just a Groq API key — free at console.groq.com.
          </p>
          <button onClick={() => router.push('/studio')}
            style={{ fontSize: 14, fontWeight: 700, padding: '16px 40px', borderRadius: 8, background: 'linear-gradient(135deg, #0070F3, #00D4AA)', color: '#fff', border: 'none', cursor: 'pointer', letterSpacing: '0.02em' }}>
            ▶ Launch Studio — It&apos;s Free
          </button>
          <p style={{ fontSize: 11, color: '#2A3A50', marginTop: 20 }}>
            or{' '}
            <a href="https://github.com/Gordon-Mensah/sap-ai-studio" target="_blank" rel="noopener noreferrer"
              style={{ color: '#3A5A70', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#3A5A70')}>
              view the source on GitHub ↗
            </a>
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #1A2333', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: 4, background: 'linear-gradient(135deg, #0070F3, #00D4AA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>⬡</div>
          <span style={{ fontSize: 11, color: '#2A3A50' }}>SAP AI Orchestration Studio — MIT License</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: 'Studio', href: '/studio' },
            { label: 'Templates', href: '/templates' },
            { label: 'Compare', href: '/compare' },
            { label: 'History', href: '/history' },
            { label: 'GitHub', href: 'https://github.com/Gordon-Mensah/sap-ai-studio' },
          ].map(link => (
            <a key={link.label} href={link.href}
              style={{ fontSize: 11, color: '#2A3A50', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#2A3A50')}>
              {link.label}
            </a>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
