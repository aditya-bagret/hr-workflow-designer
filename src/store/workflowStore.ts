import { create } from 'zustand';
import {
  addEdge, applyNodeChanges, applyEdgeChanges,
  type Node, type Edge, type Connection,
  type NodeChange, type EdgeChange,
} from '@xyflow/react';
import { v4 as uuid } from 'uuid';
import type { WorkflowNodeData, NodeType } from '../types/workflow';

type WFNode = Node<WorkflowNodeData>;

interface HistoryEntry { nodes: WFNode[]; edges: Edge[]; label: string; }

export type SidebarView = 'workflows' | 'dashboard' | 'compliance' | 'scheduler' | 'analytics' | 'integrations' | 'repository' | 'members' | 'inbox' | 'messages';

interface WorkflowStore {
  nodes: WFNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  isSandboxOpen: boolean;
  isAIAssistantOpen: boolean;
  isTemplatesOpen: boolean;
  simulatingNodeIds: string[];
  history: HistoryEntry[];
  historyPointer: number;
  currentWorkflowId: string | null;
  currentWorkflowName: string;
  backendOnline: boolean;
  activeSidebarView: SidebarView;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeDragStop: () => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNodeData>) => void;
  selectNode: (id: string | null) => void;
  deleteNode: (id: string) => void;
  setNodes: (nodes: WFNode[]) => void;

  pushHistory: (label: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  toggleSandbox: () => void;
  toggleAIAssistant: () => void;
  toggleTemplates: () => void;
  setActiveSidebarView: (view: SidebarView) => void;
  setSimulatingNodeIds: (ids: string[]) => void;
  setBackendOnline: (v: boolean) => void;
  setCurrentWorkflow: (id: string | null, name: string) => void;

  loadTemplate: (nodes: WFNode[], edges: Edge[]) => void;
  loadExample: () => void;
  loadWorkflowFromBackend: (nodes: WFNode[], edges: Edge[], id: string, name: string) => void;
  exportWorkflow: () => string;
  importWorkflow: (json: string) => void;
  clearWorkflow: () => void;
}

const defaultData = (type: NodeType): WorkflowNodeData => {
  switch (type) {
    case 'start':     return { type:'start', label:'Start', metadata:[] };
    case 'task':      return { type:'task', label:'New Task', description:'', assignee:'', dueDate:'', customFields:[] };
    case 'approval':  return { type:'approval', label:'Approval', approverRole:'Manager', autoApproveThreshold:0 };
    case 'automated': return { type:'automated', label:'Automated Step', actionId:'', actionParams:{} };
    case 'end':       return { type:'end', label:'End', endMessage:'Workflow completed', showSummary:false };
  }
};

const EXAMPLE_NODES: WFNode[] = [
  { id:'n1', type:'start',    position:{x:300,y:60},  data:{type:'start',    label:'New Hire Onboarding',   metadata:[{id:'a',key:'department',value:'Engineering'}]} },
  { id:'n2', type:'task',     position:{x:300,y:210}, data:{type:'task',     label:'Collect Documents',     description:'ID, tax forms, bank details', assignee:'HR Admin', dueDate:'', customFields:[]} },
  { id:'n3', type:'automated',position:{x:300,y:360}, data:{type:'automated',label:'Generate Offer Letter', actionId:'generate_doc', actionParams:{template:'offer_letter',recipient:'new_hire'}} },
  { id:'n4', type:'approval', position:{x:300,y:510}, data:{type:'approval', label:'Manager Approval',      approverRole:'Director', autoApproveThreshold:80} },
  { id:'n5', type:'automated',position:{x:300,y:660}, data:{type:'automated',label:'Provision Access',      actionId:'provision_access', actionParams:{system:'GitHub',role:'engineer',employeeId:''}} },
  { id:'n6', type:'end',      position:{x:300,y:810}, data:{type:'end',      label:'Onboarding Complete',   endMessage:'Employee successfully onboarded!', showSummary:true} },
];
const EXAMPLE_EDGES: Edge[] = [
  {id:'e1',source:'n1',target:'n2',animated:true},{id:'e2',source:'n2',target:'n3',animated:true},
  {id:'e3',source:'n3',target:'n4',animated:true},{id:'e4',source:'n4',target:'n5',animated:true},
  {id:'e5',source:'n5',target:'n6',animated:true},
];

const snapshot = (nodes: WFNode[], edges: Edge[]): { nodes: WFNode[]; edges: Edge[] } =>
  ({ nodes: structuredClone(nodes), edges: structuredClone(edges) });

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: EXAMPLE_NODES,
  edges: EXAMPLE_EDGES,
  selectedNodeId: null,
  isSandboxOpen: false,
  isAIAssistantOpen: false,
  isTemplatesOpen: false,
  simulatingNodeIds: [],
  history: [{ nodes: EXAMPLE_NODES, edges: EXAMPLE_EDGES, label: 'Initial' }],
  historyPointer: 0,
  currentWorkflowId: null,
  currentWorkflowName: 'Untitled Workflow',
  backendOnline: false,
  activeSidebarView: 'workflows',

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes as any) as WFNode[] });
  },
  // Called by onNodeDragStop — commit positions to history AFTER drag ends
  onNodeDragStop: () => {
    get().pushHistory('Move node');
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection) => {
    set({ edges: addEdge({ ...connection, animated: true }, get().edges) });
    get().pushHistory('Connect nodes');
  },
  addNode: (type, position) => {
    const id = uuid();
    set({ nodes: [...get().nodes, { id, type, position, data: defaultData(type) }], selectedNodeId: id });
    get().pushHistory(`Add ${type} node`);
  },
  updateNodeData: (id, data) => {
    set({ nodes: get().nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } as WorkflowNodeData } : n) });
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
    const entry: HistoryEntry = { ...snapshot(nodes, edges), label };
    const newHistory = [...truncated, entry];
    const capped = newHistory.length > 60 ? newHistory.slice(-60) : newHistory;
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
  setActiveSidebarView: (view) => set({ activeSidebarView: view }),
  setSimulatingNodeIds: (ids) => set({ simulatingNodeIds: ids }),
  setBackendOnline: (v) => set({ backendOnline: v }),
  setCurrentWorkflow: (id, name) => set({ currentWorkflowId: id, currentWorkflowName: name }),

  loadTemplate: (nodes, edges) => {
    set({ nodes, edges, selectedNodeId: null, isTemplatesOpen: false, currentWorkflowId: null, currentWorkflowName: 'Untitled Workflow' });
    get().pushHistory('Load template');
  },
  loadExample: () => {
    set({ nodes: EXAMPLE_NODES, edges: EXAMPLE_EDGES, selectedNodeId: null, currentWorkflowId: null, currentWorkflowName: 'Untitled Workflow' });
    get().pushHistory('Load example');
  },
  loadWorkflowFromBackend: (nodes, edges, id, name) => {
    set({ nodes, edges, selectedNodeId: null, currentWorkflowId: id, currentWorkflowName: name });
    get().pushHistory(`Loaded "${name}"`);
  },
  exportWorkflow: () => JSON.stringify({ nodes: get().nodes, edges: get().edges }, null, 2),
  importWorkflow: (json) => {
    try {
      const { nodes, edges } = JSON.parse(json);
      set({ nodes, edges, selectedNodeId: null });
      get().pushHistory('Import workflow');
    } catch { console.error('Invalid JSON'); }
  },
  clearWorkflow: () => {
    set({ nodes: [], edges: [], selectedNodeId: null, currentWorkflowId: null, currentWorkflowName: 'Untitled Workflow' });
    get().pushHistory('Clear workflow');
  },
}));
