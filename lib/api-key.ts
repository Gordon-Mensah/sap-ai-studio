// API Key Management
// Stores the user's Groq API key in localStorage (client-side only)
// Never sent to any server except directly to the /api/pipeline route as a header

const KEY = 'sap_studio_groq_key'

export function getApiKey(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(KEY) || ''
}

export function setApiKey(key: string): void {
  if (typeof window === 'undefined') return
  if (key.trim()) {
    localStorage.setItem(KEY, key.trim())
  } else {
    localStorage.removeItem(KEY)
  }
}

export function clearApiKey(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}

export function hasApiKey(): boolean {
  return !!getApiKey()
}

// Validate format — Groq keys start with 'gsk_'
export function isValidKeyFormat(key: string): boolean {
  return key.trim().startsWith('gsk_') && key.trim().length > 20
}