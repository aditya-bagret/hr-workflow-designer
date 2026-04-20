import React, { useRef } from 'react';
import {
  Play, Download, Upload, Trash2, RefreshCw,
  ChevronDown, GitBranch
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export const TopBar: React.FC = () => {
  const { nodes, edges, toggleSandbox, loadExample, clearWorkflow, exportWorkflow, importWorkflow } = useWorkflowStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) importWorkflow(ev.target.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="flex items-center px-4 h-12 flex-shrink-0 gap-3"
      style={{ background: '#0a0b0f', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Workflow title */}
      <div className="flex items-center gap-2 min-w-0">
        <GitBranch size={13} className="text-gray-600 flex-shrink-0" />
        <span className="text-[13px] font-semibold text-gray-300 truncate">HR Workflow Designer</span>
        <ChevronDown size={11} className="text-gray-600 flex-shrink-0" />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 ml-4">
        <Stat label="Nodes" value={nodes.length} />
        <div className="w-px h-4 bg-white/[0.06]" />
        <Stat label="Edges" value={edges.length} />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <IconBtn title="Load Example" onClick={loadExample}>
          <RefreshCw size={13} />
        </IconBtn>

        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        <IconBtn title="Import JSON" onClick={() => fileRef.current?.click()}>
          <Upload size={13} />
        </IconBtn>

        <IconBtn title="Export JSON" onClick={handleExport}>
          <Download size={13} />
        </IconBtn>

        <IconBtn title="Clear canvas" onClick={() => { if (confirm('Clear workflow?')) clearWorkflow(); }} danger>
          <Trash2 size={13} />
        </IconBtn>

        <div className="w-px h-5 bg-white/[0.06] mx-1" />

        {/* Run simulation button */}
        <button
          onClick={toggleSandbox}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
          style={{
            background: 'rgba(249,115,22,0.12)',
            border: '1px solid rgba(249,115,22,0.25)',
            color: '#f97316',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(249,115,22,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(249,115,22,0.12)')}
        >
          <Play size={11} />
          Test Workflow
        </button>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-[12px] font-bold text-gray-300">{value}</span>
    <span className="text-[11px] text-gray-600">{label}</span>
  </div>
);

const IconBtn: React.FC<{
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ children, title, onClick, danger }) => (
  <button
    title={title}
    onClick={onClick}
    className="p-2 rounded-lg transition-all"
    style={{ color: danger ? '#6b7280' : '#6b7280' }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLButtonElement).style.background = danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)';
      (e.currentTarget as HTMLButtonElement).style.color = danger ? '#ef4444' : '#e5e7eb';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      (e.currentTarget as HTMLButtonElement).style.color = '#6b7280';
    }}
  >
    {children}
  </button>
);
