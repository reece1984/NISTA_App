import {
  Upload, FileText, Trash2, ExternalLink, CheckCircle,
  Loader2, X, RefreshCw, Play, AlertCircle
} from 'lucide-react'
import { RECOMMENDED_DOCUMENTS, calculateCoverage, isDocumentTypeMatch } from '../utils/recommendedDocuments'
import { formatFileSize, formatUploadDate, getFileExtension } from '../utils/documentUtils'

interface DocumentsTabContentProps {
  documents: any[]
  templateName: string
  projectData: any
  hasAssessments: boolean
  hasFiles: boolean
  runningAssessment: boolean
  onUploadClick: () => void
  onDeleteDocument: (document: any) => void
  deletingDocumentId: number | null
  onRunAssessment: () => void
  onRerunAssessment: () => void
  onViewResults: () => void
}

export default function DocumentsTabContent({
  documents,
  templateName,
  projectData,
  hasAssessments,
  hasFiles,
  runningAssessment,
  onUploadClick,
  onDeleteDocument,
  deletingDocumentId,
  onRunAssessment,
  onRerunAssessment,
  onViewResults
}: DocumentsTabContentProps) {
  const recommendedDocs = RECOMMENDED_DOCUMENTS[templateName] || []
  const coverage = calculateCoverage(documents, templateName)

  // Get coverage ring color
  const getCoverageColor = (percentage: number) => {
    if (percentage <= 33) return 'var(--red)'
    if (percentage <= 66) return 'var(--amber)'
    return 'var(--green)'
  }

  // Calculate stroke offset for coverage ring
  const circumference = 2 * Math.PI * 40 // radius = 40
  const strokeOffset = circumference - (coverage.percentage / 100) * circumference

  // Get document status and icon
  const getDocumentStatus = (doc: any) => {
    // For now, all uploaded documents are considered processed
    // You can add more logic here based on actual processing status
    return 'processed'
  }

  return (
    <div style={{
      padding: '2rem',
      background: 'var(--gray-50)',
      minHeight: '600px'
    }}>
      {/* Page Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '1.5rem',
        '@media (max-width: 1024px)': {
          gridTemplateColumns: '1fr'
        }
      }}>
        {/* Main Documents Section */}
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Section Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)'
          }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--ink)'
              }}>
                Project Documents
              </h2>
              <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginTop: '0.25rem'
              }}>
                Upload programme documents for AI-powered assessment
              </p>
            </div>
            <button
              onClick={onUploadClick}
              disabled={documents.length >= 50}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                background: 'var(--ink)',
                color: 'var(--white)',
                borderRadius: '6px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: documents.length >= 50 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                border: 'none',
                opacity: documents.length >= 50 ? 0.5 : 1
              }}
              onMouseEnter={e => {
                if (documents.length < 50) {
                  e.currentTarget.style.background = 'var(--ink-light)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--ink)'
              }}
            >
              <Upload size={16} />
              Upload Documents
            </button>
          </div>

          {/* Document List */}
          {documents.length > 0 ? (
            <div style={{ padding: '0.5rem 0' }}>
              {documents.map((doc) => {
                const status = getDocumentStatus(doc)
                const isDeleting = deletingDocumentId === doc.id
                return (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.5rem',
                      borderBottom: '1px solid var(--gray-100)',
                      transition: 'background 0.15s ease',
                      opacity: isDeleting ? 0.5 : 1
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--gray-50)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    {/* Document Icon */}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      background: status === 'processed' ? 'var(--green-bg)' :
                                 status === 'processing' ? 'var(--blue-bg)' : 'var(--red-bg)',
                      border: `1px solid ${
                        status === 'processed' ? 'var(--green-border)' :
                        status === 'processing' ? 'var(--blue-border)' : 'var(--red-border)'
                      }`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: status === 'processed' ? 'var(--green)' :
                             status === 'processing' ? 'var(--blue)' : 'var(--red)',
                      flexShrink: 0
                    }}>
                      <FileText size={20} />
                    </div>

                    {/* Document Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: 'var(--ink)',
                        marginBottom: '0.25rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {doc.file_name || doc.name}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)'
                      }}>
                        <span style={{
                          padding: '0.15rem 0.5rem',
                          background: 'var(--gray-100)',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase'
                        }}>
                          {getFileExtension(doc.file_name || doc.name)}
                        </span>
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>Uploaded {formatUploadDate(doc.uploaded_at || doc.created_at)}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '100px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: status === 'processed' ? 'var(--green-bg)' :
                                 status === 'processing' ? 'var(--blue-bg)' : 'var(--red-bg)',
                      color: status === 'processed' ? 'var(--green)' :
                             status === 'processing' ? 'var(--blue)' : 'var(--red)'
                    }}>
                      {status === 'processed' && <CheckCircle size={12} />}
                      {status === 'processing' && <Loader2 size={12} className="animate-spin" />}
                      {status === 'error' && <X size={12} />}
                      {status === 'processed' ? 'Processed' :
                       status === 'processing' ? 'Processing' : 'Error'}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => window.open(doc.file_url, '_blank')}
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'none',
                          border: '1px solid transparent',
                          borderRadius: '6px',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'var(--gray-100)'
                          e.currentTarget.style.borderColor = 'var(--border)'
                          e.currentTarget.style.color = 'var(--ink)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'none'
                          e.currentTarget.style.borderColor = 'transparent'
                          e.currentTarget.style.color = 'var(--text-muted)'
                        }}
                        title="View document"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteDocument(doc)}
                        disabled={isDeleting}
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'none',
                          border: '1px solid transparent',
                          borderRadius: '6px',
                          color: 'var(--text-muted)',
                          cursor: isDeleting ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s ease',
                          opacity: isDeleting ? 0.5 : 1
                        }}
                        onMouseEnter={e => {
                          if (!isDeleting) {
                            e.currentTarget.style.background = 'var(--red-bg)'
                            e.currentTarget.style.borderColor = 'var(--red-border)'
                            e.currentTarget.style.color = 'var(--red)'
                          }
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'none'
                          e.currentTarget.style.borderColor = 'transparent'
                          e.currentTarget.style.color = 'var(--text-muted)'
                        }}
                        title="Delete document"
                      >
                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // Empty state
            <div style={{
              padding: '3rem 1.5rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1.5rem',
                background: 'var(--gray-100)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                <FileText size={32} />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: '0.5rem'
              }}>
                No documents uploaded yet
              </h3>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                maxWidth: '300px',
                margin: '0 auto'
              }}>
                Upload your project documents to run an AI-powered assessment
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
            {/* Recommended Documents Card */}
            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FileText size={16} color="var(--ink)" />
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--text-muted)'
                }}>
                  Recommended for {templateName}
                </span>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {recommendedDocs.map((rec) => {
                    const isUploaded = documents.some(doc =>
                      isDocumentTypeMatch(doc.file_name || doc.name || '', rec.name)
                    )
                    return (
                      <div
                        key={rec.name}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          background: 'var(--gray-50)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'var(--gray-100)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'var(--gray-50)'
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: isUploaded ? 'none' : '2px solid var(--gray-300)',
                          borderRadius: '4px',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: '2px',
                          background: isUploaded ? 'var(--green)' : 'transparent'
                        }}>
                          {isUploaded && <CheckCircle size={12} color="white" strokeWidth={3} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--ink)',
                            marginBottom: '0.15rem'
                          }}>
                            {rec.name}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            lineHeight: 1.4
                          }}>
                            {rec.description}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Evidence Coverage Card - Only show when there are documents */}
            {documents.length > 0 && (
            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} color="var(--ink)" />
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--text-muted)'
                }}>
                  Evidence Coverage
                </span>
              </div>
              <div style={{ padding: '1.25rem', textAlign: 'center' }}>
                {/* Coverage Ring */}
                <div style={{
                  width: '100px',
                  height: '100px',
                  margin: '0 auto 1rem',
                  position: 'relative'
                }}>
                  <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="var(--gray-200)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={getCoverageColor(coverage.percentage)}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeOffset}
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--ink)'
                  }}>
                    {coverage.percentage}%
                  </div>
                </div>
                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  marginBottom: '1rem'
                }}>
                  of recommended documents uploaded
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem',
                  textAlign: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border)'
                }}>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--ink)'
                    }}>
                      {coverage.uploaded}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      Uploaded
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--ink)'
                    }}>
                      {coverage.recommended}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      Recommended
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Assessment CTA Card - Only show when there are documents */}
            {documents.length > 0 && (
            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-sm)',
              padding: '1.25rem'
            }}>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--ink)',
                marginBottom: '1rem',
                lineHeight: 1.5
              }}>
                Your documents have been processed and are ready for assessment.
              </p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <button
                  onClick={hasAssessments ? onRerunAssessment : onRunAssessment}
                  disabled={runningAssessment || !hasFiles}
                  style={{
                    width: '100%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.25rem',
                    background: 'var(--ink)',
                    color: 'var(--white)',
                    borderRadius: '6px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: runningAssessment || !hasFiles ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    border: 'none',
                    opacity: runningAssessment || !hasFiles ? 0.5 : 1
                  }}
                  onMouseEnter={e => {
                    if (!runningAssessment && hasFiles) {
                      e.currentTarget.style.background = 'var(--ink-light)'
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--ink)'
                  }}
                >
                  {runningAssessment ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      {hasAssessments ? 'Re-run Assessment' : 'Run Assessment'}
                    </>
                  )}
                </button>
                {hasAssessments && (
                  <button
                    onClick={onViewResults}
                    style={{
                      width: '100%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.25rem',
                      background: 'var(--white)',
                      color: 'var(--ink)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--gray-100)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--white)'
                    }}
                  >
                    <Play size={16} />
                    View Results
                  </button>
                )}
              </div>
            </div>
            )}
          </div>
      </div>
    </div>
  )
}