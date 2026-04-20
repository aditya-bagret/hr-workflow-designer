import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { WORKFLOW_TEMPLATES } from '../../data/templates';

export const TemplatesModal: React.FC = () => {
  const { loadTemplate, toggleTemplates } = useWorkflowStore();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-[700px] rounded-2xl overflow-hidden animate-fade-in"
        style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 className="text-[16px] font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Workflow Templates
            </h2>
            <p className="text-[12px] text-gray-600 mt-0.5">Start from a pre-built HR workflow — customize after loading</p>
          </div>
          <button onClick={toggleTemplates} className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-600 hover:text-gray-300 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Templates grid */}
        <div className="grid grid-cols-3 gap-4 p-6">
          {WORKFLOW_TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => loadTemplate(template.nodes as any, template.edges)}
              className="group text-left rounded-xl p-4 transition-all"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,0.06)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,0.25)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
              }}
            >
              {/* Icon */}
              <div className="text-3xl mb-3">{template.icon}</div>

              {/* Name */}
              <div className="text-[13px] font-semibold text-white mb-1.5 group-hover:text-orange-300 transition-colors">
                {template.name}
              </div>

              {/* Description */}
              <p className="text-[11px] text-gray-600 leading-relaxed mb-3">{template.description}</p>

              {/* Stats */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] text-gray-600">{template.nodes.length} nodes</span>
                <span className="text-[10px] text-gray-700">·</span>
                <span className="text-[10px] text-gray-600">{template.edges.length} edges</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {template.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide"
                    style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600 group-hover:text-orange-400 transition-colors">
                Use template <ArrowRight size={10} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
