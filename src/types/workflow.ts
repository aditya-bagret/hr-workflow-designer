export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
}

export interface StartNodeData extends Record<string, unknown> {
  type: 'start';
  label: string;
  metadata: KeyValuePair[];
}

export interface TaskNodeData extends Record<string, unknown> {
  type: 'task';
  label: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
}

export interface ApprovalNodeData extends Record<string, unknown> {
  type: 'approval';
  label: string;
  approverRole: string;
  autoApproveThreshold: number;
}

export interface AutomatedNodeData extends Record<string, unknown> {
  type: 'automated';
  label: string;
  actionId: string;
  actionParams: Record<string, string>;
}

export interface EndNodeData extends Record<string, unknown> {
  type: 'end';
  label: string;
  endMessage: string;
  showSummary: boolean;
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface SimulationStep {
  nodeId: string;
  nodeLabel: string;
  nodeType: NodeType;
  status: 'success' | 'warning' | 'error' | 'skipped';
  message: string;
  timestamp: string;
  duration: number;
}

export interface SimulationResult {
  success: boolean;
  totalSteps: number;
  completedSteps: number;
  steps: SimulationStep[];
  errors: string[];
  warnings: string[];
  executionTime: number;
}

export interface ValidationError {
  nodeId?: string;
  message: string;
  severity: 'error' | 'warning';
}
