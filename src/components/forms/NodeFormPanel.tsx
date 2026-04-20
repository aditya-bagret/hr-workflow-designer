import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { getAutomations } from '../../api/mockApi';
import type {
  WorkflowNodeData, StartNodeData, TaskNodeData, ApprovalNodeData,
  AutomatedNodeData, EndNodeData, AutomationAction, KeyValuePair
} from '../../types/workflow';
import { v4 as uuid } from 'uuid';

// ── Shared UI helpers ──────────────────────────────────────────────────────

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
    {children}
  </label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 focus:bg-white/[0.06] transition-all ${props.className || ''}`}
  />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={`w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 focus:bg-white/[0.06] transition-all resize-none ${props.className || ''}`}
  />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => (
  <div className="relative">
    <select
      {...props}
      className={`w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-orange-500/60 appearance-none transition-all ${props.className || ''}`}
    >
      {children}
    </select>
    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
  </div>
);

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-5">
    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
      <div className="h-px flex-1 bg-white/5" />
      {title}
      <div className="h-px flex-1 bg-white/5" />
    </div>
    {children}
  </div>
);

const KeyValueEditor: React.FC<{
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}> = ({ pairs, onChange, keyPlaceholder = 'key', valuePlaceholder = 'value' }) => (
  <div className="space-y-2">
    {pairs.map(pair => (
      <div key={pair.id} className="flex gap-2 items-center">
        <Input
          value={pair.key} placeholder={keyPlaceholder}
          onChange={e => onChange(pairs.map(p => p.id === pair.id ? { ...p, key: e.target.value } : p))}
        />
        <Input
          value={pair.value} placeholder={valuePlaceholder}
          onChange={e => onChange(pairs.map(p => p.id === pair.id ? { ...p, value: e.target.value } : p))}
        />
        <button
          onClick={() => onChange(pairs.filter(p => p.id !== pair.id))}
          className="p-1.5 rounded hover:bg-red-500/15 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
        >
          <Trash2 size={12} />
        </button>
      </div>
    ))}
    <button
      onClick={() => onChange([...pairs, { id: uuid(), key: '', value: '' }])}
      className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-orange-400 transition-colors mt-1"
    >
      <Plus size={11} /> Add field
    </button>
  </div>
);

// ── Individual Form Components ───────────────────────────────────────────────

const StartForm: React.FC<{ data: StartNodeData; update: (d: Partial<StartNodeData>) => void }> = ({ data, update }) => (
  <>
    <FormSection title="Basic">
      <Label>Workflow Title</Label>
      <Input value={data.label} placeholder="e.g. New Hire Onboarding" onChange={e => update({ label: e.target.value })} />
    </FormSection>
    <FormSection title="Metadata">
      <KeyValueEditor pairs={data.metadata} onChange={metadata => update({ metadata })} keyPlaceholder="field" valuePlaceholder="value" />
    </FormSection>
  </>
);

const TaskForm: React.FC<{ data: TaskNodeData; update: (d: Partial<TaskNodeData>) => void }> = ({ data, update }) => (
  <>
    <FormSection title="Task Details">
      <div className="space-y-3">
        <div>
          <Label>Title *</Label>
          <Input value={data.label} placeholder="Task title" onChange={e => update({ label: e.target.value })} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={data.description} rows={3} placeholder="What needs to be done?" onChange={e => update({ description: e.target.value })} />
        </div>
      </div>
    </FormSection>
    <FormSection title="Assignment">
      <div className="space-y-3">
        <div>
          <Label>Assignee</Label>
          <Input value={data.assignee} placeholder="Person or role" onChange={e => update({ assignee: e.target.value })} />
        </div>
        <div>
          <Label>Due Date</Label>
          <Input type="date" value={data.dueDate} onChange={e => update({ dueDate: e.target.value })} />
        </div>
      </div>
    </FormSection>
    <FormSection title="Custom Fields">
      <KeyValueEditor pairs={data.customFields} onChange={customFields => update({ customFields })} />
    </FormSection>
  </>
);

const ApprovalForm: React.FC<{ data: ApprovalNodeData; update: (d: Partial<ApprovalNodeData>) => void }> = ({ data, update }) => (
  <>
    <FormSection title="Approval Settings">
      <div className="space-y-3">
        <div>
          <Label>Title</Label>
          <Input value={data.label} placeholder="Approval step name" onChange={e => update({ label: e.target.value })} />
        </div>
        <div>
          <Label>Approver Role</Label>
          <Select value={data.approverRole} onChange={e => update({ approverRole: e.target.value })}>
            <option value="Manager">Manager</option>
            <option value="Director">Director</option>
            <option value="HRBP">HRBP</option>
            <option value="VP">VP</option>
            <option value="C-Level">C-Level</option>
            <option value="custom">Custom...</option>
          </Select>
        </div>
      </div>
    </FormSection>
    <FormSection title="Auto-Approve">
      <Label>Threshold (%)</Label>
      <div className="space-y-2">
        <Input
          type="number" min={0} max={100} value={data.autoApproveThreshold}
          placeholder="0 = disabled"
          onChange={e => update({ autoApproveThreshold: Number(e.target.value) })}
        />
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${data.autoApproveThreshold}%`,
                background: data.autoApproveThreshold > 70 ? '#22c55e' : data.autoApproveThreshold > 40 ? '#f97316' : '#ef4444',
              }}
            />
          </div>
          <span className="text-[11px] text-gray-500">{data.autoApproveThreshold}%</span>
        </div>
        <p className="text-[10px] text-gray-600">If score ≥ threshold, auto-approve. Set to 0 to disable.</p>
      </div>
    </FormSection>
  </>
);

const AutomatedForm: React.FC<{ data: AutomatedNodeData; update: (d: Partial<AutomatedNodeData>) => void }> = ({ data, update }) => {
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAutomations().then(a => { setAutomations(a); setLoading(false); });
  }, []);

  const selectedAction = automations.find(a => a.id === data.actionId);

  return (
    <>
      <FormSection title="Step Info">
        <Label>Title</Label>
        <Input value={data.label} placeholder="Step name" onChange={e => update({ label: e.target.value })} />
      </FormSection>
      <FormSection title="Action">
        <Label>Choose Action</Label>
        {loading ? (
          <div className="text-[12px] text-gray-600 py-2">Loading actions...</div>
        ) : (
          <Select
            value={data.actionId}
            onChange={e => update({ actionId: e.target.value, actionParams: {} })}
          >
            <option value="">— Select an action —</option>
            {automations.map(a => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </Select>
        )}
      </FormSection>
      {selectedAction && selectedAction.params.length > 0 && (
        <FormSection title="Parameters">
          <div className="space-y-3">
            {selectedAction.params.map(param => (
              <div key={param}>
                <Label>{param.replace(/_/g, ' ')}</Label>
                <Input
                  value={data.actionParams[param] || ''}
                  placeholder={`Enter ${param}`}
                  onChange={e => update({ actionParams: { ...data.actionParams, [param]: e.target.value } })}
                />
              </div>
            ))}
          </div>
        </FormSection>
      )}
    </>
  );
};

const EndForm: React.FC<{ data: EndNodeData; update: (d: Partial<EndNodeData>) => void }> = ({ data, update }) => (
  <>
    <FormSection title="End Settings">
      <div className="space-y-3">
        <div>
          <Label>Title</Label>
          <Input value={data.label} placeholder="End node title" onChange={e => update({ label: e.target.value })} />
        </div>
        <div>
          <Label>Completion Message</Label>
          <Textarea value={data.endMessage} rows={3} placeholder="Message shown on completion" onChange={e => update({ endMessage: e.target.value })} />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div>
            <div className="text-[12px] font-medium text-gray-300">Show Summary</div>
            <div className="text-[10px] text-gray-600">Display a summary of completed steps</div>
          </div>
          <button
            onClick={() => update({ showSummary: !data.showSummary })}
            className={`relative w-9 h-5 rounded-full transition-all ${data.showSummary ? 'bg-orange-500' : 'bg-white/10'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${data.showSummary ? 'left-4.5' : 'left-0.5'}`} style={{ left: data.showSummary ? '18px' : '2px' }} />
          </button>
        </div>
      </div>
    </FormSection>
  </>
);

// ── Main NodeFormPanel ───────────────────────────────────────────────────────

const NODE_COLORS: Record<string, string> = {
  start: '#22c55e', task: '#3b82f6', approval: '#f97316', automated: '#a855f7', end: '#ef4444',
};

const NODE_LABELS: Record<string, string> = {
  start: 'Start Node', task: 'Task Node', approval: 'Approval Node', automated: 'Automated Step', end: 'End Node',
};

export const NodeFormPanel: React.FC = () => {
  const { selectedNodeId, nodes, updateNodeData, selectNode, deleteNode } = useWorkflowStore();

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!selectedNode) return null;

  const data = selectedNode.data as WorkflowNodeData;
  const color = NODE_COLORS[data.type];
  const update = (partial: Partial<WorkflowNodeData>) => updateNodeData(selectedNode.id, partial);

  return (
    <div
      className="w-[300px] h-full flex flex-col animate-slide-in"
      style={{ background: '#0f1117', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-[12px] font-semibold text-white">{NODE_LABELS[data.type]}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => deleteNode(selectedNode.id)}
            className="p-1.5 rounded hover:bg-red-500/15 text-gray-600 hover:text-red-400 transition-colors"
            title="Delete node"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => selectNode(null)}
            className="p-1.5 rounded hover:bg-white/[0.06] text-gray-600 hover:text-gray-300 transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Node ID */}
      <div className="px-4 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span className="text-[10px] font-mono text-gray-700">id: {selectedNode.id.slice(0, 8)}</span>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {data.type === 'start' && <StartForm data={data as StartNodeData} update={update as (d: Partial<StartNodeData>) => void} />}
        {data.type === 'task' && <TaskForm data={data as TaskNodeData} update={update as (d: Partial<TaskNodeData>) => void} />}
        {data.type === 'approval' && <ApprovalForm data={data as ApprovalNodeData} update={update as (d: Partial<ApprovalNodeData>) => void} />}
        {data.type === 'automated' && <AutomatedForm data={data as AutomatedNodeData} update={update as (d: Partial<AutomatedNodeData>) => void} />}
        {data.type === 'end' && <EndForm data={data as EndNodeData} update={update as (d: Partial<EndNodeData>) => void} />}
      </div>
    </div>
  );
};
