import { TreeNodeData } from '@arco-design/web-vue';

export interface LogEntry {
  time: string;
  level: string;
  message: string;
}

export interface LogPanelData {
  id: string;
  title: string;
  engineId?: string;
  engineName?: string;
  width: string; // Width percentage or value
  logs: LogEntry[];
}

export interface EngineData {
  name: string;
  active: boolean;
  // Add other engine properties as needed
}

export interface AutoReplyFormData {
  tool: string;
  handlerSf: string;
  active: boolean;
  delaySeconds: number;
  script: string;
}

export interface AutoReplyItem {
  name: string;
  tool: string;
  sf: string;
  delaySeconds: number;
  active: boolean;
}

export type SmlTreeNode = TreeNodeData & {
  key: string;
  title: string;
  isFolder?: boolean;
  children?: SmlTreeNode[];
};
