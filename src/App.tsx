import { ReactFlowProvider } from '@xyflow/react';
import { AppSidebar } from './components/layout/AppSidebar';
import { TopBar } from './components/layout/TopBar';
import { InfoPanel } from './components/layout/InfoPanel';
import { NodePalette } from './components/canvas/NodePalette';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { NodeFormPanel } from './components/forms/NodeFormPanel';
import { SandboxPanel } from './components/sandbox/SandboxPanel';
import { AIAssistantPanel } from './components/ai/AIAssistantPanel';
import { TemplatesModal } from './components/templates/TemplatesModal';
import { useWorkflowStore } from './store/workflowStore';

function App() {
  const { selectedNodeId, isSandboxOpen, isAIAssistantOpen, isTemplatesOpen } = useWorkflowStore();

  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#0a0b0f' }}>
        <AppSidebar />

        <div className="flex flex-col flex-1 min-w-0">
          <TopBar />

          <div className="flex flex-1 min-h-0">
            {/* Node palette */}
            <div className="w-[170px] flex-shrink-0 h-full" style={{ background: '#0a0b0f', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <NodePalette />
            </div>

            {/* Canvas */}
            <div className="flex-1 min-w-0 relative">
              <WorkflowCanvas />
            </div>

            {/* Right panels — AI panel takes priority if open */}
            {isAIAssistantOpen
              ? <AIAssistantPanel />
              : selectedNodeId
                ? <NodeFormPanel />
                : <InfoPanel />
            }
          </div>
        </div>

        {/* Modals */}
        {isSandboxOpen && <SandboxPanel />}
        {isTemplatesOpen && <TemplatesModal />}
      </div>
    </ReactFlowProvider>
  );
}

export default App;
