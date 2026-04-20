import React, { useRef } from 'react';
import { Play, Download, Upload, Trash2, RefreshCw, Undo2, Redo2, LayoutTemplate, Sparkles, GitBranch, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { useAutoLayout } from '../../hooks/useAutoLayout';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export const TopBar: React.FC = () => {
  const {
    nodes, edges, toggleSandbox, loadExample, clearWorkflow,
    exportWorkflow, importWorkflow, toggleAIAssistant, toggleTemplates,
    undo, redo, canUndo, canRedo, setNodes,
  } = useWorkflowStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const { applyLayout } = useAutoLayout();

  const handleExport = () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'workflow.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { if (ev.target?.result) importWorkflow(ev.target.result as string); };
    reader.readAsText(file);
  };

  const handleAutoLayout = () => {
    const laid = applyLayout(nodes, edges);
    setNodes(laid as any);
  };

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+z': () => undo(),
    'ctrl+y': () => redo(),
    'ctrl+shift+z': () => redo(),
    'ctrl+e': () => handleExport(),
    'ctrl+l': () => handleAutoLayout(),
    'escape': () => useWorkflowStore.getState().selectNode(null),
  });

  return (
    <div className="flex items-center px-4 h-12 flex-shrink-0 gap-2"
      style={{ background: '#0a0b0f', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Workflow title */}
      <div className="flex items-center gap-2 min-w-0 mr-2">
        <GitBranch size={12} className="text-gray-600 flex-shrink-0" />
        <span className="text-[13px] font-semibold text-gray-300 truncate" style={{ fontFamily: 'Syne, sans-serif' }}>
          HR Workflow Designer
        </span>
        <ChevronDown size={10} className="text-gray-600 flex-shrink-0" />
      </div>

      <div className="w-px h-4 bg-white/[0.06]" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <IconBtn title="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo()}>
          <Undo2 size={13} />
        </IconBtn>
        <IconBtn title="Redo (Ctrl+Y)" onClick={redo} disabled={!canRedo()}>
          <Redo2 size={13} />
        </IconBtn>
      </div>

      <div className="w-px h-4 bg-white/[0.06]" />

      {/* Layout + actions */}
      <div className="flex items-center gap-0.5">
        <IconBtn title="Auto Layout (Ctrl+L)" onClick={handleAutoLayout}>
          <LayoutDashboard size={13} />
        </IconBtn>
        <IconBtn title="Templates" onClick={toggleTemplates}>
          <LayoutTemplate size={13} />
        </IconBtn>
        <IconBtn title="Load Example" onClick={loadExample}>
          <RefreshCw size={13} />
        </IconBtn>
      </div>

      <div className="w-px h-4 bg-white/[0.06]" />

      {/* File ops */}
      <div className="flex items-center gap-0.5">
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        <IconBtn title="Import JSON (Ctrl+O)" onClick={() => fileRef.current?.click()}>
          <Upload size={13} />
        </IconBtn>
        <IconBtn title="Export JSON (Ctrl+E)" onClick={handleExport}>
          <Download size={13} />
        </IconBtn>
        <IconBtn title="Clear canvas" onClick={() => { if (confirm('Clear workflow?')) clearWorkflow(); }} danger>
          <Trash2 size={13} />
        </IconBtn>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 ml-2">
        <Stat label="Nodes" value={nodes.length} />
        <Stat label="Edges" value={edges.length} />
      </div>

      <div className="flex-1" />

      {/* AI Assistant */}
      <button onClick={toggleAIAssistant}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all mr-2"
        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.22)', color: '#c084fc' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.18)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.1)')}>
        <Sparkles size={11} /> AI Assistant
      </button>

      {/* Simulate */}
      <button onClick={toggleSandbox}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
        style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', color: '#f97316' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(249,115,22,0.2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(249,115,22,0.12)')}>
        <Play size={11} /> Test Workflow
      </button>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-[12px] font-bold text-gray-400">{value}</span>
    <span className="text-[11px] text-gray-600">{label}</span>
  </div>
);

const IconBtn: React.FC<{ children: React.ReactNode; title: string; onClick: () => void; danger?: boolean; disabled?: boolean }> =
  ({ children, title, onClick, danger, disabled }) => (
    <button title={title} onClick={onClick} disabled={disabled}
      className="p-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      style={{ color: '#6b7280' }}
      onMouseEnter={e => {
        if (disabled) return;
        (e.currentTarget as HTMLButtonElement).style.background = danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)';
        (e.currentTarget as HTMLButtonElement).style.color = danger ? '#ef4444' : '#e5e7eb';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        (e.currentTarget as HTMLButtonElement).style.color = '#6b7280';
      }}>
      {children}
    </button>
  );
