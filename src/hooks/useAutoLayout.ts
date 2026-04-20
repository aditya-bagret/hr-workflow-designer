import { useCallback } from 'react';
import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

const NODE_WIDTH = 240;
const NODE_HEIGHT = 110;

export function useAutoLayout() {
  const applyLayout = useCallback(
    (nodes: Node[], edges: Edge[]): Node[] => {
      const g = new dagre.graphlib.Graph();
      g.setDefaultEdgeLabel(() => ({}));
      g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 80, marginx: 40, marginy: 40 });

      nodes.forEach(n => {
        g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
      });
      edges.forEach(e => {
        g.setEdge(e.source, e.target);
      });

      dagre.layout(g);

      return nodes.map(n => {
        const pos = g.node(n.id);
        return {
          ...n,
          position: {
            x: pos.x - NODE_WIDTH / 2,
            y: pos.y - NODE_HEIGHT / 2,
          },
        };
      });
    },
    []
  );

  return { applyLayout };
}
