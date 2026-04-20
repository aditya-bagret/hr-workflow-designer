import React, { useState } from 'react';
import { X, Play, CheckCircle, AlertTriangle, XCircle, Clock, Loader, Download, ChevronRight } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { simulateWorkflow } from '../../api/mockApi';
import type { SimulationResult, SimulationStep } from '../../types/workflow';

const NODE_COLORS: Record<string, string> = {
  start: '#22c55e', task: '#3b82f6', approval: '#f97316', automated: '#a855f7', end: '#ef4444',
};

const StatusIcon: React.FC<{ status: SimulationStep['status']; size?: number }> = ({ status, size = 14 }) => {
  if (status === 'success') return <CheckCircle size={size} className="text-green-400" />;
  if (status === 'warning') return <AlertTriangle size={size} className="text-orange-400" />;
  if (status === 'error') return <XCircle size={size} className="text-red-400" />;
  return <Clock size={size} className="text-gray-500" />;
};

export const SandboxPanel: React.FC = () => {
  const { nodes, edges, toggleSandbox, exportWorkflow, setSimulatingNodeIds } = useWorkflowStore();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [visibleSteps, setVisibleSteps] = useState<SimulationStep[]>([]);

  const runSimulation = async () => {
    setRunning(true);
    setResult(null);
    setVisibleSteps([]);
    setActiveStep(null);
    setSimulatingNodeIds([]);

    try {
      const res = await simulateWorkflow(nodes as any, edges);
      setResult(res);

      // Animate steps appearing one by one, and light up nodes on canvas
      for (let i = 0; i < res.steps.length; i++) {
        const step = res.steps[i];
        setSimulatingNodeIds([step.nodeId]);
        await new Promise(r => setTimeout(r, 500));
        setVisibleSteps(prev => [...prev, step]);
      }
      setSimulatingNodeIds([]);
    } finally {
      setRunning(false);
    }
  };

  const handleExport = () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'workflow.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(5px)' }}>
      <div className="w-[700px] max-h-[82vh] flex flex-col rounded-2xl overflow-hidden animate-fade-in"
        style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 className="text-[15px] font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Workflow Sandbox</h2>
            <p className="text-[11px] text-gray-600 mt-0.5">{nodes.length} nodes · {edges.length} edges · Live node animation enabled</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-gray-400 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Download size={12} /> Export JSON
            </button>
            <button onClick={toggleSandbox} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Run bar */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={runSimulation} disabled={running || nodes.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-40"
            style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.28)', color: '#f97316' }}
            onMouseEnter={e => { if (!running) (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,0.2)'; }}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,0.12)'}
          >
            {running ? <Loader size={13} className="animate-spin" /> : <Play size={13} />}
            {running ? 'Simulating… (watch nodes light up!)' : 'Run Live Simulation'}
          </button>

          {result && (
            <div className="flex items-center gap-5 mt-3">
              <StatBadge label="Steps" value={`${result.completedSteps}/${result.totalSteps}`} color="#22c55e" />
              <StatBadge label="Time" value={`${result.executionTime}ms`} color="#3b82f6" />
              <StatBadge label="Errors" value={result.errors.length} color={result.errors.length > 0 ? '#ef4444' : '#4b5563'} />
              <StatBadge label="Warnings" value={result.warnings.length} color={result.warnings.length > 0 ? '#f97316' : '#4b5563'} />
              <div className={`ml-auto flex items-center gap-1.5 text-[12px] font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                {result.success ? <CheckCircle size={13} /> : <XCircle size={13} />}
                {result.success ? 'All checks passed' : 'Validation failed'}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {/* Errors / Warnings sidebar */}
          {result && (result.errors.length > 0 || result.warnings.length > 0) && (
            <div className="w-[220px] border-r border-white/[0.05] overflow-y-auto p-3 space-y-2 flex-shrink-0">
              <div className="text-[10px] text-gray-700 uppercase tracking-wider mb-2">Issues</div>
              {result.errors.map((e, i) => (
                <div key={i} className="flex gap-2 p-2.5 rounded-lg bg-red-500/8 border border-red-500/20">
                  <XCircle size={10} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] text-red-300">{e}</span>
                </div>
              ))}
              {result.warnings.map((w, i) => (
                <div key={i} className="flex gap-2 p-2.5 rounded-lg bg-orange-500/8 border border-orange-500/20">
                  <AlertTriangle size={10} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] text-orange-300">{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* Steps timeline */}
          <div className="flex-1 overflow-y-auto p-4">
            {!result && !running && (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                  <Play size={20} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-[13px] text-gray-400 font-medium">Ready to simulate</p>
                  <p className="text-[11px] text-gray-600 mt-1">Nodes will light up on the canvas as they execute in real-time.</p>
                </div>
              </div>
            )}

            {running && visibleSteps.length === 0 && (
              <div className="h-full flex items-center justify-center gap-3">
                <Loader size={16} className="animate-spin text-orange-400" />
                <span className="text-[13px] text-gray-500">Initialising simulation…</span>
              </div>
            )}

            <div className="space-y-2">
              {visibleSteps.map((step, i) => (
                <div key={step.nodeId + i}
                  onClick={() => setActiveStep(activeStep === step.nodeId ? null : step.nodeId)}
                  className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all animate-fade-in"
                  style={{
                    background: activeStep === step.nodeId ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${activeStep === step.nodeId ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
                  }}
                >
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ background: `${NODE_COLORS[step.nodeType] || '#6b7280'}20`, color: NODE_COLORS[step.nodeType] || '#6b7280', border: `1px solid ${NODE_COLORS[step.nodeType] || '#6b7280'}40` }}>
                      {i + 1}
                    </div>
                    {i < visibleSteps.length - 1 && <div className="w-px h-3 bg-white/10" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-white truncate">{step.nodeLabel}</span>
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold flex-shrink-0"
                        style={{ background: `${NODE_COLORS[step.nodeType]}18`, color: NODE_COLORS[step.nodeType] }}>
                        {step.nodeType}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">{step.message}</p>
                    {activeStep === step.nodeId && (
                      <div className="mt-2 space-y-1 animate-fade-in">
                        <div className="flex items-center gap-2 text-[10px] text-gray-600">
                          <Clock size={9} /> {step.duration}ms execution time
                        </div>
                        <div className="text-[10px] font-mono text-gray-700">id: {step.nodeId}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <StatusIcon status={step.status} size={13} />
                    <ChevronRight size={11} className={`text-gray-700 transition-transform ${activeStep === step.nodeId ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              ))}

              {running && visibleSteps.length > 0 && (
                <div className="flex items-center gap-2 p-3">
                  <Loader size={12} className="animate-spin text-orange-400" />
                  <span className="text-[11px] text-gray-600">Executing next step…</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBadge: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <div className="flex flex-col">
    <span className="text-[10px] text-gray-600 uppercase tracking-wider">{label}</span>
    <span className="text-[14px] font-bold" style={{ color }}>{value}</span>
  </div>
);
