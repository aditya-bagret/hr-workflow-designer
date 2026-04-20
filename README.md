# HR Workflow Designer — Tredence Case Study

A production-grade visual HR Workflow Designer with **AI-powered analysis**, live simulation, undo/redo, auto-layout, and workflow templates.

## Quick Start
```bash
npm install
npm run dev
```
Open http://localhost:5173

---

## What's Implemented

### Core Requirements (All Complete)
- ✅ React + Vite + TypeScript
- ✅ React Flow canvas with drag-and-drop from node palette
- ✅ 5 custom node types: Start, Task, Approval, Automated Step, End
- ✅ Per-node configuration forms with controlled components and full type safety
- ✅ Mock API layer (`GET /automations`, `POST /simulate` with topological sort)
- ✅ Workflow Sandbox with step-by-step execution log

### Bonus Features (All Complete)
- ✅ **Export/Import workflow as JSON**
- ✅ **Undo/Redo** — Ctrl+Z / Ctrl+Y, stored in Zustand history stack (60 entries)
- ✅ **Minimap + zoom controls**
- ✅ **Workflow validation errors visually shown on nodes** — error/warning badges on node cards
- ✅ **Auto-layout** — Dagre.js topological tree positioning (Ctrl+L)
- ✅ **Workflow Templates** — 3 pre-built HR workflows (Onboarding, Leave Approval, Document Verification)

### Differentiator Feature
- 🤖 **AI Workflow Assistant** — Claude-powered chat panel (top-right "AI Assistant" button). Analyzes your live workflow, suggests next nodes, flags HR compliance gaps, answers HR process questions. Receives full workflow context (all nodes + edges) on every message.

---

## Architecture

```
src/
├── api/
│   └── mockApi.ts              # GET /automations + POST /simulate (topological sort + Kahn's algorithm)
├── components/
│   ├── ai/
│   │   └── AIAssistantPanel.tsx    # Claude API chat panel
│   ├── canvas/
│   │   ├── WorkflowCanvas.tsx      # React Flow with DnD, node click, pane click
│   │   └── NodePalette.tsx         # Draggable node type sidebar
│   ├── forms/
│   │   └── NodeFormPanel.tsx       # All 5 config forms — dynamic, controlled, typed
│   ├── layout/
│   │   ├── AppSidebar.tsx          # Collapsible left nav (Reference 1 design)
│   │   ├── TopBar.tsx              # Undo/Redo, Auto-Layout, Templates, AI, Simulate
│   │   └── InfoPanel.tsx           # Live health score, validation checklist, node list
│   ├── nodes/
│   │   ├── BaseNode.tsx            # Shared shell: validation badges, simulation glow
│   │   └── index.tsx               # StartNode, TaskNode, ApprovalNode, AutomatedNode, EndNode
│   ├── sandbox/
│   │   └── SandboxPanel.tsx        # Live animated simulation modal
│   └── templates/
│       └── TemplatesModal.tsx      # 3 HR workflow templates picker
├── data/
│   └── templates.ts            # Template data for 3 HR workflows
├── hooks/
│   ├── useAutoLayout.ts        # Dagre-based tree layout
│   ├── useKeyboardShortcuts.ts # Ctrl+Z/Y/E/L keyboard bindings
│   ├── useUndoRedo.ts          # Generic undo/redo utility hook
│   └── useWorkflowValidation.ts # Cycle detection + structural validation (returns per-node errors)
├── store/
│   └── workflowStore.ts        # Zustand — nodes, edges, history stack, simulation IDs, UI toggles
├── types/
│   └── workflow.ts             # Discriminated union types for all 5 node data shapes
└── App.tsx
```

## Key Design Decisions

**Discriminated union types** — `WorkflowNodeData` is typed as a union of 5 interfaces, each `extends Record<string, unknown>` for React Flow compatibility. The form panel and validation hook switch on `data.type` — adding a new node type is a 3-step change: type → form component → switch case.

**Zustand history stack** — Undo/Redo is stored directly in the Zustand store as an array of `{nodes, edges, label}` snapshots with a pointer. Capped at 60 entries. `structuredClone` ensures snapshots are immutable.

**useWorkflowValidation** — a pure `useMemo` hook that runs every time `nodes` or `edges` change. Returns both a flat `errors` array and a `nodeErrors` map keyed by node ID, consumed by node components to show inline badges.

**Live simulation animation** — `simulatingNodeIds: string[]` in the store. The sandbox loops through steps with `setTimeout`, updating this array one node at a time. BaseNode reads this to apply a glowing border + shimmer bar.

**Topological execution** — Kahn's algorithm in `mockApi.ts` processes nodes in dependency order. If the result length ≠ node count, a cycle exists and is reported as an error.

**AI Assistant context injection** — on every message, the full workflow graph (node labels, types, assignees, action IDs, edge connections) is serialized into the system prompt so Claude always has current context.

## Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| Ctrl+Z | Undo |
| Ctrl+Y / Ctrl+Shift+Z | Redo |
| Ctrl+E | Export JSON |
| Ctrl+L | Auto-layout |
| Delete | Delete selected node |
| Escape | Deselect node |

## What I'd Add With More Time
- **Node version history** — per-node changelog with diff view
- **Conditional edges** — branch logic with labels ("If approved → X", "If rejected → Y")
- **Backend persistence** — FastAPI + PostgreSQL with named workflow drafts
- **Real-time collaboration** — WebSocket-based multi-user canvas editing
- **Workflow analytics** — track simulated execution times across runs
