from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
import uuid as _uuid

from database import init_db, list_workflows, get_workflow, create_workflow, update_workflow, delete_workflow

app = FastAPI(title="HR Workflow Designer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Init DB on startup
@app.on_event("startup")
def startup():
    init_db()


# ── Schemas ───────────────────────────────────────────────────────────────────

class WorkflowSave(BaseModel):
    name: str
    description: str = ""
    nodes: list[Any]
    edges: list[Any]


class WorkflowUpdate(BaseModel):
    name: str
    description: str = ""
    nodes: list[Any]
    edges: list[Any]


class SimulateRequest(BaseModel):
    nodes: list[Any]
    edges: list[Any]


# ── Automations ───────────────────────────────────────────────────────────────

AUTOMATIONS = [
    {"id": "send_email",       "label": "Send Email",                "params": ["to", "subject", "body"]},
    {"id": "generate_doc",     "label": "Generate Document",         "params": ["template", "recipient"]},
    {"id": "slack_notify",     "label": "Send Slack Notification",   "params": ["channel", "message"]},
    {"id": "create_ticket",    "label": "Create JIRA Ticket",        "params": ["project", "summary", "priority"]},
    {"id": "update_hris",      "label": "Update HRIS Record",        "params": ["employeeId", "field", "value"]},
    {"id": "schedule_meeting", "label": "Schedule Meeting",          "params": ["participants", "duration", "agenda"]},
    {"id": "provision_access", "label": "Provision System Access",   "params": ["system", "role", "employeeId"]},
    {"id": "send_offer",       "label": "Send Offer Letter",         "params": ["candidateEmail", "offerTemplate"]},
]

@app.get("/api/automations")
def get_automations():
    return AUTOMATIONS


# ── Simulate ──────────────────────────────────────────────────────────────────

NODE_COLORS = {
    "start": "#22c55e", "task": "#3b82f6", "approval": "#f97316",
    "automated": "#a855f7", "end": "#ef4444",
}

def topological_sort(nodes, edges):
    adj = {n["id"]: [] for n in nodes}
    in_degree = {n["id"]: 0 for n in nodes}
    node_map = {n["id"]: n for n in nodes}

    for e in edges:
        if e["source"] in adj:
            adj[e["source"]].append(e["target"])
        if e["target"] in in_degree:
            in_degree[e["target"]] += 1

    queue = [nid for nid, deg in in_degree.items() if deg == 0]
    result = []
    while queue:
        nid = queue.pop(0)
        result.append(node_map[nid])
        for neighbor in adj.get(nid, []):
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return result if len(result) == len(nodes) else nodes


def step_message(node):
    d = node.get("data", {})
    t = d.get("type", "")
    label = d.get("label", "Node")
    if t == "start":    return f'Workflow initiated: "{label}"'
    if t == "task":     return f'Task assigned to {d.get("assignee") or "unassigned"} — "{label}"'
    if t == "approval": return f'Awaiting approval from {d.get("approverRole", "Manager")}'
    if t == "automated": return f'Executing automation: {d.get("actionId") or "none configured"}'
    if t == "end":      return f'Workflow completed — {d.get("endMessage", "Done")}'
    return "Step executed"


@app.post("/api/simulate")
def simulate(req: SimulateRequest):
    import random, time
    nodes, edges = req.nodes, req.edges
    errors, warnings = [], []
    steps = []

    start_nodes = [n for n in nodes if n.get("data", {}).get("type") == "start"]
    end_nodes   = [n for n in nodes if n.get("data", {}).get("type") == "end"]
    connected   = set(e["source"] for e in edges) | set(e["target"] for e in edges)

    if len(start_nodes) == 0: errors.append("Workflow must have a Start node")
    if len(start_nodes) > 1:  errors.append("Workflow can only have one Start node")
    if len(end_nodes) == 0:   warnings.append("Workflow has no End node")

    for n in nodes:
        if n["id"] not in connected and len(nodes) > 1:
            label = n.get("data", {}).get("label", n["id"])
            warnings.append(f'Node "{label}" is not connected')

    ordered = topological_sort(nodes, edges)
    total_time = 0

    for node in ordered:
        d = node.get("data", {})
        duration = random.randint(80, 500)
        total_time += duration
        status = "success"
        if d.get("type") == "approval":
            thr = d.get("autoApproveThreshold", 0)
            if thr and thr < 50:
                status = "warning"
        steps.append({
            "nodeId":    node["id"],
            "nodeLabel": d.get("label", "Node"),
            "nodeType":  d.get("type", "task"),
            "status":    status,
            "message":   step_message(node),
            "duration":  duration,
        })

    return {
        "success":        len(errors) == 0,
        "totalSteps":     len(steps),
        "completedSteps": sum(1 for s in steps if s["status"] in ("success", "warning")),
        "steps":          steps,
        "errors":         errors,
        "warnings":       warnings,
        "executionTime":  total_time,
    }


# ── Workflow CRUD ─────────────────────────────────────────────────────────────

@app.get("/api/workflows")
def list_wf():
    return list_workflows()


@app.post("/api/workflows", status_code=201)
def create_wf(body: WorkflowSave):
    wid = str(_uuid.uuid4())
    result = create_workflow(wid, body.name, body.description, body.nodes, body.edges)
    return result


@app.get("/api/workflows/{workflow_id}")
def get_wf(workflow_id: str):
    wf = get_workflow(workflow_id)
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf


@app.put("/api/workflows/{workflow_id}")
def update_wf(workflow_id: str, body: WorkflowUpdate):
    if not get_workflow(workflow_id):
        raise HTTPException(status_code=404, detail="Workflow not found")
    return update_workflow(workflow_id, body.name, body.description, body.nodes, body.edges)


@app.delete("/api/workflows/{workflow_id}", status_code=204)
def delete_wf(workflow_id: str):
    if not delete_workflow(workflow_id):
        raise HTTPException(status_code=404, detail="Workflow not found")


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
