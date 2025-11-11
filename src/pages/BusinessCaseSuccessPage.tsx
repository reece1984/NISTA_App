import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function BusinessCaseSuccessPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [openCase, setOpenCase] = useState<number | null>(null)

  const faqs = [
    {
      q: "Does AI write the business case for us?",
      a: "No. AI provides structure, guidance, and suggestions. You provide the strategic thinking, programme context, and evidence. Think of it as having an expert business case advisor available 24/7 who never charges by the hour."
    },
    {
      q: "Do we still need consultants?",
      a: "It depends. For specialized analysis (detailed economic modeling, complex options appraisal, market research), consultants add value. For business case structure, consistency, and Green Book compliance, AI handles much of what junior consultants traditionally did."
    },
    {
      q: "Will our business case be Green Book compliant?",
      a: "Business Case Success is designed to guide Green Book compliance, but you remain responsible for the quality and accuracy of your business case. AI ensures structure and methodology align with guidance, but cannot guarantee approval."
    },
    {
      q: "How does AI know about our programme?",
      a: "You provide programme context documents (preliminary business case, feasibility studies, delivery strategy, etc.). AI analyzes these to understand your programme. The more context you provide, the better AI suggestions become."
    },
    {
      q: "Can multiple people work on the business case?",
      a: "Yes. Team members can work on different cases. AI maintains consistency across all sections and flags contradictions between different authors' contributions."
    },
    {
      q: "What if we're not happy with AI suggestions?",
      a: "Every AI suggestion is just that - a suggestion. You decide what to accept, reject, or modify. AI learns from your decisions and improves suggestions over time."
    },
    {
      q: "Can we use this for business case updates/refreshes?",
      a: "Yes. Upload your existing business case, describe changes, and AI will guide update process while maintaining consistency with unchanged sections."
    }
  ]

  const fiveCases = [
    {
      title: "Strategic Case",
      icon: "🎯",
      subtitle: "The compelling case for change",
      covers: [
        "Strategic context and background",
        "Case for change (problem/opportunity)",
        "Strategic fit with organizational objectives",
        "Policy alignment (government priorities)",
        "Stakeholder analysis and engagement",
        "Scope and benefits (high-level)",
        "Constraints and dependencies",
        "High-level risks"
      ],
      aiHelps: [
        "Structures strategic narrative",
        "Suggests evidence for policy alignment",
        "Guides benefits articulation",
        "Prompts for stakeholder analysis depth"
      ]
    },
    {
      title: "Economic Case",
      icon: "💰",
      subtitle: "The best value for money",
      covers: [
        "Options appraisal (long-list to short-list)",
        "Critical success factors",
        "Detailed options analysis",
        "Cost-benefit analysis",
        "Sensitivity analysis",
        "Risk assessment and optimism bias",
        "Preferred option recommendation",
        "Value for money assessment"
      ],
      aiHelps: [
        "Structures options appraisal framework",
        "Guides cost-benefit methodology",
        "Calculates benefit-cost ratios",
        "Suggests sensitivity scenarios"
      ]
    },
    {
      title: "Commercial Case",
      icon: "💼",
      subtitle: "The deal can be done",
      covers: [
        "Procurement strategy and route",
        "Market analysis and supplier capability",
        "Sourcing options and evaluation",
        "Payment mechanisms",
        "Contract length and structure",
        "Risk allocation principles",
        "Required expertise and resources",
        "Procurement timeline"
      ],
      aiHelps: [
        "Suggests procurement approaches by programme type",
        "Guides market analysis structure",
        "Prompts for risk allocation thinking",
        "Ensures delivery strategy alignment"
      ]
    },
    {
      title: "Financial Case",
      icon: "📊",
      subtitle: "It is affordable",
      covers: [
        "Total programme costs (capital and revenue)",
        "Funding sources and availability",
        "Cashflow profile and phasing",
        "Budget impact over time",
        "Affordability assessment",
        "Financial risks and sensitivities",
        "Value for money indicators",
        "Accounting treatment"
      ],
      aiHelps: [
        "Structures financial analysis",
        "Validates calculation logic",
        "Guides affordability assessment",
        "Ensures consistency with economic case costs"
      ]
    },
    {
      title: "Management Case",
      icon: "⚙️",
      subtitle: "It is achievable",
      covers: [
        "Programme/project management approach",
        "Governance structure and decision-making",
        "Delivery strategy and phasing",
        "Benefits realization plan",
        "Risk management strategy",
        "Stakeholder engagement approach",
        "Change management and assurance",
        "Programme/project plan and milestones"
      ],
      aiHelps: [
        "Structures governance framework",
        "Guides delivery strategy development",
        "Ensures benefits plan links to strategic case",
        "Validates risk approach comprehensiveness"
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
                <span className="text-gray-900">Business Case Success</span>
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
      <section className="mt-16 bg-gradient-to-br from-blue-700 via-blue-600 to-green-500 text-white py-16 md:py-24 relative overflow-hidden">
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
              <div className="inline-block bg-green-500 px-4 py-2 rounded-lg text-sm font-semibold">
                AI-Assisted Business Case Development
              </div>
              <div className="inline-block bg-blue-500 px-4 py-2 rounded-full text-sm font-semibold">
                Coming Q4 2025
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Compelling Business Cases.<br />Evidence-Based.
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-95 max-w-3xl mx-auto">
              AI-assisted business case development aligned to HMT Green Book. Draft complete five-case models faster with expert guidance at every step.
            </p>

            {/* Key Metrics */}
            <div className="flex flex-wrap justify-center gap-8 mb-10 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                <span className="font-semibold">5 Cases</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <span className="font-semibold">Green Book Aligned</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="font-semibold">Evidence-Based</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link to="/signup" className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:shadow-lg hover:-translate-y-0.5">
                Join Waitlist
              </Link>
              <a href="#how-it-works" className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white transition-all">
                Watch Demo
              </a>
            </div>

            <p className="text-sm opacity-90 italic">
              Because great business cases combine strategic thinking with rigorous analysis
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">
            The Business Case Challenge
          </h2>
          <p className="text-center text-lg text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
            Developing a compelling business case for a major programme takes <strong>6-12 months</strong>, costs <strong>£200K+</strong> in consulting fees, and requires navigating complex HM Treasury guidance while gathering evidence from across the organization.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Complexity</h3>
              <p className="text-gray-600 leading-relaxed">
                HMT Green Book is 140 pages. Supplementary guidance adds hundreds more. Five cases require different expertise. Consistency is hard.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Evidence Gathering</h3>
              <p className="text-gray-600 leading-relaxed">
                Strategic case needs policy alignment proof. Economic case requires detailed analysis. Commercial case demands market assessment. Pulling it all together takes months.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Quality Assurance</h3>
              <p className="text-gray-600 leading-relaxed">
                Is strategic rationale clear? Is economic case robust? Is commercial strategy deliverable? Is financial case affordable? Finding gaps late is costly.
              </p>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
            <p className="text-gray-700 leading-relaxed">
              The average Outline Business Case takes <strong className="text-gray-900">6-9 months</strong> to develop and requires input from <strong className="text-gray-900">20+ people</strong> across strategy, finance, commercial, technical, and delivery teams. <strong className="text-gray-900">25%</strong> are rejected or require major revision at first approval attempt.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="how-it-works" className="py-16 md:py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              AI-Assisted Business Case Creation
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Business Case Success guides you through developing a complete five-case business case aligned to HM Treasury Green Book. AI provides structure, suggests content, and ensures consistency - you provide the strategic thinking.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                icon: '🎯',
                title: 'Strategic Case Development',
                desc: 'AI helps articulate strategic rationale, policy alignment, and case for change. Suggests evidence requirements. Guides benefits identification.'
              },
              {
                step: 2,
                icon: '💰',
                title: 'Economic Case Building',
                desc: 'AI assists with options appraisal framework, cost-benefit analysis structure, and value-for-money assessment. Ensures methodology alignment with Green Book.'
              },
              {
                step: 3,
                icon: '💼',
                title: 'Commercial Case Design',
                desc: 'AI guides procurement strategy development, market analysis, and commercial approach. Suggests contract strategy based on programme characteristics.'
              },
              {
                step: 4,
                icon: '📊',
                title: 'Financial Case Preparation',
                desc: 'AI helps structure affordability analysis, funding strategy, and budget profile. Validates financial assumptions and calculations.'
              },
              {
                step: 5,
                icon: '⚙️',
                title: 'Management Case Assembly',
                desc: 'AI assists with governance framework, delivery strategy, benefits realization plan, and risk management approach. Ensures consistency across all cases.'
              }
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
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

      {/* Key Features Section - Continued in next message due to length */}
      {/* I'll split this to avoid token limits */}

      {/* Five Cases Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            The Five-Case Model Framework
          </h2>
          <div className="space-y-4">
            {fiveCases.map((caseItem, idx) => (
              <div key={idx} className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setOpenCase(openCase === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{caseItem.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{caseItem.title}</h3>
                      <p className="text-sm text-gray-600 italic">{caseItem.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-2xl">{openCase === idx ? '−' : '+'}</span>
                </button>
                {openCase === idx && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="mb-6">
                      <p className="font-semibold text-gray-900 mb-3">What it covers:</p>
                      <ul className="space-y-2">
                        {caseItem.covers.map((item, cidx) => (
                          <li key={cidx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-green-500">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-3">How AI helps:</p>
                      <ul className="space-y-2">
                        {caseItem.aiHelps.map((item, cidx) => (
                          <li key={cidx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-green-500">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
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
              Business Case Success is part of Programme Insights. Upload documents once, use across all modules. Bundle and save 10-25%.
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
                name: 'Risk Success',
                icon: '⚠️',
                color: 'amber',
                desc: 'AI-powered risk identification',
                coming: 'Q3 2025'
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
      <section id="pricing" className="py-16 md:py-20 bg-white">
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
            <div className="bg-white rounded-xl p-8 border-2 border-green-500 shadow-lg">
              <div className="text-center mb-6">
                <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full uppercase">
                  Business Case Success - Coming Q4 2025
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">£35,000<span className="text-2xl text-gray-500">/year</span></div>
                <p className="text-gray-600">Annual subscription for unlimited business case development support</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited business case sessions (SOC, OBC, FBC)',
                  'AI-guided full five-case model development',
                  'Options identification and appraisal',
                  'Cost-benefit analysis assistance',
                  'Strategic and economic case support',
                  'Iterative refinement and updates',
                  'Interactive development dashboard',
                  'Email support',
                  'Works with other Programme Insights modules',
                  'Bundle with other modules and save 10-25%'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-500 flex-shrink-0">✓</span>
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
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Join the Waitlist - Get Early Access Discount</h3>
              <p className="text-lg mb-2 opacity-95">
                Business Case Success launches Q4 2025. Join the waitlist for priority access and early bird pricing.
              </p>
              <p className="text-xl font-bold mb-6">
                Waitlist Benefit: 20% off Year 1 (£28,000 instead of £35,000)
              </p>
              <div className="bg-white/10 rounded-lg p-6 mb-6 text-left">
                <h4 className="font-bold mb-3 text-lg">Waitlist Benefits:</h4>
                <ul className="space-y-2">
                  {[
                    'Priority access when we launch Q4 2025',
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
              <a href="mailto:hello@programmeinsights.co.uk?subject=Business%20Case%20Success%20Waitlist" className="inline-block bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all">
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
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
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
      <section className="py-16 md:py-20 bg-gradient-to-br from-blue-700 via-blue-600 to-green-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the Business Case Success Waitlist
          </h2>
          <p className="text-lg mb-8 opacity-95">
            Be among the first to use AI-assisted business case development. Early adopters receive exclusive launch benefits.
          </p>
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Name" className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500" />
              <input type="email" placeholder="Email" className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500" />
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Organization" className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500" />
              <select className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500">
                <option value="">Business Case Stage</option>
                <option value="soc">Strategic Outline Case</option>
                <option value="obc">Outline Business Case</option>
                <option value="fbc">Full Business Case</option>
                <option value="refresh">Business Case Refresh</option>
              </select>
            </div>
            <Link to="/signup" className="block w-full bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all">
              Join Waitlist
            </Link>
          </div>
          <div className="space-y-2 text-sm opacity-90">
            <p className="font-bold text-lg">Launching Q4 2025</p>
            <p className="font-semibold">Early adopter benefits:</p>
            <ul className="space-y-1">
              <li>• 30% launch discount</li>
              <li>• Priority onboarding</li>
              <li>• Influence roadmap</li>
              <li>• Dedicated support</li>
            </ul>
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
                <li><Link to="/business-case-success" className="hover:opacity-100 transition-opacity">Business Case Success</Link></li>
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
