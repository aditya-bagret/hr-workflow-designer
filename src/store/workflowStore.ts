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

interface WorkflowStore {
  nodes: WFNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  isSandboxOpen: boolean;

  // Actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNodeData>) => void;
  selectNode: (id: string | null) => void;
  deleteNode: (id: string) => void;
  toggleSandbox: () => void;
  loadExample: () => void;
  exportWorkflow: () => string;
  importWorkflow: (json: string) => void;
  clearWorkflow: () => void;
}

type WFNode = Node<WorkflowNodeData>;

const defaultNodeData = (type: NodeType): WorkflowNodeData => {
  switch (type) {
    case 'start':
      return { type: 'start', label: 'Start', metadata: [] };
    case 'task':
      return { type: 'task', label: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] };
    case 'approval':
      return { type: 'approval', label: 'Approval', approverRole: 'Manager', autoApproveThreshold: 0 };
    case 'automated':
      return { type: 'automated', label: 'Automated Step', actionId: '', actionParams: {} };
    case 'end':
      return { type: 'end', label: 'End', endMessage: 'Workflow completed', showSummary: false };
  }
};

const EXAMPLE_NODES: WFNode[] = [
  { id: 'n1', type: 'start', position: { x: 300, y: 80 }, data: { type: 'start', label: 'New Hire Onboarding', metadata: [{ id: 'a', key: 'department', value: 'Engineering' }] } },
  { id: 'n2', type: 'task', position: { x: 300, y: 230 }, data: { type: 'task', label: 'Collect Documents', description: 'Gather ID, tax forms, and bank details', assignee: 'HR Admin', dueDate: '2025-01-10', customFields: [] } },
  { id: 'n3', type: 'automated', position: { x: 300, y: 390 }, data: { type: 'automated', label: 'Generate Offer Letter', actionId: 'generate_doc', actionParams: { template: 'offer_letter', recipient: 'new_hire' } } },
  { id: 'n4', type: 'approval', position: { x: 300, y: 550 }, data: { type: 'approval', label: 'Manager Approval', approverRole: 'Director', autoApproveThreshold: 80 } },
  { id: 'n5', type: 'automated', position: { x: 300, y: 710 }, data: { type: 'automated', label: 'Provision Access', actionId: 'provision_access', actionParams: { system: 'GitHub', role: 'engineer', employeeId: '' } } },
  { id: 'n6', type: 'end', position: { x: 300, y: 870 }, data: { type: 'end', label: 'Onboarding Complete', endMessage: 'Employee successfully onboarded!', showSummary: true } },
];

const EXAMPLE_EDGES: Edge[] = [
  { id: 'e1-2', source: 'n1', target: 'n2', animated: true },
  { id: 'e2-3', source: 'n2', target: 'n3', animated: true },
  { id: 'e3-4', source: 'n3', target: 'n4', animated: true },
  { id: 'e4-5', source: 'n4', target: 'n5', animated: true },
  { id: 'e5-6', source: 'n5', target: 'n6', animated: true },
];

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: EXAMPLE_NODES,
  edges: EXAMPLE_EDGES,
  selectedNodeId: null,
  isSandboxOpen: false,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes as any) as WFNode[] });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection) => {
    set({ edges: addEdge({ ...connection, animated: true }, get().edges) });
  },
  addNode: (type, position) => {
    const id = uuid();
    const newNode: WFNode = {
      id,
      type,
      position,
      data: defaultNodeData(type),
    };
    set({ nodes: [...get().nodes, newNode], selectedNodeId: id });
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
  },
  toggleSandbox: () => set({ isSandboxOpen: !get().isSandboxOpen }),
  loadExample: () => set({ nodes: EXAMPLE_NODES, edges: EXAMPLE_EDGES, selectedNodeId: null }),
  exportWorkflow: () => JSON.stringify({ nodes: get().nodes, edges: get().edges }, null, 2),
  importWorkflow: (json) => {
    try {
      const { nodes, edges } = JSON.parse(json);
      set({ nodes, edges, selectedNodeId: null });
    } catch {
      console.error('Invalid workflow JSON');
    }
  },
  clearWorkflow: () => set({ nodes: [], edges: [], selectedNodeId: null }),
}));
