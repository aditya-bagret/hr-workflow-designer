import React from 'react';
import { Activity, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { SavedWorkflowsPanel } from './SavedWorkflowsPanel';
import {
  DashboardView, ComplianceView, SchedulerView, AnalyticsView,
  IntegrationsView, RepositoryView, MembersView, InboxView, MessagesView,
} from './SidebarViews';

const NODE_COLORS: Record<string, string> = {
  start:'#22c55e', task:'#3b82f6', approval:'#f97316', automated:'#a855f7', end:'#ef4444',
};
const NODE_LABELS: Record<string, string> = {
  start:'Start', task:'Task', approval:'Approval', automated:'Automation', end:'End',
};

const FlowOverview: React.FC = () => {
  const { nodes, edges, selectNode } = useWorkflowStore();
  const typeCounts = nodes.reduce<Record<string, number>>((acc, n) => {
    const t = (n.data as any).type as string;
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const connectedIds = new Set([...edges.map(e => e.source), ...edges.map(e => e.target)]);
  const disconnected = nodes.filter(n => !connectedIds.has(n.id) && nodes.length > 1);
  const hasStart = !!typeCounts['start'];
  const hasEnd = !!typeCounts['end'];
  const healthScore = Math.max(0, 100 - (!hasStart ? 30 : 0) - (!hasEnd ? 20 : 0) - disconnected.length * 15 - (typeCounts['start'] > 1 ? 20 : 0));

  return (
    <div className="flex flex-col h-full">
      <div className="px-3.5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-0.5">
          <Activity size={12} className="text-orange-400" />
          <span className="text-[11px] font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Flow Overview</span>
        </div>
        <p className="text-[10px] text-gray-600">Select a node to edit it</p>
      </div>
      <div className="px-3.5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-gray-600 uppercase tracking-wider">Health Score</span>
          <span className="text-[13px] font-bold" style={{ color: healthScore >= 80 ? '#22c55e' : healthScore >= 50 ? '#f97316' : '#ef4444' }}>{healthScore}%</span>
        </div>
        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${healthScore}%`, background: healthScore >= 80 ? '#22c55e' : healthScore >= 50 ? '#f97316' : '#ef4444' }} />
        </div>
      </div>
      <div className="px-3.5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="text-[10px] text-gray-700 uppercase tracking-wider mb-2.5">Node Breakdown</div>
        <div className="space-y-2">
          {Object.entries(NODE_COLORS).map(([type, color]) => {
            const count = typeCounts[type] || 0;
            return (
              <div key={type} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color, opacity: count > 0 ? 1 : 0.25 }} />
                <span className="text-[11px] text-gray-500 flex-1">{NODE_LABELS[type]}</span>
                <span className="text-[11px] font-semibold" style={{ color: count > 0 ? color : '#374151' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="px-3.5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-gray-700 uppercase tracking-wider">Connections</div>
          <div className="flex items-center gap-1">
            <TrendingUp size={10} className="text-blue-400" />
            <span className="text-[12px] font-semibold text-blue-400">{edges.length}</span>
          </div>
        </div>
      </div>
      <div className="px-3.5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="text-[10px] text-gray-700 uppercase tracking-wider mb-2.5">Validation</div>
        <div className="space-y-2">
          {[
            { ok: hasStart, label: 'Has Start node' },
            { ok: hasEnd, label: 'Has End node' },
            { ok: disconnected.length === 0, label: 'All nodes connected' },
            { ok: (typeCounts['start'] || 0) <= 1, label: 'Single start point' },
          ].map(({ ok, label }) => (
            <div key={label} className="flex items-center gap-2">
              {ok ? <CheckCircle2 size={10} className="text-green-500 flex-shrink-0" /> : <AlertCircle size={10} className="text-orange-400 flex-shrink-0" />}
              <span className={`text-[11px] ${ok ? 'text-gray-600' : 'text-orange-400/80'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3.5 py-3">
        <div className="text-[10px] text-gray-700 uppercase tracking-wider mb-2.5">Nodes</div>
        <div className="space-y-1.5">
          {nodes.map(n => {
            const d = n.data as any;
            const color = NODE_COLORS[d.type];
            const isDisc = disconnected.some(dd => dd.id === n.id);
            return (
              <button key={n.id} onClick={() => selectNode(n.id)}
                className="w-full flex items-center gap-2 text-left hover:bg-white/[0.04] rounded-lg px-2 py-1.5 transition-colors group">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-[11px] text-gray-400 group-hover:text-gray-200 truncate flex-1 transition-colors">{d.label}</span>
                {isDisc && <AlertCircle size={9} className="text-orange-400 flex-shrink-0" />}
              </button>
            );
          })}
          {nodes.length === 0 && <p className="text-[11px] text-gray-700 italic">No nodes yet</p>}
        </div>
      </div>
    </div>
  );
};

export const InfoPanel: React.FC = () => {
  const { activeSidebarView } = useWorkflowStore();

  const renderContent = () => {
    switch (activeSidebarView) {
      case 'workflows':    return <SavedWorkflowsPanel />;
      case 'dashboard':    return <DashboardView />;
      case 'compliance':   return <ComplianceView />;
      case 'scheduler':    return <SchedulerView />;
      case 'analytics':    return <AnalyticsView />;
      case 'integrations': return <IntegrationsView />;
      case 'repository':   return <RepositoryView />;
      case 'members':      return <MembersView />;
      case 'inbox':        return <InboxView />;
      case 'messages':     return <MessagesView />;
      default:             return <FlowOverview />;
    }
  };

  return (
    <div className="w-[220px] h-full flex flex-col flex-shrink-0 relative overflow-hidden"
      style={{ background: '#0a0b0f', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
      {renderContent()}
    </div>
  );
};
