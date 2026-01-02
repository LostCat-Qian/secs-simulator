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
  width: string;
  logs: LogEntry[];
}

export interface EngineData {
  name: string;
  active: boolean;
  fileName: string;
  config: Record<string, any>;
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
