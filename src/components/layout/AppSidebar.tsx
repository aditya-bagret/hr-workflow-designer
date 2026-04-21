import React from 'react';
import {
  LayoutDashboard, Shield, CalendarClock, BarChart2, GitMerge,
  Plug, BookOpen, Users, Inbox, MessageSquare, Settings, HelpCircle,
  ChevronRight, Cpu,
} from 'lucide-react';
import { useWorkflowStore, type SidebarView } from '../../store/workflowStore';

interface NavItem { icon: React.ReactNode; label: string; view: SidebarView; badge?: number; }

const SECTIONS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'General',
    items: [
      { icon: <LayoutDashboard size={14} />, label: 'Dashboard',   view: 'dashboard' },
      { icon: <Shield size={14} />,          label: 'Compliance',  view: 'compliance' },
      { icon: <CalendarClock size={14} />,   label: 'Scheduler',   view: 'scheduler' },
      { icon: <BarChart2 size={14} />,       label: 'Analytics',   view: 'analytics' },
    ],
  },
  {
    title: 'Automation',
    items: [
      { icon: <Plug size={14} />,    label: 'Integrations', view: 'integrations', badge: 3 },
      { icon: <BookOpen size={14} />, label: 'Repository',  view: 'repository' },
      { icon: <GitMerge size={14} />, label: 'Workflows',   view: 'workflows' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { icon: <Users size={14} />,        label: 'Members',  view: 'members' },
      { icon: <Inbox size={14} />,        label: 'Inbox',    view: 'inbox', badge: 12 },
      { icon: <MessageSquare size={14} />, label: 'Messages', view: 'messages' },
    ],
  },
];

export const AppSidebar: React.FC = () => {
  const { activeSidebarView, setActiveSidebarView } = useWorkflowStore();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex flex-col h-full flex-shrink-0 transition-all duration-300"
      style={{ width: collapsed ? 52 : 200, background: '#0a0b0f', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3.5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
          <Cpu size={14} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-[13px] font-bold text-white truncate" style={{ fontFamily: 'Syne, sans-serif' }}>
            FlowStudio
          </span>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-0.5 rounded hover:bg-white/[0.06] text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0">
          <ChevronRight size={12} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
        {SECTIONS.map(section => (
          <div key={section.title}>
            {!collapsed && (
              <div className="text-[9px] font-bold uppercase tracking-widest text-gray-700 px-2 mb-1.5">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const isActive = activeSidebarView === item.view;
                return (
                  <button key={item.label}
                    onClick={() => setActiveSidebarView(item.view)}
                    title={collapsed ? item.label : undefined}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all text-left"
                    style={{
                      background: isActive ? 'rgba(249,115,22,0.12)' : 'transparent',
                      color: isActive ? '#f97316' : '#9ca3af',
                    }}
                    onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#e5e7eb'; }}}
                    onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9ca3af'; }}}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="text-[12px] font-medium flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                            style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-2 py-3 space-y-0.5 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {[{ icon: <Settings size={14} />, label: 'Settings' }, { icon: <HelpCircle size={14} />, label: 'Help & Support' }].map(item => (
          <button key={item.label}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-white/[0.04] transition-all"
            title={collapsed ? item.label : undefined}>
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="text-[12px]">{item.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};
