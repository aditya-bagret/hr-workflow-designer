import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader, Bot, User, Lightbulb } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { WorkflowNodeData } from '../../types/workflow';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'Review my workflow for issues',
  'What node should I add next?',
  'Suggest a better approval flow',
  'Is this workflow HR compliant?',
];

function buildWorkflowSummary(nodes: any[], edges: any[]) {
  const nodeList = nodes.map(n => {
    const d = n.data as WorkflowNodeData;
    let detail = '';
    if (d.type === 'task') detail = ` (assignee: ${(d as any).assignee || 'unassigned'})`;
    if (d.type === 'approval') detail = ` (role: ${(d as any).approverRole})`;
    if (d.type === 'automated') detail = ` (action: ${(d as any).actionId || 'none'})`;
    return `  - [${d.type.toUpperCase()}] "${d.label}"${detail}`;
  }).join('\n');

  const edgeList = edges.map(e => {
    const src = nodes.find(n => n.id === e.source)?.data?.label || e.source;
    const tgt = nodes.find(n => n.id === e.target)?.data?.label || e.target;
    return `  - "${src}" → "${tgt}"`;
  }).join('\n');

  return `Current Workflow (${nodes.length} nodes, ${edges.length} edges):\n\nNodes:\n${nodeList || '  (none)'}\n\nConnections:\n${edgeList || '  (none)'}`;
}

export const AIAssistantPanel: React.FC = () => {
  const { nodes, edges, toggleAIAssistant } = useWorkflowStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Workflow Assistant. I can analyze your current workflow, suggest improvements, flag HR compliance issues, and help you design better processes. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (userInput: string) => {
    if (!userInput.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: userInput };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const workflowContext = buildWorkflowSummary(nodes, edges);

    const systemPrompt = `You are an expert HR Process Designer and React/workflow engineering assistant embedded inside an HR Workflow Designer tool.

The user has a visual workflow canvas. Here is their current workflow:

${workflowContext}

Your role:
1. Analyze their workflow for logical issues, missing steps, or HR compliance gaps
2. Suggest concrete next steps or improvements  
3. Answer questions about HR processes (onboarding, approvals, leave management, etc.)
4. Give React/TypeScript architecture advice when asked
5. Be concise — max 3-4 paragraphs. Use bullet points for suggestions.
6. If the workflow is empty, encourage them to start with a Start node.
7. Reference actual node names from their workflow when giving feedback.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const text = data.content?.find((b: any) => b.type === 'text')?.text || 'Sorry, I had trouble responding.';
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-[340px] h-full flex flex-col animate-slide-in flex-shrink-0"
      style={{ background: '#0a0c12', borderLeft: '1px solid rgba(168,85,247,0.2)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(168,85,247,0.15)', background: 'rgba(168,85,247,0.05)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}
          >
            <Sparkles size={14} style={{ color: '#a855f7' }} />
          </div>
          <div>
            <div className="text-[12px] font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>AI Assistant</div>
            <div className="text-[10px]" style={{ color: 'rgba(168,85,247,0.7)' }}>Powered by Claude</div>
          </div>
        </div>
        <button onClick={toggleAIAssistant} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-600 hover:text-gray-300 transition-colors">
          <X size={13} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: msg.role === 'assistant' ? 'rgba(168,85,247,0.2)' : 'rgba(249,115,22,0.2)',
              }}
            >
              {msg.role === 'assistant'
                ? <Bot size={11} style={{ color: '#a855f7' }} />
                : <User size={11} style={{ color: '#f97316' }} />
              }
            </div>
            <div
              className="max-w-[260px] px-3 py-2 rounded-xl text-[12px] leading-relaxed"
              style={{
                background: msg.role === 'assistant' ? 'rgba(255,255,255,0.04)' : 'rgba(249,115,22,0.1)',
                border: `1px solid ${msg.role === 'assistant' ? 'rgba(255,255,255,0.06)' : 'rgba(249,115,22,0.2)'}`,
                color: msg.role === 'assistant' ? '#d1d5db' : '#fed7aa',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(168,85,247,0.2)' }}>
              <Bot size={11} style={{ color: '#a855f7' }} />
            </div>
            <div
              className="px-3 py-2 rounded-xl flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Loader size={11} className="animate-spin text-purple-400" />
              <span className="text-[11px] text-gray-600">Analyzing workflow…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-3 pb-2 flex flex-wrap gap-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
        {QUICK_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            disabled={loading}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-all disabled:opacity-40"
            style={{
              background: 'rgba(168,85,247,0.08)',
              border: '1px solid rgba(168,85,247,0.18)',
              color: 'rgba(168,85,247,0.8)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.08)')}
          >
            <Lightbulb size={9} />
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 flex gap-2 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Ask about your workflow…"
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/40 transition-all"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="p-2 rounded-xl transition-all disabled:opacity-30"
          style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.25)', color: '#a855f7' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.25)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.15)')}
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
};
