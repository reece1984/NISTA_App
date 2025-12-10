interface ActionPlanProps {
  actions: any[]
}

export default function ActionPlan({ actions }: ActionPlanProps) {
  const formatDate = (date: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="report-section">
      <h2 className="section-title">Action Plan</h2>

      <p className="section-intro">
        {actions.length} action{actions.length !== 1 ? 's' : ''} have been identified to improve gateway readiness.
        Actions are prioritised by potential impact on the overall assessment.
      </p>

      {/* Summary stats */}
      <div className="action-stats">
        <div className="action-stat">
          <span className="action-stat-value">{actions.filter(a => a.priority === 'Critical').length}</span>
          <span className="action-stat-label">Critical Priority</span>
        </div>
        <div className="action-stat">
          <span className="action-stat-value">{actions.filter(a => a.priority === 'High').length}</span>
          <span className="action-stat-label">High Priority</span>
        </div>
        <div className="action-stat">
          <span className="action-stat-value">{actions.filter(a => a.status === 'In Progress').length}</span>
          <span className="action-stat-label">In Progress</span>
        </div>
        <div className="action-stat">
          <span className="action-stat-value">{actions.filter(a => a.status === 'Completed').length}</span>
          <span className="action-stat-label">Completed</span>
        </div>
      </div>

      {/* Actions table */}
      <table className="actions-table">
        <thead>
          <tr>
            <th className="col-action">Action</th>
            <th className="col-criterion">Related Criterion</th>
            <th className="col-priority">Priority</th>
            <th className="col-impact">Impact</th>
            <th className="col-owner">Owner</th>
            <th className="col-due">Due Date</th>
            <th className="col-status">Status</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action, index) => (
            <tr key={action.id}>
              <td className="action-title">
                <span className="action-number">{index + 1}.</span>
                {action.title}
              </td>
              <td className="action-criterion">{action.criterion_code || '-'}</td>
              <td>
                <span className={`priority-badge priority-${action.priority.toLowerCase()}`}>
                  {action.priority}
                </span>
              </td>
              <td className="action-impact">+{action.impact}%</td>
              <td className="action-owner">{action.owner || 'Unassigned'}</td>
              <td className="action-due">{formatDate(action.due_date)}</td>
              <td>
                <span className={`status-badge status-${action.status.toLowerCase().replace(' ', '-')}`}>
                  {action.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
