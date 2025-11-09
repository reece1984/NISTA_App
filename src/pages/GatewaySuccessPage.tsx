import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function GatewaySuccessPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "Is this the same as IPA Scout?",
      a: "No. IPA Scout is the official tool used by IPA reviewers during formal gateway reviews. Gateway Success uses the same underlying technology (Azure OpenAI UK, RAG architecture) but is designed for programme teams to prepare BEFORE the official review. Think of it as a pre-flight check before the real review."
    },
    {
      q: "Will IPA accept assessments from Gateway Success?",
      a: "Gateway Success is a preparation tool, not a replacement for official IPA reviews. It helps you identify and address gaps before your formal review. Many programmes use consultant-led mock reviews - this provides similar value but faster, more comprehensive, and more affordable."
    },
    {
      q: "How accurate are the assessments?",
      a: "Our AI uses the same criteria and evaluation approach as IPA Scout. However, official IPA reviews include human judgment and context we cannot replicate. Gateway Success identifies objective gaps in documentation - the final assessment quality depends on how you address those gaps."
    },
    {
      q: "What documents do I need to upload?",
      a: "This varies by gate type, but generally includes: business cases, project plans, schedules, cost estimates, risk registers, procurement strategies, governance frameworks, benefits plans, and stakeholder engagement documentation. The more complete your documentation, the more accurate the assessment."
    },
    {
      q: "Is my data secure?",
      a: "Yes. All processing happens on UK infrastructure (Azure UK regions). Data is encrypted in transit and at rest. We offer self-hosted deployment for maximum security. Your documents are never used to train AI models (contractual guarantee from Microsoft)."
    },
    {
      q: "How long does an assessment take?",
      a: "Document upload and processing typically takes 1-2 minutes per document. AI analysis runs in 1-2 minutes. Report generation is instant. Total time: 5-10 minutes for most projects."
    },
    {
      q: "Can I use this for non-UK projects?",
      a: "Gateway Success is specifically designed for UK IPA gateway reviews using NISTA criteria. It may provide value for other contexts, but the assessment framework is UK-focused."
    },
    {
      q: "What happens after the assessment?",
      a: "You receive detailed findings and recommendations. You address gaps in your documentation. You can run the assessment again (included in price) to verify improvements before your official IPA review."
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
                <span className="text-gray-900">Gateway Success</span>
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
      <section className="mt-16 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white py-16 md:py-24 relative overflow-hidden">
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
            <div className="inline-block bg-orange-500 px-4 py-2 rounded-lg text-sm font-semibold mb-6">
              AI-Powered NISTA Assessments
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Pass Your NISTA Gate Review.<br />First Time.
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-95 max-w-3xl mx-auto">
              AI-powered readiness assessments for Gate 0, Gate 1, PAR, and Gate 3. Identify gaps before the IPA does.
            </p>

            {/* Key Metrics */}
            <div className="flex flex-wrap justify-center gap-8 mb-10 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏱️</span>
                <span className="font-semibold">2 Min Assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                <span className="font-semibold">70+ NISTA Criteria</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚪</span>
                <span className="font-semibold">4 Gate Types</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link to="/signup" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:shadow-lg hover:-translate-y-0.5">
                Schedule a Demo
              </Link>
              <a href="#how-it-works" className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white transition-all">
                See How It Works
              </a>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm opacity-90">
              <span className="text-green-400">✓</span>
              <span>Same technology as IPA Scout</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Why Gateway Reviews Fail
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              {[
                'Incomplete documentation',
                'Inconsistent evidence',
                'Poor stakeholder engagement records',
                'Weak options appraisal',
                'Integration gaps across five cases'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-gray-700">
                  <span className="text-red-500 text-xl">❌</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[
                'Missing strategic alignment evidence',
                'Unclear benefits realization plans',
                'Inadequate risk identification',
                'Procurement strategy weaknesses',
                'No objective self-assessment'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-gray-700">
                  <span className="text-red-500 text-xl">❌</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-gray-900">30% of major projects</strong> receive red or amber ratings at gateway reviews, causing delays, reputational damage, and additional costs of <strong className="text-gray-900">£250K+</strong> for remediation.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 md:py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Know Exactly What IPA Scout Will Find - Before Your Review
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Gateway Success uses the same AI technology as IPA Scout to assess your documentation against all NISTA criteria
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                icon: '📤',
                title: 'Upload Documents',
                desc: 'Upload up to 50 project documents: business cases, plans, schedules, risk registers, procurement strategies, and supporting evidence'
              },
              {
                step: 2,
                icon: '🤖',
                title: 'AI Analysis',
                desc: 'Our AI analyzes your documents against 70+ official NISTA criteria using Azure OpenAI UK - the same technology powering IPA Scout'
              },
              {
                step: 3,
                icon: '🔍',
                title: 'Gap Identification',
                desc: "Receive detailed findings for each criterion: what's strong (green), what needs work (amber), and what's missing (red)"
              },
              {
                step: 4,
                icon: '✅',
                title: 'Action Plan',
                desc: 'Get specific, evidence-based recommendations to address each gap before your official IPA review'
              }
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
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

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Everything You Need for Gateway Review Preparation
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: '70+ NISTA Criteria Assessment',
                desc: 'Comprehensive evaluation across Strategic, Economic, Commercial, Financial, and Management cases'
              },
              {
                title: 'Four Gateway Types Supported',
                desc: 'Gate 0 (Strategic Assessment), Gate 1 (Business Justification), Gate 3 (Investment Decision), PAR (Project Assessment Review)'
              },
              {
                title: 'Multi-Document Analysis',
                desc: 'Upload and analyze up to 50 documents simultaneously for complete programme assessment'
              },
              {
                title: 'Same Technology as IPA Scout',
                desc: 'Built on Azure OpenAI UK - the exact platform used by the Infrastructure & Projects Authority'
              },
              {
                title: 'Evidence-Based Findings',
                desc: 'Every assessment includes specific evidence citations from your documents'
              },
              {
                title: 'RAG-Rated Results',
                desc: 'Clear red/amber/green ratings for each criterion with confidence scores'
              },
              {
                title: 'Actionable Recommendations',
                desc: 'Specific guidance on addressing gaps, not vague suggestions'
              },
              {
                title: 'UK Data Residency',
                desc: 'All processing on UK infrastructure, Official Sensitive compatible, self-hosted option available'
              }
            ].map((feature, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="text-green-500 text-2xl font-bold flex-shrink-0">✓</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Types Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Four Assessment Types, One Platform
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: '🎯',
                title: 'Gate 0 - Strategic Assessment',
                criteria: '15 strategic criteria',
                desc: 'Assessing project viability, strategic fit, and stakeholder alignment before commitment',
                docs: 'Strategic Outline Case, Benefits Summary, Stakeholder Engagement Plan'
              },
              {
                icon: '💼',
                title: 'Gate 1 - Business Justification',
                criteria: '30 five-case model criteria',
                desc: 'Evaluating business case quality before formal approval to proceed',
                docs: 'Outline Business Case, Project Execution Plan, Procurement Strategy, Risk Register'
              },
              {
                icon: '💰',
                title: 'Gate 3 - Investment Decision',
                criteria: '25 procurement criteria',
                desc: 'Assessing readiness before contract award and major expenditure',
                docs: 'Full Business Case, Contract Strategy, Financial Model, Project Schedule'
              },
              {
                icon: '📊',
                title: 'PAR - Project Assessment Review',
                criteria: '50 comprehensive criteria',
                desc: 'Reviewing ongoing project health and delivery confidence',
                docs: 'Current Business Case, PMO Documentation, Progress Reports, Updated Risk Register'
              }
            ].map((gate, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all">
                <div className="text-5xl mb-4">{gate.icon}</div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{gate.title}</h3>
                <p className="text-sm text-blue-600 font-semibold mb-3">{gate.criteria}</p>
                <p className="text-gray-700 mb-4">{gate.desc}</p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong className="text-gray-900">Documents needed:</strong> {gate.docs}
                </p>
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1">
                  View Criteria →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section id="how-it-works" className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            From Upload to Action Plan in Minutes
          </h2>
          <div className="space-y-8">
            {[
              {
                time: 'MINUTE 0-1',
                title: 'Document Upload',
                desc: 'Drag and drop your PDFs. Categorize by type (Business Case, Risk Register, etc.). System validates and processes.'
              },
              {
                time: 'MINUTE 1-2',
                title: 'AI Assessment',
                desc: 'AI analyzes documents against NISTA criteria. Searches for evidence. Evaluates completeness and quality. Identifies gaps.'
              },
              {
                time: 'MINUTE 2-3',
                title: 'Results Generation',
                desc: 'Comprehensive assessment report generated. RAG ratings assigned. Evidence extracted. Recommendations formulated.'
              },
              {
                time: 'MINUTE 3+',
                title: 'Action Planning',
                desc: 'Review detailed findings. Prioritize gaps. Assign remediation tasks. Track progress toward readiness.'
              }
            ].map((step, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="w-32 h-20 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                    {step.time}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables Section */}
      <section className="py-16 md:py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            What You Receive
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Interactive Dashboard',
                desc: 'Real-time assessment results with RAG distribution, dimension breakdown, and priority actions. Filter, search, and drill down.',
                icon: '📊'
              },
              {
                title: 'Executive PDF Report',
                desc: 'Professional 3-4 page report: executive summary, key findings, critical issues, and recommendations. Board-ready.',
                icon: '📄'
              },
              {
                title: 'Detailed Analysis',
                desc: 'Criterion-by-criterion breakdown with findings, evidence citations, confidence scores, and specific remediation guidance.',
                icon: '🔍'
              }
            ].map((deliverable, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-6xl mb-4">{deliverable.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{deliverable.title}</h3>
                <p className="text-gray-600">{deliverable.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Built on Proven, Secure Technology
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Technology Stack</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Gateway Success uses the same core technology as IPA Scout:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Azure OpenAI UK (UK South/West regions)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>PostgreSQL (structured data)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>ChromaDB (vector embeddings)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Self-hosted deployment option</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Docker-based architecture</span>
                </li>
              </ul>
              <p className="text-gray-700 mt-4 italic">
                This isn't experimental - it's the proven technology IPA uses to review major projects.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Security & Compliance</h3>
              <div className="space-y-3">
                {[
                  'UK G-Cloud Certified (Azure OpenAI UK)',
                  'UK Data Residency (all processing in UK)',
                  'Official Sensitive Compatible',
                  'No Data Used for AI Training (contractual guarantee)',
                  'Self-Hosted Deployment Available',
                  'Audit Logging & Access Controls',
                  'Encryption at Rest and in Transit'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
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
              Gateway Success is part of Programme Insights. Upload documents once, use across all modules. Bundle and save 10-25%.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
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
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Coming {module.coming}
                </span>
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
      <section id="pricing" className="py-16 md:py-20 bg-gray-50">
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
            <div className="bg-white rounded-xl p-8 border-2 border-orange-500 shadow-lg">
              <div className="text-center mb-6">
                <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full uppercase">
                  Gateway Success - Available Now
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">£40,000<span className="text-2xl text-gray-500">/year</span></div>
                <p className="text-gray-600">Annual subscription for unlimited assessments</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited NISTA assessments (Gate 0, 1, 3, PAR)',
                  'Support for all 4 gate types',
                  'Up to 50 documents per assessment',
                  'Interactive dashboard with RAG ratings',
                  'PDF reports with evidence citations',
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

          {/* Pilot Programme CTA */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Join Our Pilot Programme - Save 25%</h3>
              <p className="text-lg mb-2 opacity-95">
                Gateway Success is available NOW. First 10 programmes get 25% off Year 1.
              </p>
              <p className="text-xl font-bold mb-6">
                Pilot Price: £30,000/year (normally £40,000)
              </p>
              <div className="bg-white/10 rounded-lg p-6 mb-6 text-left">
                <h4 className="font-bold mb-3 text-lg">Pilot Benefits:</h4>
                <ul className="space-y-2">
                  {[
                    'Everything in standard plan',
                    'Priority feature requests',
                    'Direct access to product team',
                    'Case study opportunity (optional)',
                    'Lock in pilot pricing for Year 2 (optional renewal)'
                  ].map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="flex-shrink-0">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a href="mailto:hello@programmeinsights.co.uk?subject=Gateway%20Success%20Pilot%20Programme" className="inline-block bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all">
                Apply for Pilot Programme →
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
      <section className="py-16 md:py-20 bg-gradient-to-br from-blue-700 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See Gateway Success in Action
          </h2>
          <p className="text-lg mb-8 opacity-95">
            Schedule a 30-minute demo to see how Gateway Success identifies gaps in real project documentation
          </p>
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Name" className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500" />
              <input type="email" placeholder="Email" className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500" />
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Organization" className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500" />
              <input type="date" placeholder="Preferred Date" className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500" />
            </div>
            <Link to="/signup" className="block w-full bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all">
              Schedule Demo
            </Link>
          </div>
          <p className="text-lg opacity-90">
            Or email us: <a href="mailto:hello@programmeinsights.co.uk" className="underline hover:no-underline">hello@programmeinsights.co.uk</a>
          </p>
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
                <li><Link to="/programmeinsights#products" className="hover:opacity-100 transition-opacity">Baseline Success</Link></li>
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
