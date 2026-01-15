<template>
  <div class="flow-graph-container">
    <div class="flow-palette">
      <div class="palette-title">Tools</div>
      <div class="palette-item" v-for="type in nodeTypes" :key="type" :draggable="true"
        @dragstart="onDragStart($event, type)">
        {{ type }}
      </div>
    </div>

    <div class="flow-canvas" ref="canvasRef" @drop="onDrop" @dragover="onDragOver">
      <VueFlow v-model="elements" class="flow-chart" :default-viewport="{ zoom: 1 }" :min-zoom="0.2" :max-zoom="4"
        @pane-ready="onPaneReady" @node-click="onNodeClick">
        <Background pattern-color="#aaa" :gap="16" />
        <Controls />

        <template #node-custom="props">
          <div class="custom-node" :class="{ selected: props.selected }">
            <div class="node-header" :class="props.data.type">
              {{ props.data.type.toUpperCase() }}
            </div>
            <div class="node-body">
              <div v-if="props.data.label" class="node-label">{{ props.data.label }}</div>
              <div v-if="props.data.desc" class="node-desc">{{ props.data.desc }}</div>
            </div>
            <Handle type="target" :position="Position.Top" />
            <Handle type="source" :position="Position.Bottom" />
          </div>
        </template>
      </VueFlow>
    </div>

    <div class="properties-panel" v-if="selectedNodeData">
      <div class="panel-header">
        <span>Properties</span>
        <a-button size="mini" type="text" @click="selectedNodeId = null">
          <icon-close />
        </a-button>
      </div>
      <div class="panel-content">
        <a-form :model="selectedNodeData" layout="vertical" size="small">
          <a-form-item label="Type">
            <a-tag>{{ selectedNodeData.type }}</a-tag>
          </a-form-item>

          <!-- Send Node Params -->
          <template v-if="selectedNodeData.type === 'send'">
            <a-form-item label="SML File">
              <a-select v-model="selectedNodeData.filePath" allow-search placeholder="Select SML">
                <a-option v-for="p in smlFiles" :key="p" :value="p">{{ p }}</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="Expect SF">
              <a-input v-model="selectedNodeData.expectSf" placeholder="S6F12" />
            </a-form-item>
            <a-form-item label="Timeout (ms)">
              <a-input-number v-model="selectedNodeData.timeoutMs" :min="1000" :step="1000" />
            </a-form-item>
            <a-form-item label="Engines">
              <a-select v-model="selectedNodeData.tools" multiple allow-clear>
                <a-option v-for="t in availableTools" :key="t" :value="t">{{ t }}</a-option>
              </a-select>
            </a-form-item>
          </template>

          <!-- Wait Node Params -->
          <template v-if="selectedNodeData.type === 'wait'">
            <a-form-item label="Expect SF">
              <a-input v-model="selectedNodeData.expectSf" placeholder="S6F11" />
            </a-form-item>
            <a-form-item label="Includes">
              <a-input v-model="selectedNodeData.smlIncludes" placeholder="content..." />
            </a-form-item>
            <a-form-item label="Timeout (ms)">
              <a-input-number v-model="selectedNodeData.timeoutMs" :min="1000" :step="1000" />
            </a-form-item>
            <a-form-item label="Engines">
              <a-select v-model="selectedNodeData.tools" multiple allow-clear>
                <a-option v-for="t in availableTools" :key="t" :value="t">{{ t }}</a-option>
              </a-select>
            </a-form-item>
          </template>

          <!-- Delay Node Params -->
          <template v-if="selectedNodeData.type === 'delay'">
            <a-form-item label="Delay (ms)">
              <a-input-number v-model="selectedNodeData.ms" :min="0" :step="100" />
            </a-form-item>
          </template>

          <!-- Log Node Params -->
          <template v-if="selectedNodeData.type === 'log'">
            <a-form-item label="Message">
              <a-textarea v-model="selectedNodeData.message" />
            </a-form-item>
            <a-form-item label="Level">
              <a-select v-model="selectedNodeData.level">
                <a-option>INFO</a-option>
                <a-option>WARN</a-option>
                <a-option>ERROR</a-option>
              </a-select>
            </a-form-item>
          </template>

          <a-divider />
          <a-button type="primary" status="danger" long @click="deleteSelectedNode">Delete Node</a-button>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { VueFlow, useVueFlow, Position, Handle } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { IconClose } from '@arco-design/web-vue/es/icon'
import type { AutoFlowStep } from '../../types'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

const props = defineProps<{
  steps: AutoFlowStep[]
  smlFiles: string[]
  availableTools: string[]
}>()

const emit = defineEmits<{
  (e: 'update:steps', steps: AutoFlowStep[]): void
}>()

const nodeTypes = ['send', 'wait', 'delay', 'log', 'end']
const elements = ref<any[]>([])
const selectedNodeId = ref<string | null>(null)
const canvasRef = ref<HTMLElement | null>(null)

const { addNodes, addEdges, onConnect, removeNodes, getNodes, getEdges, project, findNode } = useVueFlow()

onConnect((params) => addEdges(params))

const selectedNodeData = computed(() => {
  if (!selectedNodeId.value) return null
  const node = findNode(selectedNodeId.value)
  return node ? node.data : null
})

// --- Data Conversion ---

const stepToNode = (step: AutoFlowStep, index: number, x: number = 250, y: number = 0) => {
  const id = `node-${Date.now()}-${index}`
  // Extract data for UI
  let label = ''
  let desc = ''

  if (step.type === 'send') {
    label = step.filePath || 'Select SML'
    desc = step.expect?.sf ? `Expect: ${step.expect.sf}` : ''
  } else if (step.type === 'wait') {
    label = step.expect?.sf || 'Wait Any'
    desc = step.expect?.smlIncludes || ''
  } else if (step.type === 'delay') {
    label = `${step.ms} ms`
  } else if (step.type === 'log') {
    label = step.message || 'Log'
  } else if (step.type === 'end') {
    label = 'End'
  }

  // Flatten data for easier binding in properties panel
  const data: any = {
    type: step.type,
    label,
    desc,
    // Original fields
    filePath: (step as any).filePath,
    expectSf: (step as any).expect?.sf,
    smlIncludes: (step as any).expect?.smlIncludes,
    timeoutMs: (step as any).timeoutMs,
    ms: (step as any).ms,
    message: (step as any).message,
    level: (step as any).level,
    tools: (step as any).tools,
    waitReply: (step as any).waitReply,
  }

  return {
    id,
    type: 'custom',
    position: { x, y: y || index * 120 + 50 },
    data
  }
}

// Convert graph back to steps (Linear traversal)
const graphToSteps = (): AutoFlowStep[] => {
  const nodes = getNodes.value
  const edges = getEdges.value

  if (nodes.length === 0) return []

  // Find start node (node with no incoming edges, or the top-most one)
  // Simple heuristic: Sort by Y position for now, or trace edges.
  // Since user can drag, Y position is a good indicator of sequence if they arrange it vertically.
  // But better: follow edges.

  // Find roots (no target handles connected)
  const targetIds = new Set(edges.map(e => e.target))
  let current = nodes.find(n => !targetIds.has(n.id))

  // If cycle or no clear root, fallback to sorting by Y
  if (!current && nodes.length > 0) {
    const sorted = [...nodes].sort((a, b) => a.position.y - b.position.y)
    current = sorted[0]
  }

  const result: AutoFlowStep[] = []
  const visited = new Set<string>()

  while (current) {
    if (visited.has(current.id)) break
    visited.add(current.id)

    const d = current.data
    const step: any = { type: d.type }

    if (d.type === 'send') {
      step.filePath = d.filePath
      if (d.expectSf) step.expect = { sf: d.expectSf }
      if (d.timeoutMs) step.timeoutMs = d.timeoutMs
      if (d.tools) step.tools = d.tools
      if (d.waitReply !== undefined) step.waitReply = d.waitReply
    } else if (d.type === 'wait') {
      step.expect = {}
      if (d.expectSf) step.expect.sf = d.expectSf
      if (d.smlIncludes) step.expect.smlIncludes = d.smlIncludes
      if (d.timeoutMs) step.timeoutMs = d.timeoutMs
      if (d.tools) step.tools = d.tools
    } else if (d.type === 'delay') {
      step.ms = d.ms
    } else if (d.type === 'log') {
      step.message = d.message
      step.level = d.level
    }

    result.push(step)

    // Find next node
    const edge = edges.find(e => e.source === current!.id)
    if (edge) {
      current = nodes.find(n => n.id === edge.target)
    } else {
      current = undefined
    }
  }

  return result
}

// --- Watchers & Events ---

// Initial load
watch(() => props.steps, (newSteps) => {
  // Only reload if we have a significant change (e.g. from parent loading a new flow)
  // We need to avoid loops if we emit updates.
  // For now, assume this is called when Flow is selected or reset.
  // We'll rely on internal state for edits.
  if (newSteps && newSteps.length && elements.value.length === 0) {
    const nodes = newSteps.map((s, i) => stepToNode(s, i))
    const edges = nodes.slice(0, -1).map((n, i) => ({
      id: `e-${n.id}-${nodes[i + 1].id}`,
      source: n.id,
      target: nodes[i + 1].id
    }))
    elements.value = [...nodes, ...edges]
  } else if (!newSteps || newSteps.length === 0) {
    elements.value = []
  }
}, { immediate: true })

// Watch for data changes in selected node to update graph display & emit
watch(selectedNodeData, (newData) => {
  if (!newData) return
  // Update display label/desc
  if (newData.type === 'send') {
    newData.label = newData.filePath || 'Select SML'
    newData.desc = newData.expectSf ? `Expect: ${newData.expectSf}` : ''
  } else if (newData.type === 'wait') {
    newData.label = newData.expectSf || 'Wait Any'
    newData.desc = newData.smlIncludes || ''
  } else if (newData.type === 'delay') {
    newData.label = `${newData.ms} ms`
  } else if (newData.type === 'log') {
    newData.label = newData.message || 'Log'
  }

  // Emit update
  emit('update:steps', graphToSteps())
}, { deep: true })

// Watch edges/structure change
watch(elements, () => {
  emit('update:steps', graphToSteps())
}, { deep: true })

const onNodeClick = (e: any) => {
  selectedNodeId.value = e.node.id
}

const deleteSelectedNode = () => {
  if (selectedNodeId.value) {
    removeNodes([selectedNodeId.value])
    selectedNodeId.value = null
  }
}

// --- Drag & Drop ---

const onDragStart = (event: DragEvent, type: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', type)
    event.dataTransfer.effectAllowed = 'move'
  }
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDrop = (event: DragEvent) => {
  const type = event.dataTransfer?.getData('application/vueflow')
  if (type) {
    const { left, top } = canvasRef.value?.getBoundingClientRect() || { left: 0, top: 0 }

    // Simple projection if possible, or just raw coords
    // useVueFlow provides 'project' to convert screen to flow coords
    const position = project({
      x: event.clientX - left,
      y: event.clientY - top,
    })

    const newNode = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position,
      data: { type, label: type, desc: '' } // Init empty data
    }

    addNodes([newNode])
  }
}

const onPaneReady = (instance: any) => {
  instance.fitView()
}

</script>

<style scoped lang="less">
.flow-graph-container {
  display: flex;
  height: 100%;
  width: 100%;
  position: relative;
}

.flow-palette {
  width: 120px;
  background: var(--color-bg-2);
  border-right: 1px solid var(--color-border);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;

  .palette-title {
    font-weight: 600;
    margin-bottom: 8px;
  }

  .palette-item {
    padding: 8px;
    background: var(--color-fill-2);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    cursor: grab;
    text-align: center;

    &:hover {
      background: var(--color-fill-3);
    }
  }
}

.flow-canvas {
  flex: 1;
  height: 100%;
  position: relative;
}

.flow-chart {
  height: 100vh;
  width: 100%;
}

.properties-panel {
  width: 300px;
  background: var(--color-bg-2);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;

  .panel-header {
    padding: 12px;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }
}

/* Custom Node Styles */
.custom-node {
  width: 180px;
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s;

  &.selected {
    border-color: rgb(var(--primary-6));
    box-shadow: 0 0 0 2px rgba(var(--primary-6), 0.2);
  }

  .node-header {
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    text-transform: uppercase;

    &.send {
      background: #165dff;
    }

    &.wait {
      background: #eb0aa4;
    }

    &.delay {
      background: #ff7d00;
    }

    &.log {
      background: #7bc616;
    }

    &.end {
      background: #86909c;
    }
  }

  .node-body {
    padding: 8px 10px;

    .node-label {
      font-weight: 500;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .node-desc {
      font-size: 11px;
      color: var(--color-text-3);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
