'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import ReactFlow, {
  Node, Edge, addEdge, Connection,
  useNodesState, useEdgesState, Controls, Background,
  BackgroundVariant, ReactFlowProvider, NodeTypes, Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { v4 as uuidv4 } from 'uuid'
import { PipelineNode } from '@/components/PipelineNode'
import { NodePalette } from '@/components/NodePalette'
import { StepConfigPanel } from '@/components/StepConfigPanel'
import { RunPanel } from '@/components/RunPanel'
import { TopBar } from '@/components/TopBar'
import { SaveModal } from '@/components/SaveModal'
import { ApiKeyModal } from '@/components/ApiKeyModal'
import { PipelineStep } from '@/lib/pipeline-engine'
import { savePipeline, updatePipeline, saveRun } from '@/lib/storage'
import { getApiKey, hasApiKey } from '@/lib/api-key'

const nodeTypes: NodeTypes = { pipelineNode: PipelineNode }

function getDefaultConfig(type: PipelineStep['type']): Record<string, any> {
  switch (type) {
    case 'template':    return { template: 'You are a helpful assistant. {{input}}', variables: {} }
    case 'llm':         return { systemPrompt: 'You are a helpful AI assistant.', model: 'llama-3.3-70b-versatile' }
    case 'masking':     return {}
    case 'filter':      return { blocklist: [] }
    case 'grounding':   return { document: '' }
    case 'translation': return { targetLanguage: 'German' }
    case 'summariser':  return { style: 'bullet', maxPoints: 5, model: 'llama-3.3-70b-versatile' }
    case 'sentiment':   return { model: 'llama-3.1-8b-instant' }
    case 'json-parser': return { schema: '', model: 'llama-3.3-70b-versatile' }
    default:            return {}
  }
}

function OrchestratorCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [runResults, setRunResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [runPanelOpen, setRunPanelOpen] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [currentPipelineId, setCurrentPipelineId] = useState<string | null>(null)
  const [currentPipelineName, setCurrentPipelineName] = useState<string>('')
  const [saveToast, setSaveToast] = useState<string | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Load template from localStorage when navigating from templates page
  useEffect(() => {
    const templateData = localStorage.getItem('loadTemplate')
    if (templateData) {
      localStorage.removeItem('loadTemplate')
      try {
        const steps = JSON.parse(templateData)
        const newNodes = steps.map((step: any, i: number) => ({
          id: step.id, type: 'pipelineNode',
          position: { x: 120 + i * 240, y: 220 },
          data: { id: step.id, type: step.type, name: step.name, config: step.config },
        }))
        const newEdges = steps.slice(0, -1).map((step: any, i: number) => ({
          id: `e${step.id}-${steps[i + 1].id}`,
          source: step.id, target: steps[i + 1].id,
          animated: true, style: { stroke: '#00D4AA', strokeWidth: 2 },
        }))
        setNodes(newNodes)
        setEdges(newEdges)
      } catch (e) { console.error('Failed to load template:', e) }
    }

    // Load pipeline from history page
    const pipelineData = localStorage.getItem('loadPipeline')
    if (pipelineData) {
      localStorage.removeItem('loadPipeline')
      try {
        const p = JSON.parse(pipelineData)
        setNodes(p.nodes || [])
        setEdges(p.edges || [])
        setCurrentPipelineId(p.id)
        setCurrentPipelineName(p.name)
      } catch (e) { console.error('Failed to load pipeline:', e) }
    }
    // Check for API key on first load
    if (!hasApiKey()) {
      setIsFirstTime(true)
      setApiKeyModalOpen(true)
    }
  }, [])

  const showToast = (msg: string) => {
    setSaveToast(msg)
    setTimeout(() => setSaveToast(null), 3000)
  }

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#00D4AA', strokeWidth: 2 } }, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => setSelectedNode(node), [])
  const onPaneClick = useCallback(() => setSelectedNode(null), [])

  const addNode = useCallback((type: PipelineStep['type'], label: string) => {
    const id = uuidv4()
    const position = { x: 120 + nodes.length * 240, y: 220 }
    setNodes((nds) => nds.concat({
      id, type: 'pipelineNode', position,
      data: { id, type, name: label, config: getDefaultConfig(type) },
    }))
  }, [nodes.length, setNodes])

  const updateNodeConfig = useCallback((nodeId: string, config: Record<string, any>, name: string) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, config, name } } : n))
    setSelectedNode((prev) => prev?.id === nodeId ? { ...prev, data: { ...prev.data, config, name } } : prev)
  }, [setNodes])

  const getOrderedSteps = useCallback((): PipelineStep[] => {
    const edgeMap: Record<string, string> = {}
    edges.forEach((e) => { edgeMap[e.source] = e.target })
    const allTargets = new Set(edges.map((e) => e.target))
    const roots = nodes.filter((n) => !allTargets.has(n.id))
    if (roots.length === 0) return nodes.map((n) => ({ id: n.id, type: n.data.type, name: n.data.name, config: n.data.config }))
    const ordered: PipelineStep[] = []
    let current: string | undefined = roots[0].id
    const visited = new Set<string>()
    while (current && !visited.has(current)) {
      visited.add(current)
      const node = nodes.find((n) => n.id === current)
      if (node) ordered.push({ id: node.id, type: node.data.type, name: node.data.name, config: node.data.config })
      current = edgeMap[current]
    }
    return ordered
  }, [nodes, edges])

  const runPipeline = useCallback(async (userInput: string) => {
    if (nodes.length === 0) return
    setIsRunning(true)
    setRunResults(null)
    const steps = getOrderedSteps()
    const startTime = Date.now()
    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps, input: userInput, groqApiKey: getApiKey() }),
      })
      const data = await res.json()
      setRunResults(data)

      // Auto-save run to history if we have a pipeline ID
      if (currentPipelineId && currentPipelineName) {
        saveRun({
          pipelineId: currentPipelineId,
          pipelineName: currentPipelineName,
          input: userInput,
          finalOutput: data.finalOutput || '',
          results: data.results || [],
          status: data.success ? 'success' : 'error',
          totalDuration: Date.now() - startTime,
          stepCount: steps.length,
        })
      }
    } catch (err: any) {
      setRunResults({ success: false, error: err.message })
    } finally {
      setIsRunning(false)
    }
  }, [nodes, edges, getOrderedSteps, currentPipelineId, currentPipelineName])

  const handleSave = useCallback((name: string, description: string, tags: string[]) => {
    if (currentPipelineId) {
      updatePipeline(currentPipelineId, { name, description, tags, nodes, edges })
      setCurrentPipelineName(name)
      showToast(`✓ "${name}" updated`)
    } else {
      const saved = savePipeline({ name, description, tags, nodes, edges })
      setCurrentPipelineId(saved.id)
      setCurrentPipelineName(name)
      showToast(`✓ "${name}" saved`)
    }
    setSaveModalOpen(false)
  }, [currentPipelineId, nodes, edges])

  const handleQuickSave = useCallback(() => {
    if (nodes.length === 0) return
    if (currentPipelineId && currentPipelineName) {
      updatePipeline(currentPipelineId, { nodes, edges })
      showToast(`✓ "${currentPipelineName}" saved`)
    } else {
      setSaveModalOpen(true)
    }
  }, [currentPipelineId, currentPipelineName, nodes, edges])

  const generateCode = useCallback(() => {
    const steps = getOrderedSteps()
    const code = `// Generated by SAP AI Orchestration Studio
// Pipeline: ${currentPipelineName || 'Untitled'}

import Groq from 'groq-sdk'
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const steps = ${JSON.stringify(steps, null, 2)}

async function runPipeline(input: string) {
  let current = input
  for (const step of steps) {
    // Execute step: ${steps.map(s => s.name).join(' → ')}
    console.log(\`Running: \${step.name}\`)
    // Add your step logic here based on step.type
  }
  return current
}

runPipeline("Your input here").then(console.log)`

    navigator.clipboard.writeText(code).then(() => showToast('✓ Code copied to clipboard'))
  }, [getOrderedSteps, currentPipelineName])

  return (
    <div className="flex flex-col h-screen bg-[#080B14] text-white overflow-hidden" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      <TopBar
        nodeCount={nodes.length}
        pipelineName={currentPipelineName}
        onRun={() => setRunPanelOpen(true)}
        onSave={handleQuickSave}
        onSaveAs={() => setSaveModalOpen(true)}
        onClear={() => {
          setNodes([]); setEdges([]); setSelectedNode(null)
          setRunResults(null); setRunPanelOpen(false)
          setCurrentPipelineId(null); setCurrentPipelineName('')
        }}
        onExportCode={generateCode}
        onManageKey={() => { setIsFirstTime(false); setApiKeyModalOpen(true) }}
      />

      <div className="flex flex-1 overflow-hidden">
        <NodePalette onAddNode={addNode} />

        <div ref={reactFlowWrapper} className="flex-1 relative">
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect} onNodeClick={onNodeClick} onPaneClick={onPaneClick}
            nodeTypes={nodeTypes} fitView
            defaultEdgeOptions={{ animated: true, style: { stroke: '#00D4AA', strokeWidth: 2 } }}
          >
            <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#111827" />
            <Controls style={{ background: '#111827', border: '1px solid #1E2B3C', borderRadius: '6px' }} />
            {nodes.length === 0 && (
              <Panel position="top-center">
                <div className="text-center mt-32 select-none pointer-events-none">
                  <div className="text-[80px] leading-none mb-6 opacity-10">⬡</div>
                  <p className="text-[#1E2B3C] text-xs tracking-[0.3em] uppercase font-mono">Add nodes from the palette → connect → run</p>
                  <p className="text-[#1A2333] text-[10px] tracking-[0.2em] uppercase font-mono mt-2">or load a template from the library</p>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {selectedNode && (
          <StepConfigPanel node={selectedNode} onUpdate={updateNodeConfig} onClose={() => setSelectedNode(null)} />
        )}
      </div>

      {runPanelOpen && (
        <RunPanel
          isRunning={isRunning} results={runResults}
          onRun={runPipeline} onClose={() => setRunPanelOpen(false)}
          stepCount={nodes.length}
        />
      )}

      {saveModalOpen && (
        <SaveModal
          initialName={currentPipelineName}
          onSave={handleSave}
          onClose={() => setSaveModalOpen(false)}
        />
      )}

      {apiKeyModalOpen && (
        <ApiKeyModal
          isFirstTime={isFirstTime}
          onSave={() => { setApiKeyModalOpen(false); showToast('✓ API key saved') }}
          onClose={isFirstTime ? undefined : () => setApiKeyModalOpen(false)}
        />
      )}

      {/* Toast */}
      {saveToast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded text-xs font-semibold z-50 transition-all"
          style={{ background: '#00D4AA22', border: '1px solid #00D4AA44', color: '#00D4AA', backdropFilter: 'blur(8px)' }}
        >
          {saveToast}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <ReactFlowProvider>
      <OrchestratorCanvas />
    </ReactFlowProvider>
  )
}