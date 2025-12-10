# Gateway Success PDF Report - Implementation Guide

## What's Been Created

All report components are now in place:

### Components Created
- ✅ `src/reports/components/RatingBadge.tsx` - Reusable rating badge
- ✅ `src/reports/components/CoverPage.tsx` - Professional cover page
- ✅ `src/reports/components/ExecutiveSummary.tsx` - Executive summary with metrics
- ✅ `src/reports/components/CaseAssessment.tsx` - Detailed case assessment
- ✅ `src/reports/components/ActionPlan.tsx` - Action plan table
- ✅ `src/reports/components/EvidenceRegister.tsx` - Evidence register
- ✅ `src/reports/styles/report.css` - Print-optimized CSS (comprehensive)
- ✅ `src/reports/GatewayReport.tsx` - Main report component
- ✅ `src/components/ExportReportModal.tsx` - Export modal UI

## Quick Start - View Report in Browser

The report can be viewed directly in the browser and printed to PDF using browser print (Ctrl+P).

### 1. Create Report Route

Add to `src/App.tsx`:

```tsx
import GatewayReport from './reports/GatewayReport'

// Add this route
<Route path="/report/:projectId" element={<GatewayReport projectId={projectId} reportType="full" />} />
```

### 2. Navigate to Report

```tsx
// From any page:
navigate(`/report/${projectId}?type=summary`)
```

### 3. Print to PDF

Users can press **Ctrl+P** (or Cmd+P on Mac) and select "Save as PDF" from the print dialog. The CSS is already optimized for print.

---

## Production Implementation - Puppeteer PDF Generation

For automated PDF generation without user interaction, implement server-side PDF generation.

### Option 1: Using Puppeteer (Node.js Backend)

#### 1. Install Puppeteer

```bash
npm install puppeteer
```

#### 2. Create PDF Generation Utility

Create `src/reports/utils/generatePdf.ts`:

```typescript
import puppeteer from 'puppeteer'

export async function generateGatewayReport(
  projectId: string,
  reportType: 'summary' | 'full' | 'board-pack'
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()

    // Navigate to the report HTML route
    await page.goto(`${process.env.APP_URL}/report/${projectId}?type=${reportType}`, {
      waitUntil: 'networkidle0'
    })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width: 100%; font-size: 9px; font-family: 'Source Sans 3', sans-serif; color: #64748b; display: flex; justify-content: space-between; padding: 0 15mm;">
          <span>GatewaySuccess Report</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `
    })

    return pdf
  } finally {
    await browser.close()
  }
}
```

#### 3. Create API Endpoint

Create `backend/src/routes/reports.js`:

```javascript
const express = require('express')
const { generateGatewayReport } = require('../utils/generatePdf')

const router = express.Router()

router.post('/api/reports/generate', async (req, res) => {
  const { projectId, reportType } = req.body

  try {
    // Validate user has access to project
    // ... authentication/authorization logic ...

    // Generate PDF
    const pdfBuffer = await generateGatewayReport(projectId, reportType)

    // Set headers
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="Gateway Report.pdf"`)

    // Send PDF
    res.send(pdfBuffer)
  } catch (error) {
    console.error('PDF generation error:', error)
    res.status(500).json({ error: 'Failed to generate report' })
  }
})

module.exports = router
```

### Option 2: Using Browser Print Dialog (Simpler)

Modify `ExportReportModal.tsx` to open report in new window for printing:

```tsx
const handleExport = () => {
  // Open report in new window
  const reportUrl = `/report/${project.id}?type=${reportType}`
  const printWindow = window.open(reportUrl, '_blank')

  // Wait for load, then trigger print
  if (printWindow) {
    printWindow.addEventListener('load', () => {
      setTimeout(() => {
        printWindow.print()
      }, 500)
    })
  }

  onClose()
}
```

---

## Wire Up Export Button

### On Findings Page

Find or create a button to trigger the export modal. Example:

```tsx
import { useState } from 'react'
import ExportReportModal from '../components/ExportReportModal'
import { FileDown } from 'lucide-react'

function FindingsPage() {
  const [showExportModal, setShowExportModal] = useState(false)

  return (
    <>
      {/* Existing page content */}
      <div className="flex items-center justify-between mb-6">
        <h1>Assessment Findings</h1>
        <button
          onClick={() => setShowExportModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-copper hover:bg-[#a85d32] text-white rounded-lg text-sm font-medium transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Export modal */}
      <ExportReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        project={project}
      />
    </>
  )
}
```

---

## Connect to Real Data

Currently `GatewayReport.tsx` uses mock data. Replace with real data fetching:

```tsx
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function GatewayReport() {
  const { projectId } = useParams()
  const [searchParams] = useSearchParams()
  const reportType = searchParams.get('type') as 'summary' | 'full' | 'board-pack' || 'full'

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function fetchReportData() {
      try {
        // Fetch project
        const { data: project } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single()

        // Fetch assessments
        const { data: assessments } = await supabase
          .from('assessments')
          .select('*, assessment_criteria(*)')
          .eq('project_id', projectId)

        // Fetch actions
        const { data: actions } = await supabase
          .from('action_items')
          .select('*')
          .eq('project_id', projectId)

        // Fetch documents
        const { data: documents } = await supabase
          .from('documents')
          .select('*')
          .eq('project_id', projectId)

        // Process and set data
        setData({
          project,
          assessments,
          actions,
          documents
        })
      } catch (error) {
        console.error('Error fetching report data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [projectId])

  if (loading) {
    return <div className="p-12 text-center">Generating report...</div>
  }

  // Use real data instead of mock data
  return (
    <div className="gateway-report">
      <CoverPage project={data.project} assessment={data.assessment} />
      {/* ... rest of report ... */}
    </div>
  )
}
```

---

## Testing

1. **View in browser**: Navigate to `/report/[project-id]?type=summary`
2. **Test print**: Press Ctrl+P and check print preview
3. **Test export modal**: Click "Export Report" button on findings page
4. **Check PDF quality**: Verify page breaks, colors, and formatting

---

## Deployment Considerations

### If using Puppeteer on server:

1. **Memory**: Puppeteer requires ~100MB RAM per concurrent PDF generation
2. **Chrome dependencies**: Ensure Chrome/Chromium is installed on server
3. **Docker**: Use `puppeteer/puppeteer:latest` base image
4. **Timeout**: Set reasonable timeout (30-60 seconds) for large reports
5. **Queue**: Consider job queue (Bull, BeeQueue) for high-volume usage

### Dockerfile example:

```dockerfile
FROM node:18-alpine

# Install Chromium dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to use installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

CMD ["npm", "start"]
```

---

## Next Steps

1. ✅ Components are created
2. ✅ CSS is print-optimized
3. ✅ Export modal is ready
4. ⏳ Add route for `/report/:projectId`
5. ⏳ Connect GatewayReport to real data
6. ⏳ Wire up Export button on Findings page
7. ⏳ Choose PDF generation method (browser print or Puppeteer)
8. ⏳ Test with real project data

---

## Alternative: Client-Side PDF Generation

If you want to avoid Puppeteer, use `jsPDF` + `html2canvas`:

```bash
npm install jspdf html2canvas
```

```tsx
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const handleExport = async () => {
  const reportElement = document.getElementById('gateway-report')
  const canvas = await html2canvas(reportElement)
  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF('p', 'mm', 'a4')
  const imgWidth = 210
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
  pdf.save('gateway-report.pdf')
}
```

**Note**: This method has lower quality than Puppeteer but doesn't require server setup.
