import { Link } from 'react-router-dom'
import { Upload, Sparkles, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">PI</span>
              </div>
              <span className="text-xl font-semibold text-text-primary">Programme Insights</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-text-secondary hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-secondary text-white px-5 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-primary text-white relative overflow-hidden">
        {/* Geometric Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 border-2 border-white rotate-12"></div>
          <div className="absolute top-40 right-20 w-96 h-96 border-2 border-white -rotate-12"></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 border-2 border-white rotate-45"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-block bg-accent px-4 py-2 rounded-lg text-sm font-semibold mb-6">
              AI-Powered Assessment Services
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Transform NISTA/PAR Assessments for Major UK Infrastructure
            </h1>
            <p className="text-xl sm:text-2xl mb-10 text-white/90 max-w-3xl">
              Deliver rebaseline checks, PAR assessments, and project setup in weeks, not months. AI-powered automation with human expertise ensures 70-80% efficiency gains while maintaining professional quality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="inline-block bg-accent text-white hover:bg-accent-light text-lg px-8 py-3 rounded-lg font-semibold transition-colors text-center"
              >
                Schedule a Consultation
              </Link>
              <Link
                to="/login"
                className="inline-block border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-3 rounded-lg font-semibold transition-colors text-center"
              >
                Explore Services
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">2-4 Weeks</div>
                <div className="text-sm text-white/80">Rapid Delivery</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">70-80%</div>
                <div className="text-sm text-white/80">Efficiency Gains</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">15+ Years</div>
                <div className="text-sm text-white/80">Domain Expertise</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="inline-block text-secondary text-sm font-semibold mb-4">Our Services</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Three Core Services, Exceptional Results
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Productized consulting services powered by AI automation, delivered through prime contractors or directly to programme directors.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {/* Step 1 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-secondary/10 mb-6">
              <Upload className="w-10 h-10 text-secondary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-text-primary">
              1. Upload Documents
            </h3>
            <p className="text-text-secondary text-lg">
              Upload your Business Case, Project Execution Plan, and Risk
              Register documents in PDF format.
            </p>
            <div className="mt-4 text-primary font-semibold">£8-12K</div>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-accent/10 mb-6">
              <Sparkles className="w-10 h-10 text-accent" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-text-primary">
              2. AI Analysis
            </h3>
            <p className="text-text-secondary text-lg">
              Our AI system analyzes your documents against the five key
              NISTA/PAR criteria using advanced RAG technology.
            </p>
            <div className="mt-4 text-primary font-semibold">£15-25K</div>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-text-primary/10 mb-6">
              <CheckCircle className="w-10 h-10 text-text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-text-primary">
              3. Get Results
            </h3>
            <p className="text-text-secondary text-lg">
              Receive detailed RAG-rated assessments with evidence-based
              findings and actionable recommendations.
            </p>
            <div className="mt-4 text-primary font-semibold">£20-35K</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-card py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-text-primary">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-text-primary">
                Five Assessment Dimensions
              </h3>
              <p className="text-text-secondary">
                Comprehensive evaluation across Strategic, Management, Economic,
                Commercial, and Financial criteria.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-text-primary">
                RAG Rating System
              </h3>
              <p className="text-text-secondary">
                Clear Red/Amber/Green ratings with confidence scores for each
                assessment criterion.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-text-primary">
                Evidence-Based Findings
              </h3>
              <p className="text-text-secondary">
                Every assessment is backed by direct quotes and evidence from
                your uploaded documents.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-text-primary">
                Actionable Recommendations
              </h3>
              <p className="text-text-secondary">
                Receive specific, practical suggestions to improve your business
                case before IPA submission.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
              <span className="text-white font-bold text-xs">PI</span>
            </div>
            <span className="font-semibold">Programme Insights</span>
          </div>
          <p className="text-sm text-white/80">
            © {new Date().getFullYear()} Programme Insights - NISTA/PAR Readiness Assessment
          </p>
          <p className="text-xs text-white/60 mt-2">
            Built with Supabase & N8N
          </p>
        </div>
      </footer>
    </div>
  )
}
