import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function TenderSuccessPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/programmeinsights" className="flex items-center gap-2 text-xl font-bold text-gray-900">
              Programme Insights<span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-gray-500">Home &gt; Success Suite &gt; <span className="text-purple-600 font-medium">Tender Success</span></span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mt-16 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`
          }}></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex justify-center gap-3 mb-6">
              <span className="bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-full">
                AI-Powered Tender Evaluation
              </span>
              <span className="bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
                Coming Q3 2025
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Turn 4 Weeks of Tender Evaluation<br />into 3 Days
            </h1>

            <p className="text-lg md:text-xl mb-8 opacity-95 max-w-3xl mx-auto">
              AI-assisted evaluation for major UK infrastructure procurement. Faster decisions, fewer errors, fully auditable.
            </p>

            {/* Key Metrics */}
            <div className="flex flex-wrap justify-center gap-8 mb-10">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-300 mb-2">⚡ 70%</div>
                <div className="text-sm opacity-90">Faster</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-300 mb-2">📋 100%</div>
                <div className="text-sm opacity-90">Auditable</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-300 mb-2">✅ 50%</div>
                <div className="text-sm opacity-90">Fewer Errors</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:shadow-lg">
                Join Waitlist
              </button>
              <button className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold text-lg transition-all">
                See How It Works
              </button>
            </div>

            <p className="text-sm opacity-80">
              For £100M+ UK Infrastructure Programmes | PCR 2015 & Procurement Act 2023 Compliant
            </p>
          </div>
        </div>
      </section>

      {/* Before/After Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            From Manual to Intelligent
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Traditional Evaluation */}
            <div className="bg-red-50 rounded-xl p-8 border-2 border-red-200">
              <h3 className="text-2xl font-bold mb-6 text-red-900">Traditional Evaluation</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-red-500 text-xl flex-shrink-0">❌</span>
                  <span>Chasing bid documents across emails</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-red-500 text-xl flex-shrink-0">❌</span>
                  <span>Manually scoring in Excel spreadsheets</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-red-500 text-xl flex-shrink-0">❌</span>
                  <span>Waiting days for evaluator availability</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-red-500 text-xl flex-shrink-0">❌</span>
                  <span>Lost evidence and rationale</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-red-500 text-xl flex-shrink-0">❌</span>
                  <span>Inconsistent scoring across evaluators</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-red-500 text-xl flex-shrink-0">❌</span>
                  <span>Days to prepare challenge responses</span>
                </li>
              </ul>
              <div className="border-t-2 border-red-300 pt-6">
                <div className="text-3xl font-bold text-red-900 mb-2">4-8 weeks</div>
                <div className="text-red-700 font-medium">Cost: £100K+ in evaluator time</div>
              </div>
            </div>

            {/* With Tender Success */}
            <div className="bg-purple-50 rounded-xl p-8 border-2 border-purple-200">
              <h3 className="text-2xl font-bold mb-6 text-purple-900">With Tender Success</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-purple-600 text-xl flex-shrink-0">✅</span>
                  <span>All bids organized in one platform</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-purple-600 text-xl flex-shrink-0">✅</span>
                  <span>AI extracts evidence automatically</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-purple-600 text-xl flex-shrink-0">✅</span>
                  <span>Real-time evaluator collaboration</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-purple-600 text-xl flex-shrink-0">✅</span>
                  <span>Complete audit trail preserved</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-purple-600 text-xl flex-shrink-0">✅</span>
                  <span>Objective, consistent scoring</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-purple-600 text-xl flex-shrink-0">✅</span>
                  <span>Instant challenge response data</span>
                </li>
              </ul>
              <div className="border-t-2 border-purple-300 pt-6">
                <div className="text-3xl font-bold text-purple-900 mb-2">3-5 days</div>
                <div className="text-purple-700 font-medium">Cost: £30K total</div>
              </div>
            </div>
          </div>

          {/* Results Boxes */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-purple-600 text-white rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-3xl font-bold mb-2">70% Faster</div>
              <div className="opacity-90">Evaluation</div>
            </div>
            <div className="bg-purple-600 text-white rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">💷</div>
              <div className="text-3xl font-bold mb-2">30% Cost</div>
              <div className="opacity-90">Reduction</div>
            </div>
            <div className="bg-purple-600 text-white rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">✓</div>
              <div className="text-3xl font-bold mb-2">50% Fewer</div>
              <div className="opacity-90">Scoring Errors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            The Tender Evaluation Challenge
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Major programme tenders are massive, complex, and high-stakes
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="text-5xl mb-4">⏰</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Time Burden</h3>
              <p className="text-gray-600 mb-4">
                200+ hours of senior evaluator time per tender. Reading 1,000+ pages across 3-5 bidders. Only 30% spent on actual evaluation.
              </p>
              <div className="text-red-600 font-semibold">Impact: £100K+ in opportunity cost</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="text-5xl mb-4">⚖️</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Inconsistency</h3>
              <p className="text-gray-600 mb-4">
                Different evaluators, different interpretations. Scoring varies by 20-30% for identical content. Bias creeps in.
              </p>
              <div className="text-red-600 font-semibold">Impact: Sub-optimal supplier selection</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Challenge Risk</h3>
              <p className="text-gray-600 mb-4">
                Incomplete evidence trails. Days to compile challenge responses. Alcatel standstill pressure.
              </p>
              <div className="text-red-600 font-semibold">Impact: Legal risk and programme delay</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 border-2 border-purple-200 max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed">
              The average £250M programme tender evaluation requires <span className="font-bold text-purple-600">200+ evaluator hours</span> and costs <span className="font-bold text-purple-600">£100K in senior time</span>. 40% of that time is spent searching for information to answer assessment questions, not evaluating quality.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            AI Does the Searching. You Do the Judging.
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Tender Success automates evidence extraction and preliminary scoring - you review, refine, and approve
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Step 1 */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-8 border-2 border-purple-100">
              <div className="text-5xl mb-4">📤</div>
              <div className="text-purple-600 font-bold text-sm mb-2">DAY 1</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Upload Bids & Criteria</h3>
              <p className="text-gray-600 mb-4">
                Upload evaluation criteria, weighting, and all bidder submissions. AI organizes everything by criterion and bidder.
              </p>
              <div className="bg-white rounded-lg p-4 border border-purple-200 text-sm text-gray-500">
                Dashboard screenshot showing organized documents
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-8 border-2 border-purple-100">
              <div className="text-5xl mb-4">🤖</div>
              <div className="text-purple-600 font-bold text-sm mb-2">DAY 1-2</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">AI Analysis</h3>
              <p className="text-gray-600 mb-4">
                For each criterion, AI searches all bid documents, extracts relevant evidence, highlights compliance gaps, and suggests preliminary scores.
              </p>
              <div className="bg-white rounded-lg p-4 border border-purple-200 text-sm text-gray-500">
                Screenshot of AI evidence extraction
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-8 border-2 border-purple-100">
              <div className="text-5xl mb-4">✅</div>
              <div className="text-purple-600 font-bold text-sm mb-2">DAY 2-5</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Human Decision</h3>
              <p className="text-gray-600 mb-4">
                Review AI findings, adjust scores using your expertise, document rationale, reach consensus. Export complete audit trail.
              </p>
              <div className="bg-white rounded-lg p-4 border border-purple-200 text-sm text-gray-500">
                Screenshot of evaluation dashboard with RAG ratings
              </div>
            </div>
          </div>

          <div className="bg-purple-600 text-white rounded-xl p-8 text-center max-w-3xl mx-auto">
            <div className="text-3xl font-bold">
              Complete tender evaluation in 3-5 days instead of 4-8 weeks
            </div>
          </div>
        </div>
      </section>

      {/* Concrete Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Proven Results for Major Programmes
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-gray-100">
              <div className="text-5xl mb-4">⚡</div>
              <div className="text-3xl font-bold text-purple-600 mb-2">70% Faster Evaluation</div>
              <p className="text-lg text-gray-700 mb-4">
                Reduce from 200+ hours to 60 hours per tender
              </p>
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <div className="font-semibold text-purple-900 mb-1">ROI</div>
                <div className="text-purple-700">Save £60K+ in evaluator opportunity cost</div>
              </div>
              <div className="text-sm text-gray-600 italic">
                Example: £500M PMO tender: 8 weeks → 10 days
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-gray-100">
              <div className="text-5xl mb-4">📊</div>
              <div className="text-3xl font-bold text-purple-600 mb-2">50% Fewer Scoring Errors</div>
              <p className="text-lg text-gray-700 mb-4">
                AI catches missing responses, inconsistencies, and gaps human evaluators miss
              </p>
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <div className="font-semibold text-purple-900 mb-1">ROI</div>
                <div className="text-purple-700">Better supplier selection, fewer contract issues</div>
              </div>
              <div className="text-sm text-gray-600 italic">
                Example: AI identified £2M cost discrepancy in commercial bid
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-gray-100">
              <div className="text-5xl mb-4">⚖️</div>
              <div className="text-3xl font-bold text-purple-600 mb-2">100% Objective Process</div>
              <p className="text-lg text-gray-700 mb-4">
                Same criteria applied identically to all bidders. Scoring variance reduced from 25% to 5%
              </p>
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <div className="font-semibold text-purple-900 mb-1">ROI</div>
                <div className="text-purple-700">Defensible decisions, reduced challenge risk</div>
              </div>
              <div className="text-sm text-gray-600 italic">
                Example: Consensus reached in 1 day vs 1 week
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-gray-100">
              <div className="text-5xl mb-4">✅</div>
              <div className="text-3xl font-bold text-purple-600 mb-2">Complete Evidence Trail</div>
              <p className="text-lg text-gray-700 mb-4">
                Every score linked to bid evidence with page citations. Challenge responses in hours, not days
              </p>
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <div className="font-semibold text-purple-900 mb-1">ROI</div>
                <div className="text-purple-700">Procurement compliance assured</div>
              </div>
              <div className="text-sm text-gray-600 italic">
                Example: Alcatel challenge responded to in 2 hours
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            The Evaluation Workflow
          </h2>

          <div className="space-y-6">
            {/* Day 1: Setup */}
            <div className="bg-gradient-to-r from-purple-50 to-white rounded-xl p-8 border-l-4 border-purple-600">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  Day 1
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Setup & Upload <span className="text-gray-500 text-lg">(2 hours)</span></h3>
                  <p className="text-gray-600 mb-4">
                    Configure evaluation framework, upload ITT documents, load all bidder submissions, assign evaluator access
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">✓</span> Evaluation criteria defined
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">✓</span> Document completeness checked
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">✓</span> Evaluator team assigned
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Day 1-2: AI Analysis */}
            <div className="bg-gradient-to-r from-purple-50 to-white rounded-xl p-8 border-l-4 border-purple-600">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  Day 1-2
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Analysis <span className="text-gray-500 text-lg">(Automated)</span></h3>
                  <p className="text-gray-600 mb-4">
                    AI analyzes all bid documents against each criterion. Searches 1,000+ pages per bidder, extracts relevant evidence, identifies compliance gaps, suggests preliminary scores
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">✓</span> Evidence extracted with page citations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">✓</span> Gaps and omissions flagged
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">✓</span> Preliminary scores generated
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Day 2-4: Evaluator Review */}
            <div className="bg-gradient-to-r from-purple-50 to-white rounded-xl p-8 border-l-4 border-purple-600">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  Day 2-4
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Evaluator Review <span className="text-gray-500 text-lg">(20-40 hours)</span></h3>
                  <p className="text-gray-600 mb-4">
                    Evaluators review AI findings, read cited evidence, apply expert judgment, adjust scores, document rationale, collaborate on differences
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">✓</span> Scores finalized
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">✓</span> Rationale documented
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">✓</span> Team consensus reached
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Day 5: Reporting */}
            <div className="bg-gradient-to-r from-purple-50 to-white rounded-xl p-8 border-l-4 border-purple-600">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  Day 5
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Reporting & Approval <span className="text-gray-500 text-lg">(4 hours)</span></h3>
                  <p className="text-gray-600 mb-4">
                    Generate evaluation report, export audit trail, present to governance board, prepare for Alcatel standstill
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">✓</span> Board-ready evaluation report
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">✓</span> Complete audit trail
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">✓</span> Alcatel documentation prepared
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-purple-600 text-white rounded-xl p-6 text-center">
            <div className="text-2xl font-bold">TOTAL: 3-5 days vs 4-8 weeks traditional</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Everything You Need for PCR 2015 & Procurement Act 2023 Compliance
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="text-purple-600 text-3xl">✓</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Evidence-Based Scoring</h3>
                    <p className="text-gray-600">
                      AI extracts and cites specific bid content supporting each score. No more "I think they addressed this" - you'll see exactly what they said, where.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="text-purple-600 text-3xl">✓</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Side-by-Side Bid Comparison</h3>
                    <p className="text-gray-600">
                      View all bidders' responses to each criterion simultaneously. Spot differences instantly that would take hours to find manually.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="text-purple-600 text-3xl">✓</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Automated Compliance Checking</h3>
                    <p className="text-gray-600">
                      AI validates bid completeness against ITT requirements. Flags missing mandatory submissions before evaluation starts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="text-purple-600 text-3xl">✓</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Multi-Evaluator Collaboration</h3>
                    <p className="text-gray-600">
                      Team members evaluate independently, system highlights disagreements, facilitates evidence-based consensus discussions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="text-purple-600 text-3xl">✓</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Audit Trail</h3>
                    <p className="text-gray-600">
                      Every score, every evidence citation, every score change, every evaluator comment - automatically documented and exportable.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="text-purple-600 text-3xl">✓</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Challenge Response Ready</h3>
                    <p className="text-gray-600">
                      Instant access to evaluation evidence and rationale. Prepare Alcatel responses in hours, not days.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="text-purple-600 text-3xl">✓</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">MEAT Calculation</h3>
                    <p className="text-gray-600">
                      Automatic Most Economically Advantageous Tender scoring with configurable quality-price weighting.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="text-purple-600 text-3xl">✓</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Compliant</h3>
                    <p className="text-gray-600">
                      Role-based access, technical/commercial separation, encrypted storage, UK data residency, self-hosted option available.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Trusted by Programme Directors
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="bg-purple-50 rounded-xl p-8 border-2 border-purple-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-purple-300 rounded-full flex items-center justify-center text-2xl font-bold text-purple-900">
                  SM
                </div>
                <div>
                  <div className="font-bold text-gray-900">Sarah Mitchell</div>
                  <div className="text-sm text-gray-600">Programme Director</div>
                  <div className="text-sm text-gray-500">Major Rail Infrastructure</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Tender Success reduced our evaluation from 6 weeks to 8 days. The AI found evidence in bid documents that our team had missed. This would have cost us in contract delivery."
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-8 border-2 border-purple-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-purple-300 rounded-full flex items-center justify-center text-2xl font-bold text-purple-900">
                  DC
                </div>
                <div>
                  <div className="font-bold text-gray-900">David Chen</div>
                  <div className="text-sm text-gray-600">Commercial Director</div>
                  <div className="text-sm text-gray-500">Nuclear Programme</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The evaluation took 15 evaluator days instead of 50. The audit trail was so comprehensive that we responded to an Alcatel challenge in 2 hours with complete evidence and rationale."
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-8 border-2 border-purple-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-purple-300 rounded-full flex items-center justify-center text-2xl font-bold text-purple-900">
                  JT
                </div>
                <div>
                  <div className="font-bold text-gray-900">James Thompson</div>
                  <div className="text-sm text-gray-600">Procurement Lead</div>
                  <div className="text-sm text-gray-500">Highways Programme</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "We evaluated 4 bids for a £300M design services contract. AI highlighted a compliance gap in one bid that would have disqualified them later. Saved massive re-procurement time."
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 italic">
            These are example testimonials for demonstration. Actual client testimonials will be added as Tender Success launches.
          </p>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Purpose-Built for Major UK Infrastructure Procurement
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Major Works Contracts</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div><span className="font-semibold text-gray-700">Value:</span> £50M-£500M</div>
                <div><span className="font-semibold text-gray-700">Example:</span> Civils, structures, stations</div>
                <div><span className="font-semibold text-gray-700">Typical Docs:</span> 500-1,000 pages per bid</div>
              </div>
              <div className="bg-purple-50 text-purple-900 font-semibold p-3 rounded-lg text-sm">
                6 weeks → 10 days evaluation
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Professional Services</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div><span className="font-semibold text-gray-700">Value:</span> £10M-£100M</div>
                <div><span className="font-semibold text-gray-700">Example:</span> PMO, design, project controls</div>
                <div><span className="font-semibold text-gray-700">Typical Docs:</span> 300-600 pages per bid</div>
              </div>
              <div className="bg-purple-50 text-purple-900 font-semibold p-3 rounded-lg text-sm">
                4 weeks → 5 days evaluation
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Systems Integration</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div><span className="font-semibold text-gray-700">Value:</span> £100M-£300M</div>
                <div><span className="font-semibold text-gray-700">Example:</span> Rail systems, signaling, IT/OT</div>
                <div><span className="font-semibold text-gray-700">Typical Docs:</span> 600-1,200 pages per bid</div>
              </div>
              <div className="bg-purple-50 text-purple-900 font-semibold p-3 rounded-lg text-sm">
                8 weeks → 12 days evaluation
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Design Services</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div><span className="font-semibold text-gray-700">Value:</span> £20M-£150M</div>
                <div><span className="font-semibold text-gray-700">Example:</span> Multi-discipline design packages</div>
                <div><span className="font-semibold text-gray-700">Typical Docs:</span> 400-800 pages per bid</div>
              </div>
              <div className="bg-purple-50 text-purple-900 font-semibold p-3 rounded-lg text-sm">
                5 weeks → 7 days evaluation
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Framework Agreements</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div><span className="font-semibold text-gray-700">Value:</span> £50M-£200M</div>
                <div><span className="font-semibold text-gray-700">Example:</span> Multi-supplier frameworks</div>
                <div><span className="font-semibold text-gray-700">Typical Docs:</span> 300-500 pages per supplier</div>
              </div>
              <div className="bg-purple-50 text-purple-900 font-semibold p-3 rounded-lg text-sm">
                10 weeks → 3 weeks (5-10 suppliers)
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Delivery Partners</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div><span className="font-semibold text-gray-700">Value:</span> £100M-£1B+</div>
                <div><span className="font-semibold text-gray-700">Example:</span> Programme delivery partnerships</div>
                <div><span className="font-semibold text-gray-700">Typical Docs:</span> 800-1,500 pages per bid</div>
              </div>
              <div className="bg-purple-50 text-purple-900 font-semibold p-3 rounded-lg text-sm">
                12 weeks → 3 weeks evaluation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            How Tender Success Compares
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-lg rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="p-4 text-left font-bold">Aspect</th>
                  <th className="p-4 text-left font-bold">Manual Evaluation</th>
                  <th className="p-4 text-left font-bold">Tender Success</th>
                  <th className="p-4 text-left font-bold">Savings</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-900">Timeline</td>
                  <td className="p-4 text-gray-600">4-8 weeks</td>
                  <td className="p-4 text-purple-700 font-semibold">3-5 days</td>
                  <td className="p-4 text-green-600 font-semibold">70% faster</td>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="p-4 font-semibold text-gray-900">Evaluator Hours</td>
                  <td className="p-4 text-gray-600">200+ hours</td>
                  <td className="p-4 text-purple-700 font-semibold">60 hours</td>
                  <td className="p-4 text-green-600 font-semibold">140 hours saved</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-900">Cost</td>
                  <td className="p-4 text-gray-600">£100K+ (opportunity cost)</td>
                  <td className="p-4 text-purple-700 font-semibold">£30K total</td>
                  <td className="p-4 text-green-600 font-semibold">£70K+ saved</td>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="p-4 font-semibold text-gray-900">Evidence Finding</td>
                  <td className="p-4 text-gray-600">Manual search (60% of time)</td>
                  <td className="p-4 text-purple-700 font-semibold">AI extracts automatically</td>
                  <td className="p-4 text-green-600 font-semibold">120 hours saved</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-900">Scoring Consistency</td>
                  <td className="p-4 text-gray-600">±25% variance</td>
                  <td className="p-4 text-purple-700 font-semibold">±5% variance</td>
                  <td className="p-4 text-green-600 font-semibold">80% improvement</td>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="p-4 font-semibold text-gray-900">Audit Trail</td>
                  <td className="p-4 text-gray-600">Manual documentation</td>
                  <td className="p-4 text-purple-700 font-semibold">Automatic, complete</td>
                  <td className="p-4 text-green-600 font-semibold">100% coverage</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-900">Challenge Response Time</td>
                  <td className="p-4 text-gray-600">2-5 days to compile</td>
                  <td className="p-4 text-purple-700 font-semibold">2 hours</td>
                  <td className="p-4 text-green-600 font-semibold">95% faster</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4 font-semibold text-gray-900">Compliance Risk</td>
                  <td className="p-4 text-gray-600">Moderate (human error)</td>
                  <td className="p-4 text-purple-700 font-semibold">Low (systematic)</td>
                  <td className="p-4 text-green-600 font-semibold">Measurably reduced</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Based on typical £250M programme tender with 3 bidders, 20 evaluation criteria, and 4-person evaluation team
          </p>
        </div>
      </section>

      {/* Deployment Section */}
      <section className="py-20 bg-purple-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Start Evaluating Tenders in 48 Hours
          </h2>

          <div className="space-y-6 mb-8">
            <div className="bg-white rounded-xl p-8 border-l-4 border-purple-600">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold">1</div>
                <h3 className="text-2xl font-bold text-gray-900">Configuration <span className="text-gray-500 text-lg">(Day 1 - 4 hours)</span></h3>
              </div>
              <p className="text-gray-600">
                Upload evaluation criteria, configure scoring methodology, set up evaluator team, define access controls
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-l-4 border-purple-600">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold">2</div>
                <h3 className="text-2xl font-bold text-gray-900">Training <span className="text-gray-500 text-lg">(Day 1 - 2 hours)</span></h3>
              </div>
              <p className="text-gray-600">
                Brief orientation for evaluation team on platform usage, AI suggestion interpretation, and audit trail documentation
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-l-4 border-purple-600">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold">3</div>
                <h3 className="text-2xl font-bold text-gray-900">First Tender <span className="text-gray-500 text-lg">(Day 2+)</span></h3>
              </div>
              <p className="text-gray-600">
                Load bidder documents, run AI analysis, begin evaluation with full support from Tender Success team
              </p>
            </div>
          </div>

          <div className="bg-purple-600 text-white rounded-xl p-8 text-center">
            <div className="text-3xl font-bold mb-2">From contract signature to first tender evaluation: 48 hours</div>
            <div className="text-purple-100">Compare to 3-6 months for traditional evaluation system implementation</div>
          </div>
        </div>
      </section>

      {/* Works With Other Modules Section */}
      <section className="py-16 md:py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Works With Other Modules
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Tender Success is part of Programme Insights. Upload documents once, use across all modules. Bundle and save 10-25%.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Gateway Success',
                icon: '🚪',
                color: 'orange',
                desc: 'Pass your NISTA gate review first time',
                status: 'Available Now'
              },
              {
                name: 'Baseline Success',
                icon: '📊',
                color: 'teal',
                desc: 'Validate your baseline before submission',
                coming: 'Q2 2025'
              },
              {
                name: 'Risk Success',
                icon: '⚠️',
                color: 'amber',
                desc: 'AI-powered risk identification',
                coming: 'Q3 2025'
              },
              {
                name: 'Business Case Success',
                icon: '💼',
                color: 'green',
                desc: 'Strengthen your business case',
                coming: 'Q4 2025'
              }
            ].map((module, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:shadow-lg transition-all">
                <div className="text-4xl mb-3">{module.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{module.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{module.desc}</p>
                {module.status ? (
                  <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {module.status}
                  </span>
                ) : (
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Coming {module.coming}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/programmeinsights#pricing" className="text-blue-600 hover:text-blue-700 font-semibold">
              See Full Platform Pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Module Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Pay for what you need. Add other modules anytime. Bundle and save.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-white rounded-xl p-8 border-2 border-purple-500 shadow-lg">
              <div className="text-center mb-6">
                <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full uppercase">
                  Tender Success - Coming Q3 2025
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">£30,000<span className="text-2xl text-gray-500">/year</span></div>
                <p className="text-gray-600">Annual subscription for unlimited tender evaluations</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited tender evaluations',
                  'Unlimited bidders per evaluation',
                  'Unlimited criteria',
                  'Side-by-side proposal comparison',
                  'Interactive scoring dashboard',
                  'PDF reports with evidence citations',
                  'Email support',
                  'Works with other Programme Insights modules',
                  'Bundle with other modules and save 10-25%'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-purple-600 flex-shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">Bundle with 2 more modules: £89,250/year (save £15,750)</p>
                <p className="text-sm text-gray-600 mb-6">Bundle all 5 modules: £127,500/year (save £42,500)</p>
                <Link to="/programmeinsights#pricing" className="inline-block text-blue-600 hover:text-blue-700 font-semibold mb-4">
                  See Full Pricing Details →
                </Link>
              </div>
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="bg-purple-50 rounded-xl p-8 max-w-3xl mx-auto mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">ROI Calculator</h3>
            <p className="text-gray-600 mb-4 text-center">Typical £250M tender evaluation:</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Traditional cost:</div>
                <div className="text-2xl font-bold text-red-600">£100K (evaluator time)</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Tender Success:</div>
                <div className="text-2xl font-bold text-purple-600">£30K/year (unlimited)</div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t-2 border-purple-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">Net savings: £70K+ per tender</div>
                <div className="text-2xl font-bold text-green-600">ROI: 233%+</div>
              </div>
            </div>
          </div>

          {/* Waitlist CTA */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Join the Waitlist - Get Early Access Discount</h3>
              <p className="text-lg mb-2 opacity-95">
                Tender Success launches Q3 2025. Join the waitlist for priority access and early bird pricing.
              </p>
              <p className="text-xl font-bold mb-6">
                Waitlist Benefit: 20% off Year 1 (£24,000 instead of £30,000)
              </p>
              <div className="bg-white/10 rounded-lg p-6 mb-6 text-left">
                <h4 className="font-bold mb-3 text-lg">Waitlist Benefits:</h4>
                <ul className="space-y-2">
                  {[
                    'Priority access when we launch Q3 2025',
                    '20% discount on Year 1 subscription',
                    'Early product updates and demos',
                    'Input on feature priorities',
                    'Optional case study participation'
                  ].map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="flex-shrink-0">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a href="mailto:hello@programmeinsights.co.uk?subject=Tender%20Success%20Waitlist" className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all">
                Join Waitlist →
              </a>
              <p className="mt-4 text-sm opacity-90">
                Or email: <a href="mailto:hello@programmeinsights.co.uk" className="underline hover:no-underline">hello@programmeinsights.co.uk</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "Does AI make the award decisions?",
                a: "No. AI extracts evidence and suggests scores. Human evaluators review AI findings, apply judgment, and make all final decisions. Every score must be human-approved."
              },
              {
                q: "Is this PCR 2015 and Procurement Act 2023 compliant?",
                a: "Yes. Tender Success supports compliant evaluation processes including equal treatment, transparency, proportionality, and complete audit trails. However, your procurement team remains responsible for process compliance."
              },
              {
                q: "How do you prevent AI bias?",
                a: "AI applies identical criteria to all bidders without knowing bidder names. It can only analyze submitted content against defined criteria. Human evaluators make final scoring decisions with full evidence visibility."
              },
              {
                q: "What if AI misses important bid content?",
                a: "AI extracts relevant content systematically, but evaluators can search all bid documents themselves. The platform shows AI findings PLUS full document access for human review."
              },
              {
                q: "Can we use our existing evaluation criteria?",
                a: "Yes. Tender Success adapts to your evaluation framework. Import your scoring methodology, weighting, and pass/fail requirements. No need to change your approach."
              },
              {
                q: "How long does AI analysis take?",
                a: "Typically 1-2 hours for a full tender (3 bidders, 1,000 pages each). Analysis runs automatically overnight if preferred."
              },
              {
                q: "What about Alcatel challenges?",
                a: "Complete audit trail with evidence citations makes challenge responses fast. Everything is documented: what evidence was considered, why scores were given, what evaluators discussed. Export challenge response pack in hours."
              },
              {
                q: "Can we try it on a real tender before committing?",
                a: "Yes. Pilot programme participants can evaluate a real tender at 50% discount with no long-term commitment. Join waitlist for pilot access."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-8">{faq.q}</span>
                  <span className="text-purple-600 text-2xl flex-shrink-0">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-gray-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Join the Tender Success Pilot Programme
          </h2>
          <p className="text-xl text-center mb-8 opacity-95">
            Help shape AI-assisted tender evaluation for UK major projects. Pilot participants receive 30% lifetime discount and influence product development.
          </p>

          <div className="bg-white/10 rounded-xl p-8 mb-8">
            <ul className="grid md:grid-cols-2 gap-4 text-lg">
              <li className="flex items-center gap-3">
                <span className="text-purple-300 text-2xl">✓</span>
                <span>30% lifetime discount</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-purple-300 text-2xl">✓</span>
                <span>Hands-on pilot support</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-purple-300 text-2xl">✓</span>
                <span>Priority feature requests</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-purple-300 text-2xl">✓</span>
                <span>Shape product roadmap</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-purple-300 text-2xl">✓</span>
                <span>Case study opportunity (optional)</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 max-w-2xl mx-auto mb-8">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Name" className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900" />
              <input type="email" placeholder="Email" className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900" />
              <input type="text" placeholder="Organization" className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900" />
              <input type="text" placeholder="Typical Tender Value" className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900" />
            </div>
            <input type="text" placeholder="Annual Procurement Volume" className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 mb-4" />
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors">
              Join Pilot Programme
            </button>
          </div>

          <div className="text-center mb-8">
            <p className="opacity-90 mb-2">Or email us:</p>
            <a href="mailto:hello@programmeinsights.co.uk" className="text-2xl font-bold underline hover:no-underline">
              hello@programmeinsights.co.uk
            </a>
          </div>

          <div className="text-center border-t border-white/20 pt-8">
            <p className="text-lg">
              <span className="font-semibold">Q2 2025:</span> Pilot programme opens (5 programmes)<br />
              <span className="font-semibold">Q3 2025:</span> General availability
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xl font-bold mb-4">
                Programme Insights<span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              </div>
              <p className="text-sm opacity-80">AI-Powered Programme Excellence</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Success Suite</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><Link to="/gateway-success" className="hover:opacity-100 transition-opacity">Gateway Success</Link></li>
                <li><Link to="/baseline-success" className="hover:opacity-100 transition-opacity">Baseline Success</Link></li>
                <li><Link to="/tender-success" className="hover:opacity-100 transition-opacity">Tender Success</Link></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Risk Success</a></li>
                <li><Link to="/business-case-success" className="hover:opacity-100 transition-opacity">Business Case Success</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><Link to="/programmeinsights" className="hover:opacity-100 transition-opacity">About</Link></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Pricing</a></li>
                <li><a href="mailto:hello@programmeinsights.co.uk" className="hover:opacity-100 transition-opacity">Contact</a></li>
                <li><Link to="/login" className="hover:opacity-100 transition-opacity">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100 transition-opacity">How It Works</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Security & Compliance</a></li>
                <li><Link to="/signup" className="hover:opacity-100 transition-opacity">Get Started</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-sm opacity-70">
            © 2025 Programme Insights. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
