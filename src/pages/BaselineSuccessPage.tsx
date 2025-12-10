import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function BaselineSuccessPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [openCheck, setOpenCheck] = useState<number | null>(null)

  const faqs = [
    {
      q: "Does this replace project controls consultants?",
      a: "No. Baseline Success provides rapid, comprehensive integration analysis. Consultants provide expertise in resolving complex baseline issues, stakeholder management, and detailed schedule/cost development. Many programmes will use both: AI for fast analysis, consultants for problem-solving."
    },
    {
      q: "What if my baseline is in an unusual format?",
      a: "We support all major formats, but custom structures may need adaptation. During onboarding, we'll review your data and configure the analysis appropriately. Most baselines work out-of-the-box."
    },
    {
      q: "How detailed is the analysis?",
      a: "Baseline Success analyzes every activity, cost code, and scope item. If your schedule has 5,000 activities, all 5,000 are checked. If your cost estimate has 500 cost codes, all 500 are validated. It's comprehensive, not sampled."
    },
    {
      q: "Can I use this for earned value management (EVM)?",
      a: "Yes. The integration checks ensure your baseline is EVM-ready. We validate control accounts, WBS-CBS alignment, and measurement baselines - all critical for EVM."
    },
    {
      q: "What happens if I iterate my baseline?",
      a: "Run Baseline Success again (included in price). The system tracks changes between versions, showing improvement areas and any new issues introduced."
    },
    {
      q: "Is this only for rebaselines, or also initial baselines?",
      a: "Both. Whether developing your first baseline or rebaselining after years of delivery, Baseline Success validates integration quality."
    }
  ]

  const integrationChecks = [
    {
      title: "Time-Cost Integration ⏱️💷",
      desc: "Every schedule activity must have cost allocation. Cost phasing must align with schedule milestones. Resource loading must match both time and cost plans.",
      checks: [
        "Activities without cost codes",
        "Cost codes without activities",
        "Phasing mismatches (schedule vs cost S-curves)",
        "Resource hour-rate inconsistencies",
        "Milestone-invoice alignment"
      ]
    },
    {
      title: "WBS-CBS Mapping 📊",
      desc: "Work Breakdown Structure and Cost Breakdown Structure must be perfectly aligned. No orphaned work packages or cost accounts.",
      checks: [
        "WBS elements without CBS codes",
        "CBS codes without WBS elements",
        "Hierarchy consistency (same level structure)",
        "Control account definitions",
        "Summary level roll-ups"
      ]
    },
    {
      title: "Risk-Contingency Logic 🎲",
      desc: "Risk register must inform contingency allocation. Identified risks should map to cost and schedule contingency.",
      checks: [
        "Quantified risks vs contingency amounts",
        "Schedule contingency vs risk impacts",
        "P50/P80 alignment",
        "Risk register completeness",
        "Mitigation cost allocation"
      ]
    },
    {
      title: "Scope-Schedule Mapping 🎯",
      desc: "Every scope element must have schedule deliverable(s). Deliverables must have clear completion criteria.",
      checks: [
        "Scope items without schedule activities",
        "Deliverables without scope definition",
        "Completion criteria clarity",
        "Acceptance procedures",
        "Handover sequence logic"
      ]
    },
    {
      title: "Resource-Organization Consistency 👥",
      desc: "Resource assignments must match organizational structure. Roles and responsibilities must be clear.",
      checks: [
        "Resources without org chart mapping",
        "Role definition consistency",
        "Authority levels alignment",
        "Resource availability vs schedule",
        "Team structure vs OBS"
      ]
    },
    {
      title: "Change Control Baseline 📋",
      desc: "Baseline must be clearly defined and measurable. Change control procedures must be documented.",
      checks: [
        "Time baseline definition and measurement",
        "Cost baseline definition and measurement",
        "Scope baseline definition and measurement",
        "Change control process documentation",
        "Variance thresholds and triggers"
      ]
    },
    {
      title: "Baseline Credibility 🎖️",
      desc: "Overall baseline must be realistic, achievable, and aligned with programme objectives.",
      checks: [
        "Schedule float and criticality",
        "Cost estimate basis of estimate",
        "Scope definition completeness",
        "Risk identification comprehensiveness",
        "Stakeholder alignment evidence"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/programmeinsights" className="flex items-center gap-2 text-xl font-bold text-gray-900">
                Programme Insights<span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              </Link>
              <div className="hidden md:flex items-center text-sm text-gray-500">
                <Link to="/programmeinsights" className="hover:text-blue-600">Home</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-400">Success Suite</span>
                <span className="mx-2">/</span>
                <span className="text-gray-900">Baseline Success</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/programmeinsights#products" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Products</Link>
              <Link to="/programmeinsights#about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About</Link>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Pricing</a>
              <Link to="/programmeinsights#contact" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact</Link>
              <Link to="/signup" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-all hover:shadow-md hover:-translate-y-0.5">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-0.5 bg-gray-900 mb-1"></div>
              <div className="w-6 h-0.5 bg-gray-900 mb-1"></div>
              <div className="w-6 h-0.5 bg-gray-900"></div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4">
            <div className="flex flex-col gap-4">
              <Link to="/programmeinsights#products" className="text-gray-600 hover:text-blue-600 font-medium">Products</Link>
              <Link to="/programmeinsights#about" className="text-gray-600 hover:text-blue-600 font-medium">About</Link>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium">Pricing</a>
              <Link to="/programmeinsights#contact" className="text-gray-600 hover:text-blue-600 font-medium">Contact</Link>
              <Link to="/signup" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold text-center">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="mt-16 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%)
            `,
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px'
          }}></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="inline-block bg-cyan-500 px-4 py-2 rounded-lg text-sm font-semibold">
                AI-Powered Baseline Review
              </div>
              <div className="inline-block bg-blue-500 px-4 py-2 rounded-full text-sm font-semibold">
                Coming Q2 2025
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Integrated Baselines.<br />Confident Delivery.
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-95 max-w-3xl mx-auto">
              AI-powered baseline health checks ensuring perfect integration across time, cost, and scope. Identify gaps before they derail your programme.
            </p>

            {/* Key Metrics */}
            <div className="flex flex-wrap justify-center gap-8 mb-10 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span className="font-semibold">15 Min Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                <span className="font-semibold">7 Integration Checks</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <span className="font-semibold">3 Baseline Components</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link to="/signup" className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:shadow-lg hover:-translate-y-0.5">
                Join Waitlist
              </Link>
              <a href="#how-it-works" className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white transition-all">
                Watch Demo
              </a>
            </div>

            <p className="text-sm opacity-90 italic">
              Built by baseline experts who've led major programme rebaselines on £1bn+ projects
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">
            Why Programme Baselines Fail
          </h2>
          <p className="text-center text-lg text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
            Every major programme rebaseline takes <strong>6-12 months</strong> and costs <strong>£200K+</strong> in consulting fees. Yet 40% still receive red ratings at approval due to one critical issue: <strong>poor integration</strong>.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Schedule Disconnect</h3>
              <p className="text-gray-600 leading-relaxed">
                Schedule dates don't align with cost phasing. Critical path activities missing cost codes. Milestone logic contradicts scope delivery sequence.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">💷</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Cost Gaps</h3>
              <p className="text-gray-600 leading-relaxed">
                Cost estimate structure doesn't match WBS. Contingency allocation ignores schedule risks. Resource loading inconsistent with org chart.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Scope Drift</h3>
              <p className="text-gray-600 leading-relaxed">
                Scope definition too vague for costing. Deliverables not mapped to schedule. Change control baseline unclear.
              </p>
            </div>
          </div>

          <div className="bg-cyan-50 border-l-4 border-cyan-500 p-6 rounded-r-lg">
            <p className="text-gray-700 leading-relaxed">
              The most common reason for baseline rejection isn't bad data - it's <strong className="text-gray-900">poor integration between time, cost, and scope</strong>. Senior reviewers immediately spot inconsistencies that teams miss after months of work.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="how-it-works" className="py-16 md:py-20 bg-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              AI-Powered Integration Analysis in Minutes
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Baseline Success analyzes your schedule, cost estimate, and scope documents to identify integration gaps before your approval review
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                icon: '📤',
                title: 'Upload Baseline Documents',
                desc: 'Upload your project schedule (P6, MSP), cost estimate (Excel, PDF), scope definition, WBS, OBS, risk register, and delivery strategy'
              },
              {
                step: 2,
                icon: '🔗',
                title: 'Integration Analysis',
                desc: 'AI checks 7 critical integration points: schedule-cost alignment, risk-contingency logic, WBS-CBS consistency, scope-schedule mapping, and more'
              },
              {
                step: 3,
                icon: '⚠️',
                title: 'Gap Identification',
                desc: 'Receive detailed findings on every inconsistency: missing cost codes, schedule logic gaps, scope-cost mismatches, risk allocation issues'
              },
              {
                step: 4,
                icon: '✅',
                title: 'Recommendations',
                desc: 'Get specific guidance to fix each integration gap before your baseline approval review or IPA gateway'
              }
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <div className="text-5xl mb-4 mt-2">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Comprehensive Baseline Health Checks
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Schedule-Cost Integration',
                desc: 'Validates every schedule activity has a cost allocation. Checks phasing alignment. Identifies missing cost codes and resource loading gaps.'
              },
              {
                title: 'WBS-CBS Consistency',
                desc: 'Ensures Work Breakdown Structure perfectly maps to Cost Breakdown Structure. No orphaned costs or activities.'
              },
              {
                title: 'Risk-Contingency Alignment',
                desc: 'Checks if contingency allocation reflects identified risks. Validates risk register ties to cost estimate and schedule buffers.'
              },
              {
                title: 'Scope-Deliverable Mapping',
                desc: 'Confirms every scope item has schedule deliverable. Validates completion criteria. Checks acceptance definitions.'
              },
              {
                title: 'Change Control Baseline',
                desc: 'Ensures baseline is clearly defined for time, cost, and scope. Validates change control procedures. Checks measurement baseline.'
              },
              {
                title: 'Critical Path Analysis',
                desc: 'Reviews schedule logic and constraints. Identifies missing dependencies. Validates critical path credibility.'
              },
              {
                title: 'Resource-Org Structure',
                desc: 'Checks resource assignments match org chart. Validates roles and responsibilities. Identifies resource conflicts.'
              },
              {
                title: 'Baseline Quality Score',
                desc: 'Overall health rating (0-100%) with dimension breakdown. Tracks improvement over iterations. Benchmarks against best practice.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="text-cyan-500 text-2xl font-bold flex-shrink-0">✓</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Checks Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Seven Critical Integration Points Analyzed
          </h2>
          <div className="space-y-4">
            {integrationChecks.map((check, idx) => (
              <div key={idx} className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setOpenCheck(openCheck === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors flex justify-between items-center"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-cyan-600 font-bold">CHECK {idx + 1}:</span>
                    <span>{check.title}</span>
                  </span>
                  <span className="text-2xl">{openCheck === idx ? '−' : '+'}</span>
                </button>
                {openCheck === idx && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed mb-4">{check.desc}</p>
                    <p className="font-semibold text-gray-900 mb-2">What we check:</p>
                    <ul className="space-y-2">
                      {check.checks.map((item, cidx) => (
                        <li key={cidx} className="flex items-start gap-2 text-gray-700">
                          <span className="text-cyan-500">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            When to Use Baseline Success
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: '✅',
                title: 'Before Baseline Approval',
                desc: 'Pre-submission health check before seeking SRO or board approval. Identify integration gaps while there\'s still time to fix them.',
                timing: '2-4 weeks before approval',
                benefit: 'Avoid embarrassing rejections'
              },
              {
                icon: '🔄',
                title: 'During Rebaseline Development',
                desc: 'Iterative checks during 6-12 month rebaseline process. Catch issues early when they\'re easy to fix.',
                timing: 'Monthly during rebaseline',
                benefit: 'Stay on track, avoid rework'
              },
              {
                icon: '🚪',
                title: 'Before IPA Gateway Review',
                desc: 'Final validation before Gate 1 or Gate 3 review. Ensure your baseline meets IPA expectations.',
                timing: '1 month before gateway',
                benefit: 'Confidence in review readiness'
              },
              {
                icon: '🔍',
                title: 'After Consultant Delivery',
                desc: 'Independent verification of consultant-developed baselines. Ensure you\'re getting what you paid for.',
                timing: 'Before consultant sign-off',
                benefit: 'Quality assurance, accountability'
              }
            ].map((scenario, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 hover:border-cyan-500 hover:shadow-lg transition-all">
                <div className="text-5xl mb-4">{scenario.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{scenario.title}</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">{scenario.desc}</p>
                <div className="space-y-2 text-sm">
                  <p><strong className="text-gray-900">Timing:</strong> <span className="text-gray-600">{scenario.timing}</span></p>
                  <p><strong className="text-gray-900">Benefit:</strong> <span className="text-gray-600">{scenario.benefit}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 md:py-20 bg-cyan-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Baseline Success vs Traditional Consulting
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left font-bold text-gray-900">Aspect</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-900">Traditional Consulting</th>
                    <th className="px-6 py-4 text-left font-bold text-cyan-900 bg-cyan-50">Baseline Success</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { aspect: 'Timeline', traditional: '6-12 months', baseline: '15 minutes' },
                    { aspect: 'Cost', traditional: '£200K-500K', baseline: '£15K-25K' },
                    { aspect: 'Consistency', traditional: 'Varies by consultant', baseline: 'Objective, repeatable' },
                    { aspect: 'Iterations', traditional: 'Limited (time/cost)', baseline: 'Unlimited' },
                    { aspect: 'Depth', traditional: 'Manual sampling', baseline: 'Comprehensive analysis' },
                    { aspect: 'Transparency', traditional: 'Black box', baseline: 'Full evidence trail' },
                    { aspect: 'Speed', traditional: 'Slow (manual work)', baseline: 'Instant (AI-powered)' }
                  ].map((row, idx) => (
                    <tr key={idx} className="border-t border-gray-200">
                      <td className="px-6 py-4 font-semibold text-gray-900">{row.aspect}</td>
                      <td className="px-6 py-4 text-gray-600">{row.traditional}</td>
                      <td className="px-6 py-4 text-cyan-900 bg-cyan-50 font-semibold">{row.baseline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-6 italic">
            Baseline Success complements consulting, not replaces it. Use AI for rapid analysis, consultants for complex problem-solving.
          </p>
        </div>
      </section>

      {/* Deliverables Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            What You Receive
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Integration Dashboard',
                desc: 'Real-time visualization of integration health across all 7 checkpoints. RAG ratings per dimension. Drill-down to specific gaps.',
                icon: '📊'
              },
              {
                title: 'Gap Analysis Report',
                desc: 'Detailed findings for each integration issue: what\'s wrong, where it appears, why it matters, how to fix it. Evidence citations included.',
                icon: '📋'
              },
              {
                title: 'Remediation Roadmap',
                desc: 'Prioritized action plan with effort estimates. Critical path for baseline improvement. Track progress over iterations.',
                icon: '🗺️'
              }
            ].map((deliverable, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <div className="text-6xl mb-4">{deliverable.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{deliverable.title}</h3>
                <p className="text-gray-600 leading-relaxed">{deliverable.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Built for Complex Programme Data
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Supported Formats</h3>
              <p className="text-gray-700 mb-4">Baseline Success natively understands:</p>

              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Schedule Formats:</p>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500">•</span>
                      <span>Primavera P6 (XER, XML)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500">•</span>
                      <span>Microsoft Project (MPP, XML)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500">•</span>
                      <span>Excel schedules</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-gray-900 mb-2">Cost Formats:</p>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500">•</span>
                      <span>Excel estimates (any structure)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500">•</span>
                      <span>PDF cost reports</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500">•</span>
                      <span>CSV data exports</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-gray-900 mb-2">Document Formats:</p>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500">•</span>
                      <span>PDF (scope, WBS, OBS, risk registers)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500">•</span>
                      <span>Word documents (procedures, definitions)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500">•</span>
                      <span>PowerPoint (summary presentations)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Analysis Approach</h3>
              <p className="text-gray-700 mb-4">Multi-Document RAG Architecture:</p>
              <ol className="space-y-3">
                {[
                  'Parses schedules to extract activities, logic, resources',
                  'Analyzes cost estimates for structure and phasing',
                  'Reviews scope documents for deliverable definitions',
                  'Cross-references all sources for integration',
                  'Applies 15+ years of baseline expertise via AI',
                  'Generates evidence-based findings'
                ].map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 bg-cyan-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <p className="text-gray-700 mt-4 italic">
                Same Azure OpenAI UK platform as Gateway Success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Built by Baseline Experts
          </h2>
          <div className="bg-cyan-50 border-l-4 border-cyan-500 p-8 rounded-r-xl">
            <p className="text-gray-700 leading-relaxed mb-6">
              Baseline Success embodies 15+ years of major programme baseline experience:
            </p>
            <ul className="space-y-3 text-gray-700 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-cyan-600">•</span>
                <span>Led critical re-baseline for £1bn+ Geological Disposal Facility programme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600">•</span>
                <span>Delivered project controls procedures for Great British Nuclear SMR Programme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600">•</span>
                <span>Developed unified controls strategy for £3bn HS2 Euston Partnership</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600">•</span>
                <span>Managed integrated planning for £300m King's Cross Remodelling (100-day closure)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600">•</span>
                <span>Led early closeout of £1.4bn Crossrail West Programme</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Every check, every rule, every recommendation comes from real-world baseline challenges on major UK infrastructure programmes.
            </p>
            <p className="text-gray-900 font-semibold">
              Built by PMO professionals with 20+ years of project controls and baseline leadership across major UK infrastructure
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
              Baseline Success is part of Programme Insights. Upload documents once, use across all modules. Bundle and save 10-25%.
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
                name: 'Tender Success',
                icon: '📋',
                color: 'purple',
                desc: 'Evaluate supplier proposals objectively',
                coming: 'Q3 2025'
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
      <section id="pricing" className="py-16 md:py-20 bg-cyan-50">
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
            <div className="bg-white rounded-xl p-8 border-2 border-cyan-500 shadow-lg">
              <div className="text-center mb-6">
                <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full uppercase">
                  Baseline Success - Coming Q2 2025
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">£35,000<span className="text-2xl text-gray-500">/year</span></div>
                <p className="text-gray-600">Annual subscription for unlimited baseline reviews</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited baseline health checks',
                  'Full 7-point integration analysis',
                  'Unlimited documents',
                  'Interactive dashboard with trend analysis',
                  'PDF reports with evidence citations',
                  'Progress tracking across rebaseline cycles',
                  'Email support',
                  'Works with other Programme Insights modules',
                  'Bundle with other modules and save 10-25%'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-cyan-500 flex-shrink-0">✓</span>
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
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Join the Waitlist - Get Early Access Discount</h3>
              <p className="text-lg mb-2 opacity-95">
                Baseline Success launches Q2 2025. Join the waitlist for priority access and early bird pricing.
              </p>
              <p className="text-xl font-bold mb-6">
                Waitlist Benefit: 20% off Year 1 (£28,000 instead of £35,000)
              </p>
              <div className="bg-white/10 rounded-lg p-6 mb-6 text-left">
                <h4 className="font-bold mb-3 text-lg">Waitlist Benefits:</h4>
                <ul className="space-y-2">
                  {[
                    'Priority access when we launch Q2 2025',
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
              <a href="mailto:hello@programmeinsights.co.uk?subject=Baseline%20Success%20Waitlist" className="inline-block bg-white text-cyan-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all">
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
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors flex justify-between items-center"
                >
                  <span>{faq.q}</span>
                  <span className="text-2xl">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 py-4 bg-gray-50 text-gray-700 leading-relaxed border-t border-gray-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the Baseline Success Waitlist
          </h2>
          <p className="text-lg mb-8 opacity-95">
            Be the first to access Baseline Success when it launches in Q2 2025. Early adopters receive 25% launch discount.
          </p>
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Name" className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-cyan-500" />
              <input type="email" placeholder="Email" className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-cyan-500" />
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Organization" className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-cyan-500" />
              <input type="text" placeholder="Programme Size (e.g., £500m)" className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-cyan-500" />
            </div>
            <Link to="/signup" className="block w-full bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all">
              Join Waitlist
            </Link>
          </div>
          <div className="space-y-2 text-sm opacity-90">
            <p><strong>Launch Roadmap:</strong></p>
            <p>Q1 2025: Beta testing with select programmes</p>
            <p>Q2 2025: General availability</p>
            <p>Q3 2025: P6 advanced features</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/programmeinsights" className="flex items-center gap-2 text-xl font-bold mb-4">
                Programme Insights<span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              </Link>
              <p className="text-sm opacity-80">AI-Powered Programme Excellence</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Success Suite</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><Link to="/gateway-success" className="hover:opacity-100 transition-opacity">Gateway Success</Link></li>
                <li><Link to="/baseline-success" className="hover:opacity-100 transition-opacity">Baseline Success</Link></li>
                <li><Link to="/programmeinsights#products" className="hover:opacity-100 transition-opacity">Tender Success</Link></li>
                <li><Link to="/programmeinsights#products" className="hover:opacity-100 transition-opacity">Risk Success</Link></li>
                <li><Link to="/programmeinsights#products" className="hover:opacity-100 transition-opacity">Business Case Success</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><Link to="/programmeinsights#about" className="hover:opacity-100 transition-opacity">About</Link></li>
                <li><a href="#pricing" className="hover:opacity-100 transition-opacity">Pricing</a></li>
                <li><Link to="/programmeinsights#contact" className="hover:opacity-100 transition-opacity">Contact</Link></li>
                <li><Link to="/login" className="hover:opacity-100 transition-opacity">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#how-it-works" className="hover:opacity-100 transition-opacity">How It Works</a></li>
                <li><Link to="/programmeinsights#about" className="hover:opacity-100 transition-opacity">Security & Compliance</Link></li>
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
