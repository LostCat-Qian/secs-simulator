import { TreeNodeData } from '@arco-design/web-vue'

export interface LogEntry {
  time: string
  level: string
  message: string
}

export interface LogPanelData {
  id: string
  title: string
  engineId?: string
  engineName?: string
  width: string
  logs: LogEntry[]
}

export interface EngineData {
  name: string
  active: boolean
  fileName: string
  config: Record<string, any>
  status?: 'idle' | 'connecting' | 'running'
}

export interface AutoReplyFormData {
  tool: string
  handlerSf: string
  active: boolean
  delaySeconds: number
  script: string
}

export interface AutoReplyItem {
  name: string
  tool: string
  sf: string
  delaySeconds: number
  active: boolean
}

export type SmlTreeNode = TreeNodeData & {
  key: string
  title: string
  isFolder?: boolean
  children?: SmlTreeNode[]
}

export type AutoFlowStepType = 'send' | 'wait' | 'delay' | 'log' | 'end'

export interface AutoFlowCondition {
  path: string
  op: 'exists' | 'eq' | 'neq' | 'contains' | 'regex' | 'gt' | 'gte' | 'lt' | 'lte'
  value?: any
}

export interface AutoFlowExpect {
  sf?: string
  stream?: number
  func?: number
  wBit?: boolean
  smlIncludes?: string
  conditions?: AutoFlowCondition[]
}

export type AutoFlowStep =
  | {
      type: 'send'
      filePath: string
      waitReply?: boolean
      timeoutMs?: number
      expect?: AutoFlowExpect
    }
  | {
      type: 'wait'
      timeoutMs?: number
      expect: AutoFlowExpect
    }
  | {
      type: 'delay'
      ms: number
    }
  | {
      type: 'log'
      level?: 'INFO' | 'WARN' | 'ERROR'
      message: string
    }
  | {
      type: 'end'
    }

export interface AutoFlowConfig {
  version?: number
  name: string
  description?: string
  tool: string
  steps: AutoFlowStep[]
  createdAt?: string
  updatedAt?: string
}

export interface AutoFlowSummary {
  name: string
  tool: string
  fileName: string
  stepCount: number
  updatedAt: string | null
  invalid?: boolean
}

export interface AutoFlowRunEvent {
  type: string
  runId: string
  [key: string]: any
}
