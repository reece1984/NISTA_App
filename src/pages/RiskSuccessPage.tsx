import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function RiskSuccessPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/programmeinsights" className="flex items-center gap-2 text-xl font-bold text-gray-900">
              Programme Insights<span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-gray-500">Home &gt; Success Suite &gt; <span className="text-amber-600 font-medium">Risk Success</span></span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mt-16 bg-gradient-to-br from-blue-600 via-blue-700 to-amber-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(245, 158, 11, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.3) 0%, transparent 50%)`
          }}></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex justify-center gap-3 mb-6">
              <span className="bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
                AI-Assisted Risk Management
              </span>
              <span className="bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
                Coming Q3 2025
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Intelligent Risk Registers.<br />Human Oversight.
            </h1>

            <p className="text-lg md:text-xl mb-8 opacity-95 max-w-3xl mx-auto">
              AI-assisted risk identification and response planning using deep programme context. Discover risks before they discover you - with human-in-the-loop at every step.
            </p>

            {/* Key Metrics */}
            <div className="flex flex-wrap justify-center gap-8 mb-10">
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-300 mb-2">🧠</div>
                <div className="text-sm opacity-90">Context-Aware</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-300 mb-2">🔄</div>
                <div className="text-sm opacity-90">Iterative Refinement</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-300 mb-2">✓</div>
                <div className="text-sm opacity-90">Human-Approved</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:shadow-lg">
                Join Waitlist
              </button>
              <button className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold text-lg transition-all">
                Watch Demo
              </button>
            </div>

            <p className="text-sm opacity-90 italic">
              Because the best risk registers combine AI intelligence with human expertise
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Why Risk Registers Fall Short
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Every major programme has a risk register. But most are superficial, reactive, and disconnected from actual programme reality.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Generic Risks</h3>
              <p className="text-gray-600">
                'Stakeholder resistance', 'Cost overrun', 'Schedule delays' - risks so generic they could apply to any project. No programme-specific insight.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <div className="text-5xl mb-4">⏰</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Reactive Identification</h3>
              <p className="text-gray-600">
                Risks identified after problems emerge. Risk workshops miss critical threats. Experience bias limits what teams see.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <div className="text-5xl mb-4">🔗</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Poor Integration</h3>
              <p className="text-gray-600">
                Risk register disconnected from schedule, cost estimate, and delivery strategy. Contingency allocation not risk-based. Risk mitigation not in plans.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-8 border-2 border-amber-200 max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed">
              Research shows that <span className="font-bold text-amber-700">60% of risks that derail major programmes were predictable</span> but not in the risk register. The best risk identification uses comprehensive programme context - something humans struggle with but AI excels at.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Context-Aware Risk Intelligence with Human Oversight
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-4xl mx-auto">
            Risk Success analyzes your entire programme - business case, schedule, costs, procurement strategy, stakeholder landscape - to suggest comprehensive, specific risks. You review, refine, and approve every risk.
          </p>

          <div className="grid md:grid-cols-5 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-amber-100">
              <div className="text-5xl mb-4">📤</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Upload Programme Context</h3>
              <p className="text-gray-600 text-sm">
                Provide business case, schedule, cost estimate, procurement strategy, stakeholder analysis, delivery strategy, and any existing risk register
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-amber-100">
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">AI Analyzes Context</h3>
              <p className="text-gray-600 text-sm">
                AI deeply understands your programme: objectives, constraints, critical path, procurement approach, stakeholder complexity, technical challenges, organizational factors
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-amber-100">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Risk Identification</h3>
              <p className="text-gray-600 text-sm">
                AI suggests specific risks based on programme context. Not generic risks - risks specific to YOUR programme's situation, backed by evidence from your documents
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-amber-100">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Human Review & Refinement</h3>
              <p className="text-gray-600 text-sm">
                You review each suggested risk. Accept, reject, or refine. Add your own risks. AI learns from your decisions. Iterative conversation until register is complete.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-amber-100">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Response Planning</h3>
              <p className="text-gray-600 text-sm">
                For each risk, AI suggests response strategies based on programme context. You refine and approve. Actions integrate with schedule and budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Intelligent Risk Management Features
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-amber-600 text-3xl">✓</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Context-Aware Identification</h3>
                    <p className="text-gray-600">
                      AI analyzes your entire programme to suggest specific, relevant risks. Not generic lists - risks grounded in YOUR programme's reality.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-amber-600 text-3xl">✓</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Evidence-Based Risks</h3>
                    <p className="text-gray-600">
                      Every suggested risk includes evidence from your documents explaining why it's relevant. Citations with sources.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-amber-600 text-3xl">✓</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Comprehensive Coverage</h3>
                    <p className="text-gray-600">
                      AI considers all risk categories: technical, commercial, organizational, stakeholder, political, environmental, regulatory, delivery, financial.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-amber-600 text-3xl">✓</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Human-in-the-Loop</h3>
                    <p className="text-gray-600">
                      You review and approve every risk. Add your expertise. Refine descriptions. AI augments judgment, doesn't replace it.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-amber-600 text-3xl">✓</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Response Strategy Suggestions</h3>
                    <p className="text-gray-600">
                      For each risk, AI suggests mitigation, contingency, transfer, or acceptance strategies based on best practices and programme context.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-amber-600 text-3xl">✓</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Integration with Plans</h3>
                    <p className="text-gray-600">
                      Risk responses link to schedule activities, cost codes, and procurement strategies. Risks integrated into delivery, not separate.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-amber-600 text-3xl">✓</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Quantification Support</h3>
                    <p className="text-gray-600">
                      AI suggests probability and impact ratings based on programme context. You finalize. Supports quantitative risk analysis.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-amber-600 text-3xl">✓</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Continuous Intelligence</h3>
                    <p className="text-gray-600">
                      As programme evolves, AI suggests new emerging risks and flags changing risk profiles. Living risk management.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Comprehensive Risk Coverage
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-amber-500 transition-all">
              <div className="text-5xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Technical Risks</h3>
              <p className="text-gray-600 text-sm">
                Design complexity, technology maturity, interface challenges, performance requirements, innovation risks
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-amber-500 transition-all">
              <div className="text-5xl mb-4">🚧</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Delivery Risks</h3>
              <p className="text-gray-600 text-sm">
                Schedule logic, resource availability, construction sequencing, logistics, site conditions, dependencies
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-amber-500 transition-all">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Commercial Risks</h3>
              <p className="text-gray-600 text-sm">
                Procurement strategy, contract terms, supplier capability, market conditions, payment terms
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-amber-500 transition-all">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Stakeholder Risks</h3>
              <p className="text-gray-600 text-sm">
                Stakeholder alignment, political support, community opposition, agency coordination, decision-making
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-amber-500 transition-all">
              <div className="text-5xl mb-4">💷</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Financial Risks</h3>
              <p className="text-gray-600 text-sm">
                Funding availability, cost escalation, economic conditions, exchange rates, affordability
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-amber-500 transition-all">
              <div className="text-5xl mb-4">📜</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Regulatory Risks</h3>
              <p className="text-gray-600 text-sm">
                Consents and permits, changing regulations, planning conditions, environmental requirements
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-amber-500 transition-all">
              <div className="text-5xl mb-4">🏢</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Organizational Risks</h3>
              <p className="text-gray-600 text-sm">
                Team capability, organizational change, governance, decision-making authority, resource continuity
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-amber-500 transition-all">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">External Risks</h3>
              <p className="text-gray-600 text-sm">
                Economic downturn, political change, supply chain disruption, climate events, market volatility
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            The Risk Intelligence Workflow
          </h2>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-white rounded-xl p-8 border-l-4 border-amber-500">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">
                  Day 1
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Initial Risk Identification</h3>
                  <p className="text-gray-600">
                    Upload programme documents. AI analyzes context. Suggests 50-100 initial risks across all categories. Each with evidence and rationale.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-white rounded-xl p-8 border-l-4 border-amber-500">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  Day 2-3
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Human Review & Refinement</h3>
                  <p className="text-gray-600">
                    You review AI suggestions. Accept relevant risks. Reject irrelevant ones. Refine descriptions for clarity and specificity. Add risks AI missed from your expertise.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-white rounded-xl p-8 border-l-4 border-amber-500">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  Day 3-4
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Risk Elaboration</h3>
                  <p className="text-gray-600">
                    For accepted risks, AI suggests: probability and impact ratings, root causes, triggering events, early warning indicators, potential consequences.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-white rounded-xl p-8 border-l-4 border-amber-500">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  Day 5-7
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Response Planning</h3>
                  <p className="text-gray-600">
                    For each significant risk, AI suggests response strategies: mitigation actions (with schedule/cost implications), contingency plans, transfer options (insurance, contractual), risk owners.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-white rounded-xl p-8 border-l-4 border-amber-500">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  Day 7-10
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Integration & Finalization</h3>
                  <p className="text-gray-600">
                    Integrate risk responses into schedule and budget. Assign ownership. Set review frequency. Establish reporting thresholds. Finalize risk register.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-8 border-l-4 border-blue-500">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs text-center leading-tight">
                  Ongoing
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Continuous Monitoring <span className="text-gray-500 text-lg">(Monthly)</span></h3>
                  <p className="text-gray-600">
                    As programme progresses, upload updated documents. AI identifies emerging risks, changing risk profiles, and response effectiveness. Keeps register current.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Human-in-the-Loop Section */}
      <section className="py-20 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Why Human-in-the-Loop Matters
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* What AI Does Well */}
            <div className="bg-white rounded-xl p-8 border-2 border-amber-200">
              <h3 className="text-2xl font-bold mb-6 text-amber-700">What AI Does Well</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 text-2xl">✓</span>
                  <span className="text-gray-700">Comprehensive analysis of large document sets</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 text-2xl">✓</span>
                  <span className="text-gray-700">Identifying patterns across programmes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 text-2xl">✓</span>
                  <span className="text-gray-700">Systematic consideration of all risk categories</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 text-2xl">✓</span>
                  <span className="text-gray-700">Connecting risks to evidence in documents</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 text-2xl">✓</span>
                  <span className="text-gray-700">Suggesting response options from best practices</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 text-2xl">✓</span>
                  <span className="text-gray-700">Maintaining consistency and completeness</span>
                </li>
              </ul>
            </div>

            {/* What Humans Do Better */}
            <div className="bg-white rounded-xl p-8 border-2 border-blue-200">
              <h3 className="text-2xl font-bold mb-6 text-blue-700">What Humans Do Better</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-2xl">✓</span>
                  <span className="text-gray-700">Applying organizational context and politics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-2xl">✓</span>
                  <span className="text-gray-700">Understanding cultural and relationship factors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-2xl">✓</span>
                  <span className="text-gray-700">Assessing risk likelihood with local knowledge</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-2xl">✓</span>
                  <span className="text-gray-700">Judging risk tolerance and appetite</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-2xl">✓</span>
                  <span className="text-gray-700">Prioritizing based on strategic importance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-2xl">✓</span>
                  <span className="text-gray-700">Making final risk acceptance decisions</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 border-2 border-amber-200 max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              Risk Success combines AI's analytical power with human judgment. <span className="font-bold text-amber-700">AI suggests, you decide.</span> <span className="font-bold text-blue-700">AI provides evidence, you provide wisdom.</span> The result: risk registers that are both comprehensive AND credible.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            When to Use Risk Success
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-amber-50 rounded-xl p-8 border-2 border-amber-200">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">New Programme Risk Register</h3>
              <p className="text-gray-600 mb-4">
                Starting a new major programme. Need comprehensive risk register for business case or gateway review. Want systematic, thorough approach.
              </p>
              <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                <div className="font-semibold text-amber-700">Benefit:</div>
                <div className="text-gray-700">Complete, credible register in 1-2 weeks vs months</div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-8 border-2 border-amber-200">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Risk Register Refresh</h3>
              <p className="text-gray-600 mb-4">
                Existing risk register is stale and generic. Need to revitalize with programme-specific risks based on current context.
              </p>
              <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                <div className="font-semibold text-amber-700">Benefit:</div>
                <div className="text-gray-700">Evidence-based refresh, find previously missed risks</div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-8 border-2 border-amber-200">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Pre-Gateway Risk Review</h3>
              <p className="text-gray-600 mb-4">
                Approaching IPA gateway. Want independent validation that risk register is comprehensive and integrated with delivery plans.
              </p>
              <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                <div className="font-semibold text-amber-700">Benefit:</div>
                <div className="text-gray-700">Confidence that risk management meets IPA expectations</div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-8 border-2 border-amber-200">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Continuous Risk Intelligence</h3>
              <p className="text-gray-600 mb-4">
                Want ongoing AI-powered identification of emerging risks as programme evolves and context changes.
              </p>
              <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                <div className="font-semibold text-amber-700">Benefit:</div>
                <div className="text-gray-700">Proactive risk management, early warning of threats</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Risk Success vs Traditional Risk Workshops
          </h2>

          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse bg-white shadow-lg rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-amber-500 text-white">
                  <th className="p-4 text-left font-bold">Aspect</th>
                  <th className="p-4 text-left font-bold">Traditional Workshop</th>
                  <th className="p-4 text-left font-bold">Risk Success</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-900">Preparation</td>
                  <td className="p-4 text-gray-600">2-4 weeks</td>
                  <td className="p-4 text-amber-700 font-semibold">1 day (upload docs)</td>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="p-4 font-semibold text-gray-900">Coverage</td>
                  <td className="p-4 text-gray-600">Limited by time/attendees</td>
                  <td className="p-4 text-amber-700 font-semibold">Comprehensive (AI analyzes everything)</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-900">Specificity</td>
                  <td className="p-4 text-gray-600">Often generic</td>
                  <td className="p-4 text-amber-700 font-semibold">Programme-specific with evidence</td>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="p-4 font-semibold text-gray-900">Documentation</td>
                  <td className="p-4 text-gray-600">Manual, time-consuming</td>
                  <td className="p-4 text-amber-700 font-semibold">Automatic, thorough</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-900">Bias</td>
                  <td className="p-4 text-gray-600">Experience-dependent</td>
                  <td className="p-4 text-amber-700 font-semibold">Systematic, AI checks blind spots</td>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="p-4 font-semibold text-gray-900">Cost</td>
                  <td className="p-4 text-gray-600">£10K-30K (facilitation + time)</td>
                  <td className="p-4 text-amber-700 font-semibold">£5K-10K</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-900">Update Frequency</td>
                  <td className="p-4 text-gray-600">Quarterly (expensive)</td>
                  <td className="p-4 text-amber-700 font-semibold">Monthly (AI-powered)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4 font-semibold text-gray-900">Integration</td>
                  <td className="p-4 text-gray-600">Manual linking to plans</td>
                  <td className="p-4 text-amber-700 font-semibold">Automatic connection to schedule/cost</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-center text-gray-600 italic max-w-3xl mx-auto">
            Note: Risk Success complements workshops, not replaces them. Use AI for comprehensive baseline, workshops for team alignment and buy-in.
          </p>
        </div>
      </section>

      {/* Deliverables Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            What You Receive
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-amber-50 rounded-xl p-8 border-2 border-amber-200">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Risk Register</h3>
              <p className="text-gray-600 mb-4">Complete risk register with:</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 50-100+ specific, programme-relevant risks</li>
                <li>• Evidence citations for each risk</li>
                <li>• Probability and impact ratings</li>
                <li>• Risk categorization and grouping</li>
                <li>• Response strategies and actions</li>
                <li>• Risk owners and review frequency</li>
                <li>• Export to Excel, PDF, or your PMO tool</li>
              </ul>
            </div>

            <div className="bg-amber-50 rounded-xl p-8 border-2 border-amber-200">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Response Plans</h3>
              <p className="text-gray-600 mb-4">Detailed response documentation:</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Mitigation actions with schedule/cost links</li>
                <li>• Contingency plans and triggers</li>
                <li>• Risk transfer strategies</li>
                <li>• Acceptance rationale for residual risks</li>
                <li>• Early warning indicators</li>
                <li>• Contingency budget allocation logic</li>
              </ul>
            </div>

            <div className="bg-amber-50 rounded-xl p-8 border-2 border-amber-200">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Integration Pack</h3>
              <p className="text-gray-600 mb-4">Risk-plan integration:</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Schedule activities for risk responses</li>
                <li>• Cost codes for mitigation and contingency</li>
                <li>• Procurement risk allocation recommendations</li>
                <li>• Risk ownership and governance structure</li>
                <li>• Reporting templates and thresholds</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-20 bg-amber-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">
            Built on Major Programme Risk Experience
          </h2>

          <div className="bg-white rounded-xl p-8 border-2 border-amber-200">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Risk Success embodies lessons from managing risk on £100M-£3bn programmes:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-amber-600 text-xl">•</span>
                <span>Managed risk for £1.4bn Crossrail West Programme closeout</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 text-xl">•</span>
                <span>Led risk analysis for £300m King's Cross Remodelling (100-day closure)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 text-xl">•</span>
                <span>Developed risk frameworks for nuclear, rail, aviation, and infrastructure</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 text-xl">•</span>
                <span>Performed quantitative risk analysis (PRA) for major business case approvals</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 text-xl">•</span>
                <span>Integrated risk with schedule, cost, and commercial strategies</span>
              </li>
            </ul>
            <p className="text-lg text-gray-700 leading-relaxed mt-6 italic">
              Every AI suggestion is grounded in real-world risk management expertise from major UK infrastructure programmes.
            </p>
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
              Risk Success is part of Programme Insights. Upload documents once, use across all modules. Bundle and save 10-25%.
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
                name: 'Tender Success',
                icon: '📋',
                color: 'purple',
                desc: 'Evaluate supplier proposals objectively',
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
            <div className="bg-white rounded-xl p-8 border-2 border-amber-500 shadow-lg">
              <div className="text-center mb-6">
                <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full uppercase">
                  Risk Success - Coming Q3 2025
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">£30,000<span className="text-2xl text-gray-500">/year</span></div>
                <p className="text-gray-600">Annual subscription for unlimited risk intelligence</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited risk identification sessions',
                  'AI-powered risk discovery (50-100+ risks per session)',
                  'Human-AI iterative refinement',
                  'Response strategy development',
                  'Schedule/cost integration analysis',
                  'Emerging risk identification',
                  'Risk profile tracking over time',
                  'Email support',
                  'Works with other Programme Insights modules',
                  'Bundle with other modules and save 10-25%'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-amber-600 flex-shrink-0">✓</span>
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

          {/* Waitlist CTA */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Join the Waitlist - Get Early Access Discount</h3>
              <p className="text-lg mb-2 opacity-95">
                Risk Success launches Q3 2025. Join the waitlist for priority access and early bird pricing.
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
              <a href="mailto:hello@programmeinsights.co.uk?subject=Risk%20Success%20Waitlist" className="inline-block bg-white text-amber-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all">
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
                q: "Can AI really identify risks humans miss?",
                a: "Yes, but not magically. AI can systematically analyze your entire programme context (thousands of pages) and identify patterns, dependencies, and threats that humans might overlook due to time constraints or cognitive biases. However, AI doesn't replace human judgment - it augments it."
              },
              {
                q: "Will the AI-suggested risks be credible?",
                a: "Every risk includes evidence from your documents explaining why it's relevant. Risks aren't generic templates - they're specific to your programme's context. You review and refine everything, so final register reflects both AI analysis AND your expertise."
              },
              {
                q: "How does this compare to risk workshops?",
                a: "Risk Success provides comprehensive, systematic identification AI-powered. Workshops provide team alignment and buy-in. Best approach: Use Risk Success for thorough baseline, then workshop to validate, prioritize, and build ownership."
              },
              {
                q: "What if AI suggests risks we've already considered and accepted?",
                a: "Perfect. The AI doesn't know what you've decided previously. If it suggests a risk you've already accepted or mitigated, simply mark it as such with rationale. This actually strengthens your risk register by showing comprehensive consideration."
              },
              {
                q: "Can we use our own risk categorization?",
                a: "Yes. Risk Success adapts to your taxonomy, probability/impact scales, and risk management methodology. The system doesn't impose a new approach."
              },
              {
                q: "How often should we update the risk register with AI?",
                a: "Depends on programme phase and volatility. Typical: Monthly during active delivery, quarterly during stable phases. Each AI refresh considers updated programme context (new schedules, cost reports, issues, etc.)."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-8">{faq.q}</span>
                  <span className="text-amber-600 text-2xl flex-shrink-0">
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
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-amber-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Join the Risk Success Beta Programme
          </h2>
          <p className="text-xl text-center mb-8 opacity-95">
            Help shape AI-assisted risk management for major programmes. Beta participants influence roadmap and receive lifetime discounts.
          </p>

          <div className="bg-white rounded-xl p-8 max-w-2xl mx-auto mb-8">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Name" className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900" />
              <input type="email" placeholder="Email" className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900" />
              <input type="text" placeholder="Organization" className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900" />
              <input type="text" placeholder="Programme Type" className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900" />
            </div>
            <button className="w-full bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors">
              Join Beta
            </button>
          </div>

          <div className="bg-white/10 rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="font-bold text-xl mb-4 text-center">Beta Benefits</h3>
            <ul className="grid md:grid-cols-2 gap-3 text-lg">
              <li className="flex items-center gap-2">
                <span className="text-amber-300">✓</span>
                <span>25% lifetime discount</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-300">✓</span>
                <span>Priority feature requests</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-300">✓</span>
                <span>Dedicated support</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-300">✓</span>
                <span>Shape product direction</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xl font-bold mb-4">
                Programme Insights<span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              </div>
              <p className="text-sm opacity-80">AI-Powered Programme Excellence</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Success Suite</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><Link to="/gateway-success" className="hover:opacity-100 transition-opacity">Gateway Success</Link></li>
                <li><Link to="/baseline-success" className="hover:opacity-100 transition-opacity">Baseline Success</Link></li>
                <li><Link to="/tender-success" className="hover:opacity-100 transition-opacity">Tender Success</Link></li>
                <li><Link to="/risk-success" className="hover:opacity-100 transition-opacity">Risk Success</Link></li>
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
