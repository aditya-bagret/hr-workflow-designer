import React from 'react';
import { Activity, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

const NODE_COLORS: Record<string, string> = {
  start: '#22c55e', task: '#3b82f6', approval: '#f97316', automated: '#a855f7', end: '#ef4444',
};
const NODE_LABELS: Record<string, string> = {
  start: 'Start', task: 'Task', approval: 'Approval', automated: 'Automation', end: 'End',
};

export const InfoPanel: React.FC = () => {
  const { nodes, edges, selectNode } = useWorkflowStore();

  // Compute stats
  const typeCounts = nodes.reduce<Record<string, number>>((acc, n) => {
    const t = (n.data as any).type as string;
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const connectedIds = new Set([...edges.map(e => e.source), ...edges.map(e => e.target)]);
  const disconnected = nodes.filter(n => !connectedIds.has(n.id) && nodes.length > 1);
  const hasStart = typeCounts['start'] > 0;
  const hasEnd = typeCounts['end'] > 0;

  const healthScore = Math.max(0, 100
    - (hasStart ? 0 : 30)
    - (hasEnd ? 0 : 20)
    - disconnected.length * 15
    - (typeCounts['start'] > 1 ? 20 : 0)
  );

  return (
    <div
      className="w-[220px] h-full flex flex-col flex-shrink-0"
      style={{ background: '#0a0b0f', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Header */}
      <div className="px-3.5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-0.5">
          <Activity size={12} className="text-orange-400" />
          <span className="text-[11px] font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            Flow Overview
          </span>
        </div>
        <p className="text-[10px] text-gray-600">Live workflow health</p>
      </div>

      {/* Health score */}
      <div className="px-3.5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-gray-600 uppercase tracking-wider">Health Score</span>
          <span
            className="text-[13px] font-bold"
            style={{ color: healthScore >= 80 ? '#22c55e' : healthScore >= 50 ? '#f97316' : '#ef4444' }}
          >
            {healthScore}%
          </span>
        </div>
        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${healthScore}%`,
              background: healthScore >= 80 ? '#22c55e' : healthScore >= 50 ? '#f97316' : '#ef4444',
            }}
          />
        </div>
      </div>

      {/* Node breakdown */}
      <div className="px-3.5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="text-[10px] text-gray-700 uppercase tracking-wider mb-2.5">Node Breakdown</div>
        <div className="space-y-2">
          {Object.entries(NODE_COLORS).map(([type, color]) => {
            const count = typeCounts[type] || 0;
            return (
              <div key={type} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color, opacity: count > 0 ? 1 : 0.25 }} />
                <span className="text-[11px] text-gray-500 flex-1">{NODE_LABELS[type]}</span>
                <span className="text-[11px] font-semibold" style={{ color: count > 0 ? color : '#374151' }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connections */}
      <div className="px-3.5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-gray-700 uppercase tracking-wider">Connections</div>
          <div className="flex items-center gap-1">
            <TrendingUp size={10} className="text-blue-400" />
            <span className="text-[12px] font-semibold text-blue-400">{edges.length}</span>
          </div>
        </div>
      </div>

      {/* Validation */}
      <div className="px-3.5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="text-[10px] text-gray-700 uppercase tracking-wider mb-2.5">Validation</div>
        <div className="space-y-2">
          <ValidationItem ok={hasStart} label="Has Start node" />
          <ValidationItem ok={hasEnd} label="Has End node" />
          <ValidationItem ok={disconnected.length === 0} label="All nodes connected" />
          <ValidationItem ok={typeCounts['start'] <= 1} label="Single start point" />
        </div>
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3">
        <div className="text-[10px] text-gray-700 uppercase tracking-wider mb-2.5">Nodes</div>
        <div className="space-y-1.5">
          {nodes.map(n => {
            const d = n.data as any;
            const color = NODE_COLORS[d.type];
            const isDisconnected = disconnected.some(dd => dd.id === n.id);
            return (
              <button
                key={n.id}
                onClick={() => selectNode(n.id)}
                className="w-full flex items-center gap-2 text-left hover:bg-white/[0.04] rounded-lg px-2 py-1.5 transition-colors group"
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-[11px] text-gray-400 group-hover:text-gray-200 truncate flex-1 transition-colors">
                  {d.label}
                </span>
                {isDisconnected && (
                  <AlertCircle size={9} className="text-orange-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
          {nodes.length === 0 && (
            <p className="text-[11px] text-gray-700 italic">No nodes yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

const ValidationItem: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => (
  <div className="flex items-center gap-2">
    {ok
      ? <CheckCircle2 size={10} className="text-green-500 flex-shrink-0" />
      : <AlertCircle size={10} className="text-orange-400 flex-shrink-0" />
    }
    <span className={`text-[11px] ${ok ? 'text-gray-600' : 'text-orange-400/80'}`}>{label}</span>
  </div>
);
