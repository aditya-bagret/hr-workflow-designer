import React from 'react';
import {
  TrendingUp, Users, Clock, CheckCircle2, BarChart2,
  Shield, CalendarClock, Plug, BookOpen, Inbox, MessageSquare, ArrowUp, ArrowDown,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

const Pill: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
    style={{ background: `${color}18`, color }}>
    {label}
  </span>
);

const StatCard: React.FC<{ label: string; value: string | number; sub: string; icon: React.ReactNode; color: string; trend?: number }> =
  ({ label, value, sub, icon, color, trend }) => (
    <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, color }}>{icon}</div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <ArrowUp size={9} /> : <ArrowDown size={9} />}{Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-[20px] font-bold text-white">{value}</div>
      <div className="text-[11px] font-medium text-gray-400 mt-0.5">{label}</div>
      <div className="text-[10px] text-gray-700 mt-0.5">{sub}</div>
    </div>
  );

export const DashboardView: React.FC = () => {
  const { nodes, edges } = useWorkflowStore();
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <h2 className="text-[14px] font-bold text-white mb-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>Dashboard</h2>
        <p className="text-[11px] text-gray-600">HR workflow activity overview</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard label="Active Workflows" value={3} sub="2 running today" icon={<TrendingUp size={13} />} color="#f97316" trend={12} />
        <StatCard label="Canvas Nodes" value={nodes.length} sub={`${edges.length} connections`} icon={<BarChart2 size={13} />} color="#3b82f6" trend={5} />
        <StatCard label="Pending Approvals" value={7} sub="3 overdue" icon={<Clock size={13} />} color="#f97316" trend={-8} />
        <StatCard label="Completed Today" value={14} sub="Across all flows" icon={<CheckCircle2 size={13} />} color="#22c55e" trend={21} />
      </div>
      <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[11px] font-semibold text-gray-400 mb-3">Recent Activity</div>
        {[
          { label: 'Onboarding: Arjun K.', time: '2m ago', status: 'running', color: '#3b82f6' },
          { label: 'Leave Approval: Priya M.', time: '14m ago', status: 'pending', color: '#f97316' },
          { label: 'BGV: Ravi S.', time: '1h ago', status: 'complete', color: '#22c55e' },
          { label: 'Offer Letter: Deepa T.', time: '3h ago', status: 'complete', color: '#22c55e' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
            <span className="text-[11px] text-gray-400 flex-1 truncate">{item.label}</span>
            <Pill label={item.status} color={item.color} />
            <span className="text-[10px] text-gray-700 flex-shrink-0">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlaceholderView: React.FC<{ icon: React.ReactNode; title: string; desc: string; items: string[]; color: string }> =
  ({ icon, title, desc, items, color }) => (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <h2 className="text-[14px] font-bold text-white mb-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h2>
        <p className="text-[11px] text-gray-600">{desc}</p>
      </div>
      <div className="rounded-xl p-4 flex flex-col items-center text-center"
        style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}18`, color }}>{icon}</div>
        <p className="text-[12px] font-semibold text-gray-300">{title} Module</p>
        <p className="text-[11px] text-gray-600 mt-1">Coming soon — scope for extension</p>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item} className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-[11px] text-gray-400">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );

export const ComplianceView = () => <PlaceholderView icon={<Shield size={16} />} title="Compliance" desc="Policy and audit management" color="#ef4444"
  items={['GDPR data handling checks', 'SOC2 audit trail logging', 'Document retention policies', 'Access control reviews', 'Workflow approval audit logs']} />;

export const SchedulerView = () => <PlaceholderView icon={<CalendarClock size={16} />} title="Scheduler" desc="Recurring workflow triggers" color="#3b82f6"
  items={['Scheduled monthly onboarding', 'Automated leave balance reset', 'Performance review cycles', 'Probation period reminders', 'Contract renewal triggers']} />;

export const AnalyticsView: React.FC = () => {
  const { nodes, edges } = useWorkflowStore();
  const types = nodes.reduce<Record<string, number>>((a, n) => { const t = (n.data as any).type; a[t] = (a[t] || 0) + 1; return a; }, {});
  const bars = [
    { label: 'Start', count: types.start || 0, color: '#22c55e' },
    { label: 'Task', count: types.task || 0, color: '#3b82f6' },
    { label: 'Approval', count: types.approval || 0, color: '#f97316' },
    { label: 'Auto', count: types.automated || 0, color: '#a855f7' },
    { label: 'End', count: types.end || 0, color: '#ef4444' },
  ];
  const max = Math.max(...bars.map(b => b.count), 1);
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <h2 className="text-[14px] font-bold text-white mb-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>Analytics</h2>
        <p className="text-[11px] text-gray-600">Current workflow composition</p>
      </div>
      <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[11px] font-semibold text-gray-500 mb-3">Node Distribution</div>
        <div className="space-y-2.5">
          {bars.map(b => (
            <div key={b.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-500">{b.label}</span>
                <span className="text-[11px] font-bold" style={{ color: b.color }}>{b.count}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-white/[0.04]">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(b.count / max) * 100}%`, background: b.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Total Nodes" value={nodes.length} sub="On canvas" icon={<BarChart2 size={12} />} color="#3b82f6" />
        <StatCard label="Connections" value={edges.length} sub="Edges" icon={<TrendingUp size={12} />} color="#a855f7" />
      </div>
    </div>
  );
};

export const IntegrationsView = () => <PlaceholderView icon={<Plug size={16} />} title="Integrations" desc="Connected systems and APIs" color="#a855f7"
  items={['Slack — Notifications ✅', 'JIRA — Ticket creation ✅', 'Google Workspace ✅', 'HRIS (Workday)', 'DocuSign (pending)', 'Azure AD SSO']} />;

export const RepositoryView = () => <PlaceholderView icon={<BookOpen size={16} />} title="Repository" desc="Workflow library and versioning" color="#22c55e"
  items={['Workflow version history', 'Draft vs published states', 'Team workflow library', 'Clone and fork workflows', 'Change diff viewer']} />;

export const MembersView = () => <PlaceholderView icon={<Users size={16} />} title="Members" desc="Team roles and permissions" color="#3b82f6"
  items={['HR Admin', 'Engineering Lead', 'HRBP', 'Director (Approver)', 'Compliance Officer', 'IT Provisioning']} />;

export const InboxView = () => <PlaceholderView icon={<Inbox size={16} />} title="Inbox" desc="Workflow notifications and tasks" color="#f97316"
  items={['Approval required: Leave — Priya M.', 'Task overdue: BGV review', 'New workflow shared by HR team', '3 workflows pending your sign-off', 'Onboarding step: Day-1 orientation']} />;

export const MessagesView = () => <PlaceholderView icon={<MessageSquare size={16} />} title="Messages" desc="Team communication thread" color="#6b7280"
  items={['HR Admin → You: Onboarding updated', 'Director: Approved Q3 hiring', 'System: BGV vendor connected', 'HR Admin: Leave policy refreshed', 'IT: Access provisioning ready']} />;
