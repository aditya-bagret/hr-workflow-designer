import React, { useCallback, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  BackgroundVariant, type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '../../store/workflowStore';
import { StartNode, TaskNode, ApprovalNode, AutomatedNode, EndNode } from '../nodes';
import type { NodeType } from '../../types/workflow';

const nodeTypes = { start: StartNode, task: TaskNode, approval: ApprovalNode, automated: AutomatedNode, end: EndNode };
const NODE_COLORS: Record<string, string> = { start:'#22c55e', task:'#3b82f6', approval:'#f97316', automated:'#a855f7', end:'#ef4444' };

export const WorkflowCanvas: React.FC = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeDragStop, addNode, selectNode } = useWorkflowStore();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = React.useState<any>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow') as NodeType;
    if (!type || !rfInstance) return;
    const bounds = wrapperRef.current?.getBoundingClientRect();
    const position = rfInstance.screenToFlowPosition({
      x: e.clientX - (bounds?.left ?? 0),
      y: e.clientY - (bounds?.top ?? 0),
    });
    addNode(type, position);
  }, [rfInstance, addNode]);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => { selectNode(node.id); }, [selectNode]);
  const onPaneClick = useCallback(() => { selectNode(null); }, [selectNode]);

  // ✅ Key fix: push history AFTER drag ends, not on every position change tick
  const handleNodeDragStop = useCallback(() => { onNodeDragStop(); }, [onNodeDragStop]);

  return (
    <div ref={wrapperRef} className="w-full h-full">
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        fitView fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3} maxZoom={2}
        deleteKeyCode="Delete"
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor={node => NODE_COLORS[(node.data as any)?.type] || '#6b7280'}
          maskColor="rgba(0,0,0,0.6)"
          style={{ width: 140, height: 90 }}
        />
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(249,115,22,0.08)', border: '1px dashed rgba(249,115,22,0.25)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <p className="text-[14px] font-semibold text-gray-500">Drop nodes here to start</p>
              <p className="text-[12px] text-gray-700 mt-1">Drag from the node palette on the left</p>
            </div>
          </div>
        )}
      </ReactFlow>
    </div>
  );
};
