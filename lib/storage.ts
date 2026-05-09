// Pipeline persistence — Supabase primary, localStorage fallback
// Strategy: try Supabase first. If not configured or offline, fall back to localStorage.
// This means the app works fully offline and syncs to the cloud when available.

import { supabase, isSupabaseConfigured } from './supabase'

export interface SavedPipeline {
  id: string
  name: string
  description: string
  nodes: any[]
  edges: any[]
  createdAt: string
  updatedAt: string
  runCount: number
  tags: string[]
}

export interface PipelineRun {
  id: string
  pipelineId: string
  pipelineName: string
  input: string
  finalOutput: string
  results: any[]
  status: 'success' | 'error'
  totalDuration: number
  stepCount: number
  ranAt: string
}

const LS_PIPELINES = 'sap_studio_pipelines'
const LS_RUNS = 'sap_studio_runs'

// ── Helpers: map DB snake_case ↔ app camelCase ─────────────────────────────

function dbToPipeline(row: any): SavedPipeline {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    nodes: row.nodes || [],
    edges: row.edges || [],
    tags: row.tags || [],
    runCount: row.run_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function dbToRun(row: any): PipelineRun {
  return {
    id: row.id,
    pipelineId: row.pipeline_id,
    pipelineName: row.pipeline_name,
    input: row.input,
    finalOutput: row.final_output,
    results: row.results || [],
    status: row.status,
    totalDuration: row.total_duration,
    stepCount: row.step_count,
    ranAt: row.ran_at,
  }
}

// ── localStorage helpers ───────────────────────────────────────────────────

function lsGetPipelines(): SavedPipeline[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_PIPELINES) || '[]') } catch { return [] }
}

function lsSetPipelines(p: SavedPipeline[]) {
  localStorage.setItem(LS_PIPELINES, JSON.stringify(p))
}

function lsGetRuns(): PipelineRun[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_RUNS) || '[]') } catch { return [] }
}

function lsSetRuns(r: PipelineRun[]) {
  localStorage.setItem(LS_RUNS, JSON.stringify(r))
}

function genId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// ── Pipelines ──────────────────────────────────────────────────────────────

export async function getAllPipelines(): Promise<SavedPipeline[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .order('updated_at', { ascending: false })
      if (!error && data) return data.map(dbToPipeline)
    } catch { /* fall through to localStorage */ }
  }
  return lsGetPipelines()
}

export async function savePipeline(
  pipeline: Omit<SavedPipeline, 'id' | 'createdAt' | 'updatedAt' | 'runCount'>
): Promise<SavedPipeline> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('pipelines')
        .insert({
          name: pipeline.name,
          description: pipeline.description || null,
          nodes: pipeline.nodes,
          edges: pipeline.edges,
          tags: pipeline.tags || [],
        })
        .select()
        .single()
      if (!error && data) {
        const saved = dbToPipeline(data)
        // Mirror to localStorage as offline cache
        const local = lsGetPipelines()
        lsSetPipelines([saved, ...local])
        return saved
      }
    } catch { /* fall through */ }
  }

  // localStorage fallback
  const now = new Date().toISOString()
  const newPipeline: SavedPipeline = {
    ...pipeline, id: genId('pl'),
    createdAt: now, updatedAt: now, runCount: 0,
  }
  lsSetPipelines([newPipeline, ...lsGetPipelines()])
  return newPipeline
}

export async function updatePipeline(id: string, updates: Partial<SavedPipeline>): Promise<SavedPipeline | null> {
  if (isSupabaseConfigured()) {
    try {
      const dbUpdates: any = {}
      if (updates.name !== undefined)        dbUpdates.name = updates.name
      if (updates.description !== undefined) dbUpdates.description = updates.description
      if (updates.nodes !== undefined)       dbUpdates.nodes = updates.nodes
      if (updates.edges !== undefined)       dbUpdates.edges = updates.edges
      if (updates.tags !== undefined)        dbUpdates.tags = updates.tags
      if (updates.runCount !== undefined)    dbUpdates.run_count = updates.runCount

      const { data, error } = await supabase
        .from('pipelines')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()
      if (!error && data) {
        const updated = dbToPipeline(data)
        // Keep localStorage cache in sync
        const local = lsGetPipelines()
        const idx = local.findIndex(p => p.id === id)
        if (idx !== -1) { local[idx] = updated; lsSetPipelines(local) }
        return updated
      }
    } catch { /* fall through */ }
  }

  // localStorage fallback
  const pipelines = lsGetPipelines()
  const idx = pipelines.findIndex(p => p.id === id)
  if (idx === -1) return null
  pipelines[idx] = { ...pipelines[idx], ...updates, updatedAt: new Date().toISOString() }
  lsSetPipelines(pipelines)
  return pipelines[idx]
}

export async function deletePipeline(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      // Cascade delete handles runs via FK constraint
      await supabase.from('pipelines').delete().eq('id', id)
    } catch { /* fall through */ }
  }
  lsSetPipelines(lsGetPipelines().filter(p => p.id !== id))
  lsSetRuns(lsGetRuns().filter(r => r.pipelineId !== id))
}

export async function getPipelineById(id: string): Promise<SavedPipeline | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('pipelines').select('*').eq('id', id).single()
      if (!error && data) return dbToPipeline(data)
    } catch { /* fall through */ }
  }
  return lsGetPipelines().find(p => p.id === id) || null
}

// ── Runs ───────────────────────────────────────────────────────────────────

export async function getAllRuns(): Promise<PipelineRun[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('pipeline_runs')
        .select('*')
        .order('ran_at', { ascending: false })
        .limit(100)
      if (!error && data) return data.map(dbToRun)
    } catch { /* fall through */ }
  }
  return lsGetRuns()
}

export async function saveRun(run: Omit<PipelineRun, 'id' | 'ranAt'>): Promise<PipelineRun> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('pipeline_runs')
        .insert({
          id: genId('run'),
          pipeline_id: run.pipelineId,
          pipeline_name: run.pipelineName,
          input: run.input,
          final_output: run.finalOutput,
          results: run.results,
          status: run.status,
          total_duration: run.totalDuration,
          step_count: run.stepCount,
        })
        .select()
        .single()
      if (!error && data) {
        const saved = dbToRun(data)
        // Increment run count
        const pipeline = await getPipelineById(run.pipelineId)
        if (pipeline) await updatePipeline(run.pipelineId, { runCount: (pipeline.runCount || 0) + 1 })
        // Mirror to localStorage cache
        const local = lsGetRuns()
        lsSetRuns([saved, ...local].slice(0, 100))
        return saved
      }
    } catch { /* fall through */ }
  }

  // localStorage fallback
  const newRun: PipelineRun = { ...run, id: genId('run'), ranAt: new Date().toISOString() }
  const runs = lsGetRuns()
  lsSetRuns([newRun, ...runs].slice(0, 100))
  const pipeline = lsGetPipelines().find(p => p.id === run.pipelineId)
  if (pipeline) {
    const ps = lsGetPipelines()
    const idx = ps.findIndex(p => p.id === run.pipelineId)
    if (idx !== -1) { ps[idx].runCount = (ps[idx].runCount || 0) + 1; lsSetPipelines(ps) }
  }
  return newRun
}

export async function deleteRun(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try { await supabase.from('pipeline_runs').delete().eq('id', id) } catch { /* fall through */ }
  }
  lsSetRuns(lsGetRuns().filter(r => r.id !== id))
}

// ── Stats ──────────────────────────────────────────────────────────────────

export async function getStats() {
  const [pipelines, runs] = await Promise.all([getAllPipelines(), getAllRuns()])
  const successRuns = runs.filter(r => r.status === 'success')
  const avgDuration = runs.length > 0
    ? Math.round(runs.reduce((a, r) => a + r.totalDuration, 0) / runs.length)
    : 0
  return {
    totalPipelines: pipelines.length,
    totalRuns: runs.length,
    successRate: runs.length > 0 ? Math.round((successRuns.length / runs.length) * 100) : 0,
    avgDurationMs: avgDuration,
  }
}