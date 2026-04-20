import type { AutomationAction, SimulationResult, SimulationStep } from '../types/workflow';
import type { Node, Edge } from '@xyflow/react';
import type { WorkflowNodeData, NodeType } from '../types/workflow';

// Mock automation actions
const MOCK_AUTOMATIONS: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'slack_notify', label: 'Send Slack Notification', params: ['channel', 'message'] },
  { id: 'create_ticket', label: 'Create JIRA Ticket', params: ['project', 'summary', 'priority'] },
  { id: 'update_hris', label: 'Update HRIS Record', params: ['employeeId', 'field', 'value'] },
  { id: 'schedule_meeting', label: 'Schedule Meeting', params: ['participants', 'duration', 'agenda'] },
  { id: 'provision_access', label: 'Provision System Access', params: ['system', 'role', 'employeeId'] },
  { id: 'send_offer', label: 'Send Offer Letter', params: ['candidateEmail', 'offerTemplate'] },
];

export const getAutomations = async (): Promise<AutomationAction[]> => {
  await delay(300);
  return MOCK_AUTOMATIONS;
};

export const simulateWorkflow = async (
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): Promise<SimulationResult> => {
  await delay(800);

  const errors: string[] = [];
  const warnings: string[] = [];
  const steps: SimulationStep[] = [];

  // Validate structure
  const startNodes = nodes.filter(n => n.data.type === 'start');
  const endNodes = nodes.filter(n => n.data.type === 'end');

  if (startNodes.length === 0) errors.push('Workflow must have a Start node');
  if (startNodes.length > 1) errors.push('Workflow can only have one Start node');
  if (endNodes.length === 0) warnings.push('Workflow has no End node');

  // Check for disconnected nodes
  const connectedNodeIds = new Set([
    ...edges.map(e => e.source),
    ...edges.map(e => e.target),
  ]);
  const disconnected = nodes.filter(n => !connectedNodeIds.has(n.id) && nodes.length > 1);
  if (disconnected.length > 0) {
    disconnected.forEach(n => {
      warnings.push(`Node "${(n.data as WorkflowNodeData).label}" is not connected`);
    });
  }

  // Build execution order via topological sort
  const ordered = topologicalSort(nodes, edges);

  // Simulate execution
  let time = 0;
  for (const node of ordered) {
    const data = node.data as WorkflowNodeData;
    const duration = Math.floor(Math.random() * 400) + 100;
    time += duration;

    const step: SimulationStep = {
      nodeId: node.id,
      nodeLabel: data.label,
      nodeType: data.type as NodeType,
      status: 'success',
      message: getStepMessage(data),
      timestamp: new Date(Date.now() + time).toISOString(),
      duration,
    };

    // Simulate some realistic conditions
    if (data.type === 'approval') {
      const threshold = (data as any).autoApproveThreshold || 0;
      if (threshold > 0 && threshold < 50) {
        step.status = 'warning';
        step.message = `Auto-approval threshold ${threshold}% is low — manual review recommended`;
      }
    }

    steps.push(step);
  }

  const success = errors.length === 0;

  return {
    success,
    totalSteps: steps.length,
    completedSteps: steps.filter(s => s.status === 'success' || s.status === 'warning').length,
    steps,
    errors,
    warnings,
    executionTime: time,
  };
};

// --- Helpers ---

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getStepMessage(data: WorkflowNodeData): string {
  switch (data.type) {
    case 'start':
      return `Workflow initiated: "${data.label}"`;
    case 'task':
      return `Task assigned to ${(data as any).assignee || 'unassigned'} — "${data.label}"`;
    case 'approval':
      return `Awaiting approval from ${(data as any).approverRole || 'Manager'}`;
    case 'automated':
      return `Executing automation: ${(data as any).actionId || 'none configured'}`;
    case 'end':
      return `Workflow completed — ${(data as any).endMessage || 'Done'}`;
    default:
      return 'Step executed';
  }
}

function topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
  const adjList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  const nodeMap = new Map<string, Node>();

  nodes.forEach(n => {
    adjList.set(n.id, []);
    inDegree.set(n.id, 0);
    nodeMap.set(n.id, n);
  });

  edges.forEach(e => {
    adjList.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
  });

  const queue: string[] = [];
  inDegree.forEach((deg, id) => { if (deg === 0) queue.push(id); });

  const result: Node[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = nodeMap.get(id);
    if (node) result.push(node);
    adjList.get(id)?.forEach(neighbor => {
      const newDeg = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    });
  }

  // If not all nodes were processed, there's a cycle — return what we have
  return result.length === nodes.length ? result : nodes;
}
