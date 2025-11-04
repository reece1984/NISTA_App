import {
  AlertTriangle,
  Search,
  TrendingDown,
  BarChart3,
  CheckCircle2,
  Target,
  X,
  Check,
  Compass,
  Banknote,
  Rocket,
  ClipboardCheck,
  FileText,
  Upload,
  Activity,
  Scale,
  AlertCircle,
  FileCheck
} from 'lucide-react'
import Button from '../components/ui/Button'

export default function ProductLanding() {
  const scrollToCalendar = () => {
    const calendarSection = document.getElementById('calendar-section')
    if (calendarSection) {
      calendarSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="scroll-smooth">
      {/* Section 1: Hero */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-[#1e3a5f] mb-6 leading-tight">
              Stop Guessing. Start Delivering. Pass Your IPA Gate Reviews with Confidence.
            </h1>
            <h2 className="text-3xl font-semibold text-[#2c5f8d] mb-8 leading-relaxed">
              The AI-powered assessment platform that helps UK infrastructure project teams identify risks early, build bulletproof business cases, and navigate Gate 0, Gate 1, PAR, and Gate 3 reviews—before the IPA finds the gaps.
            </h2>
            <p className="text-lg leading-relaxed text-[#64748b] mb-10">
              <strong className="text-[#1e3a5f]">72% of major government projects are rated AMBER</strong>—meaning significant issues exist that could derail delivery. Your project doesn't have to be one of them. NISTA/PAR gives you the same rigorous assessment framework the Infrastructure & Projects Authority uses, so you can fix problems before they become red flags.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                variant="primary"
                size="lg"
                onClick={scrollToCalendar}
                className="h-16 px-8 text-lg font-bold bg-[#1e3a5f] hover:bg-[#152941] rounded-lg w-full sm:w-auto"
              >
                Book Your Free Assessment Demo
              </Button>
              <button
                onClick={scrollToCalendar}
                className="text-lg font-semibold text-[#2c5f8d] hover:text-[#1e3a5f] transition-colors"
              >
                See How It Works →
              </button>
            </div>

            {/* Dashboard Preview Placeholder */}
            <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center shadow-lg border border-gray-200">
              <span className="text-2xl font-semibold text-slate-500">Dashboard Preview</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The Problem */}
      <section className="bg-[#f8fafc] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-semibold text-[#1e3a5f] text-center mb-16">
            Your Project Is One Gate Review Away From a RED Rating
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Column 1 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#ef4444]/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-[#ef4444]" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-[#1e3a5f] mb-4 text-center">
                227 Projects. £834 Billion. 12% Rated RED.
              </h3>
              <p className="text-lg leading-relaxed text-[#64748b]">
                The 2023-24 IPA Annual Report reveals that 27 major projects are rated RED—meaning delivery is unachievable without significant intervention. Another 163 projects (72%) are AMBER, teetering on the edge.
              </p>
            </div>

            {/* Column 2 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#2c5f8d]/10 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-[#2c5f8d]" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-[#1e3a5f] mb-4 text-center">
                Gate Reviews Expose What You Can't See
              </h3>
              <p className="text-lg leading-relaxed text-[#64748b]">
                IPA gate reviews are designed to find gaps in your strategic case, economic justification, delivery confidence, and procurement readiness. By the time the IPA flags a critical issue, it's often too late.
              </p>
            </div>

            {/* Column 3 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#ef4444]/10 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-8 h-8 text-[#ef4444]" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-[#1e3a5f] mb-4 text-center">
                The Cost of Getting It Wrong
              </h3>
              <p className="text-lg leading-relaxed text-[#64748b]">
                RED-rated projects face £96.8 billion in whole life costs at risk. Delayed approvals. Budget cuts. Programme resets. Career-defining failures.
              </p>
            </div>
          </div>

          {/* Callout Box */}
          <div className="bg-[#1e3a5f] text-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
            <p className="text-xl leading-relaxed">
              <strong className="text-2xl">Did You Know?</strong><br />
              <strong>12%</strong> of GMPP projects are rated RED (27 projects, £96.8bn at risk).<br />
              <strong>72%</strong> are rated AMBER (163 projects with significant unresolved issues).<br />
              Only <strong>11%</strong> achieve GREEN status.
            </p>
          </div>

          <div className="text-center mt-12">
            <Button
              variant="primary"
              size="lg"
              onClick={scrollToCalendar}
              className="h-16 px-8 text-lg font-bold bg-[#1e3a5f] hover:bg-[#152941] rounded-lg"
            >
              See NISTA/PAR in Action—Book a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Section 3: The Solution */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-[#1e3a5f] mb-4">
              The 3-Step Path From AMBER to GREEN
            </h2>
            <p className="text-xl text-[#64748b] max-w-3xl mx-auto">
              NISTA/PAR helps you assess, address, and assure—before the IPA ever sees your business case.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#2c5f8d] text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-lg">
                  1
                </div>
                <div className="w-16 h-16 bg-[#2c5f8d]/10 rounded-full flex items-center justify-center mb-6">
                  <BarChart3 className="w-8 h-8 text-[#2c5f8d]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#1e3a5f] mb-4">
                  Assess
                </h3>
                <h4 className="text-xl font-semibold text-[#2c5f8d] mb-3">
                  Upload Your Documents. Get Instant Insights.
                </h4>
                <p className="text-lg leading-relaxed text-[#64748b] mb-4">
                  Upload your business case, strategic outline, economic appraisal, or project brief. Our AI analyzes your documents against the exact criteria the IPA uses for Gate 0, Gate 1, PAR, and Gate 3 reviews. Within minutes, you'll see which areas are strong (GREEN), which need attention (AMBER), and which are critical risks (RED).
                </p>
                <p className="text-lg font-semibold text-[#10b981]">
                  ✓ No more guesswork. Know exactly where you stand.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#2c5f8d] text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-lg">
                  2
                </div>
                <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#1e3a5f] mb-4">
                  Address
                </h3>
                <h4 className="text-xl font-semibold text-[#2c5f8d] mb-3">
                  Fix the Gaps Before They Become Red Flags.
                </h4>
                <p className="text-lg leading-relaxed text-[#64748b] mb-4">
                  For every criterion, NISTA/PAR provides AI-generated findings, evidence-based recommendations, and specific actions to strengthen your case.
                </p>
                <p className="text-lg font-semibold text-[#10b981]">
                  ✓ Strengthen your case with confidence.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#2c5f8d] text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-lg">
                  3
                </div>
                <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-[#10b981]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#1e3a5f] mb-4">
                  Assure
                </h3>
                <h4 className="text-xl font-semibold text-[#2c5f8d] mb-3">
                  Enter Your Gate Review Ready to Pass.
                </h4>
                <p className="text-lg leading-relaxed text-[#64748b] mb-4">
                  Generate a professional assessment report that shows stakeholders, the IPA, and the Treasury that you've done the work.
                </p>
                <p className="text-lg font-semibold text-[#10b981]">
                  ✓ Pass your gate review. Unlock your funding.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Button
              variant="primary"
              size="lg"
              onClick={scrollToCalendar}
              className="h-16 px-8 text-lg font-bold bg-[#1e3a5f] hover:bg-[#152941] rounded-lg"
            >
              See NISTA/PAR in Action—Book a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Section 4: Consequences */}
      <section className="bg-[#f8fafc] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-[#1e3a5f] mb-4">
              The Hidden Cost of 'Winging It'
            </h2>
            <p className="text-xl text-[#64748b] max-w-3xl mx-auto">
              Every day without a rigorous self-assessment is a day closer to a RED rating.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
            {/* Without NISTA/PAR */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-2xl font-semibold text-[#ef4444] mb-6 text-center">
                Without NISTA/PAR
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <X className="w-6 h-6 text-[#ef4444] flex-shrink-0 mt-1" />
                  <span className="text-lg text-[#64748b]">
                    You discover critical gaps during the IPA review (too late to fix)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-6 h-6 text-[#ef4444] flex-shrink-0 mt-1" />
                  <span className="text-lg text-[#64748b]">
                    Your business case is sent back for rework (6-12 month delay)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-6 h-6 text-[#ef4444] flex-shrink-0 mt-1" />
                  <span className="text-lg text-[#64748b]">
                    Treasury questions your delivery confidence (budget at risk)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-6 h-6 text-[#ef4444] flex-shrink-0 mt-1" />
                  <span className="text-lg text-[#64748b]">
                    Your SRO faces scrutiny from the Accounting Officer (career risk)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-6 h-6 text-[#ef4444] flex-shrink-0 mt-1" />
                  <span className="text-lg text-[#64748b]">
                    Your project joins the 72% rated AMBER—or worse, the 12% rated RED
                  </span>
                </li>
              </ul>
            </div>

            {/* With NISTA/PAR */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-[#10b981]">
              <h3 className="text-2xl font-semibold text-[#10b981] mb-6 text-center">
                With NISTA/PAR
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#10b981] flex-shrink-0 mt-1" />
                  <span className="text-lg text-[#64748b]">
                    You identify and fix gaps before the IPA sees them
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#10b981] flex-shrink-0 mt-1" />
                  <span className="text-lg text-[#64748b]">
                    Your business case passes on the first submission
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#10b981] flex-shrink-0 mt-1" />
                  <span className="text-lg text-[#64748b]">
                    Treasury approves your funding with confidence
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#10b981] flex-shrink-0 mt-1" />
                  <span className="text-lg text-[#64748b]">
                    Your SRO demonstrates world-class project delivery
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#10b981] flex-shrink-0 mt-1" />
                  <span className="text-lg text-[#64748b]">
                    Your project joins the 11% rated GREEN
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Quote */}
          <div className="text-center mb-12">
            <blockquote className="text-3xl font-semibold text-[#1e3a5f] max-w-4xl mx-auto italic">
              "The IPA's job is to find what's wrong. Your job is to make sure there's nothing to find."
            </blockquote>
          </div>

          <div className="text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={scrollToCalendar}
              className="h-16 px-8 text-lg font-bold bg-[#1e3a5f] hover:bg-[#152941] rounded-lg"
            >
              Don't Wait for the IPA—Assess Your Project Now
            </Button>
          </div>
        </div>
      </section>

      {/* Section 5: Transformation */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-[#1e3a5f] mb-4">
              From 'Hoping to Pass' to 'Confident to Deliver'
            </h2>
            <p className="text-xl text-[#64748b] max-w-3xl mx-auto">
              NISTA/PAR doesn't just help you pass gate reviews—it transforms how you deliver major projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#2c5f8d]/10 rounded-full flex items-center justify-center">
                  <Compass className="w-8 h-8 text-[#2c5f8d]" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-[#1e3a5f] mb-4 text-center">
                Strategic Clarity
              </h3>
              <h4 className="text-xl font-semibold text-[#2c5f8d] mb-3 text-center">
                Align with Government Priorities
              </h4>
              <p className="text-lg leading-relaxed text-[#64748b] text-center">
                Ensure your project supports Net Zero, Levelling Up, economic growth, and other national objectives.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center">
                  <Banknote className="w-8 h-8 text-[#10b981]" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-[#1e3a5f] mb-4 text-center">
                Economic Confidence
              </h3>
              <h4 className="text-xl font-semibold text-[#2c5f8d] mb-3 text-center">
                Build a Bulletproof Economic Case
              </h4>
              <p className="text-lg leading-relaxed text-[#64748b] text-center">
                From options appraisal to value for money, NISTA/PAR evaluates your economic justification using HM Treasury Green Book principles.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#f59e0b]/10 rounded-full flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-[#f59e0b]" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-[#1e3a5f] mb-4 text-center">
                Delivery Assurance
              </h3>
              <h4 className="text-xl font-semibold text-[#2c5f8d] mb-3 text-center">
                Prove You Can Deliver
              </h4>
              <p className="text-lg leading-relaxed text-[#64748b] text-center">
                The IPA wants to see realistic plans, capable teams, and managed risks. NISTA/PAR assesses your delivery confidence.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#2c5f8d]/10 rounded-full flex items-center justify-center">
                  <ClipboardCheck className="w-8 h-8 text-[#2c5f8d]" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-[#1e3a5f] mb-4 text-center">
                Procurement Readiness
              </h3>
              <h4 className="text-xl font-semibold text-[#2c5f8d] mb-3 text-center">
                Navigate Procurement with Confidence
              </h4>
              <p className="text-lg leading-relaxed text-[#64748b] text-center">
                Gate 3 requires procurement strategy, market engagement, and contract readiness. NISTA/PAR evaluates your approach.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <Button
              variant="primary"
              size="lg"
              onClick={scrollToCalendar}
              className="h-16 px-8 text-lg font-bold bg-[#1e3a5f] hover:bg-[#152941] rounded-lg"
            >
              Transform Your Project Delivery—Book a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Section 6: Features */}
      <section className="bg-[#f8fafc] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-semibold text-[#1e3a5f] text-center mb-16">
            Everything You Need to Pass Your Gate Review
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#2c5f8d]/10 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-[#2c5f8d]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#1e3a5f] mb-3 text-center">
                Template-Specific Assessments
              </h3>
              <p className="text-lg leading-relaxed text-[#64748b] text-center">
                Choose Gate 0, Gate 1, PAR, or Gate 3—each with tailored criteria, weighted scoring, and critical flags.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-[#10b981]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#1e3a5f] mb-3 text-center">
                Document Upload & AI Analysis
              </h3>
              <p className="text-lg leading-relaxed text-[#64748b] text-center">
                Upload Word docs, PDFs, or PowerPoint presentations. Our AI extracts key information automatically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#f59e0b]/10 rounded-full flex items-center justify-center">
                  <Activity className="w-8 h-8 text-[#f59e0b]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#1e3a5f] mb-3 text-center">
                RAG-Rated Criteria
              </h3>
              <p className="text-lg leading-relaxed text-[#64748b] text-center">
                See at a glance which criteria are GREEN (strong), AMBER (needs attention), or RED (critical risk).
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#2c5f8d]/10 rounded-full flex items-center justify-center">
                  <Scale className="w-8 h-8 text-[#2c5f8d]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#1e3a5f] mb-3 text-center">
                Weighted Scoring
              </h3>
              <p className="text-lg leading-relaxed text-[#64748b] text-center">
                High-impact criteria (like strategic alignment and value for money) carry more weight in your overall rating.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#ef4444]/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-[#ef4444]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#1e3a5f] mb-3 text-center">
                Critical Flags
              </h3>
              <p className="text-lg leading-relaxed text-[#64748b] text-center">
                If a critical criterion is RED, your overall rating is RED—just like the IPA's approach.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center">
                  <FileCheck className="w-8 h-8 text-[#10b981]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#1e3a5f] mb-3 text-center">
                Professional Assessment Reports
              </h3>
              <p className="text-lg leading-relaxed text-[#64748b] text-center">
                Generate publication-ready PDF reports with executive summaries, RAG distribution charts, and recommendations.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <Button
              variant="primary"
              size="lg"
              onClick={scrollToCalendar}
              className="h-16 px-8 text-lg font-bold bg-[#1e3a5f] hover:bg-[#152941] rounded-lg"
            >
              Explore All Features—Book a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Section 7: Final CTA (Calendar) */}
      <section id="calendar-section" className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold text-[#1e3a5f] mb-4">
              Ready to Pass Your Next Gate Review?
            </h2>
            <p className="text-xl text-[#2c5f8d] mb-8">
              Book a free 30-minute demo and see how NISTA/PAR can transform your project delivery.
            </p>
            <p className="text-lg leading-relaxed text-[#64748b] mb-8">
              In just 30 minutes, we'll show you:
            </p>
            <ul className="text-lg text-[#64748b] text-left max-w-2xl mx-auto space-y-3 mb-12">
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-[#10b981] flex-shrink-0 mt-1" />
                <span>How to upload and assess your business case documents</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-[#10b981] flex-shrink-0 mt-1" />
                <span>How the AI identifies gaps and generates recommendations</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-[#10b981] flex-shrink-0 mt-1" />
                <span>How to interpret RAG ratings and weighted scores</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-[#10b981] flex-shrink-0 mt-1" />
                <span>How to generate professional assessment reports</span>
              </li>
            </ul>
          </div>

          {/* Calendar Placeholder */}
          <div className="bg-white p-10 rounded-lg shadow-lg border border-gray-200">
            <div className="text-center">
              <p className="text-xl text-[#64748b] mb-8">
                Calendar booking widget will be embedded here (Calendly/Cal.com)
              </p>
              <a
                href="mailto:hello@nistapar.com?subject=Demo Booking Request&body=I'd like to book a demo of NISTA/PAR."
                className="inline-block"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="h-16 px-8 text-lg font-bold bg-[#1e3a5f] hover:bg-[#152941] rounded-lg"
                >
                  Book Your Demo Now
                </Button>
              </a>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-lg text-[#64748b]">
              Prefer to email?{' '}
              <a href="mailto:hello@nistapar.com" className="text-[#2c5f8d] hover:text-[#1e3a5f] font-semibold underline">
                Contact us at hello@nistapar.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
