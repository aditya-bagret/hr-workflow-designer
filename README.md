# HR Workflow Designer — Tredence Case Study

A production-grade visual HR Workflow Designer built with React, TypeScript, and React Flow.

## Quick Start
```bash
npm install
npm run dev
```
Open http://localhost:5173

## Architecture
```
src/
├── api/mockApi.ts              # Mock API (GET /automations, POST /simulate)
├── components/
│   ├── canvas/WorkflowCanvas.tsx   # React Flow canvas with DnD
│   ├── canvas/NodePalette.tsx      # Draggable node sidebar
│   ├── forms/NodeFormPanel.tsx     # All 5 node config forms
│   ├── layout/AppSidebar.tsx       # Left nav (mirrors Reference 1 UI)
│   ├── layout/TopBar.tsx           # Toolbar
│   ├── layout/InfoPanel.tsx        # Live flow overview + validation
│   ├── nodes/BaseNode.tsx          # Shared node shell
│   ├── nodes/index.tsx             # 5 custom node components
│   └── sandbox/SandboxPanel.tsx    # Simulation modal
├── store/workflowStore.ts      # Zustand global state
├── types/workflow.ts           # TypeScript discriminated union types
└── App.tsx                     # Root layout
```

## Key Design Decisions

**Zustand store** — all workflow state in one place. Makes canvas/form/sidebar communication prop-drilling free, and serialization for export/import trivial.

**Discriminated union types** — `WorkflowNodeData` is a union of 5 typed interfaces. Form panel switches on `data.type` and renders the correct form with full TypeScript safety. Each interface `extends Record<string, unknown>` for React Flow compatibility.

**Mock API with topological sort** — `simulateWorkflow` uses Kahn's algorithm to execute nodes in dependency order, detect cycles, and flag disconnected nodes before building the execution log.

**Extensible form architecture** — adding a new node type = add interface to `workflow.ts` + add form component + register in switch. Zero changes to canvas/store needed.

## Node Types
| Node | Color | Key Fields |
|------|-------|------------|
| Start | Green | Title, metadata key-value pairs |
| Task | Blue | Title, description, assignee, due date, custom fields |
| Approval | Orange | Approver role dropdown, auto-approve threshold with progress bar |
| Automated | Purple | Action picker (from mock API), dynamic param fields |
| End | Red | Completion message, summary toggle |

## Mock API
- `GET /automations` → 8 mock actions with param definitions
- `POST /simulate` → topological execution with timing, status, errors, warnings

## What I'd Add With More Time
- Undo/Redo (useHistoryState wrapper around Zustand)
- Node templates (pre-configured presets)
- Visual validation errors directly on nodes (red border + tooltip)
- Auto-layout via Dagre.js
- Conditional edge labels with branching logic
- Backend persistence (FastAPI + PostgreSQL)

## Tech Stack
React 18, TypeScript, Vite, @xyflow/react, Zustand, Tailwind CSS v3, Lucide React
