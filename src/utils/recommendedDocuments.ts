export interface RecommendedDocument {
  name: string
  description: string
  required: boolean
}

export const RECOMMENDED_DOCUMENTS: Record<string, RecommendedDocument[]> = {
  'Gate 0: Strategic Assessment': [
    {
      name: 'Strategic Outline Case',
      description: 'Initial strategic justification',
      required: true
    },
    {
      name: 'Stakeholder Map',
      description: 'Key stakeholder identification',
      required: true
    },
    {
      name: 'High-Level Options',
      description: 'Initial options assessment',
      required: false
    },
    {
      name: 'Programme Brief',
      description: 'Programme scope and objectives',
      required: true
    }
  ],
  'Gate 1: Business Justification': [
    {
      name: 'Strategic Outline Case',
      description: 'Strategic justification and options',
      required: true
    },
    {
      name: 'Options Analysis',
      description: 'Detailed assessment of alternatives',
      required: true
    },
    {
      name: 'Initial Benefits Map',
      description: 'Expected benefits and outcomes',
      required: true
    },
    {
      name: 'Stakeholder Engagement Plan',
      description: 'Approach to stakeholder management',
      required: false
    }
  ],
  'Gate 2: Delivery Strategy': [
    {
      name: 'Outline Business Case',
      description: 'Five-case model at outline stage',
      required: true
    },
    {
      name: 'Procurement Strategy',
      description: 'Initial commercial approach',
      required: true
    },
    {
      name: 'Risk Register',
      description: 'Key risks and mitigations',
      required: true
    },
    {
      name: 'Benefits Management Strategy',
      description: 'Approach to benefits realisation',
      required: true
    },
    {
      name: 'Resource Plan',
      description: 'Resource requirements and allocation',
      required: false
    }
  ],
  'Gate 3: Investment Decision': [
    {
      name: 'Full Business Case',
      description: 'Complete FBC with all five cases',
      required: true
    },
    {
      name: 'Benefits Realisation Plan',
      description: 'Detailed benefits tracking approach',
      required: true
    },
    {
      name: 'Risk Register',
      description: 'Current risk log with mitigations',
      required: true
    },
    {
      name: 'Procurement Strategy',
      description: 'Commercial approach documentation',
      required: true
    },
    {
      name: 'Implementation Plan',
      description: 'Detailed delivery schedule',
      required: false
    },
    {
      name: 'Assurance Plan',
      description: 'Approach to ongoing assurance',
      required: false
    }
  ],
  'Gate 4: Readiness for Service': [
    {
      name: 'Updated Business Case',
      description: 'Business case reflecting current state',
      required: true
    },
    {
      name: 'Contract Documentation',
      description: 'Key commercial agreements',
      required: true
    },
    {
      name: 'Benefits Tracker',
      description: 'Current benefits status',
      required: true
    },
    {
      name: 'Risk Register',
      description: 'Live risk management log',
      required: true
    },
    {
      name: 'Lessons Learned',
      description: 'Key insights from delivery',
      required: false
    }
  ],
  'Gate 5: Operations Review & Benefits': [
    {
      name: 'Operations Manual',
      description: 'Operational procedures and guides',
      required: true
    },
    {
      name: 'Benefits Report',
      description: 'Achieved vs planned benefits',
      required: true
    },
    {
      name: 'Lessons Learned Report',
      description: 'Comprehensive review of programme',
      required: true
    },
    {
      name: 'Handover Documentation',
      description: 'Transition to BAU arrangements',
      required: true
    },
    {
      name: 'Final Accounts',
      description: 'Financial closure documentation',
      required: false
    }
  ],
  'Project Assessment Review': [
    {
      name: 'Programme Business Case',
      description: 'Current business case documentation',
      required: true
    },
    {
      name: 'Programme Plan',
      description: 'Integrated programme schedule',
      required: true
    },
    {
      name: 'Risk Register',
      description: 'Active risk management documentation',
      required: true
    },
    {
      name: 'Benefits Management',
      description: 'Benefits tracking and realisation',
      required: true
    },
    {
      name: 'Governance Structure',
      description: 'Decision-making arrangements',
      required: true
    },
    {
      name: 'Financial Reports',
      description: 'Budget and expenditure tracking',
      required: false
    }
  ]
}

// Helper function to check if a document matches a recommended type
export function isDocumentTypeMatch(fileName: string, recommendedName: string): boolean {
  const normalizedFile = fileName.toLowerCase().replace(/[_\-\s]/g, '')
  const normalizedRecommended = recommendedName.toLowerCase().replace(/[_\-\s]/g, '')

  // Check for common variations
  const variations = [
    normalizedRecommended,
    normalizedRecommended.replace('case', ''),
    normalizedRecommended.replace('plan', ''),
    normalizedRecommended.replace('strategy', ''),
    normalizedRecommended.replace('register', ''),
    normalizedRecommended.replace('report', ''),
  ]

  return variations.some(variation => normalizedFile.includes(variation))
}

// Calculate coverage percentage
export function calculateCoverage(
  uploadedDocuments: any[],
  templateName: string
): { uploaded: number; recommended: number; percentage: number } {
  const recommendedDocs = RECOMMENDED_DOCUMENTS[templateName] || []
  const uploadedCount = recommendedDocs.filter(rec =>
    uploadedDocuments.some(doc =>
      isDocumentTypeMatch(doc.file_name || doc.name || '', rec.name)
    )
  ).length

  return {
    uploaded: uploadedCount,
    recommended: recommendedDocs.length,
    percentage: recommendedDocs.length > 0
      ? Math.round((uploadedCount / recommendedDocs.length) * 100)
      : 0
  }
}