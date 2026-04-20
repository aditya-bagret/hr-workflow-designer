import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

interface BaseNodeProps {
  id: string;
  selected: boolean;
  color: string;
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  badge?: string;
  hasSource?: boolean;
  hasTarget?: boolean;
  children?: React.ReactNode;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  id, selected, color, icon, label, subtitle, badge,
  hasSource = true, hasTarget = true, children
}) => {
  const deleteNode = useWorkflowStore(s => s.deleteNode);

  return (
    <div
      className="node-card relative min-w-[220px] rounded-xl overflow-visible cursor-pointer"
      style={{
        background: 'linear-gradient(145deg, #1a1d28, #141620)',
        border: selected
          ? `1.5px solid ${color}`
          : '1.5px solid rgba(255,255,255,0.08)',
        boxShadow: selected
          ? `0 0 0 3px ${color}22, 0 8px 32px rgba(0,0,0,0.5)`
          : '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Color bar top */}
      <div className="h-[3px] w-full rounded-t-xl" style={{ background: color }} />

      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
          style={{ background: `${color}20`, color }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: `${color}cc` }}>
            {badge}
          </div>
          <div className="text-[13px] font-semibold text-white leading-tight truncate">{label}</div>
        </div>
        {selected && (
          <button
            onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 text-gray-600 transition-all"
            title="Delete node"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Subtitle */}
      <div className="px-3.5 pb-2">
        <p className="text-[11px] text-gray-500 truncate">{subtitle}</p>
      </div>

      {/* Content */}
      {children && (
        <div className="px-3.5 pb-3 border-t border-white/5 pt-2">{children}</div>
      )}

      {/* Handles */}
      {hasTarget && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ top: -6, background: '#1e2130' }}
        />
      )}
      {hasSource && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ bottom: -6, background: '#1e2130' }}
        />
      )}
    </div>
  );
};
