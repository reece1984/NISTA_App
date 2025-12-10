import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function CorporateHomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/programmeinsights" className="flex items-center gap-2 text-xl font-bold text-gray-900">
              Programme Insights<span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#products" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Products</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">FAQ</a>
              <Link to="/gateway-success" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-all hover:shadow-md hover:-translate-y-0.5">
                Start with Gateway Success
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
              <a href="#products" className="text-gray-600 hover:text-blue-600 font-medium">Products</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 font-medium">About</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 font-medium">FAQ</a>
              <Link to="/gateway-success" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold text-center">
                Start with Gateway Success
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="mt-16 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white py-20 md:py-32 relative overflow-hidden">
        {/* Pattern Background */}
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

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              The AI Platform for Major UK Infrastructure Programmes
            </h1>
            <p className="text-lg md:text-xl mb-4 opacity-95 max-w-4xl mx-auto leading-relaxed">
              One platform. Five powerful modules. Complete programme confidence.
            </p>
            <p className="text-lg mb-8 opacity-90 max-w-3xl mx-auto">
              Module-based AI tools for programme directors managing £100M+ projects. Start with what you need, expand when ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/gateway-success" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:shadow-lg hover:-translate-y-0.5">
                Start with Gateway Success
              </Link>
              <a href="#pricing" className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white transition-all">
                See Pricing
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm opacity-90">
              <div className="flex items-center gap-2">✓ UK Data Residency</div>
              <div className="flex items-center gap-2">✓ Same Technology as IPA Scout</div>
              <div className="flex items-center gap-2">✓ 20+ Years PMO Expertise</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Major Programme Directors Face Critical Challenges
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Gateway Review Failures</h3>
              <p className="text-gray-600">30%+ of NISTA/PAR reviews receive red or amber ratings, delaying programmes and damaging credibility.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">⏱️</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Time-Consuming Manual Processes</h3>
              <p className="text-gray-600">Traditional preparation takes 6-12 months and costs £200K+, with no guarantee of success.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">No Early Warning System</h3>
              <p className="text-gray-600">Teams don't know what IPA Scout will find until it's too late to address gaps properly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            One Platform. Multiple Modules. Seamless Integration.
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Upload your documents once, use them across all modules
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="text-5xl mb-4">📁</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">1. Create Your Project</h3>
              <p className="text-gray-600">
                Set up your programme once. Upload all your documents to a shared library. Categorize by type (business cases, schedules, risks, etc.)
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">2. Choose Your Modules</h3>
              <p className="text-gray-600">
                Start with Gateway Success or any module you need. Each module analyzes your documents against specific criteria. Run assessments in minutes, not weeks.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">3. Expand When Ready</h3>
              <p className="text-gray-600">
                Add more modules anytime. All modules share your project documents - no re-uploading. Save 10-25% with multi-module bundles.
              </p>
            </div>
          </div>

          <div className="bg-blue-600 text-white rounded-xl p-8 text-center max-w-4xl mx-auto">
            <p className="text-lg font-medium">
              All modules work together on one platform. Upload documents once, use across Gateway prep, Baseline analysis, Tender evaluation, Risk identification, and Business Case development.
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Five Modules. One Integrated Platform. Buy What You Need.
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Purpose-built AI modules for every critical programme management need
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Gateway Success */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-orange-500 hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 transform scale-y-0 group-hover:scale-y-100 transition-transform"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">🚪</div>
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full uppercase">Available Now</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Gateway Success</h3>
              <p className="text-sm text-gray-500 font-medium mb-3">NISTA/PAR Readiness Assessment</p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <div className="text-orange-700 font-bold text-lg">From £40,000/year</div>
              </div>
              <p className="text-gray-600 mb-4">
                AI-powered gap analysis for Gate 0, Gate 1, Gate 3, and PAR reviews. Know what IPA Scout will find before your official review.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-orange-500 font-bold text-lg">•</span>
                  <span>70+ NISTA criteria assessment</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-orange-500 font-bold text-lg">•</span>
                  <span>2-minute analysis</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-orange-500 font-bold text-lg">•</span>
                  <span>Same technology as IPA Scout</span>
                </li>
              </ul>
              <Link to="/gateway-success" className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Learn More →
              </Link>
            </div>

            {/* Baseline Success */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-cyan-500 hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 transform scale-y-0 group-hover:scale-y-100 transition-transform"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">📊</div>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full uppercase">Coming Q2 2025</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Baseline Success</h3>
              <p className="text-sm text-gray-500 font-medium mb-3">Project Baseline Review</p>
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 mb-4">
                <div className="text-cyan-700 font-bold text-lg">From £35,000/year</div>
              </div>
              <p className="text-gray-600 mb-4">
                AI-powered baseline health checks ensuring integration across time, cost, and scope. Identify gaps before they become issues.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-cyan-500 font-bold text-lg">•</span>
                  <span>Schedule-cost-scope integration</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-cyan-500 font-bold text-lg">•</span>
                  <span>Risk-contingency alignment</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-cyan-500 font-bold text-lg">•</span>
                  <span>Baseline quality scoring</span>
                </li>
              </ul>
              <Link to="/baseline-success" className="block w-full text-center bg-white hover:bg-blue-600 hover:text-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-semibold transition-all">
                Learn More →
              </Link>
            </div>

            {/* Tender Success */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-purple-500 hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 transform scale-y-0 group-hover:scale-y-100 transition-transform"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">📋</div>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full uppercase">Coming Q3 2025</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Tender Success</h3>
              <p className="text-sm text-gray-500 font-medium mb-3">Tender Evaluation Support</p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                <div className="text-purple-700 font-bold text-lg">From £30,000/year</div>
              </div>
              <p className="text-gray-600 mb-4">
                AI-assisted tender evaluation against your criteria. Faster, more consistent, fully auditable assessment of supplier bids.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-purple-500 font-bold text-lg">•</span>
                  <span>Criteria-based bid evaluation</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-purple-500 font-bold text-lg">•</span>
                  <span>Compliance checking</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-purple-500 font-bold text-lg">•</span>
                  <span>Comparative scoring</span>
                </li>
              </ul>
              <Link to="/tender-success" className="block w-full text-center bg-white hover:bg-blue-600 hover:text-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-semibold transition-all">
                Learn More →
              </Link>
            </div>

            {/* Risk Success */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-amber-500 hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 transform scale-y-0 group-hover:scale-y-100 transition-transform"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">🛡️</div>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full uppercase">Coming Q3 2025</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Risk Success</h3>
              <p className="text-sm text-gray-500 font-medium mb-3">AI-Assisted Risk Management</p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <div className="text-amber-700 font-bold text-lg">From £30,000/year</div>
              </div>
              <p className="text-gray-600 mb-4">
                Intelligent risk register development using programme context. Human-in-the-loop at every step for credible, comprehensive risk management.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-amber-500 font-bold text-lg">•</span>
                  <span>Context-aware risk identification</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-amber-500 font-bold text-lg">•</span>
                  <span>Response plan generation</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-amber-500 font-bold text-lg">•</span>
                  <span>Risk-cost-schedule integration</span>
                </li>
              </ul>
              <Link to="/risk-success" className="block w-full text-center bg-white hover:bg-blue-600 hover:text-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-semibold transition-all">
                Learn More →
              </Link>
            </div>

            {/* Business Case Success */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-green-500 hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 transform scale-y-0 group-hover:scale-y-100 transition-transform"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">💼</div>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full uppercase">Coming Q4 2025</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Business Case Success</h3>
              <p className="text-sm text-gray-500 font-medium mb-3">AI-Assisted Business Case Development</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="text-green-700 font-bold text-lg">From £35,000/year</div>
              </div>
              <p className="text-gray-600 mb-4">
                Intelligent business case creation aligned to HMT Green Book. Draft complete five-case models with expert AI assistance.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-green-500 font-bold text-lg">•</span>
                  <span>Five-case framework guidance</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-green-500 font-bold text-lg">•</span>
                  <span>Evidence-based drafting</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-green-500 font-bold text-lg">•</span>
                  <span>Green Book compliance</span>
                </li>
              </ul>
              <Link to="/business-case-success" className="block w-full text-center bg-white hover:bg-blue-600 hover:text-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-semibold transition-all">
                Learn More →
              </Link>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 font-medium">
              <span className="font-bold text-blue-700">Bundle multiple modules and save 10-25%.</span> Most clients start with 1-2 modules and expand over time.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Overview Section */}
      <section id="pricing" className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Flexible Module Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pay for what you need. Add modules anytime. Bundle and save.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="text-4xl font-bold text-blue-600 mb-4">£40,000<span className="text-lg text-gray-500">/year</span></div>
              <p className="text-gray-600 mb-6">Start with one module of your choice</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-gray-600">
                  <span className="text-blue-600">✓</span>
                  <span>1 module of your choice</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <span className="text-blue-600">✓</span>
                  <span>Unlimited projects</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <span className="text-blue-600">✓</span>
                  <span>Email support</span>
                </li>
              </ul>
              <Link to="/gateway-success" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Select →
              </Link>
            </div>

            {/* Professional */}
            <div className="bg-white rounded-xl p-8 border-2 border-blue-600 hover:shadow-xl transition-all relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                ⭐ MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">£89,250<span className="text-lg text-gray-500">/year</span></div>
              <div className="text-green-600 font-semibold mb-4">Save £15,750 (15%)</div>
              <p className="text-gray-600 mb-6">3 modules of your choice</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-gray-600">
                  <span className="text-blue-600">✓</span>
                  <span>3 modules of your choice</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <span className="text-blue-600">✓</span>
                  <span>15% bundle discount</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <span className="text-blue-600">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
              <a href="mailto:hello@programmeinsights.co.uk" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Select →
              </a>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">£127,500<span className="text-lg text-gray-500">/year</span></div>
              <div className="text-green-600 font-semibold mb-4">Save £42,500 (25%)</div>
              <p className="text-gray-600 mb-6">All 5 modules</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-gray-600">
                  <span className="text-blue-600">✓</span>
                  <span>All 5 modules</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <span className="text-blue-600">✓</span>
                  <span>25% bundle discount</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <span className="text-blue-600">✓</span>
                  <span>Dedicated success manager</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <span className="text-blue-600">✓</span>
                  <span>Quarterly reviews</span>
                </li>
              </ul>
              <a href="mailto:hello@programmeinsights.co.uk" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Select →
              </a>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">All pricing is annual subscription. Monthly and quarterly payment options available.</p>
          </div>

          <div className="mt-12 bg-white rounded-xl p-8 border-2 border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Module Pricing?</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-2">💡</div>
                <h4 className="font-semibold text-gray-900 mb-2">Start Small</h4>
                <p className="text-sm text-gray-600">Begin with one module (£40K), expand as you see value</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">💰</div>
                <h4 className="font-semibold text-gray-900 mb-2">Pay for What You Need</h4>
                <p className="text-sm text-gray-600">Don't pay for features you won't use</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🎁</div>
                <h4 className="font-semibold text-gray-900 mb-2">Bundle Discounts</h4>
                <p className="text-sm text-gray-600">Save 10-25% when you add multiple modules</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">➕</div>
                <h4 className="font-semibold text-gray-900 mb-2">Add Anytime</h4>
                <p className="text-sm text-gray-600">Activate new modules mid-contract (pro-rated)</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🔗</div>
                <h4 className="font-semibold text-gray-900 mb-2">Shared Platform</h4>
                <p className="text-sm text-gray-600">All modules use same documents and project data</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Programme Insights */}
      <section id="about" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Built by PMO Experts, For PMO Professionals
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">20+ Years of Major Programme Experience</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Programme Insights was founded by PMO and Project Controls professionals with over 20 years delivering integrated PMOs for major UK infrastructure programmes including:
              </p>
              <ul className="space-y-2 mb-4 text-gray-600">
                <li>• UK Rail programmes (Major stations, track upgrades, and infrastructure frameworks)</li>
                <li>• Nuclear sector (Multi-billion new build and decommissioning programmes)</li>
                <li>• Aviation infrastructure (Major airport terminal and airside programmes)</li>
                <li>• Oil & Gas facilities (Major offshore platform and onshore terminal programmes)</li>
                <li>• Major projects portfolio management across diverse infrastructure sectors</li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                We understand the challenges programme directors face because we've lived them. Our AI products solve real problems we encountered managing £100M-£3bn programmes across UK rail, nuclear, aviation, and energy infrastructure.
              </p>
            </div>
            <div className="space-y-6">
              {[
                { title: 'Domain Expertise + AI Technology', desc: 'Built by PMO professionals who know major projects, not just AI' },
                { title: 'UK Data Residency & Security', desc: 'Azure OpenAI UK, self-hosted option, Official Sensitive compatible' },
                { title: 'Same Technology as IPA Scout', desc: 'Proven approach used by the Infrastructure & Projects Authority' },
                { title: 'Module-Based, Not Time-Based', desc: 'Fixed-price modules, not expensive consulting day rates' },
                { title: 'Fast Deployment', desc: '48-hour setup, immediate value' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="text-green-500 text-2xl font-bold flex-shrink-0">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "How is this different from ChatGPT or Claude?",
                a: "Consumer AI tools like ChatGPT and Claude aren't suitable for major programme work for several reasons:\n\n• Security: ChatGPT may use your data for training. Programme Insights uses Azure OpenAI UK with contractual guarantees that your Official Sensitive data is never used for training and never leaves the UK.\n\n• Programme Context: ChatGPT has no knowledge of your programme. You'd need to manually copy/paste documents (hitting character limits). Programme Insights indexes your entire document library and maintains full programme context across all assessments.\n\n• Structured Assessment: ChatGPT gives generic advice. Programme Insights systematically checks all 70+ NISTA criteria, extracts evidence with page citations, and provides a comprehensive, repeatable audit trail.\n\n• Expert Oversight: ChatGPT has no accountability. Programme Insights combines AI analysis with expert review - every assessment is checked by someone with 20+ years of PMO experience on £1bn+ programmes.\n\n• Time Savings: Using ChatGPT for gateway prep would take 40-60 hours of manual work (copying docs, crafting prompts, organizing responses). Programme Insights takes 2 hours total (upload once, run unlimited assessments).\n\nThink of it this way: ChatGPT is a general-purpose text interface. Programme Insights is a purpose-built platform for major project assessment - like the difference between Notepad and Primavera P6 for scheduling."
              },
              {
                q: "Do you use the same technology as IPA Scout?",
                a: "Yes. Programme Insights uses the same core technology stack as IPA Scout (the Infrastructure & Projects Authority's AI tool):\n\n• Azure OpenAI UK (same AI engine)\n• PostgreSQL (structured data)\n• ChromaDB (vector embeddings for RAG)\n• Self-hosted deployment option\n\nThe key difference: Scout is used BY IPA during official reviews. Programme Insights is used BY programmes to prepare BEFORE those reviews. It's like using the same revision materials as the exam board - you know what they're looking for because you're using their methodology."
              },
              {
                q: "Can I start with one module and add others later?",
                a: "Absolutely. That's exactly how we designed it. Most clients:\n\nYear 1: Start with Gateway Success (£40K)\nYear 2: Add Baseline Success (£67.5K total with 10% bundle discount)\nYear 3: Add more modules as needs grow\n\nYou can add modules anytime mid-contract (pro-rated). The bundle discount recalculates automatically. All modules share the same document library - no re-uploading needed."
              },
              {
                q: "Is this secure enough for Official Sensitive data?",
                a: "Yes. Programme Insights is designed for Official Sensitive data from day one:\n\n• UK data residency (Azure UK regions only)\n• No data used for AI training (contractual guarantee)\n• Self-hosted deployment option (data on YOUR infrastructure)\n• Encryption at rest and in transit\n• Role-based access control\n• Complete audit logging\n• Follows HMG Generative AI Framework\n\nIf it's secure enough for IPA to use this technology for official gateway reviews, it's secure enough for programme preparation."
              },
              {
                q: "How long does procurement take?",
                a: "It depends on your route:\n\n• Supply Chain Route (FASTEST): 2-4 weeks - Come in through Turner & Townsend, Deloitte, Atkins, or other consultancies you already have on contract. They bring us in as specialist subcontractor - no new procurement needed.\n\n• Pilot Exception: 4-6 weeks - Many programmes can run a pilot under innovation exemptions (typically under threshold)\n\n• Framework Call-Off: 6-8 weeks - We're working on G-Cloud accreditation (target Q2 2025)\n\n• Full Procurement: 6-12 months - If none of the above work, standard procurement applies\n\nMost clients use the supply chain route - it's fastest and proven."
              },
              {
                q: "What if the AI gets something wrong?",
                a: "Programme Insights has multiple safeguards:\n\n• Human Expert Review: Every assessment is reviewed before delivery\n• Evidence Citations: Every finding includes page citations you can verify\n• Confidence Scoring: System indicates confidence level for each finding\n• Your Oversight: You review and validate all findings\n• Iterative Learning: If AI misses something, we refine the criteria\n\nThe combination of comprehensive AI analysis + expert human review + your team's knowledge provides higher assurance than traditional consultant reviews. And unlike consultants, AI doesn't get tired or miss things due to time pressure."
              },
              {
                q: "How is this different from Firewood FAST?",
                a: "Firewood and Programme Insights serve different needs:\n\nFirewood FAST:\n• Enterprise portfolio assurance management\n• For assurance directors managing 10-50 programmes\n• During official reviews\n• Enterprise pricing (£250K+)\n• 3-6 month implementation\n\nProgramme Insights:\n• Individual programme delivery support\n• For programme directors running specific projects\n• Preparing for reviews (before and between)\n• Module pricing (£40-127K depending on needs)\n• 48-hour deployment\n\nThink of it as: Firewood helps assurance teams conduct reviews efficiently. Programme Insights helps programmes prepare for those reviews. They're complementary - many clients will use both."
              },
              {
                q: "Do we still need consulting firms?",
                a: "Programme Insights complements consultants, doesn't replace them:\n\nTraditional Consulting is Best For:\n• Strategic advice requiring judgment\n• Stakeholder facilitation and change management\n• Complex organizational challenges\n• Bespoke problem-solving\n\nProgramme Insights is Best For:\n• Systematic document analysis\n• Comprehensive gap identification\n• Evidence extraction and citation\n• Repeatable, objective assessment\n\nMany clients use both: Run Gateway Success first (identifies 15 gaps), then engage consultancy strategically to solve the 5 most complex gaps. More efficient use of consulting budget."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-8">{faq.q}</span>
                  <span className="text-blue-600 text-2xl flex-shrink-0">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-gray-600 whitespace-pre-line">
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
            Ready to Transform Your Programme Delivery?
          </h2>
          <p className="text-lg mb-8 opacity-95">
            Join forward-thinking programme directors using AI to deliver better outcomes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/gateway-success" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:shadow-lg">
              Start with Gateway Success
            </Link>
            <a href="mailto:hello@programmeinsights.co.uk" className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white transition-all">
              Schedule a Call
            </a>
          </div>
          <p className="text-lg opacity-90">
            <a href="mailto:hello@programmeinsights.co.uk" className="underline hover:no-underline">
              hello@programmeinsights.co.uk
            </a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xl font-bold mb-4">
                Programme Insights<span className="w-2 h-2 bg-orange-500 rounded-full"></span>
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
                <li><a href="#about" className="hover:opacity-100 transition-opacity">About</a></li>
                <li><a href="#pricing" className="hover:opacity-100 transition-opacity">Pricing</a></li>
                <li><a href="#faq" className="hover:opacity-100 transition-opacity">FAQ</a></li>
                <li><Link to="/login" className="hover:opacity-100 transition-opacity">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#products" className="hover:opacity-100 transition-opacity">How It Works</a></li>
                <li><a href="#about" className="hover:opacity-100 transition-opacity">Security & Compliance</a></li>
                <li><Link to="/gateway-success" className="hover:opacity-100 transition-opacity">Get Started</Link></li>
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
