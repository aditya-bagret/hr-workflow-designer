import React, { useEffect, useState } from 'react';
import {
  Save, FolderOpen, Trash2, Plus, RefreshCw, Cloud, CloudOff,
  Clock, GitBranch, Loader, CheckCircle, AlertCircle, X
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import {
  listWorkflows, saveWorkflow, updateWorkflow,
  deleteWorkflow, getWorkflow, checkHealth,
  type SavedWorkflowMeta,
} from '../../api/backendApi';

export const SavedWorkflowsPanel: React.FC = () => {
  const {
    nodes, edges, currentWorkflowId, currentWorkflowName,
    backendOnline, setBackendOnline, setCurrentWorkflow, loadWorkflowFromBackend,
  } = useWorkflowStore();

  const [workflows, setWorkflows] = useState<SavedWorkflowMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const ping = async () => {
    try { await checkHealth(); setBackendOnline(true); return true; }
    catch { setBackendOnline(false); return false; }
  };

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const list = await listWorkflows();
      setWorkflows(list);
    } catch {
      showToast('Could not reach backend — start the server', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void ping().then((ok) => { if (ok) fetchWorkflows(); });
  }, []);

  const handleSave = async () => {
    if (!saveName.trim()) return;
    setSaving(true);
    try {
      if (currentWorkflowId) {
        await updateWorkflow(currentWorkflowId, saveName, saveDesc, nodes as any, edges);
        setCurrentWorkflow(currentWorkflowId, saveName);
        showToast('Workflow updated!', true);
      } else {
        const wf = await saveWorkflow(saveName, saveDesc, nodes as any, edges);
        setCurrentWorkflow(wf.id, wf.name);
        showToast('Workflow saved!', true);
      }
      setShowSaveDialog(false);
      fetchWorkflows();
    } catch {
      showToast('Save failed — is the backend running?', false);
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async (id: string) => {
    try {
      const wf = await getWorkflow(id);
      loadWorkflowFromBackend(wf.nodes as any, wf.edges, wf.id, wf.name);
      showToast(`Loaded "${wf.name}"`, true);
    } catch {
      showToast('Failed to load workflow', false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteWorkflow(id);
      if (currentWorkflowId === id) setCurrentWorkflow(null, 'Untitled Workflow');
      setWorkflows(prev => prev.filter(w => w.id !== id));
      showToast('Deleted', true);
    } catch {
      showToast('Delete failed', false);
    }
  };

  const openSaveDialog = () => {
    setSaveName(currentWorkflowName || 'My Workflow');
    setSaveDesc('');
    setShowSaveDialog(true);
  };

  const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3.5 py-3.5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <GitBranch size={12} className="text-orange-400" />
            <span className="text-[11px] font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Saved Workflows</span>
          </div>
          <div className="flex items-center gap-1">
            {backendOnline
              ? <span title="Backend connected"><Cloud size={11} className="text-green-400" /></span>
              : <span title="Backend offline"><CloudOff size={11} className="text-red-400" /></span>
            }
            <button onClick={() => { ping().then((ok: boolean) => { if (ok) fetchWorkflows(); }); }} className="p-1 rounded hover:bg-white/[0.06] text-gray-600 hover:text-gray-300 transition-colors" title="Refresh">
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-gray-700">
          {backendOnline ? 'Connected to backend' : 'Start backend: python3 backend/main.py'}
        </p>
      </div>

      {/* Current workflow indicator */}
      {currentWorkflowId && (
        <div className="mx-3 mt-3 px-2.5 py-2 rounded-lg flex items-center gap-2"
          style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-[11px] text-orange-300 truncate flex-1">{currentWorkflowName}</span>
          <span className="text-[9px] text-orange-500 flex-shrink-0">active</span>
        </div>
      )}

      {/* Save button */}
      <div className="p-3 flex-shrink-0">
        <button onClick={openSaveDialog}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-semibold transition-all"
          style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', color: '#f97316' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(249,115,22,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(249,115,22,0.12)')}>
          <Save size={12} />
          {currentWorkflowId ? 'Save / Update' : 'Save to Backend'}
        </button>
      </div>

      {/* Workflow list */}
      <div className="flex-1 overflow-y-auto px-3 space-y-2">
        {loading && (
          <div className="flex items-center justify-center py-6 gap-2">
            <Loader size={13} className="animate-spin text-gray-600" />
            <span className="text-[11px] text-gray-600">Loading…</span>
          </div>
        )}

        {!loading && workflows.length === 0 && (
          <div className="text-center py-6">
            <Plus size={18} className="text-gray-700 mx-auto mb-2" />
            <p className="text-[11px] text-gray-600">No saved workflows yet</p>
            <p className="text-[10px] text-gray-700 mt-0.5">Save your current workflow above</p>
          </div>
        )}

        {workflows.map(wf => (
          <div key={wf.id}
            className="group rounded-xl p-3 transition-all"
            style={{
              background: currentWorkflowId === wf.id ? 'rgba(249,115,22,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${currentWorkflowId === wf.id ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.06)'}`,
            }}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold text-gray-300 truncate">{wf.name}</div>
                {wf.description && <div className="text-[10px] text-gray-600 truncate mt-0.5">{wf.description}</div>}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-gray-600">{wf.nodeCount} nodes</span>
                  <span className="text-gray-700 text-[10px]">·</span>
                  <span className="text-[10px] text-gray-600">{wf.edgeCount} edges</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Clock size={9} className="text-gray-700" />
                  <span className="text-[9px] text-gray-700">{fmt(wf.updated_at)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => handleLoad(wf.id)}
                  className="p-1.5 rounded-lg hover:bg-blue-500/15 text-gray-600 hover:text-blue-400 transition-colors"
                  title="Load workflow">
                  <FolderOpen size={11} />
                </button>
                <button onClick={() => handleDelete(wf.id, wf.name)}
                  className="p-1.5 rounded-lg hover:bg-red-500/15 text-gray-600 hover:text-red-400 transition-colors"
                  title="Delete workflow">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="absolute inset-0 z-20 flex items-end" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full rounded-t-2xl p-5 animate-fade-in" style={{ background: '#141620', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Save Workflow</span>
              <button onClick={() => setShowSaveDialog(false)} className="p-1 rounded hover:bg-white/[0.06] text-gray-600 hover:text-gray-300 transition-colors">
                <X size={13} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-1.5">Name *</label>
                <input value={saveName} onChange={e => setSaveName(e.target.value)}
                  placeholder="e.g. Onboarding Flow v2"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white placeholder-gray-700 focus:outline-none focus:border-orange-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-1.5">Description</label>
                <input value={saveDesc} onChange={e => setSaveDesc(e.target.value)}
                  placeholder="Optional description"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white placeholder-gray-700 focus:outline-none focus:border-orange-500/50 transition-all" />
              </div>
              <button onClick={handleSave} disabled={saving || !saveName.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-40"
                style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316' }}>
                {saving ? <Loader size={12} className="animate-spin" /> : <Save size={12} />}
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-4 left-3 right-3 z-30 flex items-center gap-2 px-3 py-2.5 rounded-xl animate-fade-in"
          style={{ background: toast.ok ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${toast.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
          {toast.ok ? <CheckCircle size={12} className="text-green-400 flex-shrink-0" /> : <AlertCircle size={12} className="text-red-400 flex-shrink-0" />}
          <span className="text-[11px]" style={{ color: toast.ok ? '#86efac' : '#fca5a5' }}>{toast.msg}</span>
        </div>
      )}
    </div>
  );
};
