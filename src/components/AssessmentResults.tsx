import { useState } from 'react'
import { Search, X, FileDown, FileSpreadsheet, Sparkles, ClipboardList } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import OverallRatingCard from './dashboard/OverallRatingCard'
import RAGDonutChart from './dashboard/RAGDonutChart'
import DimensionBarChart from './dashboard/DimensionBarChart'
import PriorityActionsCard from './dashboard/PriorityActionsCard'
import InteractiveCriteriaTable from './dashboard/InteractiveCriteriaTable'
import ActionPlanDraftWorkspace from './ActionPlan/ActionPlanDraftWorkspace'
import AssessmentComparisonBanner from './ActionPlan/AssessmentComparisonBanner'
import ActionKanbanBoard from './ActionPlan/ActionKanbanBoard'
import ActionTableView from './ActionPlan/ActionTableView'

interface Assessment {
  id: number
  rag_rating: 'green' | 'amber' | 'red' | 'pending'
  finding: string | null
  evidence: string | null
  recommendation: string | null
  summary: string | null
  confidence: number | null
  satisfaction_score: number | null
  assessment_criteria: {
    criterion_code: string
    title: string
    dimension: string
    weight: number | null
    is_critical: boolean
  }
}

interface ProjectSummary {
  id: number
  project_id: number
  overall_rating: string
  executive_summary: string | null
  key_strengths: string | null
  critical_issues: string | null
  overall_recommendation: string | null
  created_at: string
  updated_at: string
}

interface AssessmentResultsProps {
  assessments: Assessment[]
  projectSummary?: ProjectSummary | null
  projectData?: any
  assessmentRunId?: number
  viewMode?: 'full' | 'summary' | 'detail' // Control which parts to render
}

export default function AssessmentResults({
  assessments,
  projectSummary,
  projectData,
  assessmentRunId,
  viewMode = 'full', // Default to full view for backwards compatibility
}: AssessmentResultsProps) {
  const [filter, setFilter] = useState<'all' | 'green' | 'amber' | 'red'>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dimensionFilter, setDimensionFilter] = useState<string | null>(null)
  const [showActionPlanWorkspace, setShowActionPlanWorkspace] = useState(false)

  // Check if action plan draft exists and its status
  const { data: existingDraft } = useQuery({
    queryKey: ['action-plan-draft-exists', assessmentRunId],
    queryFn: async () => {
      if (!assessmentRunId) return null
      const { data, error } = await supabase
        .from('action_plan_drafts')
        .select('id, draft_status')
        .eq('assessment_run_id', assessmentRunId)
        .limit(1)
        .maybeSingle()

      if (error) return null
      return data
    },
    enabled: !!assessmentRunId
  })

  // Check if actions have been created from this assessment run
  const { data: createdActions } = useQuery({
    queryKey: ['actions-from-assessment', assessmentRunId],
    queryFn: async () => {
      if (!assessmentRunId) return null
      const { data, error } = await supabase
        .from('actions')
        .select('id')
        .eq('source_assessment_run_id', assessmentRunId)
        .limit(1)

      if (error) return null
      return data && data.length > 0
    },
    enabled: !!assessmentRunId
  })

  const [showActionsView, setShowActionsView] = useState(false)

  const exportToPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    const margin = 20

    // Professional Color Palette
    type Color = [number, number, number]
    const colors: Record<string, Color> = {
      primary: [41, 128, 185],      // Professional blue
      primaryDark: [21, 67, 96],    // Dark blue
      accent: [52, 152, 219],        // Light blue accent
      success: [39, 174, 96],        // Green
      warning: [243, 156, 18],       // Orange/Amber
      danger: [231, 76, 60],         // Red
      lightGray: [236, 240, 241],    // Light background
      mediumGray: [149, 165, 166],   // Medium gray
      darkGray: [44, 62, 80],        // Dark text
      white: [255, 255, 255]
    }

    // Helper function to add page footer
    const addFooter = (pageNum: number, totalPages: number) => {
      doc.setFillColor(...colors.primaryDark)
      doc.rect(0, pageHeight - 15, pageWidth, 15, 'F')

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.white)
      doc.text('Programme Insights - NISTA/PAR Assessment Platform', margin, pageHeight - 8)
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' })
    }

    // ===== COVER PAGE =====
    // Gradient-like header with modern design
    doc.setFillColor(...colors.primaryDark)
    doc.rect(0, 0, pageWidth, 100, 'F')

    // Accent stripe
    doc.setFillColor(...colors.accent)
    doc.rect(0, 95, pageWidth, 5, 'F')

    // Modern title with better spacing
    doc.setTextColor(...colors.white)
    doc.setFontSize(42)
    doc.setFont('helvetica', 'bold')
    doc.text('NISTA/PAR', pageWidth / 2, 40, { align: 'center' })

    doc.setFontSize(24)
    doc.setFont('helvetica', 'normal')
    doc.text('Assessment Results Report', pageWidth / 2, 58, { align: 'center' })

    // Subtitle with icon-like element
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 200, 200)
    doc.text('Infrastructure & Projects Authority', pageWidth / 2, 70, { align: 'center' })

    // Date with better styling
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(220, 220, 220)
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, 85, { align: 'center' })

    // Calculate summary statistics
    const ragCounts = {
      green: assessments.filter((a) => a.rag_rating === 'green').length,
      amber: assessments.filter((a) => a.rag_rating === 'amber').length,
      red: assessments.filter((a) => a.rag_rating === 'red').length,
    }

    // Overall RAG calculation
    const overallRag = getOverallRag()

    // Modern Executive Summary Section
    let currentY = 120

    // Section header with modern styling
    doc.setFillColor(...colors.lightGray)
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 12, 2, 2, 'F')

    doc.setTextColor(...colors.primaryDark)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Executive Summary', margin + 8, currentY + 8.5)

    currentY += 20

    // Overall Rating Card with modern design
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(...colors.mediumGray)
    doc.setLineWidth(0.5)
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 28, 4, 4, 'FD')

    // Left side - Label
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.darkGray)
    doc.text('Overall Assessment Rating', margin + 10, currentY + 12)

    // Right side - RAG Badge with shadow effect
    const ragColors = {
      green: colors.success,
      amber: colors.warning,
      red: colors.danger,
      pending: colors.mediumGray,
    }

    // Shadow
    doc.setFillColor(0, 0, 0, 0.1)
    doc.roundedRect(pageWidth - margin - 52, currentY + 8.5, 42, 14, 3, 3, 'F')

    // Badge
    doc.setFillColor(...(ragColors[overallRag] || ragColors.pending))
    doc.roundedRect(pageWidth - margin - 50, currentY + 7, 42, 14, 3, 3, 'F')
    doc.setTextColor(...colors.white)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(overallRag.toUpperCase(), pageWidth - margin - 29, currentY + 16, { align: 'center' })

    currentY += 35

    // Criteria Statistics with modern cards
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.darkGray)
    doc.text('Assessment Breakdown', margin + 10, currentY)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...colors.mediumGray)
    doc.text(`${assessments.length} criteria assessed`, margin + 10, currentY + 6)

    currentY += 15

    // Modern RAG breakdown with proportional bars
    const barWidth = pageWidth - margin * 2 - 20
    const barHeight = 16
    const barX = margin + 10

    // Background bar
    doc.setFillColor(...colors.lightGray)
    doc.roundedRect(barX, currentY, barWidth, barHeight, 3, 3, 'F')

    // Calculate proportions
    const total = assessments.length
    const greenWidth = (ragCounts.green / total) * barWidth
    const amberWidth = (ragCounts.amber / total) * barWidth
    const redWidth = (ragCounts.red / total) * barWidth

    // Draw proportional segments
    if (greenWidth > 0) {
      doc.setFillColor(...colors.success)
      doc.roundedRect(barX, currentY, greenWidth, barHeight, 3, 3, 'F')
    }
    if (amberWidth > 0) {
      doc.setFillColor(...colors.warning)
      doc.rect(barX + greenWidth, currentY, amberWidth, barHeight, 'F')
    }
    if (redWidth > 0) {
      doc.setFillColor(...colors.danger)
      doc.roundedRect(barX + greenWidth + amberWidth, currentY, redWidth, barHeight, 3, 3, 'F')
    }

    currentY += barHeight + 8

    // Legend with modern styling
    const legendY = currentY
    const legendItemWidth = (pageWidth - margin * 2) / 3

    // Green legend
    doc.setFillColor(...colors.success)
    doc.circle(margin + 15, legendY, 3, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.darkGray)
    doc.text(`${ragCounts.green}`, margin + 22, legendY + 1.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...colors.mediumGray)
    doc.text(`Green (${Math.round((ragCounts.green / total) * 100)}%)`, margin + 30, legendY + 1.5)

    // Amber legend
    doc.setFillColor(...colors.warning)
    doc.circle(margin + legendItemWidth + 15, legendY, 3, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.darkGray)
    doc.text(`${ragCounts.amber}`, margin + legendItemWidth + 22, legendY + 1.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...colors.mediumGray)
    doc.text(`Amber (${Math.round((ragCounts.amber / total) * 100)}%)`, margin + legendItemWidth + 30, legendY + 1.5)

    // Red legend
    doc.setFillColor(...colors.danger)
    doc.circle(margin + legendItemWidth * 2 + 15, legendY, 3, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.darkGray)
    doc.text(`${ragCounts.red}`, margin + legendItemWidth * 2 + 22, legendY + 1.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...colors.mediumGray)
    doc.text(`Red (${Math.round((ragCounts.red / total) * 100)}%)`, margin + legendItemWidth * 2 + 30, legendY + 1.5)

    currentY += 12

    // Project Summary Section (if available)
    let summaryStartY = currentY + 10
    if (projectSummary) {
      // Executive Summary
      if (projectSummary.executive_summary && summaryStartY < pageHeight - 60) {
        doc.setFillColor(...colors.lightGray)
        doc.roundedRect(margin, summaryStartY, pageWidth - margin * 2, 10, 2, 2, 'F')

        doc.setTextColor(...colors.primaryDark)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Project Summary', margin + 8, summaryStartY + 7)

        summaryStartY += 15

        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(...colors.mediumGray)
        doc.setLineWidth(0.5)

        const execLines = doc.splitTextToSize(projectSummary.executive_summary, pageWidth - margin * 2 - 20)
        const execHeight = (execLines.length * 5) + 16

        if (summaryStartY + execHeight > pageHeight - 30) {
          doc.addPage()
          addFooter(1, assessments.length + 1)
          summaryStartY = 30
        }

        doc.roundedRect(margin, summaryStartY, pageWidth - margin * 2, execHeight, 3, 3, 'FD')
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...colors.darkGray)
        doc.text(execLines, margin + 10, summaryStartY + 10)
        summaryStartY += execHeight + 8
      }

      // Key Strengths with modern card design
      if (projectSummary.key_strengths && summaryStartY < pageHeight - 60) {
        const strengthLines = doc.splitTextToSize(projectSummary.key_strengths, pageWidth - margin * 2 - 20)
        const strengthHeight = (strengthLines.length * 5) + 16

        if (summaryStartY + strengthHeight > pageHeight - 30) {
          doc.addPage()
          addFooter(1, assessments.length + 1)
          summaryStartY = 30
        }

        // Card with left border accent
        doc.setFillColor(245, 255, 250)
        doc.roundedRect(margin, summaryStartY, pageWidth - margin * 2, strengthHeight, 3, 3, 'F')
        doc.setFillColor(...colors.success)
        doc.rect(margin, summaryStartY, 4, strengthHeight, 'F')

        doc.setDrawColor(...colors.success)
        doc.setLineWidth(0.5)
        doc.roundedRect(margin, summaryStartY, pageWidth - margin * 2, strengthHeight, 3, 3, 'D')

        doc.setTextColor(...colors.success)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Key Strengths', margin + 10, summaryStartY + 10)

        doc.setTextColor(...colors.darkGray)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(strengthLines, margin + 10, summaryStartY + 18)
        summaryStartY += strengthHeight + 6
      }

      // Critical Issues
      if (projectSummary.critical_issues && summaryStartY < pageHeight - 60) {
        const issuesLines = doc.splitTextToSize(projectSummary.critical_issues, pageWidth - margin * 2 - 20)
        const issuesHeight = (issuesLines.length * 5) + 16

        if (summaryStartY + issuesHeight > pageHeight - 30) {
          doc.addPage()
          addFooter(1, assessments.length + 1)
          summaryStartY = 30
        }

        // Card with left border accent
        doc.setFillColor(255, 245, 245)
        doc.roundedRect(margin, summaryStartY, pageWidth - margin * 2, issuesHeight, 3, 3, 'F')
        doc.setFillColor(...colors.danger)
        doc.rect(margin, summaryStartY, 4, issuesHeight, 'F')

        doc.setDrawColor(...colors.danger)
        doc.setLineWidth(0.5)
        doc.roundedRect(margin, summaryStartY, pageWidth - margin * 2, issuesHeight, 3, 3, 'D')

        doc.setTextColor(...colors.danger)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Critical Issues', margin + 10, summaryStartY + 10)

        doc.setTextColor(...colors.darkGray)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(issuesLines, margin + 10, summaryStartY + 18)
        summaryStartY += issuesHeight + 6
      }

      // Overall Recommendation
      if (projectSummary.overall_recommendation && summaryStartY < pageHeight - 60) {
        const recLines = doc.splitTextToSize(projectSummary.overall_recommendation, pageWidth - margin * 2 - 20)
        const recHeight = (recLines.length * 5) + 16

        if (summaryStartY + recHeight > pageHeight - 30) {
          doc.addPage()
          addFooter(1, assessments.length + 1)
          summaryStartY = 30
        }

        // Card with left border accent
        doc.setFillColor(240, 248, 255)
        doc.roundedRect(margin, summaryStartY, pageWidth - margin * 2, recHeight, 3, 3, 'F')
        doc.setFillColor(...colors.primary)
        doc.rect(margin, summaryStartY, 4, recHeight, 'F')

        doc.setDrawColor(...colors.primary)
        doc.setLineWidth(0.5)
        doc.roundedRect(margin, summaryStartY, pageWidth - margin * 2, recHeight, 3, 3, 'D')

        doc.setTextColor(...colors.primary)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Overall Recommendation', margin + 10, summaryStartY + 10)

        doc.setTextColor(...colors.darkGray)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(recLines, margin + 10, summaryStartY + 18)
        summaryStartY += recHeight + 10
      }
    } else {
      summaryStartY = currentY
    }

    // Add footer to cover page
    addFooter(1, assessments.length + 2)

    // Summary table on new page
    doc.addPage()
    summaryStartY = 30

    // Modern section header
    doc.setFillColor(...colors.lightGray)
    doc.roundedRect(margin, summaryStartY, pageWidth - margin * 2, 12, 2, 2, 'F')

    doc.setTextColor(...colors.primaryDark)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Assessment Overview', margin + 8, summaryStartY + 8.5)

    summaryStartY += 18

    const summaryTableData = assessments.map((a) => [
      a.assessment_criteria.criterion_code,
      a.assessment_criteria.title,
      a.assessment_criteria.weight !== null ? `${a.assessment_criteria.weight}%` : '-',
      a.assessment_criteria.is_critical ? 'YES' : 'NO',
      a.rag_rating.toUpperCase(),
    ])

    autoTable(doc, {
      startY: summaryStartY,
      head: [['Code', 'Criterion', 'Weight', 'Critical', 'Status']],
      body: summaryTableData,
      theme: 'plain',
      headStyles: {
        fillColor: colors.primaryDark,
        textColor: colors.white,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 6,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 5,
        lineColor: colors.lightGray,
        lineWidth: 0.5,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        0: { cellWidth: 22, fontStyle: 'bold', textColor: colors.darkGray },
        1: { cellWidth: 95, textColor: colors.darkGray },
        2: { cellWidth: 18, halign: 'center', textColor: colors.darkGray },
        3: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
        4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          const criticalValue = data.cell.raw as string
          if (criticalValue === 'YES') {
            data.cell.styles.textColor = colors.danger
            data.cell.styles.fillColor = [255, 242, 242]
          }
        }
        if (data.section === 'body' && data.column.index === 4) {
          const ragValue = data.cell.raw as string
          if (ragValue === 'GREEN') {
            data.cell.styles.textColor = colors.success
            data.cell.styles.fillColor = [240, 255, 244]
          } else if (ragValue === 'AMBER') {
            data.cell.styles.textColor = colors.warning
            data.cell.styles.fillColor = [255, 248, 225]
          } else if (ragValue === 'RED') {
            data.cell.styles.textColor = colors.danger
            data.cell.styles.fillColor = [255, 242, 242]
          }
        }
      },
    })

    // Add footer to overview page
    addFooter(2, assessments.length + 2)

    // ===== DETAILED ASSESSMENT PAGES =====
    assessments.forEach((assessment, index) => {
      doc.addPage()

      // Modern page header
      doc.setFillColor(...colors.primaryDark)
      doc.rect(0, 0, pageWidth, 45, 'F')

      doc.setFillColor(...colors.accent)
      doc.rect(0, 42, pageWidth, 3, 'F')

      doc.setTextColor(...colors.white)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('NISTA/PAR Assessment Report', margin, 18)

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(assessment.assessment_criteria.criterion_code, margin, 32)

      // Criterion title with modern styling
      let yPos = 60
      doc.setTextColor(...colors.primaryDark)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      const titleLines = doc.splitTextToSize(assessment.assessment_criteria.title, pageWidth - margin * 2)
      doc.text(titleLines, margin, yPos)

      yPos += titleLines.length * 7 + 5

      // Dimension badge
      doc.setFillColor(...colors.lightGray)
      doc.roundedRect(margin, yPos, 60, 8, 2, 2, 'F')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.mediumGray)
      doc.text(assessment.assessment_criteria.dimension, margin + 30, yPos + 5.5, { align: 'center' })

      yPos += 15

      // Modern status card with visual hierarchy
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(...colors.lightGray)
      doc.setLineWidth(1)
      doc.roundedRect(margin, yPos, pageWidth - margin * 2, 36, 4, 4, 'FD')

      // RAG Status with modern badge
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...colors.darkGray)
      doc.text('Assessment Status', margin + 15, yPos + 12)

      const ragColor = ragColors[assessment.rag_rating] || ragColors.pending

      // Shadow effect
      doc.setFillColor(0, 0, 0, 0.1)
      doc.roundedRect(margin + 83, yPos + 6.5, 38, 12, 3, 3, 'F')

      // Badge
      doc.setFillColor(...ragColor)
      doc.roundedRect(margin + 82, yPos + 6, 38, 12, 3, 3, 'F')
      doc.setTextColor(...colors.white)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(assessment.rag_rating.toUpperCase(), margin + 101, yPos + 13, { align: 'center' })

      // Metrics row
      yPos += 24
      const metricsX = margin + 15

      // Satisfaction metric
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.mediumGray)
      doc.text('SATISFACTION', metricsX, yPos)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...colors.darkGray)
      doc.text(`${assessment.satisfaction_score !== null ? assessment.satisfaction_score : getSatisfactionPercentage(assessment.rag_rating)}%`, metricsX, yPos + 8)

      // Confidence metric
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.mediumGray)
      doc.text('CONFIDENCE', metricsX + 50, yPos)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...colors.darkGray)
      doc.text(getConfidenceLabel(assessment.confidence), metricsX + 50, yPos + 8)

      // Weight metric
      if (assessment.assessment_criteria.weight !== null) {
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...colors.mediumGray)
        doc.text('WEIGHT', metricsX + 100, yPos)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...colors.darkGray)
        doc.text(`${assessment.assessment_criteria.weight}%`, metricsX + 100, yPos + 8)
      }

      // Critical flag
      if (assessment.assessment_criteria.is_critical) {
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...colors.danger)
        doc.text('CRITICAL', metricsX + 135, yPos)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('YES', metricsX + 135, yPos + 8)
      }

      yPos += 20

      // Summary card (if exists)
      if (assessment.summary) {
        const summaryLines = doc.splitTextToSize(assessment.summary, pageWidth - margin * 2 - 20)
        const summaryHeight = summaryLines.length * 5 + 14

        doc.setFillColor(252, 252, 253)
        doc.setDrawColor(...colors.lightGray)
        doc.setLineWidth(0.5)
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, summaryHeight, 3, 3, 'FD')

        doc.setTextColor(...colors.mediumGray)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        doc.text(summaryLines, margin + 10, yPos + 9)

        yPos += summaryHeight + 10
      }

      // Finding section with modern card
      if (assessment.finding) {
        const findingLines = doc.splitTextToSize(assessment.finding, pageWidth - margin * 2 - 20)
        const findingHeight = findingLines.length * 5 + 20

        if (yPos + findingHeight > pageHeight - 25) {
          doc.addPage()
          addFooter(index + 3, assessments.length + 2)
          yPos = 30
        }

        // Card header
        doc.setFillColor(...colors.primaryDark)
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 10, 3, 3, 'F')

        doc.setTextColor(...colors.white)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Finding', margin + 10, yPos + 7)

        // Card body
        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(...colors.lightGray)
        doc.setLineWidth(0.5)
        doc.rect(margin, yPos + 10, pageWidth - margin * 2, findingHeight - 10, 'FD')

        doc.setFontSize(9.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...colors.darkGray)
        doc.text(findingLines, margin + 10, yPos + 18)
        yPos += findingHeight + 8
      }

      // Evidence section with accent border
      if (assessment.evidence && yPos < pageHeight - 60) {
        const evidenceLines = doc.splitTextToSize(assessment.evidence, pageWidth - margin * 2 - 20)
        const evidenceHeight = evidenceLines.length * 5 + 20

        if (yPos + evidenceHeight > pageHeight - 25) {
          doc.addPage()
          addFooter(index + 3, assessments.length + 2)
          yPos = 30
        }

        // Card with left accent
        doc.setFillColor(240, 248, 255)
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, evidenceHeight, 3, 3, 'F')
        doc.setFillColor(...colors.primary)
        doc.rect(margin, yPos, 4, evidenceHeight, 'F')

        doc.setDrawColor(...colors.primary)
        doc.setLineWidth(0.5)
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, evidenceHeight, 3, 3, 'D')

        doc.setTextColor(...colors.primary)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Evidence', margin + 12, yPos + 10)

        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(...colors.darkGray)
        doc.text(evidenceLines, margin + 12, yPos + 18)

        yPos += evidenceHeight + 8
      }

      // Recommendation section with modern styling
      if (assessment.recommendation && yPos < pageHeight - 60) {
        const recLines = doc.splitTextToSize(assessment.recommendation, pageWidth - margin * 2 - 20)
        const recHeight = recLines.length * 5 + 20

        if (yPos + recHeight > pageHeight - 25) {
          doc.addPage()
          addFooter(index + 3, assessments.length + 2)
          yPos = 30
        }

        // Card with left accent
        doc.setFillColor(245, 255, 250)
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, recHeight, 3, 3, 'F')
        doc.setFillColor(...colors.success)
        doc.rect(margin, yPos, 4, recHeight, 'F')

        doc.setDrawColor(...colors.success)
        doc.setLineWidth(0.5)
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, recHeight, 3, 3, 'D')

        doc.setTextColor(...colors.success)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Recommendation', margin + 12, yPos + 10)

        doc.setFontSize(9.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...colors.darkGray)
        doc.text(recLines, margin + 12, yPos + 18)
      }

      // Professional footer
      addFooter(index + 3, assessments.length + 2)
    })

    // Save the PDF
    doc.save(`nista-assessment-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new()

    // Calculate statistics
    const ragCounts = {
      green: assessments.filter((a) => a.rag_rating === 'green').length,
      amber: assessments.filter((a) => a.rag_rating === 'amber').length,
      red: assessments.filter((a) => a.rag_rating === 'red').length,
    }
    const totalAssessments = assessments.length
    const overallRag = projectSummary?.overall_rating || getOverallRag()

    // ===== SHEET 1: PROJECT OVERVIEW =====
    const overviewData = [
      ['NISTA/PAR ASSESSMENT REPORT'],
      ['Generated: ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
      [''],
      ['PROJECT INFORMATION'],
      ['Project Name', projectData?.project_name || 'N/A'],
      ['Project Value', projectData?.project_value ? `£${projectData.project_value.toLocaleString()} million` : 'N/A'],
      ['Project Sector', projectData?.project_sector || 'N/A'],
      ['Status', projectData?.status ? projectData.status.toUpperCase() : 'N/A'],
      ['Assessment Template', projectData?.assessment_templates?.name || 'N/A'],
      [''],
      ['ASSESSMENT SUMMARY'],
      ['Overall Rating', overallRag.toUpperCase()],
      ['Total Criteria', totalAssessments],
      ['Green Ratings', `${ragCounts.green} (${Math.round((ragCounts.green / totalAssessments) * 100)}%)`],
      ['Amber Ratings', `${ragCounts.amber} (${Math.round((ragCounts.amber / totalAssessments) * 100)}%)`],
      ['Red Ratings', `${ragCounts.red} (${Math.round((ragCounts.red / totalAssessments) * 100)}%)`],
      [''],
      ['TEMPLATE INFORMATION'],
      ['Template Name', projectData?.assessment_templates?.name || 'N/A'],
      ['Template Description', projectData?.assessment_templates?.description || 'N/A'],
    ]

    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData)

    // Style the overview sheet
    overviewSheet['!cols'] = [{ wch: 25 }, { wch: 60 }]

    // Merge title cells
    if (!overviewSheet['!merges']) overviewSheet['!merges'] = []
    overviewSheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }) // Title
    overviewSheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }) // Date
    overviewSheet['!merges'].push({ s: { r: 3, c: 0 }, e: { r: 3, c: 1 } }) // Project Info header
    overviewSheet['!merges'].push({ s: { r: 10, c: 0 }, e: { r: 10, c: 1 } }) // Assessment Summary header
    overviewSheet['!merges'].push({ s: { r: 17, c: 0 }, e: { r: 17, c: 1 } }) // Template Info header

    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Project Overview')

    // ===== SHEET 2: EXECUTIVE SUMMARY =====
    if (projectSummary) {
      const execSummaryData = [
        ['EXECUTIVE SUMMARY'],
        [''],
        ['Overall Rating', projectSummary.overall_rating.toUpperCase()],
        [''],
        ['EXECUTIVE SUMMARY'],
        [projectSummary.executive_summary || 'No executive summary available'],
        [''],
        ['KEY STRENGTHS'],
        [projectSummary.key_strengths || 'No key strengths identified'],
        [''],
        ['CRITICAL ISSUES'],
        [projectSummary.critical_issues || 'No critical issues identified'],
        [''],
        ['OVERALL RECOMMENDATION'],
        [projectSummary.overall_recommendation || 'No recommendation provided'],
      ]

      const execSheet = XLSX.utils.aoa_to_sheet(execSummaryData)
      execSheet['!cols'] = [{ wch: 120 }]

      if (!execSheet['!merges']) execSheet['!merges'] = []
      execSheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }) // Title

      XLSX.utils.book_append_sheet(workbook, execSheet, 'Executive Summary')
    }

    // ===== SHEET 3: ASSESSMENT OVERVIEW (Summary Table) =====
    const overviewTableData = assessments.map((a) => ({
      'Code': a.assessment_criteria.criterion_code,
      'Criterion': a.assessment_criteria.title,
      'Dimension': a.assessment_criteria.dimension,
      'Weight (%)': a.assessment_criteria.weight || '-',
      'Critical': a.assessment_criteria.is_critical ? 'YES' : 'NO',
      'RAG': a.rag_rating.toUpperCase(),
      'Satisfaction (%)': a.satisfaction_score !== null ? a.satisfaction_score : getSatisfactionPercentage(a.rag_rating),
      'Confidence': getConfidenceLabel(a.confidence),
    }))

    const overviewTableSheet = XLSX.utils.json_to_sheet(overviewTableData)
    overviewTableSheet['!cols'] = [
      { wch: 12 },  // Code
      { wch: 45 },  // Criterion
      { wch: 20 },  // Dimension
      { wch: 12 },  // Weight
      { wch: 10 },  // Critical
      { wch: 10 },  // RAG
      { wch: 16 },  // Satisfaction
      { wch: 15 },  // Confidence
    ]

    // Apply RAG color coding to the overview table
    const ragColors = {
      'GREEN': { fgColor: { rgb: 'C6EFCE' }, font: { color: { rgb: '006100' }, bold: true } },
      'AMBER': { fgColor: { rgb: 'FFEB9C' }, font: { color: { rgb: '9C5700' }, bold: true } },
      'RED': { fgColor: { rgb: 'FFC7CE' }, font: { color: { rgb: '9C0006' }, bold: true } },
    }

    // Color-code RAG cells and critical cells
    Object.keys(overviewTableSheet).forEach(cell => {
      if (cell[0] === '!') return

      const cellRef = XLSX.utils.decode_cell(cell)
      const cellValue = overviewTableSheet[cell].v

      // Color RAG column (column F, index 5)
      if (cellRef.c === 5 && cellRef.r > 0) {
        const ragValue = String(cellValue).toUpperCase()
        if (ragColors[ragValue as keyof typeof ragColors]) {
          overviewTableSheet[cell].s = {
            fill: ragColors[ragValue as keyof typeof ragColors].fgColor,
            font: ragColors[ragValue as keyof typeof ragColors].font,
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              top: { style: 'thin', color: { rgb: 'CCCCCC' } },
              bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
              left: { style: 'thin', color: { rgb: 'CCCCCC' } },
              right: { style: 'thin', color: { rgb: 'CCCCCC' } },
            }
          }
        }
      }

      // Color critical column (column E, index 4)
      if (cellRef.c === 4 && cellRef.r > 0 && cellValue === 'YES') {
        overviewTableSheet[cell].s = {
          fill: { fgColor: { rgb: 'FFC7CE' } },
          font: { color: { rgb: '9C0006' }, bold: true },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'CCCCCC' } },
            bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
            left: { style: 'thin', color: { rgb: 'CCCCCC' } },
            right: { style: 'thin', color: { rgb: 'CCCCCC' } },
          }
        }
      }

      // Style header row
      if (cellRef.r === 0) {
        overviewTableSheet[cell].s = {
          fill: { fgColor: { rgb: '2980B9' } },
          font: { color: { rgb: 'FFFFFF' }, bold: true },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: '1A5276' } },
            bottom: { style: 'thin', color: { rgb: '1A5276' } },
            left: { style: 'thin', color: { rgb: '1A5276' } },
            right: { style: 'thin', color: { rgb: '1A5276' } },
          }
        }
      }
    })

    XLSX.utils.book_append_sheet(workbook, overviewTableSheet, 'Assessment Overview')

    // ===== SHEET 4: DETAILED ASSESSMENTS =====
    const detailedData = assessments.map((assessment) => ({
      'Code': assessment.assessment_criteria.criterion_code,
      'Criterion Title': assessment.assessment_criteria.title,
      'Dimension': assessment.assessment_criteria.dimension,
      'Weight (%)': assessment.assessment_criteria.weight || '-',
      'Critical': assessment.assessment_criteria.is_critical ? 'YES' : 'NO',
      'RAG Rating': assessment.rag_rating.toUpperCase(),
      'Satisfaction (%)': (assessment.satisfaction_score !== null ? assessment.satisfaction_score : getSatisfactionPercentage(assessment.rag_rating)),
      'Confidence': getConfidenceLabel(assessment.confidence),
      'Summary': assessment.summary || '',
      'Finding': assessment.finding || '',
      'Evidence': assessment.evidence || '',
      'Recommendation': assessment.recommendation || '',
    }))

    const detailedSheet = XLSX.utils.json_to_sheet(detailedData)
    detailedSheet['!cols'] = [
      { wch: 12 },  // Code
      { wch: 40 },  // Criterion Title
      { wch: 20 },  // Dimension
      { wch: 20 },  // Category
      { wch: 12 },  // Weight
      { wch: 10 },  // Critical
      { wch: 12 },  // RAG Rating
      { wch: 15 },  // Satisfaction
      { wch: 15 },  // Confidence
      { wch: 60 },  // Summary
      { wch: 60 },  // Finding
      { wch: 60 },  // Evidence
      { wch: 60 },  // Recommendation
    ]

    // Apply formatting to detailed sheet
    Object.keys(detailedSheet).forEach(cell => {
      if (cell[0] === '!') return

      const cellRef = XLSX.utils.decode_cell(cell)
      const cellValue = detailedSheet[cell].v

      // Color RAG column (column G, index 6)
      if (cellRef.c === 6 && cellRef.r > 0) {
        const ragValue = String(cellValue).toUpperCase()
        if (ragColors[ragValue as keyof typeof ragColors]) {
          detailedSheet[cell].s = {
            fill: ragColors[ragValue as keyof typeof ragColors].fgColor,
            font: ragColors[ragValue as keyof typeof ragColors].font,
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: {
              top: { style: 'thin', color: { rgb: 'CCCCCC' } },
              bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
              left: { style: 'thin', color: { rgb: 'CCCCCC' } },
              right: { style: 'thin', color: { rgb: 'CCCCCC' } },
            }
          }
        }
      }

      // Color critical column (column F, index 5)
      if (cellRef.c === 5 && cellRef.r > 0 && cellValue === 'YES') {
        detailedSheet[cell].s = {
          fill: { fgColor: { rgb: 'FFC7CE' } },
          font: { color: { rgb: '9C0006' }, bold: true },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'CCCCCC' } },
            bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
            left: { style: 'thin', color: { rgb: 'CCCCCC' } },
            right: { style: 'thin', color: { rgb: 'CCCCCC' } },
          }
        }
      }

      // Style header row
      if (cellRef.r === 0) {
        detailedSheet[cell].s = {
          fill: { fgColor: { rgb: '2980B9' } },
          font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 11 },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: {
            top: { style: 'medium', color: { rgb: '1A5276' } },
            bottom: { style: 'medium', color: { rgb: '1A5276' } },
            left: { style: 'thin', color: { rgb: '1A5276' } },
            right: { style: 'thin', color: { rgb: '1A5276' } },
          }
        }
      }

      // Wrap text for long content columns
      if (cellRef.c >= 9 && cellRef.r > 0) {
        detailedSheet[cell].s = {
          ...detailedSheet[cell].s,
          alignment: { vertical: 'top', wrapText: true }
        }
      }
    })

    XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Detailed Assessments')

    // ===== SHEET 5: RAG STATISTICS =====
    const statsData = [
      ['RAG RATING STATISTICS'],
      [''],
      ['Rating', 'Count', 'Percentage'],
      ['Green', ragCounts.green, `${Math.round((ragCounts.green / totalAssessments) * 100)}%`],
      ['Amber', ragCounts.amber, `${Math.round((ragCounts.amber / totalAssessments) * 100)}%`],
      ['Red', ragCounts.red, `${Math.round((ragCounts.red / totalAssessments) * 100)}%`],
      ['Total', totalAssessments, '100%'],
      [''],
      ['BREAKDOWN BY DIMENSION'],
    ]

    // Calculate statistics by dimension
    const dimensionStats: { [key: string]: { green: number; amber: number; red: number } } = {}
    assessments.forEach(a => {
      const dim = a.assessment_criteria.dimension
      if (!dimensionStats[dim]) dimensionStats[dim] = { green: 0, amber: 0, red: 0 }
      if (a.rag_rating === 'green') dimensionStats[dim].green++
      else if (a.rag_rating === 'amber') dimensionStats[dim].amber++
      else if (a.rag_rating === 'red') dimensionStats[dim].red++
    })

    statsData.push(['Dimension', 'Green', 'Amber', 'Red', 'Total'])
    Object.entries(dimensionStats).forEach(([dim, counts]) => {
      const total = counts.green + counts.amber + counts.red
      statsData.push([dim, counts.green, counts.amber, counts.red, total])
    })

    statsData.push([''])
    statsData.push(['CRITICAL CRITERIA BREAKDOWN'])
    const criticalCount = assessments.filter(a => a.assessment_criteria.is_critical).length
    const criticalGreen = assessments.filter(a => a.assessment_criteria.is_critical && a.rag_rating === 'green').length
    const criticalAmber = assessments.filter(a => a.assessment_criteria.is_critical && a.rag_rating === 'amber').length
    const criticalRed = assessments.filter(a => a.assessment_criteria.is_critical && a.rag_rating === 'red').length

    statsData.push(['Total Critical Criteria', criticalCount])
    statsData.push(['Critical - Green', criticalGreen])
    statsData.push(['Critical - Amber', criticalAmber])
    statsData.push(['Critical - Red', criticalRed])

    const statsSheet = XLSX.utils.aoa_to_sheet(statsData)
    statsSheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }]

    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics')

    // Save the Excel file with timestamp
    const filename = `NISTA-Assessment-${projectData?.project_name?.replace(/[^a-z0-9]/gi, '-') || 'Report'}-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, filename)
  }

  const getSatisfactionPercentage = (rating: string) => {
    const satisfactionMap = {
      green: 90,
      amber: 50,
      red: 10,
      pending: 0,
    }
    return satisfactionMap[rating as keyof typeof satisfactionMap] || 0
  }

  const getConfidenceLabel = (confidence: number | null) => {
    if (confidence === null) return 'Unknown'
    const confValue = confidence <= 1 ? confidence * 100 : confidence
    if (confValue >= 80) return 'High'
    if (confValue >= 50) return 'Medium'
    return 'Low'
  }

  // Sort assessments by dimension and then by criterionCode
  const sortedAssessments = [...assessments].sort((a, b) => {
    // Define dimension order
    const dimensionOrder: Record<string, number> = {
      'Strategic': 1,
      'Governance': 2,
      'Financial': 3,
      'Commercial': 4,
      'Management': 5,
      'Delivery': 6
    }

    const dimA = a.assessment_criteria.dimension
    const dimB = b.assessment_criteria.dimension
    const orderA = dimensionOrder[dimA] || 999
    const orderB = dimensionOrder[dimB] || 999

    // First sort by dimension
    if (orderA !== orderB) {
      return orderA - orderB
    }

    // Then sort by criterion code within the same dimension
    const codeA = a.assessment_criteria.criterion_code
    const codeB = b.assessment_criteria.criterion_code
    return codeA.localeCompare(codeB, undefined, { numeric: true })
  })

  // Filter by RAG rating
  let filteredAssessments =
    filter === 'all'
      ? sortedAssessments
      : sortedAssessments.filter((a) => a.rag_rating === filter)

  // Filter by dimension
  if (dimensionFilter) {
    filteredAssessments = filteredAssessments.filter(
      (a) => a.assessment_criteria.dimension === dimensionFilter
    )
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    filteredAssessments = filteredAssessments.filter((assessment) => {
      const finding = assessment.finding?.toLowerCase() || ''
      const evidence = assessment.evidence?.toLowerCase() || ''
      const recommendation = assessment.recommendation?.toLowerCase() || ''
      const summary = assessment.summary?.toLowerCase() || ''
      const title = assessment.assessment_criteria.title.toLowerCase()
      const code = assessment.assessment_criteria.criterion_code.toLowerCase()

      return (
        finding.includes(query) ||
        evidence.includes(query) ||
        recommendation.includes(query) ||
        summary.includes(query) ||
        title.includes(query) ||
        code.includes(query)
      )
    })
  }

  // Calculate summary statistics
  const ragCounts = {
    green: assessments.filter((a) => a.rag_rating === 'green').length,
    amber: assessments.filter((a) => a.rag_rating === 'amber').length,
    red: assessments.filter((a) => a.rag_rating === 'red').length,
    pending: assessments.filter((a) => a.rag_rating === 'pending').length,
  }

  const totalAssessments = assessments.length

  // Calculate overall RAG rating based on weighted average
  const getOverallRag = () => {
    if (totalAssessments === 0) return 'pending'

    const greenWeight = 3
    const amberWeight = 2
    const redWeight = 1

    const weightedScore =
      (ragCounts.green * greenWeight) +
      (ragCounts.amber * amberWeight) +
      (ragCounts.red * redWeight)

    const maxScore = totalAssessments * greenWeight
    const percentage = (weightedScore / maxScore) * 100

    // If any red, overall can't be green
    if (ragCounts.red > 0 && percentage < 75) return 'red'
    if (percentage >= 75) return 'green'
    if (percentage >= 50) return 'amber'
    return 'red'
  }

  const overallRag = getOverallRag()

  // Determine what to show based on viewMode
  const showSummary = viewMode === 'full' || viewMode === 'summary'
  const showDetail = viewMode === 'full' || viewMode === 'detail'

  return (
    <div>
      {/* Assessment Comparison Banner - Show in summary and full view */}
      {showSummary && assessmentRunId && projectData?.id && (
        <AssessmentComparisonBanner
          assessmentRunId={assessmentRunId}
          projectId={projectData.id}
          onGenerateActionPlan={() => setShowActionPlanWorkspace(true)}
        />
      )}

      {/* Modern Header with Export Buttons - Show in summary and full view */}
      {showSummary && totalAssessments > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-1">Assessment Results</h2>
              <p className="text-slate-600">Comprehensive analysis of {totalAssessments} criteria</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (createdActions) {
                    setShowActionsView(true)
                  } else {
                    setShowActionPlanWorkspace(true)
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl hover:shadow-lg shadow-blue-500/30 transition-all font-semibold"
              >
                {createdActions ? (
                  <>
                    <ClipboardList size={18} />
                    View Actions
                  </>
                ) : existingDraft ? (
                  <>
                    <ClipboardList size={18} />
                    View Draft
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Action Plan
                  </>
                )}
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-medium shadow-sm"
                title="Export to Excel"
              >
                <FileSpreadsheet size={18} />
                <span className="hidden sm:inline">Excel</span>
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all font-medium shadow-sm"
                title="Export to PDF"
              >
                <FileDown size={18} />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overall Rating Card - Show in summary and full view */}
      {showSummary && totalAssessments > 0 && (
        <div className="mb-8">
          <OverallRatingCard
            overallRating={overallRag as 'green' | 'amber' | 'red' | 'pending'}
            readinessPercentage={Math.round((ragCounts.green / totalAssessments) * 100)}
            executiveSummary={projectSummary?.executive_summary || null}
            totalCriteria={totalAssessments}
          />
        </div>
      )}

      {/* Dashboard Statistics - Charts and Priority Actions - Show in summary and full view */}
      {showSummary && totalAssessments > 0 && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <RAGDonutChart
            ragCounts={ragCounts}
            onFilterChange={(newFilter) => {
              setFilter(newFilter)
              setDimensionFilter(null)
            }}
          />
          <DimensionBarChart
            assessments={assessments}
            onDimensionClick={(dimension) => {
              setDimensionFilter(dimension)
              setFilter('all')
            }}
          />
          <PriorityActionsCard
            assessments={assessments}
            onViewDetails={(id) => {
              setExpandedId(id)
              // Scroll to the assessment after expansion animation
              setTimeout(() => {
                const element = document.getElementById(`assessment-${id}`)
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  // Add extra offset to account for fixed headers
                  window.scrollBy({ top: -20, behavior: 'smooth' })
                }
              }, 300)
            }}
          />
        </div>
      )}

      {/* Search Bar - Show in detail and full view */}
      {showDetail && <div className="mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
            size={20}
          />
          <input
            type="text"
            placeholder="Search assessments (e.g., planning permissions, stakeholder, risk...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-border bg-card text-text-primary placeholder-text-secondary focus:outline-none focus:border-secondary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-text-secondary">
            {filteredAssessments.length === 0 ? (
              <span className="text-error">No results found for "{searchQuery}"</span>
            ) : (
              <span>
                Found {filteredAssessments.length} result{filteredAssessments.length !== 1 ? 's' : ''} for "{searchQuery}"
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filter Buttons - Show in detail and full view */}
      {showDetail && <div className="mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              filter === 'all'
                ? 'bg-secondary text-white'
                : 'bg-card border-2 border-border text-text-primary hover:border-secondary/30'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('green')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              filter === 'green'
                ? 'bg-rag-green text-white'
                : 'bg-card border-2 border-border text-text-primary hover:border-rag-green/30'
            )}
          >
            Green
          </button>
          <button
            onClick={() => setFilter('amber')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              filter === 'amber'
                ? 'bg-rag-amber text-white'
                : 'bg-card border-2 border-border text-text-primary hover:border-rag-amber/30'
            )}
          >
            Amber
          </button>
          <button
            onClick={() => setFilter('red')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              filter === 'red'
                ? 'bg-rag-red text-white'
                : 'bg-card border-2 border-border text-text-primary hover:border-rag-red/30'
            )}
          >
            Red
          </button>

          {/* Clear Filters Button */}
          {(dimensionFilter || filter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setFilter('all')
                setDimensionFilter(null)
                setSearchQuery('')
              }}
              className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-text-secondary hover:bg-gray-200 transition-colors border-2 border-gray-200"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {(dimensionFilter || filter !== 'all') && (
          <div className="mt-3 flex flex-wrap gap-2">
            {dimensionFilter && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">
                <span>Dimension: {dimensionFilter}</span>
                <button
                  onClick={() => setDimensionFilter(null)}
                  className="hover:text-secondary/80"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {filter !== 'all' && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">
                <span>Status: {filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
                <button
                  onClick={() => setFilter('all')}
                  className="hover:text-secondary/80"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>}

      {/* Detailed Criteria Table - Only show if not viewing actions and in detail/full view */}
      {showDetail && !showActionsView && (
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Detailed Assessment Criteria
            {filteredAssessments.length !== totalAssessments && (
              <span className="text-sm font-normal text-text-secondary ml-2">
                ({filteredAssessments.length} of {totalAssessments})
              </span>
            )}
          </h2>
          <InteractiveCriteriaTable
            assessments={filteredAssessments.map(a => ({
              ...a,
              id: a.id
            }))}
            expandedId={expandedId}
            onExpandToggle={setExpandedId}
          />
        </div>
      )}

      {/* Actions View - Show Kanban board when viewing actions */}
      {showActionsView && projectData?.id && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-text-primary">Actions</h2>
            <button
              onClick={() => setShowActionsView(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Assessment
            </button>
          </div>
          <ActionKanbanBoard projectId={projectData.id} />
        </div>
      )}

      {/* Action Plan Draft Workspace Modal */}
      {showActionPlanWorkspace && assessmentRunId && projectData?.id && (
        <ActionPlanDraftWorkspace
          assessmentRunId={assessmentRunId}
          projectId={projectData.id}
          onClose={() => setShowActionPlanWorkspace(false)}
          onConfirm={(result) => {
            console.log('Action plan confirmed:', result)
            setShowActionPlanWorkspace(false)
            // Switch to actions view to show the newly created actions
            setShowActionsView(true)
          }}
        />
      )}
    </div>
  )
}
