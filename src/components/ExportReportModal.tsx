import { useState } from 'react'
import { X, Download, FileText, Loader2 } from 'lucide-react'

interface ExportReportModalProps {
  isOpen: boolean
  onClose: () => void
  project: any
}

interface ReportOptionProps {
  type: 'summary' | 'full' | 'board-pack'
  selected: boolean
  onSelect: () => void
  title: string
  description: string
  pages: string
}

function ReportOption({ type, selected, onSelect, title, description, pages }: ReportOptionProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
        selected
          ? 'border-copper bg-orange-50'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
          ~{pages} pages
        </span>
      </div>
    </button>
  )
}

export default function ExportReportModal({ isOpen, onClose, project }: ExportReportModalProps) {
  const [reportType, setReportType] = useState<'summary' | 'full' | 'board-pack'>('summary')
  const [isGenerating, setIsGenerating] = useState(false)

  if (!isOpen) return null

  const handleExport = async () => {
    setIsGenerating(true)
    try {
      // Open report in new window for preview and printing
      const reportUrl = `/report/${project.id}?type=${reportType}`
      const printWindow = window.open(reportUrl, '_blank')

      // Wait for load, then trigger print dialog
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          setTimeout(() => {
            printWindow.print()
          }, 500)
        })
      }

      onClose()
    } catch (error) {
      console.error('Failed to open report:', error)
      alert('Failed to open report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-copper/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-copper" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Export Report</h2>
              <p className="text-sm text-slate-500">{project.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Choose a report format to export:
          </p>

          {/* Report type options */}
          <div className="space-y-3">
            <ReportOption
              type="summary"
              selected={reportType === 'summary'}
              onSelect={() => setReportType('summary')}
              title="Executive Summary"
              description="3-5 pages. Overall assessment, critical issues, and key recommendations."
              pages="3-5"
            />

            <ReportOption
              type="full"
              selected={reportType === 'full'}
              onSelect={() => setReportType('full')}
              title="Full Assessment Report"
              description="Complete assessment including all criteria, evidence analysis, and detailed action plan."
              pages="15-25"
            />

            <ReportOption
              type="board-pack"
              selected={reportType === 'board-pack'}
              onSelect={() => setReportType('board-pack')}
              title="Board Pack"
              description="High-level summary for senior stakeholders. Key metrics, critical issues, and top recommendations."
              pages="5-8"
            />
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> The report will be generated as a professional PDF suitable for printing
              or sharing with IPA reviewers and stakeholders.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isGenerating}
            className="px-4 py-2 text-sm font-medium text-white bg-copper hover:bg-[#a85d32] rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
