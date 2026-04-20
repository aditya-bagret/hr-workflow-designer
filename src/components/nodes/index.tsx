import React from 'react';
import { type NodeProps } from '@xyflow/react';
import { Play, ClipboardList, CheckSquare, Zap, Flag, User, Calendar } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { useWorkflowStore } from '../../store/workflowStore';
import { useWorkflowValidation } from '../../hooks/useWorkflowValidation';
import type {
  StartNodeData, TaskNodeData, ApprovalNodeData, AutomatedNodeData, EndNodeData
} from '../../types/workflow'; // types

function useNodeContext(id: string) {
  const { nodes, edges, simulatingNodeIds } = useWorkflowStore();
  const { nodeErrors } = useWorkflowValidation(nodes, edges);
  return {
    validationErrors: nodeErrors[id] || [],
    isSimulating: simulatingNodeIds.includes(id),
  };
}

export const StartNode: React.FC<NodeProps> = ({ id, selected, data }) => {
  const d = data as StartNodeData;
  const { validationErrors, isSimulating } = useNodeContext(id);
  return (
    <BaseNode id={id} selected={selected} color="#22c55e" icon={<Play size={14} />} badge="trigger"
      label={d.label} subtitle={d.metadata.length > 0 ? `${d.metadata.length} metadata field${d.metadata.length !== 1 ? 's' : ''}` : 'No metadata'}
      hasTarget={false} validationErrors={validationErrors} isSimulating={isSimulating}
    >
      {d.metadata.slice(0, 2).map(m => (
        <div key={m.id} className="flex items-center gap-2 mt-1">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 font-mono truncate max-w-[80px]">{m.key}</span>
          <span className="text-[10px] text-gray-500 truncate">{m.value}</span>
        </div>
      ))}
    </BaseNode>
  );
};

export const TaskNode: React.FC<NodeProps> = ({ id, selected, data }) => {
  const d = data as TaskNodeData;
  const { validationErrors, isSimulating } = useNodeContext(id);
  return (
    <BaseNode id={id} selected={selected} color="#3b82f6" icon={<ClipboardList size={14} />} badge="human task"
      label={d.label} subtitle={d.description || 'No description'}
      validationErrors={validationErrors} isSimulating={isSimulating}
    >
      <div className="flex flex-col gap-1 mt-1">
        {d.assignee && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <User size={10} className="text-blue-400" /><span className="truncate">{d.assignee}</span>
          </div>
        )}
        {d.dueDate && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Calendar size={10} className="text-blue-400" /><span>{d.dueDate}</span>
          </div>
        )}
        {d.customFields.length > 0 && (
          <div className="text-[10px] text-gray-600">+{d.customFields.length} custom field{d.customFields.length !== 1 ? 's' : ''}</div>
        )}
      </div>
    </BaseNode>
  );
};

export const ApprovalNode: React.FC<NodeProps> = ({ id, selected, data }) => {
  const d = data as ApprovalNodeData;
  const { validationErrors, isSimulating } = useNodeContext(id);
  return (
    <BaseNode id={id} selected={selected} color="#f97316" icon={<CheckSquare size={14} />} badge="approval"
      label={d.label} subtitle={`Approver: ${d.approverRole}`}
      validationErrors={validationErrors} isSimulating={isSimulating}
    >
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-gray-500">Auto-approve</span>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: d.autoApproveThreshold > 0 ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)', color: d.autoApproveThreshold > 0 ? '#f97316' : '#6b7280' }}>
          {d.autoApproveThreshold > 0 ? `${d.autoApproveThreshold}%` : 'Off'}
        </span>
      </div>
    </BaseNode>
  );
};

export const AutomatedNode: React.FC<NodeProps> = ({ id, selected, data }) => {
  const d = data as AutomatedNodeData;
  const { validationErrors, isSimulating } = useNodeContext(id);
  const paramCount = Object.keys(d.actionParams).length;
  return (
    <BaseNode id={id} selected={selected} color="#a855f7" icon={<Zap size={14} />} badge="automation"
      label={d.label} subtitle={d.actionId ? d.actionId.replace(/_/g, ' ') : 'No action selected'}
      validationErrors={validationErrors} isSimulating={isSimulating}
    >
      {d.actionId && (
        <div className="flex items-center gap-1 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-[10px] text-gray-500">{paramCount} param{paramCount !== 1 ? 's' : ''} configured</span>
        </div>
      )}
    </BaseNode>
  );
};

export const EndNode: React.FC<NodeProps> = ({ id, selected, data }) => {
  const d = data as EndNodeData;
  const { validationErrors, isSimulating } = useNodeContext(id);
  return (
    <BaseNode id={id} selected={selected} color="#ef4444" icon={<Flag size={14} />} badge="end"
      label={d.label} subtitle={d.endMessage || 'Workflow ends here'}
      hasSource={false} validationErrors={validationErrors} isSimulating={isSimulating}
    >
      {d.showSummary && (
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <span className="text-[10px] text-red-400/70">Summary enabled</span>
        </div>
      )}
    </BaseNode>
  );
};
