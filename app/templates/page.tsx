'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TEMPLATES = [
  // ── Existing 6 ──────────────────────────────────────────────────────────
  {
    id: 'email-classifier',
    name: 'Email Classifier',
    category: 'Enterprise',
    description: 'Automatically categorise incoming emails by type and urgency. Masks PII before processing, filters harmful content, then classifies with AI.',
    useCase: 'Customer support, inbox management, ticket routing',
    steps: [
      { id: '1', type: 'masking', name: 'Mask PII', config: {} },
      { id: '2', type: 'filter', name: 'Content Filter', config: { blocklist: [] } },
      { id: '3', type: 'template', name: 'Classification Template', config: { template: 'Classify the following email into one of these categories: BILLING, TECHNICAL_SUPPORT, COMPLAINT, INQUIRY, SPAM. Also rate urgency as LOW, MEDIUM, or HIGH.\n\nEmail: {{input}}\n\nRespond in JSON format: {"category": "...", "urgency": "...", "summary": "..."}', variables: {} } },
      { id: '4', type: 'llm', name: 'LLM Classifier', config: { systemPrompt: 'You are an enterprise email classification system. Always respond with valid JSON only.', model: 'llama-3.3-70b-versatile' } },
    ],
    color: '#0070F3', icon: '[ ]',
  },
  {
    id: 'contract-analyser',
    name: 'Contract Analyser',
    category: 'Legal',
    description: 'Upload a contract document, then ask questions about it. The grounding module ensures AI answers only from the document — no hallucination.',
    useCase: 'Legal review, procurement, compliance',
    steps: [
      { id: '1', type: 'masking', name: 'Mask PII', config: {} },
      { id: '2', type: 'grounding', name: 'Contract Grounding', config: { document: 'Paste your contract text here before running.' } },
      { id: '3', type: 'llm', name: 'Contract Analyst', config: { systemPrompt: 'You are a senior legal analyst. Answer questions about the provided contract strictly based on its content. Identify risk clauses, payment terms, termination conditions, and liabilities. Be specific and cite the relevant sections.', model: 'llama-3.3-70b-versatile' } },
    ],
    color: '#A78BFA', icon: '⊕',
  },
  {
    id: 'product-description',
    name: 'Product Description Generator',
    category: 'E-Commerce',
    description: 'Transform raw product data into polished, SEO-friendly product descriptions using prompt templating and LLM generation.',
    useCase: 'E-commerce, catalogue management, marketing',
    steps: [
      { id: '1', type: 'template', name: 'Product Template', config: { template: 'Generate a professional, SEO-optimised product description for the following product.\n\nProduct data: {{input}}\n\nBrand tone: {{tone}}\nTarget audience: {{audience}}\n\nWrite a compelling 3-paragraph description with a headline, key benefits, and a call to action.', variables: { tone: 'professional and modern', audience: 'business professionals' } } },
      { id: '2', type: 'llm', name: 'Description Generator', config: { systemPrompt: 'You are a world-class e-commerce copywriter. Write compelling, accurate product descriptions that convert browsers into buyers.', model: 'llama-3.3-70b-versatile' } },
      { id: '3', type: 'translation', name: 'Translate Output', config: { targetLanguage: 'German' } },
    ],
    color: '#10B981', icon: '⇄',
  },
  {
    id: 'customer-support',
    name: 'Customer Support Agent',
    category: 'Support',
    description: 'A grounded customer support pipeline that answers questions strictly from your knowledge base, with PII masking and content filtering built in.',
    useCase: 'Help desk, FAQ automation, support ticket deflection',
    steps: [
      { id: '1', type: 'masking', name: 'Mask Customer PII', config: {} },
      { id: '2', type: 'filter', name: 'Content Filter', config: { blocklist: ['refund', 'lawsuit', 'legal action'] } },
      { id: '3', type: 'grounding', name: 'Knowledge Base', config: { document: 'Paste your product knowledge base or FAQ document here.' } },
      { id: '4', type: 'llm', name: 'Support Agent', config: { systemPrompt: 'You are a helpful and professional customer support agent. Answer the customer query based strictly on the provided knowledge base. If the answer is not in the knowledge base, politely say you will escalate to a human agent.', model: 'llama-3.3-70b-versatile' } },
    ],
    color: '#F59E0B', icon: '◫',
  },
  {
    id: 'gdpr-sanitiser',
    name: 'GDPR Data Sanitiser',
    category: 'Compliance',
    description: 'Strip all personally identifiable information from documents before processing or storing. Essential for GDPR compliance in enterprise systems.',
    useCase: 'GDPR compliance, data sanitisation, audit preparation',
    steps: [
      { id: '1', type: 'masking', name: 'PII Masking', config: {} },
      { id: '2', type: 'filter', name: 'Sensitive Data Filter', config: { blocklist: ['password', 'secret', 'api_key', 'token', 'credential'] } },
      { id: '3', type: 'llm', name: 'Sanitisation Report', config: { systemPrompt: 'You are a GDPR compliance officer. Review the sanitised text and confirm what types of data were masked. List the categories of PII found and confirm the text is now safe for processing.', model: 'llama-3.1-8b-instant' } },
    ],
    color: '#EF4444', icon: '⊘',
  },
  {
    id: 'multilingual-report',
    name: 'Multilingual Report Generator',
    category: 'Enterprise',
    description: 'Generate a structured business report from raw data, then automatically translate it for international distribution.',
    useCase: 'International reporting, executive summaries, global communications',
    steps: [
      { id: '1', type: 'template', name: 'Report Template', config: { template: 'Generate a structured business report from the following data:\n\n{{input}}\n\nReport type: {{report_type}}\nAudience: {{audience}}\n\nInclude: Executive Summary, Key Findings, Recommendations, and Next Steps.', variables: { report_type: 'quarterly performance', audience: 'executive team' } } },
      { id: '2', type: 'llm', name: 'Report Generator', config: { systemPrompt: 'You are a senior business analyst. Generate clear, professional business reports with actionable insights.', model: 'llama-3.3-70b-versatile' } },
      { id: '3', type: 'translation', name: 'Translate to German', config: { targetLanguage: 'German' } },
    ],
    color: '#00D4AA', icon: '◈',
  },

  // ── New 6: Summariser, Sentiment, JSON Parser ────────────────────────────
  {
    id: 'customer-feedback-analyser',
    name: 'Customer Feedback Analyser',
    category: 'Analytics',
    description: 'Mask customer PII, analyse sentiment with emotion detection, then produce a bullet-point summary of key themes. Perfect for NPS and review pipelines.',
    useCase: 'NPS analysis, review processing, VOC programmes',
    steps: [
      { id: '1', type: 'masking', name: 'Mask PII', config: {} },
      { id: '2', type: 'sentiment', name: 'Sentiment Analysis', config: { model: 'llama-3.1-8b-instant' } },
      { id: '3', type: 'summariser', name: 'Theme Summary', config: { style: 'bullet', maxPoints: 5, model: 'llama-3.3-70b-versatile' } },
    ],
    color: '#EC4899', icon: '◉',
  },
  {
    id: 'invoice-extractor',
    name: 'Invoice Data Extractor',
    category: 'Finance',
    description: 'Extract structured invoice fields (vendor, amount, date, line items) from raw invoice text using AI-powered JSON parsing. Ready for ERP ingestion.',
    useCase: 'Accounts payable, SAP ERP integration, invoice automation',
    steps: [
      { id: '1', type: 'masking', name: 'Mask Sensitive Data', config: {} },
      { id: '2', type: 'json-parser', name: 'Extract Invoice Fields', config: { schema: '{\n  "vendor_name": "string",\n  "invoice_number": "string",\n  "invoice_date": "string",\n  "due_date": "string",\n  "subtotal": "number",\n  "tax": "number",\n  "total_amount": "number",\n  "currency": "string",\n  "line_items": [{"description": "string", "quantity": "number", "unit_price": "number"}]\n}', model: 'llama-3.3-70b-versatile' } },
    ],
    color: '#8B5CF6', icon: '{ }',
  },
  {
    id: 'research-summariser',
    name: 'Research & Meeting Summariser',
    category: 'Productivity',
    description: 'Paste a long document, transcript, or research paper. Get an executive summary, then a TL;DR — two levels of compression in one pipeline run.',
    useCase: 'Meeting notes, research digests, briefing documents',
    steps: [
      { id: '1', type: 'summariser', name: 'Executive Summary', config: { style: 'executive', maxPoints: 5, model: 'llama-3.3-70b-versatile' } },
      { id: '2', type: 'summariser', name: 'TL;DR', config: { style: 'tldr', maxPoints: 2, model: 'llama-3.1-8b-instant' } },
    ],
    color: '#F97316', icon: '≡',
  },
  {
    id: 'brand-sentiment-monitor',
    name: 'Brand Sentiment Monitor',
    category: 'Analytics',
    description: 'Filter brand-irrelevant content, score sentiment across positive/negative/neutral/mixed dimensions, then translate the result for international teams.',
    useCase: 'Social listening, brand monitoring, PR intelligence',
    steps: [
      { id: '1', type: 'filter', name: 'Relevance Filter', config: { blocklist: ['spam', 'bot', 'advertisement'] } },
      { id: '2', type: 'sentiment', name: 'Brand Sentiment Score', config: { model: 'llama-3.1-8b-instant' } },
      { id: '3', type: 'translation', name: 'Translate for HQ', config: { targetLanguage: 'German' } },
    ],
    color: '#EC4899', icon: '◉',
  },
  {
    id: 'content-moderation',
    name: 'Content Moderation Pipeline',
    category: 'Compliance',
    description: 'Enterprise-grade content safety: filter against a blocklist, analyse sentiment to catch hostile tone, then generate a structured moderation decision in JSON.',
    useCase: 'UGC platforms, community management, comment moderation',
    steps: [
      { id: '1', type: 'filter', name: 'Blocklist Filter', config: { blocklist: ['hate', 'threat', 'abuse', 'harassment'] } },
      { id: '2', type: 'sentiment', name: 'Tone Analysis', config: { model: 'llama-3.1-8b-instant' } },
      { id: '3', type: 'json-parser', name: 'Moderation Decision', config: { schema: '{\n  "decision": "approve|review|reject",\n  "risk_level": "low|medium|high",\n  "reason": "string",\n  "recommended_action": "string"\n}', model: 'llama-3.3-70b-versatile' } },
    ],
    color: '#EF4444', icon: '⊘',
  },
  {
    id: 'cv-screener',
    name: 'CV Screener & Scorer',
    category: 'HR',
    description: 'Mask candidate PII for bias-free screening, extract structured profile data, then summarise the candidate\'s fit into a bullet-point evaluation.',
    useCase: 'Talent acquisition, HR automation, candidate screening',
    steps: [
      { id: '1', type: 'masking', name: 'Anonymise CV', config: {} },
      { id: '2', type: 'json-parser', name: 'Extract Candidate Profile', config: { schema: '{\n  "years_experience": "number",\n  "skills": ["string"],\n  "education_level": "string",\n  "previous_roles": ["string"],\n  "languages": ["string"]\n}', model: 'llama-3.3-70b-versatile' } },
      { id: '3', type: 'summariser', name: 'Candidate Summary', config: { style: 'bullet', maxPoints: 5, model: 'llama-3.3-70b-versatile' } },
    ],
    color: '#0070F3', icon: '[ ]',
  },
]

const CATEGORIES = ['All', 'Enterprise', 'Legal', 'E-Commerce', 'Support', 'Compliance', 'Analytics', 'Finance', 'Productivity', 'HR']

const CATEGORY_COLORS: Record<string, string> = {
  Enterprise: '#0070F3',
  Legal: '#A78BFA',
  'E-Commerce': '#10B981',
  Support: '#F59E0B',
  Compliance: '#EF4444',
  Analytics: '#EC4899',
  Finance: '#8B5CF6',
  Productivity: '#F97316',
  HR: '#00D4AA',
}

const NEW_TEMPLATES = ['customer-feedback-analyser', 'invoice-extractor', 'research-summariser', 'brand-sentiment-monitor', 'content-moderation', 'cv-screener']

export default function TemplatesPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const loadTemplate = (template: typeof TEMPLATES[0]) => {
    localStorage.setItem('loadTemplate', JSON.stringify(template.steps))
    router.push('/')
  }

  const filtered = TEMPLATES.filter(t => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory
    const matchSearch = search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.useCase.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen" style={{ background: '#080B14', fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Header */}
      <div className="border-b px-8 py-4 flex items-center justify-between" style={{ borderColor: '#1A2333', background: '#090D1A' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #0070F3, #00D4AA)', color: '#fff' }}>
            ⬡
          </div>
          <span className="text-white text-sm font-semibold">SAP AI Orchestration Studio</span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#0070F322', color: '#0070F3', border: '1px solid #0070F333' }}>
            {TEMPLATES.length} templates
          </span>
        </div>
        <button onClick={() => router.push('/')} className="text-xs px-4 py-2 rounded transition-all"
          style={{ background: '#0070F322', color: '#0070F3', border: '1px solid #0070F344' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#0070F333' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#0070F322' }}>
          ← Back to Studio
        </button>
      </div>

      <div className="px-8 py-10 max-w-6xl mx-auto">
        {/* Title */}
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: '#3A4A60' }}>Pipeline Library</p>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Enterprise Templates</h1>
          <p className="text-sm" style={{ color: '#3A5A70' }}>
            Pre-built AI workflow pipelines inspired by SAP's Orchestration Service. Load any template into the studio with one click.
          </p>
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col gap-4 mb-8">
          <input
            className="w-full max-w-sm bg-[#0D1420] text-white text-xs px-4 py-2.5 rounded-lg border border-[#1A2333] outline-none"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            placeholder="Search templates, use cases…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: activeCategory === cat ? (CATEGORY_COLORS[cat] || '#00D4AA') + '22' : 'transparent',
                  border: `1px solid ${activeCategory === cat ? (CATEGORY_COLORS[cat] || '#00D4AA') + '55' : '#1A2333'}`,
                  color: activeCategory === cat ? (CATEGORY_COLORS[cat] || '#00D4AA') : '#3A4A60',
                }}>
                {cat}
                {cat !== 'All' && (
                  <span className="ml-1.5 text-[9px]" style={{ opacity: 0.6 }}>
                    {TEMPLATES.filter(t => t.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {search && (
          <p className="text-xs mb-5" style={{ color: '#3A4A60' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
          </p>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((template) => (
            <div key={template.id} className="rounded-xl p-5 flex flex-col gap-4 transition-all relative"
              style={{ background: '#090D1A', border: '1px solid #1A2333' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = template.color + '44'
                e.currentTarget.style.background = template.color + '08'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1A2333'
                e.currentTarget.style.background = '#090D1A'
              }}>

              {/* NEW badge */}
              {NEW_TEMPLATES.includes(template.id) && (
                <span className="absolute top-4 right-4 text-[9px] px-1.5 py-0.5 rounded font-semibold"
                  style={{ background: '#00D4AA22', color: '#00D4AA', border: '1px solid #00D4AA33' }}>
                  NEW
                </span>
              )}

              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ background: template.color + '22', color: template.color, border: `1px solid ${template.color}33` }}>
                  {template.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{template.name}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded"
                    style={{
                      background: (CATEGORY_COLORS[template.category] || '#666') + '22',
                      color: CATEGORY_COLORS[template.category] || '#666',
                      border: `1px solid ${(CATEGORY_COLORS[template.category] || '#666')}33`,
                    }}>
                    {template.category}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs leading-relaxed" style={{ color: '#3A5A70' }}>{template.description}</p>

              {/* Pipeline step chips */}
              <div className="flex items-center gap-1 flex-wrap">
                {template.steps.map((step, i) => {
                  const nodeColors: Record<string, string> = {
                    template: '#0070F3', llm: '#00D4AA', grounding: '#A78BFA', masking: '#F59E0B',
                    filter: '#EF4444', translation: '#10B981', summariser: '#F97316', sentiment: '#EC4899', 'json-parser': '#8B5CF6',
                  }
                  const c = nodeColors[step.type] || '#666'
                  return (
                    <div key={step.id} className="flex items-center gap-1">
                      <span className="text-[10px] px-2 py-0.5 rounded"
                        style={{ background: c + '18', color: c, border: `1px solid ${c}33` }}>
                        {step.type}
                      </span>
                      {i < template.steps.length - 1 && (
                        <span style={{ color: '#1A2333', fontSize: '10px' }}>→</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Use case */}
              <p className="text-[10px]" style={{ color: '#2A3A50' }}>↳ {template.useCase}</p>

              {/* Load button */}
              <button onClick={() => loadTemplate(template)}
                className="w-full py-2 rounded text-xs font-semibold transition-all mt-auto"
                style={{ background: template.color + '22', color: template.color, border: `1px solid ${template.color}44` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = template.color + '33' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = template.color + '22' }}>
                Load into Studio →
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20" style={{ color: '#2A3A50' }}>
            <p className="text-4xl mb-4">⬡</p>
            <p className="text-sm">No templates match your search.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t" style={{ borderColor: '#1A2333' }}>
          <p className="text-[11px] text-center" style={{ color: '#1E2B3C' }}>
            SAP AI Orchestration Studio — {TEMPLATES.length} templates across {CATEGORIES.length - 1} categories
          </p>
        </div>
      </div>
    </div>
  )
}
