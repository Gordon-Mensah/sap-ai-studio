import Groq from 'groq-sdk'

// NOTE: Check https://console.groq.com/docs/deprecations for current model IDs
const DEFAULT_MODEL = 'llama-3.3-70b-versatile'

export interface PipelineStep {
  id: string
  type: 'template' | 'grounding' | 'llm' | 'filter' | 'masking' | 'translation' | 'summariser' | 'sentiment' | 'json-parser'
  name: string
  config: Record<string, any>
}

export interface PipelineResult {
  stepId: string
  stepName: string
  type: string
  input: string
  output: string
  status: 'success' | 'error'
  duration: number
  metadata?: Record<string, any>
}

export async function executePipeline(
  steps: PipelineStep[],
  userInput: string,
  apiKey: string
): Promise<PipelineResult[]> {
  const groq = new Groq({ apiKey })
  const results: PipelineResult[] = []
  let currentInput = userInput

  for (const step of steps) {
    const start = Date.now()
    try {
      const { output, metadata } = await executeStep(step, currentInput, groq)
      const duration = Date.now() - start
      results.push({ stepId: step.id, stepName: step.name, type: step.type, input: currentInput, output, status: 'success', duration, metadata })
      currentInput = output
    } catch (error: any) {
      results.push({ stepId: step.id, stepName: step.name, type: step.type, input: currentInput, output: `Error: ${error.message}`, status: 'error', duration: Date.now() - start })
      break
    }
  }
  return results
}

async function executeStep(step: PipelineStep, input: string, groq: Groq): Promise<{ output: string; metadata?: Record<string, any> }> {
  switch (step.type) {
    case 'template':    return { output: applyTemplate(step.config.template || '', input, step.config.variables || {}) }
    case 'masking':     return { output: maskPII(input) }
    case 'filter':      return { output: filterContent(input, step.config.blocklist || []) }
    case 'grounding':   return { output: groundWithDocument(input, step.config.document || '') }
    case 'translation': return { output: await translateText(input, step.config.targetLanguage || 'English', groq) }
    case 'llm':         return { output: await callLLM(input, step.config.systemPrompt || '', step.config.model || DEFAULT_MODEL, groq) }
    case 'summariser':  return await summariseText(input, step.config.style || 'bullet', step.config.maxPoints || 5, step.config.model || DEFAULT_MODEL, groq)
    case 'sentiment':   return await analyseSentiment(input, step.config.model || 'llama-3.1-8b-instant', groq)
    case 'json-parser': return await extractJSON(input, step.config.schema || '', step.config.model || DEFAULT_MODEL, groq)
    default:            return { output: input }
  }
}

function applyTemplate(template: string, input: string, variables: Record<string, string>): string {
  let result = template
  result = result.replace('{{input}}', input)
  Object.entries(variables).forEach(([key, value]) => { result = result.replace(`{{${key}}}`, value) })
  return result
}

function maskPII(text: string): string {
  return text
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL MASKED]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE MASKED]')
    .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[CARD MASKED]')
    .replace(/\b[A-Z]{2}\d{6}[A-Z]?\b/g, '[ID MASKED]')
}

function filterContent(text: string, blocklist: string[]): string {
  const defaultBlocklist = ['spam', 'abuse', 'violence', 'illegal', ...blocklist]
  const lowerText = text.toLowerCase()
  for (const word of defaultBlocklist) {
    if (lowerText.includes(word.toLowerCase())) return `[CONTENT BLOCKED: Input contains restricted term "${word}"]`
  }
  return text
}

function groundWithDocument(input: string, document: string): string {
  if (!document) return input
  return `Answer using ONLY the provided document. No outside knowledge.\n\nDOCUMENT:\n${document}\n\nQUESTION: ${input}\n\nAnswer based strictly on the document above.`
}

async function translateText(text: string, targetLanguage: string, groq: Groq): Promise<string> {
  const c = await groq.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [{ role: 'system', content: `Translate to ${targetLanguage}. Return only the translated text.` }, { role: 'user', content: text }],
    max_tokens: 500,
  })
  return c.choices[0].message.content || text
}

async function callLLM(input: string, systemPrompt: string, model: string, groq: Groq): Promise<string> {
  const c = await groq.chat.completions.create({
    model,
    messages: [{ role: 'system', content: systemPrompt || 'You are a helpful AI assistant.' }, { role: 'user', content: input }],
    max_tokens: 1000,
  })
  return c.choices[0].message.content || ''
}

async function summariseText(text: string, style: string, maxPoints: number, model: string, groq: Groq): Promise<{ output: string; metadata?: Record<string, any> }> {
  const instructions: Record<string, string> = {
    bullet: `Summarise into exactly ${maxPoints} clear bullet points using "•". Be concise.`,
    paragraph: `Summarise into a concise paragraph of no more than ${maxPoints} sentences.`,
    tldr: `Write a TL;DR in 1-2 sentences maximum. Be extremely concise.`,
    executive: `Write an executive summary with: Key Findings, Implications, Recommended Actions. Max ${maxPoints} sentences total.`,
  }
  const c = await groq.chat.completions.create({
    model,
    messages: [{ role: 'system', content: instructions[style] || instructions.bullet }, { role: 'user', content: text }],
    max_tokens: 600,
  })
  const output = c.choices[0].message.content || ''
  const wIn = text.split(/\s+/).length
  const wOut = output.split(/\s+/).length
  return { output, metadata: { originalWords: wIn, summaryWords: wOut, reductionPercent: Math.max(0, Math.round((1 - wOut/wIn)*100)), style } }
}

async function analyseSentiment(text: string, model: string, groq: Groq): Promise<{ output: string; metadata?: Record<string, any> }> {
  const c = await groq.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: `You are a sentiment analysis engine. Respond ONLY with valid JSON:\n{"sentiment":"positive"|"negative"|"neutral"|"mixed","confidence":0.0-1.0,"score":-1.0-1.0,"emotions":["string"],"summary":"string"}\nNo text outside JSON.` },
      { role: 'user', content: text }
    ],
    max_tokens: 200,
  })
  const raw = c.choices[0].message.content || '{}'
  try {
    const p = JSON.parse(raw.replace(/```json|```/g, '').trim())
    const output = `Sentiment: ${(p.sentiment||'neutral').toUpperCase()} (score: ${p.score>0?'+':''}${(p.score||0).toFixed(2)}, confidence: ${Math.round((p.confidence||0)*100)}%)\nEmotions: ${(p.emotions||[]).join(', ')||'none detected'}\nAnalysis: ${p.summary||''}`
    return { output, metadata: p }
  } catch { return { output: raw, metadata: { raw } } }
}

async function extractJSON(text: string, schema: string, model: string, groq: Groq): Promise<{ output: string; metadata?: Record<string, any> }> {
  const instruction = schema
    ? `Extract data matching this schema:\n${schema}\nReturn ONLY valid JSON.`
    : `Extract all key information as a clean JSON object. Return ONLY valid JSON.`
  const c = await groq.chat.completions.create({
    model,
    messages: [{ role: 'system', content: instruction }, { role: 'user', content: text }],
    max_tokens: 800,
  })
  const raw = c.choices[0].message.content || '{}'
  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
    return { output: JSON.stringify(parsed, null, 2), metadata: { valid: true, keyCount: Object.keys(parsed).length, schemaProvided: !!schema } }
  } catch { return { output: raw, metadata: { valid: false, parseError: true } } }
}