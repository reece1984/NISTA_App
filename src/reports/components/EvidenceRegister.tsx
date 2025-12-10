interface EvidenceRegisterProps {
  documents: any[]
  coverageStats: any
}

export default function EvidenceRegister({ documents, coverageStats }: EvidenceRegisterProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="report-section">
      <h2 className="section-title">Evidence Register</h2>

      <p className="section-intro">
        {documents.length} document{documents.length !== 1 ? 's' : ''} have been uploaded and analysed against{' '}
        {coverageStats.total_requirements} evidence requirements.
      </p>

      {/* Coverage summary */}
      <div className="coverage-summary">
        <div className="coverage-stat">
          <div className="coverage-bar">
            <div
              className="coverage-bar-fill"
              style={{ width: `${coverageStats.coverage_percentage}%` }}
            />
          </div>
          <span className="coverage-label">
            {coverageStats.coverage_percentage}% Evidence Coverage
            ({coverageStats.requirements_met} of {coverageStats.total_requirements} requirements)
          </span>
        </div>
      </div>

      {/* Documents table */}
      <table className="documents-table">
        <thead>
          <tr>
            <th>Document</th>
            <th>Type</th>
            <th>Case Alignment</th>
            <th>Pages</th>
            <th>Uploaded</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {documents.map(doc => (
            <tr key={doc.id}>
              <td className="doc-name">{doc.name}</td>
              <td>{doc.type || 'Document'}</td>
              <td>{doc.case || 'Multiple'}</td>
              <td>{doc.pages || '-'}</td>
              <td>{formatDate(doc.uploaded_at)}</td>
              <td>
                <span className={`status-dot status-${doc.status?.toLowerCase() || 'processed'}`} />
                {doc.status || 'Processed'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Missing documents */}
      {coverageStats.missing_documents && coverageStats.missing_documents.length > 0 && (
        <div className="missing-docs">
          <h4 className="missing-title">Recommended Documents Not Yet Uploaded</h4>
          <ul className="missing-list">
            {coverageStats.missing_documents.map((doc: any, index: number) => (
              <li key={index}>
                <span className="missing-doc-name">{doc.name}</span>
                <span className="missing-doc-case">{doc.case} Case</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
