import type { AutomationAction, SimulationResult } from '../types/workflow';
import type { Node, Edge } from '@xyflow/react';

const BASE = 'http://localhost:8000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Automations ───────────────────────────────────────────────────────────────
export const getAutomations = (): Promise<AutomationAction[]> =>
  request('/automations');

// ── Simulate ──────────────────────────────────────────────────────────────────
export const simulateWorkflow = (
  nodes: Node[],
  edges: Edge[]
): Promise<SimulationResult> =>
  request('/simulate', {
    method: 'POST',
    body: JSON.stringify({ nodes, edges }),
  });

// ── Saved Workflow types ───────────────────────────────────────────────────────
export interface SavedWorkflowMeta {
  id: string;
  name: string;
  description: string;
  nodeCount: number;
  edgeCount: number;
  created_at: string;
  updated_at: string;
}

export interface SavedWorkflow extends SavedWorkflowMeta {
  nodes: Node[];
  edges: Edge[];
}

// ── CRUD ──────────────────────────────────────────────────────────────────────
export const listWorkflows = (): Promise<SavedWorkflowMeta[]> =>
  request('/workflows');

export const getWorkflow = (id: string): Promise<SavedWorkflow> =>
  request(`/workflows/${id}`);

export const saveWorkflow = (
  name: string,
  description: string,
  nodes: Node[],
  edges: Edge[]
): Promise<SavedWorkflow> =>
  request('/workflows', {
    method: 'POST',
    body: JSON.stringify({ name, description, nodes, edges }),
  });

export const updateWorkflow = (
  id: string,
  name: string,
  description: string,
  nodes: Node[],
  edges: Edge[]
): Promise<SavedWorkflow> =>
  request(`/workflows/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, description, nodes, edges }),
  });

export const deleteWorkflow = (id: string): Promise<void> =>
  request(`/workflows/${id}`, { method: 'DELETE' });

export const checkHealth = (): Promise<{ status: string }> =>
  request('/health');
