#!/bin/bash
# HR Workflow Designer — Start Script
# Starts both the FastAPI backend and Vite frontend in parallel

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT"

echo ""
echo "  🚀 HR Workflow Designer"
echo "  ─────────────────────────────────────"

# Check Python
if ! command -v python3 &>/dev/null; then
  echo "  ❌ python3 not found. Please install Python 3.10+"
  exit 1
fi

# Check Node
if ! command -v npm &>/dev/null; then
  echo "  ❌ npm not found. Please install Node.js 18+"
  exit 1
fi

# Install backend deps if needed
if ! python3 -c "import fastapi" 2>/dev/null; then
  echo "  📦 Installing backend dependencies..."
  pip3 install -r "$BACKEND/requirements.txt" --break-system-packages -q
fi

# Install frontend deps if needed
if [ ! -d "$FRONTEND/node_modules" ]; then
  echo "  📦 Installing frontend dependencies..."
  cd "$FRONTEND" && npm install --silent
fi

echo "  ✅ Starting backend  →  http://localhost:8000"
echo "  ✅ Starting frontend →  http://localhost:5173"
echo "  ─────────────────────────────────────"
echo "  Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
cd "$BACKEND" && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Start frontend
cd "$FRONTEND" && npm run dev &
FRONTEND_PID=$!

# On Ctrl+C, kill both
trap "echo ''; echo '  Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait
