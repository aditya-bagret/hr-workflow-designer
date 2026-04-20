
import { ReactFlowProvider } from '@xyflow/react';
import { AppSidebar } from './components/layout/AppSidebar';
import { TopBar } from './components/layout/TopBar';
import { InfoPanel } from './components/layout/InfoPanel';
import { NodePalette } from './components/canvas/NodePalette';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { NodeFormPanel } from './components/forms/NodeFormPanel';
import { SandboxPanel } from './components/sandbox/SandboxPanel';
import { useWorkflowStore } from './store/workflowStore';

function App() {
  const { selectedNodeId, isSandboxOpen } = useWorkflowStore();

  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#0a0b0f' }}>
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <TopBar />
          <div className="flex flex-1 min-h-0">
            <div className="w-[170px] flex-shrink-0 h-full" style={{ background: '#0a0b0f', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <NodePalette />
            </div>
            <div className="flex-1 min-w-0 relative">
              <WorkflowCanvas />
            </div>
            {selectedNodeId ? <NodeFormPanel /> : <InfoPanel />}
          </div>
        </div>
        {isSandboxOpen && <SandboxPanel />}
      </div>
    </ReactFlowProvider>
  );
}

export default App;
