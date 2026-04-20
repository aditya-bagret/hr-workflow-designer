import { useMemo } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { WorkflowNodeData, ValidationError } from '../types/workflow';

export interface NodeValidationMap {
  [nodeId: string]: ValidationError[];
}

export function useWorkflowValidation(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): { errors: ValidationError[]; nodeErrors: NodeValidationMap; isValid: boolean } {
  return useMemo(() => {
    const errors: ValidationError[] = [];
    const nodeErrors: NodeValidationMap = {};

    const addError = (nodeId: string | undefined, message: string, severity: 'error' | 'warning') => {
      errors.push({ nodeId, message, severity });
      if (nodeId) {
        if (!nodeErrors[nodeId]) nodeErrors[nodeId] = [];
        nodeErrors[nodeId].push({ nodeId, message, severity });
      }
    };

    const startNodes = nodes.filter(n => (n.data as WorkflowNodeData).type === 'start');
    const endNodes = nodes.filter(n => (n.data as WorkflowNodeData).type === 'end');

    // Global checks
    if (startNodes.length === 0) {
      addError(undefined, 'Workflow must have a Start node', 'error');
    }
    if (startNodes.length > 1) {
      startNodes.forEach(n => addError(n.id, 'Only one Start node is allowed', 'error'));
    }
    if (endNodes.length === 0) {
      addError(undefined, 'Workflow should have an End node', 'warning');
    }

    // Build edge maps
    const outgoing = new Map<string, string[]>();
    const incoming = new Map<string, string[]>();
    nodes.forEach(n => { outgoing.set(n.id, []); incoming.set(n.id, []); });
    edges.forEach(e => {
      outgoing.get(e.source)?.push(e.target);
      incoming.get(e.target)?.push(e.source);
    });

    // Per-node checks
    nodes.forEach(n => {
      const data = n.data as WorkflowNodeData;
      const out = outgoing.get(n.id) || [];
      const inc = incoming.get(n.id) || [];

      // Connectivity checks
      if (nodes.length > 1) {
        if (data.type !== 'start' && inc.length === 0) {
          addError(n.id, `"${data.label}" has no incoming connection`, 'warning');
        }
        if (data.type !== 'end' && out.length === 0) {
          addError(n.id, `"${data.label}" has no outgoing connection`, 'warning');
        }
      }

      // Data completeness checks
      if (data.type === 'task') {
        if (!data.label?.trim()) addError(n.id, 'Task node requires a title', 'error');
        if (!data.assignee?.trim()) addError(n.id, 'Task has no assignee', 'warning');
      }
      if (data.type === 'approval') {
        if (!data.approverRole?.trim()) addError(n.id, 'Approval node needs an approver role', 'error');
      }
      if (data.type === 'automated') {
        if (!data.actionId) addError(n.id, 'Automated step has no action selected', 'error');
      }
    });

    // Cycle detection (DFS)
    const visited = new Set<string>();
    const inStack = new Set<string>();
    let hasCycle = false;

    const dfs = (id: string): boolean => {
      visited.add(id);
      inStack.add(id);
      for (const neighbor of outgoing.get(id) || []) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (inStack.has(neighbor)) {
          return true;
        }
      }
      inStack.delete(id);
      return false;
    };

    nodes.forEach(n => {
      if (!visited.has(n.id)) {
        if (dfs(n.id)) hasCycle = true;
      }
    });

    if (hasCycle) {
      addError(undefined, 'Workflow contains a cycle — execution would loop forever', 'error');
    }

    const isValid = errors.filter(e => e.severity === 'error').length === 0;
    return { errors, nodeErrors, isValid };
  }, [nodes, edges]);
}
