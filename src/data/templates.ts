import type { Node, Edge } from '@xyflow/react';
import type { WorkflowNodeData } from '../types/workflow';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  tags: string[];
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    description: 'Full onboarding flow from offer acceptance to day-one system access',
    icon: '🎉',
    tags: ['onboarding', 'hiring', 'access'],
    nodes: [
      { id: 't1', type: 'start', position: { x: 300, y: 40 }, data: { type: 'start', label: 'Offer Accepted', metadata: [{ id: 'm1', key: 'department', value: 'Engineering' }, { id: 'm2', key: 'start_date', value: 'TBD' }] } },
      { id: 't2', type: 'task', position: { x: 300, y: 190 }, data: { type: 'task', label: 'Collect Documents', description: 'Gather ID proof, tax forms, bank details, and address proof', assignee: 'HR Admin', dueDate: '', customFields: [{ id: 'c1', key: 'checklist', value: 'ID, PAN, Bank' }] } },
      { id: 't3', type: 'automated', position: { x: 300, y: 340 }, data: { type: 'automated', label: 'Send Welcome Email', actionId: 'send_email', actionParams: { to: 'new_hire@email.com', subject: 'Welcome to Tredence!', body: 'We are excited to have you.' } } },
      { id: 't4', type: 'automated', position: { x: 300, y: 490 }, data: { type: 'automated', label: 'Generate Offer Letter', actionId: 'generate_doc', actionParams: { template: 'offer_letter_v2', recipient: 'new_hire' } } },
      { id: 't5', type: 'approval', position: { x: 300, y: 640 }, data: { type: 'approval', label: 'Director Sign-off', approverRole: 'Director', autoApproveThreshold: 90 } },
      { id: 't6', type: 'automated', position: { x: 300, y: 790 }, data: { type: 'automated', label: 'Provision System Access', actionId: 'provision_access', actionParams: { system: 'GitHub, Slack, Jira', role: 'engineer', employeeId: '' } } },
      { id: 't7', type: 'task', position: { x: 300, y: 940 }, data: { type: 'task', label: 'Day-1 Orientation', description: 'Intro to team, tools, and culture walkthrough', assignee: 'Engineering Lead', dueDate: '', customFields: [] } },
      { id: 't8', type: 'end', position: { x: 300, y: 1090 }, data: { type: 'end', label: 'Onboarding Complete', endMessage: 'Employee successfully onboarded and ready to start!', showSummary: true } },
    ],
    edges: [
      { id: 'te1', source: 't1', target: 't2', animated: true },
      { id: 'te2', source: 't2', target: 't3', animated: true },
      { id: 'te3', source: 't3', target: 't4', animated: true },
      { id: 'te4', source: 't4', target: 't5', animated: true },
      { id: 'te5', source: 't5', target: 't6', animated: true },
      { id: 'te6', source: 't6', target: 't7', animated: true },
      { id: 'te7', source: 't7', target: 't8', animated: true },
    ],
  },
  {
    id: 'leave_approval',
    name: 'Leave Approval',
    description: 'Employee leave request through manager and HR approval chain',
    icon: '📅',
    tags: ['leave', 'approval', 'hr'],
    nodes: [
      { id: 'l1', type: 'start', position: { x: 300, y: 40 }, data: { type: 'start', label: 'Leave Request Submitted', metadata: [{ id: 'lm1', key: 'type', value: 'Annual Leave' }, { id: 'lm2', key: 'days', value: '5' }] } },
      { id: 'l2', type: 'automated', position: { x: 300, y: 190 }, data: { type: 'automated', label: 'Notify Manager', actionId: 'slack_notify', actionParams: { channel: '#manager-alerts', message: 'New leave request pending your review' } } },
      { id: 'l3', type: 'approval', position: { x: 300, y: 340 }, data: { type: 'approval', label: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 0 } },
      { id: 'l4', type: 'approval', position: { x: 300, y: 490 }, data: { type: 'approval', label: 'HRBP Review', approverRole: 'HRBP', autoApproveThreshold: 75 } },
      { id: 'l5', type: 'automated', position: { x: 300, y: 640 }, data: { type: 'automated', label: 'Update HRIS Record', actionId: 'update_hris', actionParams: { employeeId: '', field: 'leave_balance', value: 'auto-decrement' } } },
      { id: 'l6', type: 'automated', position: { x: 300, y: 790 }, data: { type: 'automated', label: 'Send Confirmation', actionId: 'send_email', actionParams: { to: 'employee@company.com', subject: 'Leave Approved', body: 'Your leave request has been approved.' } } },
      { id: 'l7', type: 'end', position: { x: 300, y: 940 }, data: { type: 'end', label: 'Leave Confirmed', endMessage: 'Leave approved and calendar updated.', showSummary: false } },
    ],
    edges: [
      { id: 'le1', source: 'l1', target: 'l2', animated: true },
      { id: 'le2', source: 'l2', target: 'l3', animated: true },
      { id: 'le3', source: 'l3', target: 'l4', animated: true },
      { id: 'le4', source: 'l4', target: 'l5', animated: true },
      { id: 'le5', source: 'l5', target: 'l6', animated: true },
      { id: 'le6', source: 'l6', target: 'l7', animated: true },
    ],
  },
  {
    id: 'document_verification',
    name: 'Document Verification',
    description: 'Background check and document verification for new joiners',
    icon: '📋',
    tags: ['documents', 'verification', 'compliance'],
    nodes: [
      { id: 'd1', type: 'start', position: { x: 300, y: 40 }, data: { type: 'start', label: 'Documents Received', metadata: [{ id: 'dm1', key: 'source', value: 'HR Portal' }] } },
      { id: 'd2', type: 'task', position: { x: 300, y: 190 }, data: { type: 'task', label: 'Initial Document Check', description: 'Verify document completeness: ID, address proof, education certificates', assignee: 'HR Coordinator', dueDate: '', customFields: [{ id: 'dc1', key: 'required_docs', value: '6' }] } },
      { id: 'd3', type: 'automated', position: { x: 300, y: 340 }, data: { type: 'automated', label: 'Trigger BGV', actionId: 'create_ticket', actionParams: { project: 'BGV', summary: 'Background verification for new hire', priority: 'High' } } },
      { id: 'd4', type: 'task', position: { x: 300, y: 490 }, data: { type: 'task', label: 'BGV Review', description: 'Review background verification report from third-party vendor', assignee: 'HR Manager', dueDate: '', customFields: [] } },
      { id: 'd5', type: 'approval', position: { x: 300, y: 640 }, data: { type: 'approval', label: 'Compliance Approval', approverRole: 'HRBP', autoApproveThreshold: 85 } },
      { id: 'd6', type: 'automated', position: { x: 300, y: 790 }, data: { type: 'automated', label: 'Archive Documents', actionId: 'generate_doc', actionParams: { template: 'document_archive', recipient: 'hr_records' } } },
      { id: 'd7', type: 'end', position: { x: 300, y: 940 }, data: { type: 'end', label: 'Verification Complete', endMessage: 'All documents verified and archived successfully.', showSummary: true } },
    ],
    edges: [
      { id: 'de1', source: 'd1', target: 'd2', animated: true },
      { id: 'de2', source: 'd2', target: 'd3', animated: true },
      { id: 'de3', source: 'd3', target: 'd4', animated: true },
      { id: 'de4', source: 'd4', target: 'd5', animated: true },
      { id: 'de5', source: 'd5', target: 'd6', animated: true },
      { id: 'de6', source: 'd6', target: 'd7', animated: true },
    ],
  },
];
