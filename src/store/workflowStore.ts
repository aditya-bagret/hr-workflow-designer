import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import { v4 as uuid } from 'uuid';
import type { WorkflowNodeData, NodeType } from '../types/workflow';

type WFNode = Node<WorkflowNodeData>;

interface HistoryEntry {
  nodes: WFNode[];
  edges: Edge[];
  label: string;
}

interface WorkflowStore {
  nodes: WFNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  isSandboxOpen: boolean;
  isAIAssistantOpen: boolean;
  isTemplatesOpen: boolean;
  simulatingNodeIds: string[];   // nodes currently "executing" in live sim
  history: HistoryEntry[];
  historyPointer: number;

  // Canvas actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNodeData>) => void;
  selectNode: (id: string | null) => void;
  deleteNode: (id: string) => void;
  setNodes: (nodes: WFNode[]) => void;

  // Undo/Redo
  pushHistory: (label: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // UI toggles
  toggleSandbox: () => void;
  toggleAIAssistant: () => void;
  toggleTemplates: () => void;

  // Simulation animation
  setSimulatingNodeIds: (ids: string[]) => void;

  // Workflow management
  loadTemplate: (nodes: WFNode[], edges: Edge[]) => void;
  loadExample: () => void;
  exportWorkflow: () => string;
  importWorkflow: (json: string) => void;
  clearWorkflow: () => void;
}

const defaultNodeData = (type: NodeType): WorkflowNodeData => {
  switch (type) {
    case 'start':  return { type: 'start', label: 'Start', metadata: [] };
    case 'task':   return { type: 'task', label: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] };
    case 'approval': return { type: 'approval', label: 'Approval', approverRole: 'Manager', autoApproveThreshold: 0 };
    case 'automated': return { type: 'automated', label: 'Automated Step', actionId: '', actionParams: {} };
    case 'end':    return { type: 'end', label: 'End', endMessage: 'Workflow completed', showSummary: false };
  }
};

const EXAMPLE_NODES: WFNode[] = [
  { id: 'n1', type: 'start', position: { x: 300, y: 60 }, data: { type: 'start', label: 'New Hire Onboarding', metadata: [{ id: 'a', key: 'department', value: 'Engineering' }] } },
  { id: 'n2', type: 'task', position: { x: 300, y: 210 }, data: { type: 'task', label: 'Collect Documents', description: 'ID, tax forms, and bank details', assignee: 'HR Admin', dueDate: '2025-01-10', customFields: [] } },
  { id: 'n3', type: 'automated', position: { x: 300, y: 360 }, data: { type: 'automated', label: 'Generate Offer Letter', actionId: 'generate_doc', actionParams: { template: 'offer_letter', recipient: 'new_hire' } } },
  { id: 'n4', type: 'approval', position: { x: 300, y: 510 }, data: { type: 'approval', label: 'Manager Approval', approverRole: 'Director', autoApproveThreshold: 80 } },
  { id: 'n5', type: 'automated', position: { x: 300, y: 660 }, data: { type: 'automated', label: 'Provision Access', actionId: 'provision_access', actionParams: { system: 'GitHub', role: 'engineer', employeeId: '' } } },
  { id: 'n6', type: 'end', position: { x: 300, y: 810 }, data: { type: 'end', label: 'Onboarding Complete', endMessage: 'Employee successfully onboarded!', showSummary: true } },
];

const EXAMPLE_EDGES: Edge[] = [
  { id: 'e1', source: 'n1', target: 'n2', animated: true },
  { id: 'e2', source: 'n2', target: 'n3', animated: true },
  { id: 'e3', source: 'n3', target: 'n4', animated: true },
  { id: 'e4', source: 'n4', target: 'n5', animated: true },
  { id: 'e5', source: 'n5', target: 'n6', animated: true },
];

const INITIAL_HISTORY: HistoryEntry[] = [{ nodes: EXAMPLE_NODES, edges: EXAMPLE_EDGES, label: 'Initial' }];

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: EXAMPLE_NODES,
  edges: EXAMPLE_EDGES,
  selectedNodeId: null,
  isSandboxOpen: false,
  isAIAssistantOpen: false,
  isTemplatesOpen: false,
  simulatingNodeIds: [],
  history: INITIAL_HISTORY,
  historyPointer: 0,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes as any) as WFNode[] });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection) => {
    const newEdges = addEdge({ ...connection, animated: true }, get().edges);
    set({ edges: newEdges });
    get().pushHistory('Connect nodes');
  },
  addNode: (type, position) => {
    const id = uuid();
    const newNode: WFNode = { id, type, position, data: defaultNodeData(type) };
    set({ nodes: [...get().nodes, newNode], selectedNodeId: id });
    get().pushHistory(`Add ${type} node`);
  },
  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map(n =>
        n.id === id ? { ...n, data: { ...n.data, ...data } as WorkflowNodeData } : n
      ),
    });
  },
  selectNode: (id) => set({ selectedNodeId: id }),
  deleteNode: (id) => {
    set({
      nodes: get().nodes.filter(n => n.id !== id),
      edges: get().edges.filter(e => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    });
    get().pushHistory('Delete node');
  },
  setNodes: (nodes) => set({ nodes }),

  pushHistory: (label) => {
    const { nodes, edges, history, historyPointer } = get();
    const truncated = history.slice(0, historyPointer + 1);
    const newHistory = [...truncated, { nodes: structuredClone(nodes), edges: structuredClone(edges), label }];
    const capped = newHistory.length > 60 ? newHistory.slice(newHistory.length - 60) : newHistory;
    set({ history: capped, historyPointer: capped.length - 1 });
  },
  undo: () => {
    const { historyPointer, history } = get();
    if (historyPointer <= 0) return;
    const prev = history[historyPointer - 1];
    set({ nodes: prev.nodes, edges: prev.edges, historyPointer: historyPointer - 1, selectedNodeId: null });
  },
  redo: () => {
    const { historyPointer, history } = get();
    if (historyPointer >= history.length - 1) return;
    const next = history[historyPointer + 1];
    set({ nodes: next.nodes, edges: next.edges, historyPointer: historyPointer + 1 });
  },
  canUndo: () => get().historyPointer > 0,
  canRedo: () => get().historyPointer < get().history.length - 1,

  toggleSandbox: () => set({ isSandboxOpen: !get().isSandboxOpen }),
  toggleAIAssistant: () => set({ isAIAssistantOpen: !get().isAIAssistantOpen }),
  toggleTemplates: () => set({ isTemplatesOpen: !get().isTemplatesOpen }),

  setSimulatingNodeIds: (ids) => set({ simulatingNodeIds: ids }),

  loadTemplate: (nodes, edges) => {
    set({ nodes, edges, selectedNodeId: null, isTemplatesOpen: false });
    get().pushHistory('Load template');
  },
  loadExample: () => {
    set({ nodes: EXAMPLE_NODES, edges: EXAMPLE_EDGES, selectedNodeId: null });
    get().pushHistory('Load example');
  },
  exportWorkflow: () => JSON.stringify({ nodes: get().nodes, edges: get().edges }, null, 2),
  importWorkflow: (json) => {
    try {
      const { nodes, edges } = JSON.parse(json);
      set({ nodes, edges, selectedNodeId: null });
      get().pushHistory('Import workflow');
    } catch { console.error('Invalid workflow JSON'); }
  },
  clearWorkflow: () => {
    set({ nodes: [], edges: [], selectedNodeId: null });
    get().pushHistory('Clear workflow');
  },
}));
