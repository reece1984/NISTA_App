import type { GateRecommendations } from '../types/recommendedDocuments'

export const GATE_RECOMMENDATIONS: Record<string, GateRecommendations> = {
  'gate-0': {
    gate: 'gate-0',
    gateName: 'Gate 0: Strategic Assessment',
    documents: [
      {
        id: 'soc',
        name: 'Strategic Outline Case',
        description: 'Initial strategic case for change',
        isUploaded: false,
      },
      {
        id: 'mandate',
        name: 'Project Mandate',
        description: 'Authority to proceed with analysis',
        isUploaded: false,
      },
    ],
  },
  'gate-1': {
    gate: 'gate-1',
    gateName: 'Gate 1: Business Justification',
    documents: [
      {
        id: 'obc',
        name: 'Outline Business Case',
        description: 'Preliminary business case with options',
        isUploaded: false,
      },
      {
        id: 'benefits',
        name: 'Benefits Framework',
        description: 'Initial benefits identification',
        isUploaded: false,
      },
      {
        id: 'risk',
        name: 'Risk Register',
        description: 'Initial risk assessment',
        isUploaded: false,
      },
    ],
  },
  'gate-2': {
    gate: 'gate-2',
    gateName: 'Gate 2: Delivery Strategy',
    documents: [
      {
        id: 'obc-updated',
        name: 'Updated OBC',
        description: 'Refined business case with preferred option',
        isUploaded: false,
      },
      {
        id: 'procurement',
        name: 'Procurement Strategy',
        description: 'Commercial approach documentation',
        isUploaded: false,
      },
      {
        id: 'risk',
        name: 'Risk Register',
        description: 'Updated risk log with mitigations',
        isUploaded: false,
      },
      {
        id: 'plan',
        name: 'Delivery Plan',
        description: 'High-level implementation approach',
        isUploaded: false,
      },
    ],
  },
  'gate-3': {
    gate: 'gate-3',
    gateName: 'Gate 3: Investment Decision',
    documents: [
      {
        id: 'fbc',
        name: 'Full Business Case',
        description: 'Complete FBC with all five cases',
        isUploaded: false,
      },
      {
        id: 'brp',
        name: 'Benefits Realisation Plan',
        description: 'Detailed benefits tracking approach',
        isUploaded: false,
      },
      {
        id: 'risk',
        name: 'Risk Register',
        description: 'Current risk log with mitigations',
        isUploaded: false,
      },
      {
        id: 'procurement',
        name: 'Procurement Strategy',
        description: 'Commercial approach documentation',
        isUploaded: false,
      },
      {
        id: 'impl',
        name: 'Implementation Plan',
        description: 'Detailed delivery schedule',
        isUploaded: false,
      },
      {
        id: 'assurance',
        name: 'Assurance Plan',
        description: 'Approach to ongoing assurance',
        isUploaded: false,
      },
    ],
  },
  'gate-4': {
    gate: 'gate-4',
    gateName: 'Gate 4: Readiness for Service',
    documents: [
      {
        id: 'fbc-updated',
        name: 'Updated FBC',
        description: 'Business case with delivery updates',
        isUploaded: false,
      },
      {
        id: 'brp',
        name: 'Benefits Realisation Plan',
        description: 'Updated benefits tracking',
        isUploaded: false,
      },
      {
        id: 'transition',
        name: 'Transition Plan',
        description: 'Service transition approach',
        isUploaded: false,
      },
      {
        id: 'ops',
        name: 'Operational Readiness',
        description: 'Readiness assessment documentation',
        isUploaded: false,
      },
    ],
  },
  'gate-5': {
    gate: 'gate-5',
    gateName: 'Gate 5: Benefits Evaluation',
    documents: [
      {
        id: 'ber',
        name: 'Benefits Evaluation Report',
        description: 'Assessment of realised benefits',
        isUploaded: false,
      },
      {
        id: 'lessons',
        name: 'Lessons Learned',
        description: 'Project lessons documentation',
        isUploaded: false,
      },
      {
        id: 'closure',
        name: 'Project Closure Report',
        description: 'Final project summary',
        isUploaded: false,
      },
    ],
  },
}
