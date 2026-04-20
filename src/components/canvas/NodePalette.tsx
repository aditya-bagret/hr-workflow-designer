import React from 'react';
import { Play, ClipboardList, CheckSquare, Zap, Flag, LayoutGrid } from 'lucide-react';
import type { NodeType } from '../../types/workflow';

const NODE_TYPES: Array<{
  type: NodeType;
  label: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}> = [
  { type: 'start', label: 'Start', description: 'Workflow entry point', color: '#22c55e', icon: <Play size={14} /> },
  { type: 'task', label: 'Task', description: 'Assign a human task', color: '#3b82f6', icon: <ClipboardList size={14} /> },
  { type: 'approval', label: 'Approval', description: 'Request sign-off', color: '#f97316', icon: <CheckSquare size={14} /> },
  { type: 'automated', label: 'Automation', description: 'Trigger system action', color: '#a855f7', icon: <Zap size={14} /> },
  { type: 'end', label: 'End', description: 'Workflow completion', color: '#ef4444', icon: <Flag size={14} /> },
];

export const NodePalette: React.FC = () => {
  const onDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-1">
          <LayoutGrid size={13} className="text-gray-500" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Node Types</span>
        </div>
        <p className="text-[10px] text-gray-700">Drag onto canvas to add</p>
      </div>

      {/* Node items */}
      <div className="flex flex-col gap-1.5 p-2.5 flex-1">
        {NODE_TYPES.map(({ type, label, description, color, icon }) => (
          <div
            key={type}
            draggable
            onDragStart={e => onDragStart(e, type)}
            className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing transition-all select-none"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.background = `${color}12`;
              (e.currentTarget as HTMLDivElement).style.borderColor = `${color}40`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
            }}
          >
            <div
              className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all"
              style={{ background: `${color}18`, color }}
            >
              {icon}
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-gray-300 group-hover:text-white transition-colors">
                {label}
              </div>
              <div className="text-[10px] text-gray-600 truncate">{description}</div>
            </div>
            <div className="ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-1 h-4 rounded-full" style={{ background: color, opacity: 0.6 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="p-3 mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[10px] text-gray-700 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-px bg-white/20" />
            <span>Edge connection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-px bg-orange-500" />
            <span>Selected / hover</span>
          </div>
        </div>
      </div>
    </div>
  );
};
