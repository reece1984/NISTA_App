# NISTA/PAR Readiness Assessment Platform

An AI-powered web application that assesses UK government project documents against IPA (Infrastructure and Projects Authority) NISTA/PAR criteria, providing RAG-rated (Red/Amber/Green) assessments with evidence-based findings and actionable recommendations.

## Features

- **Five Assessment Dimensions**: Comprehensive evaluation across Strategic, Management, Economic, Commercial, and Financial criteria
- **RAG Rating System**: Clear Red/Amber/Green ratings with confidence scores
- **Evidence-Based Findings**: Every assessment backed by direct quotes from documents
- **Actionable Recommendations**: Specific suggestions to improve business cases
- **Document Upload**: Support for Business Case, Project Execution Plan, and Risk Register (PDF format, max 50MB)
- **AI-Powered Analysis**: RAG technology for intelligent document processing
- **User Authentication**: Secure email/password authentication via Supabase
- **Project Management**: Create, view, edit, and delete projects
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Programme Insights Branding**: Professional blue and orange color scheme with consistent brand identity

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod validation
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage)
- **AI Processing**: N8N automation workflows
- **Deployment**: Vercel (recommended)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:5173`

## Detailed Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- An N8N instance (for document processing)

### 1. Database Setup

**Step 1: Create Database Schema**

Go to your Supabase project's SQL Editor and run the complete database schema from your PRD to create all tables and ENUMs.

**Step 2: Add Foreign Key Constraints**

Run this SQL to establish relationships between tables:

```sql
-- Add foreign key from projects.userId to users.id
ALTER TABLE "projects"
ADD CONSTRAINT "projects_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "users"("id")
ON DELETE CASCADE;

-- Add foreign key from files.projectId to projects.id
ALTER TABLE "files"
ADD CONSTRAINT "files_projectId_fkey"
FOREIGN KEY ("projectId")
REFERENCES "projects"("id")
ON DELETE CASCADE;

-- Add foreign key from assessments.projectId to projects.id
ALTER TABLE "assessments"
ADD CONSTRAINT "assessments_projectId_fkey"
FOREIGN KEY ("projectId")
REFERENCES "projects"("id")
ON DELETE CASCADE;

-- Add foreign key from assessments.criterionId to assessment_criteria.id
ALTER TABLE "assessments"
ADD CONSTRAINT "assessments_criterionId_fkey"
FOREIGN KEY ("criterionId")
REFERENCES "assessment_criteria"("id")
ON DELETE CASCADE;
```

**Step 3: Apply Row Level Security (RLS) Policies**

Run the complete `supabase-rls-policies.sql` file from the project root to enable RLS and create security policies. This ensures users can only access their own data.

### 2. Storage Setup

1. Go to Storage in your Supabase project
2. Create a new bucket called `project-documents`
3. Set the bucket to **Public**

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_N8N_DOCUMENT_UPLOAD_WEBHOOK=your_n8n_webhook_url
VITE_N8N_RUN_ASSESSMENT_WEBHOOK=your_n8n_webhook_url
```

## Usage Guide

### 1. Sign Up / Login

1. Visit the landing page
2. Click "Get Started" or "Sign In"
3. Create an account with email/password

### 2. Create a Project

1. Click "Create New Project" on the dashboard
2. Enter project details (name, value, sector)
3. Click "Create Project"

### 3. Upload Documents

1. Open your project
2. Upload up to 3 PDFs (Business Case, PEP, Risk Register)
3. Drag and drop or click to browse

### 4. Run Assessment

1. Click "Run Assessment" once documents are uploaded
2. Wait for AI analysis (30-60 seconds)
3. View results with RAG ratings, findings, evidence, and recommendations

## Database Schema

The database consists of 5 main tables:

1. **users** - User accounts (linked to Supabase Auth via openId)
2. **projects** - Infrastructure projects created by users
3. **files** - Uploaded documents (Business Case, PEP, Risk Register)
4. **assessments** - AI-generated assessment results with RAG ratings
5. **assessment_criteria** - Static reference data for NISTA/PAR criteria

### Security Model

The application uses Row Level Security (RLS) to ensure data isolation:
- Users can only see their own projects, files, and assessments
- Foreign keys with CASCADE DELETE ensure data integrity
- Assessment criteria is public (read-only for all users)

All RLS policies are defined in `supabase-rls-policies.sql` in the project root. See the Database Setup section above for installation instructions.

### N8N Integration

N8N workflows should use the **Supabase Service Role Key** (not the anon key) to bypass RLS when inserting assessment results. This allows the AI system to write assessment data to user projects.

## Deployment to Vercel

### Option 1: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 2: Via GitHub

1. Push your code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically on push

### Environment Variables in Vercel

Add these in your Vercel project settings:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_N8N_DOCUMENT_UPLOAD_WEBHOOK`
- `VITE_N8N_RUN_ASSESSMENT_WEBHOOK`

## Project Structure

```
NISTA_App/
├── src/
│   ├── components/         # Reusable components
│   │   ├── ui/            # UI components
│   │   ├── AssessmentResults.tsx
│   │   ├── CreateProjectModal.tsx
│   │   └── FileUpload.tsx
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/               # Utilities
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── pages/             # Page components
│   │   ├── LandingPage.tsx
│   │   ├── SignUpPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── ProjectDetailPage.tsx
│   ├── App.tsx            # Main app with routing
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables
├── tailwind.config.js     # Tailwind configuration
├── package.json           # Dependencies
└── vite.config.ts         # Vite configuration
```

## Troubleshooting

### Port Already in Use

Vite will automatically try the next available port (5174, 5175, etc.)

### Supabase Connection Issues

- Verify your Supabase URL and anon key in `.env`
- Check database schema has been created
- Ensure Storage bucket exists and is public

### File Upload Errors

- Check file size (max 50MB)
- Verify file type is PDF
- Ensure Supabase Storage bucket permissions are correct

### N8N Webhook Issues

- Verify webhook URLs are correct in `.env`
- Check N8N workflows are active
- Ensure N8N instance is accessible

## N8N Workflow Overview

The N8N workflows handle:

1. **Document Upload Processing**: Extract text, generate embeddings, store in vector database
2. **Assessment Execution**: RAG query against embeddings, AI analysis, generate ratings and recommendations

For detailed N8N workflow configuration, refer to the Product Requirements Document.

## Security Considerations

- **Environment Variables**: Never commit `.env` file to version control - it's in `.gitignore`
- **Row Level Security**: RLS is enabled on all tables with proper policies implemented
- **Authentication**: Supabase Auth handles secure user sessions with JWT tokens
- **Data Isolation**: Users can only access their own projects and files via RLS policies
- **Foreign Key Constraints**: CASCADE DELETE ensures data integrity when deleting projects
- **N8N Service Role**: Use Supabase Service Role Key in N8N to bypass RLS for system operations
- **File Validation**: Upload validation limits files to PDF format, max 50MB
- **Rate Limiting**: Consider implementing rate limiting for production deployments

## Future Enhancements

- Export assessment results to PDF
- Email notifications
- Comparison view for projects
- Historical tracking
- Collaborative features
- Custom assessment criteria
- Microsoft Word support

## License

Copyright © 2025 NISTA/PAR Readiness Assessment Platform

---

**Built with Supabase & N8N**
