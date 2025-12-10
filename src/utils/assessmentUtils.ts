// Generate AI-like executive summary based on assessment results
export function generateExecutiveSummary(assessmentResults: any[], overallRating: string, project: any): string {
  const redCount = assessmentResults.filter(r => r.rag_rating?.toLowerCase() === 'red').length
  const amberCount = assessmentResults.filter(r => r.rag_rating?.toLowerCase() === 'amber').length
  const greenCount = assessmentResults.filter(r => r.rag_rating?.toLowerCase() === 'green').length
  const criticalRed = assessmentResults.filter(r => r.rag_rating?.toLowerCase() === 'red' && (r.is_critical || r.assessment_criteria?.is_critical)).length

  // Get project name with fallback
  const projectName = project.name || project.project_name || 'this project'
  const templateName = project.assessment_templates?.name || project.template_name || 'the next gate'

  // Get categories with issues
  const categoriesWithIssues = new Set(
    assessmentResults
      .filter(r => r.rag_rating?.toLowerCase() === 'red' || r.rag_rating?.toLowerCase() === 'amber')
      .map(r => (r.assessment_criteria?.category || r.category || 'General').replace(' Case', ''))
  )

  const issueCategories = Array.from(categoriesWithIssues).join(', ') || 'several areas'
  const totalCriteria = assessmentResults.length

  // Generate summary based on rating
  if (overallRating === 'RED') {
    return `The overall assessment rating for the ${projectName} gate review is <strong>RED</strong> due to critical shortcomings in ${issueCategories.toLowerCase()}. While the project demonstrates structured arrangements across ${totalCriteria} criteria, ${criticalRed > 0 ? `${criticalRed} critical issues` : `significant risks`} must be urgently addressed before proceeding to ${templateName}.`
  } else if (overallRating === 'AMBER') {
    return `The overall assessment rating for ${projectName} is <strong>AMBER</strong>, indicating the project can proceed with conditions. The assessment identified ${greenCount} criteria meeting expectations, but ${amberCount} areas require attention, particularly in ${issueCategories.toLowerCase()}. These issues should be resolved before the next gateway review to ensure project success.`
  } else {
    return `The overall assessment rating for ${projectName} is <strong>GREEN</strong>, demonstrating strong readiness to proceed. All ${greenCount} assessed criteria meet or exceed IPA standards, with robust arrangements in place across all five business case dimensions. The project shows excellent preparation for ${templateName} with no critical issues identified.`
  }
}

// Generate recommendations based on critical issues
export function generateRecommendations(criticalIssues: any[]): Array<{ text: string; priority: string }> {
  const recommendations: Array<{ text: string; priority: string }> = []

  // Group issues by category
  const issuesByCategory = criticalIssues.reduce((acc, issue) => {
    const category = (issue.assessment_criteria?.category || issue.category || 'General').replace(' Case', '')
    if (!acc[category]) acc[category] = []
    acc[category].push(issue)
    return acc
  }, {} as Record<string, any[]>)

  // Generate recommendations for each category
  Object.entries(issuesByCategory).forEach(([category, issues]) => {
    const hasRed = issues.some(i => i.rag_rating?.toLowerCase() === 'red')
    const priority = hasRed ? 'critical' : 'high'

    if (category === 'Strategic') {
      recommendations.push({
        text: `<strong>Strengthen the strategic case</strong> by conducting a comprehensive review of strategic alignment and policy objectives, ensuring clear linkage to government priorities and demonstrable contribution to strategic outcomes.`,
        priority
      })
    } else if (category === 'Economic') {
      if (issues.some(i => i.title?.toLowerCase().includes('value for money') || i.assessment_criteria?.title?.toLowerCase().includes('value for money'))) {
        recommendations.push({
          text: `<strong>Conduct a comprehensive reappraisal of the economic case</strong> to strengthen the valuation of wider benefits and ensure robustness of the VfM analysis, led by the Department's economic advisors.`,
          priority: 'critical'
        })
      } else {
        recommendations.push({
          text: `<strong>Enhance economic analysis</strong> by quantifying all wider economic impacts and conducting sensitivity analysis on key assumptions to demonstrate value for money.`,
          priority
        })
      }
    } else if (category === 'Commercial') {
      recommendations.push({
        text: `<strong>Review commercial arrangements</strong> to ensure procurement strategy aligns with market capacity, risk allocation is appropriate, and contract management capabilities are in place.`,
        priority
      })
    } else if (category === 'Financial') {
      if (issues.some(i => i.rag_rating?.toLowerCase() === 'red')) {
        recommendations.push({
          text: `<strong>Undertake a full financial review</strong> to confirm funding adequacy, contingency appropriateness, and improved cost-estimate maturity, with enhanced governance from the Shareholder Board.`,
          priority: 'critical'
        })
      } else {
        recommendations.push({
          text: `<strong>Strengthen financial controls</strong> by implementing robust cost management procedures and establishing clear financial governance arrangements.`,
          priority
        })
      }
    } else if (category === 'Management') {
      if (issues.some(i => i.title?.toLowerCase().includes('governance'))) {
        recommendations.push({
          text: `<strong>Strengthen governance</strong> by clarifying roles and responsibilities within the project governance structure and rigorously enforcing change control and stakeholder management processes.`,
          priority: hasRed ? 'critical' : 'high'
        })
      }
      if (issues.some(i => i.title?.toLowerCase().includes('schedule') || i.title?.toLowerCase().includes('risk'))) {
        recommendations.push({
          text: `<strong>Enhance schedule risk management</strong> with external validation and improved documentation. These actions must be completed and independently verified before authorising programme progression.`,
          priority: 'high'
        })
      }
    }
  })

  // Add general recommendation if needed
  if (recommendations.length === 0 && criticalIssues.length > 0) {
    recommendations.push({
      text: `<strong>Address all identified issues</strong> through a comprehensive improvement plan, with clear milestones and accountabilities established before proceeding to the next gate.`,
      priority: criticalIssues.some(i => i.rag_rating?.toLowerCase() === 'red') ? 'critical' : 'high'
    })
  }

  // Sort by priority and limit to 5
  return recommendations
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2 }
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
    })
    .slice(0, 5)
}