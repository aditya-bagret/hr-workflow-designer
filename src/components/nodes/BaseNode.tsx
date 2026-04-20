import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Trash2, AlertCircle, AlertTriangle } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { ValidationError } from '../../types/workflow';

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
  validationErrors?: ValidationError[];
  isSimulating?: boolean;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  id, selected, color, icon, label, subtitle, badge,
  hasSource = true, hasTarget = true, children,
  validationErrors = [], isSimulating = false,
}) => {
  const deleteNode = useWorkflowStore(s => s.deleteNode);
  const hasErrors = validationErrors.some(e => e.severity === 'error');
  const hasWarnings = validationErrors.some(e => e.severity === 'warning');

  const borderColor = isSimulating
    ? color
    : selected
      ? color
      : hasErrors
        ? '#ef4444'
        : hasWarnings
          ? '#f97316'
          : 'rgba(255,255,255,0.08)';

  const boxShadow = isSimulating
    ? `0 0 0 3px ${color}44, 0 0 24px ${color}55, 0 8px 32px rgba(0,0,0,0.5)`
    : selected
      ? `0 0 0 3px ${color}22, 0 8px 32px rgba(0,0,0,0.5)`
      : hasErrors
        ? '0 0 0 2px rgba(239,68,68,0.15), 0 4px 20px rgba(0,0,0,0.4)'
        : '0 4px 20px rgba(0,0,0,0.4)';

  return (
    <div
      className="node-card relative min-w-[230px] rounded-xl overflow-visible cursor-pointer"
      style={{
        background: isSimulating
          ? `linear-gradient(145deg, ${color}18, ${color}08)`
          : 'linear-gradient(145deg, #1a1d28, #141620)',
        border: `1.5px solid ${borderColor}`,
        boxShadow,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Color bar top */}
      <div
        className="h-[3px] w-full rounded-t-xl"
        style={{
          background: isSimulating ? `linear-gradient(90deg, ${color}, ${color}aa, ${color})` : color,
          backgroundSize: isSimulating ? '200% 100%' : undefined,
          animation: isSimulating ? 'shimmer 1.2s infinite linear' : undefined,
        }}
      />

      {/* Simulating pulse overlay */}
      {isSimulating && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${color}15, transparent 70%)`,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
          style={{ background: `${color}20`, color, boxShadow: isSimulating ? `0 0 8px ${color}60` : undefined }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: `${color}cc` }}>
            {badge}
          </div>
          <div className="text-[13px] font-semibold text-white leading-tight truncate">{label}</div>
        </div>

        {/* Validation badge */}
        {(hasErrors || hasWarnings) && !selected && (
          <div title={validationErrors.map(e => e.message).join('\n')}>
            {hasErrors
              ? <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
              : <AlertTriangle size={13} className="text-orange-400 flex-shrink-0" />
            }
          </div>
        )}

        {selected && (
          <button
            onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
            className="p-1 rounded hover:bg-red-500/20 hover:text-red-400 text-gray-600 transition-all flex-shrink-0"
            title="Delete node (or press Delete key)"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Subtitle */}
      <div className="px-3.5 pb-2">
        <p className="text-[11px] text-gray-500 truncate">{subtitle}</p>
      </div>

      {/* Validation errors (shown when selected) */}
      {selected && validationErrors.length > 0 && (
        <div className="px-3.5 pb-2 space-y-1">
          {validationErrors.map((err, i) => (
            <div
              key={i}
              className="flex items-start gap-1.5 text-[10px] px-2 py-1 rounded-lg"
              style={{
                background: err.severity === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.08)',
                color: err.severity === 'error' ? '#fca5a5' : '#fdba74',
              }}
            >
              {err.severity === 'error'
                ? <AlertCircle size={9} className="flex-shrink-0 mt-0.5" />
                : <AlertTriangle size={9} className="flex-shrink-0 mt-0.5" />
              }
              {err.message}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {children && (
        <div className="px-3.5 pb-3 border-t border-white/5 pt-2">{children}</div>
      )}

      {/* Handles */}
      {hasTarget && <Handle type="target" position={Position.Top} style={{ top: -6, background: '#1e2130' }} />}
      {hasSource && <Handle type="source" position={Position.Bottom} style={{ bottom: -6, background: '#1e2130' }} />}
    </div>
  );
};
