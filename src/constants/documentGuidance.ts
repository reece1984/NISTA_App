// Document guidance for different assessment templates

export interface DocumentRecommendation {
  name: string
  reason: string
}

export interface TemplateGuidance {
  title: string
  description: string
  essential: DocumentRecommendation[]
  recommended: DocumentRecommendation[]
  optional: DocumentRecommendation[]
}

export const DOCUMENT_GUIDANCE: Record<string, TemplateGuidance> = {
  gate_0: {
    title: 'Gate 0: Strategic Assessment',
    description: 'Early-stage assessment focusing on strategic fit and initial viability',
    essential: [
      { name: 'Strategic Outline Case', reason: 'Demonstrates strategic rationale and alignment' },
      { name: 'Benefits Summary', reason: 'Shows expected outcomes and value' },
    ],
    recommended: [
      { name: 'Stakeholder Engagement Plan', reason: 'Shows stakeholder buy-in and management' },
      { name: 'Initial Risk Register', reason: 'Demonstrates awareness of key risks' },
      { name: 'Options Appraisal', reason: 'Shows consideration of alternatives' },
      { name: 'Feasibility Study', reason: 'Validates technical and commercial viability' },
    ],
    optional: [
      { name: 'Strategic Context Documentation', reason: 'Provides policy and strategic background' },
      { name: 'Market Analysis', reason: 'Informs procurement approach' },
    ],
  },

  gate_1: {
    title: 'Gate 1: Business Justification',
    description: 'Detailed business case assessment before formal approval',
    essential: [
      { name: 'Outline Business Case', reason: 'Core document covering all five cases' },
      { name: 'Benefits Realisation Plan', reason: 'Details how benefits will be measured and achieved' },
      { name: 'Risk Register', reason: 'Comprehensive risk identification and mitigation' },
    ],
    recommended: [
      { name: 'Project Execution Plan', reason: 'Shows delivery approach and capability' },
      { name: 'Procurement Strategy', reason: 'Demonstrates commercial viability' },
      { name: 'Financial Model', reason: 'Validates affordability and value for money' },
      { name: 'Project Schedule', reason: 'Shows realistic timeline' },
      { name: 'Cost Estimate', reason: 'Supports financial case' },
      { name: 'Stakeholder Engagement Plan', reason: 'Demonstrates stakeholder management' },
    ],
    optional: [
      { name: 'Previous Gateway Review', reason: 'Shows progression from Gate 0' },
      { name: 'Market Analysis', reason: 'Supports procurement strategy' },
      { name: 'Technical Feasibility Study', reason: 'Validates technical approach' },
    ],
  },

  gate_3: {
    title: 'Gate 3: Investment Decision',
    description: 'Final approval before contract award and major expenditure',
    essential: [
      { name: 'Full Business Case', reason: 'Complete five-case business case' },
      { name: 'Project Management Plan', reason: 'Detailed delivery and management approach' },
      { name: 'Procurement Strategy', reason: 'Final procurement approach before contract' },
      { name: 'Risk Register', reason: 'Updated comprehensive risk assessment' },
    ],
    recommended: [
      { name: 'Contract Strategy', reason: 'Defines contracting approach' },
      { name: 'Financial Model', reason: 'Final affordability confirmation' },
      { name: 'Project Schedule', reason: 'Detailed delivery timeline' },
      { name: 'Cost Estimate', reason: 'Final cost projections' },
      { name: 'Benefits Realisation Plan', reason: 'Updated benefits measurement approach' },
      { name: 'Governance Framework', reason: 'Final governance arrangements' },
      { name: 'Quality Management Plan', reason: 'Quality assurance approach' },
      { name: 'Change Management Strategy', reason: 'Managing organizational change' },
    ],
    optional: [
      { name: 'Previous Gateway Reviews', reason: 'Shows progression through gateways' },
      { name: 'Technical Specifications', reason: 'Detailed technical requirements' },
      { name: 'Environmental Impact Assessment', reason: 'Environmental considerations' },
    ],
  },

  par: {
    title: 'PAR: Project Assessment Review',
    description: 'Comprehensive health check of ongoing project delivery',
    essential: [
      { name: 'Full Business Case', reason: 'Current approved business case' },
      { name: 'Project Management Plan', reason: 'Current management approach' },
      { name: 'Project Schedule', reason: 'Current programme with progress tracking' },
      { name: 'Risk Register', reason: 'Current risks and issues' },
    ],
    recommended: [
      { name: 'Cost Estimate', reason: 'Current cost forecast versus baseline' },
      { name: 'Benefits Realisation Plan', reason: 'Benefits tracking and forecast' },
      { name: 'Governance Framework', reason: 'Current governance arrangements' },
      { name: 'Financial Model', reason: 'Updated financial projections' },
      { name: 'Stakeholder Engagement Plan', reason: 'Current stakeholder management' },
      { name: 'Quality Management Plan', reason: 'Quality assurance status' },
      { name: 'Change Management Strategy', reason: 'Change control approach' },
      { name: 'Previous Gateway Reviews', reason: 'Historical review outcomes' },
    ],
    optional: [
      { name: 'Assurance Review Reports', reason: 'Recent internal or external assurance' },
      { name: 'Audit Reports', reason: 'Recent audit findings' },
      { name: 'Contract Documentation', reason: 'Key contract terms and performance' },
    ],
  },
}
