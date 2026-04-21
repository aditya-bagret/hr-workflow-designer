import sqlite3
import json
from pathlib import Path

DB_PATH = Path(__file__).parent / "workflows.db"


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS workflows (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT DEFAULT '',
                nodes TEXT NOT NULL DEFAULT '[]',
                edges TEXT NOT NULL DEFAULT '[]',
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        """)
        conn.commit()
    print("✅ Database initialised at", DB_PATH)


# ── CRUD helpers ──────────────────────────────────────────────────────────────

def list_workflows():
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id, name, description, created_at, updated_at, nodes, edges FROM workflows ORDER BY updated_at DESC"
        ).fetchall()
    result = []
    for r in rows:
        nodes = json.loads(r["nodes"])
        edges = json.loads(r["edges"])
        result.append({
            "id": r["id"],
            "name": r["name"],
            "description": r["description"],
            "nodeCount": len(nodes),
            "edgeCount": len(edges),
            "created_at": r["created_at"],
            "updated_at": r["updated_at"],
        })
    return result


def get_workflow(workflow_id: str):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM workflows WHERE id = ?", (workflow_id,)
        ).fetchone()
    if not row:
        return None
    return {
        "id": row["id"],
        "name": row["name"],
        "description": row["description"],
        "nodes": json.loads(row["nodes"]),
        "edges": json.loads(row["edges"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def create_workflow(workflow_id: str, name: str, description: str, nodes: list, edges: list):
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO workflows (id, name, description, nodes, edges) VALUES (?, ?, ?, ?, ?)",
            (workflow_id, name, description, json.dumps(nodes), json.dumps(edges))
        )
        conn.commit()
    return get_workflow(workflow_id)


def update_workflow(workflow_id: str, name: str, description: str, nodes: list, edges: list):
    with get_conn() as conn:
        conn.execute(
            """UPDATE workflows
               SET name=?, description=?, nodes=?, edges=?, updated_at=datetime('now')
               WHERE id=?""",
            (name, description, json.dumps(nodes), json.dumps(edges), workflow_id)
        )
        conn.commit()
    return get_workflow(workflow_id)


def delete_workflow(workflow_id: str) -> bool:
    with get_conn() as conn:
        cursor = conn.execute("DELETE FROM workflows WHERE id=?", (workflow_id,))
        conn.commit()
    return cursor.rowcount > 0
