import React from 'react';
import { type NodeProps } from '@xyflow/react';
import { Play, ClipboardList, CheckSquare, Zap, Flag, User, Calendar } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type {
  StartNodeData, TaskNodeData, ApprovalNodeData, AutomatedNodeData, EndNodeData
} from '../../types/workflow';

// ─── Start Node ──────────────────────────────────────────────────────────────
export const StartNode: React.FC<NodeProps> = ({ id, selected, data }) => {
  const d = data as StartNodeData;
  return (
    <BaseNode
      id={id} selected={selected} color="#22c55e"
      icon={<Play size={14} />} badge="trigger" label={d.label}
      subtitle={d.metadata.length > 0 ? `${d.metadata.length} metadata field${d.metadata.length > 1 ? 's' : ''}` : 'No metadata'}
      hasTarget={false}
    >
      {d.metadata.slice(0, 2).map(m => (
        <div key={m.id} className="flex items-center gap-2 mt-1">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 font-mono">{m.key}</span>
          <span className="text-[10px] text-gray-500 truncate">{m.value}</span>
        </div>
      ))}
    </BaseNode>
  );
};

// ─── Task Node ───────────────────────────────────────────────────────────────
export const TaskNode: React.FC<NodeProps> = ({ id, selected, data }) => {
  const d = data as TaskNodeData;
  return (
    <BaseNode
      id={id} selected={selected} color="#3b82f6"
      icon={<ClipboardList size={14} />} badge="human task" label={d.label}
      subtitle={d.description || 'No description'}
    >
      <div className="flex flex-col gap-1 mt-1">
        {d.assignee && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <User size={10} className="text-blue-400" />
            <span className="truncate">{d.assignee}</span>
          </div>
        )}
        {d.dueDate && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Calendar size={10} className="text-blue-400" />
            <span>{d.dueDate}</span>
          </div>
        )}
        {d.customFields.length > 0 && (
          <div className="text-[10px] text-gray-600 mt-0.5">+{d.customFields.length} custom field{d.customFields.length > 1 ? 's' : ''}</div>
        )}
      </div>
    </BaseNode>
  );
};

// ─── Approval Node ───────────────────────────────────────────────────────────
export const ApprovalNode: React.FC<NodeProps> = ({ id, selected, data }) => {
  const d = data as ApprovalNodeData;
  return (
    <BaseNode
      id={id} selected={selected} color="#f97316"
      icon={<CheckSquare size={14} />} badge="approval" label={d.label}
      subtitle={`Approver: ${d.approverRole}`}
    >
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-gray-500">Auto-approve</span>
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: d.autoApproveThreshold > 0 ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)',
            color: d.autoApproveThreshold > 0 ? '#f97316' : '#6b7280',
          }}
        >
          {d.autoApproveThreshold > 0 ? `${d.autoApproveThreshold}%` : 'Off'}
        </span>
      </div>
    </BaseNode>
  );
};

// ─── Automated Step Node ─────────────────────────────────────────────────────
export const AutomatedNode: React.FC<NodeProps> = ({ id, selected, data }) => {
  const d = data as AutomatedNodeData;
  const paramCount = Object.keys(d.actionParams).length;
  return (
    <BaseNode
      id={id} selected={selected} color="#a855f7"
      icon={<Zap size={14} />} badge="automation" label={d.label}
      subtitle={d.actionId ? d.actionId.replace(/_/g, ' ') : 'No action selected'}
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

// ─── End Node ────────────────────────────────────────────────────────────────
export const EndNode: React.FC<NodeProps> = ({ id, selected, data }) => {
  const d = data as EndNodeData;
  return (
    <BaseNode
      id={id} selected={selected} color="#ef4444"
      icon={<Flag size={14} />} badge="end" label={d.label}
      subtitle={d.endMessage || 'Workflow ends here'}
      hasSource={false}
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
