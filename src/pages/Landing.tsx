import Button from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Brain,
  AlertTriangle,
  Target,
  XCircle,
  Upload,
  CheckSquare,
  Shield,
} from "lucide-react";

export default function Landing() {
  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="font-semibold text-lg">Gateway Success</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#services" className="text-sm text-slate-600 hover:text-slate-900 transition">
              How It Works
            </a>
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Features
            </a>
            <a href="#demo" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Demo
            </a>
            <a href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Sign In
            </a>
            <Button onClick={scrollToDemo} className="bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Programme Insights Style */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white">
        {/* Geometric Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(30deg, transparent 48%, rgba(255,255,255,0.1) 49%, rgba(255,255,255,0.1) 51%, transparent 52%),
              linear-gradient(150deg, transparent 48%, rgba(255,255,255,0.1) 49%, rgba(255,255,255,0.1) 51%, transparent 52%)
            `,
            backgroundSize: '80px 140px',
          }}
        />

        <div className="container mx-auto relative py-20 md:py-28 px-4">
          <div className="max-w-3xl space-y-8">
            <div className="inline-block rounded px-3 py-1 text-sm font-medium bg-orange-500 text-white">
              AI-Powered NISTA Assessments
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Pass Your NISTA Gate Review. First Time.
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl">
              AI-powered gap analysis and readiness assessments for Gate 0, Gate 1, PAR, and Gate 3.
              Identify issues before the NISTA does.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={scrollToDemo}
                className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 h-12"
              >
                Schedule a Demo
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm text-lg px-8 h-12"
              >
                <a href="#services">Explore Features</a>
              </Button>
            </div>

            {/* Stats - Orange Text */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div>
                <div className="text-4xl md:text-5xl font-bold text-orange-400">2 Min</div>
                <div className="text-sm text-blue-100 mt-1">Assessment Time</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-orange-400">70+</div>
                <div className="text-sm text-blue-100 mt-1">NISTA Criteria</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-orange-400">4 Gates</div>
                <div className="text-sm text-blue-100 mt-1">Full Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-medium mb-2">Our Services</p>
            <h2 className="text-4xl font-bold mb-4">Four Assessment Types, One Platform</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              AI-powered assessments aligned to Infrastructure & Projects Authority criteria,
              delivered in minutes instead of weeks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Gate 0 */}
            <Card className="border-2 hover:border-blue-200 transition">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Gate 0</CardTitle>
                <CardDescription>Strategic Assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>15 strategic criteria</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Alignment to government priorities</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Value for money assessment</span>
                </div>
              </CardContent>
            </Card>

            {/* Gate 1 */}
            <Card className="border-2 hover:border-orange-200 transition border-orange-100">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Gate 1</CardTitle>
                <CardDescription>Business Case Review</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>30 Five Case Model criteria</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>Strategic, economic, commercial cases</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>Financial and management cases</span>
                </div>
              </CardContent>
            </Card>

            {/* PAR */}
            <Card className="border-2 hover:border-blue-200 transition">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">PAR</CardTitle>
                <CardDescription>Project Assessment Review</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>5 readiness criteria</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Delivery confidence assessment</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Risk and issue identification</span>
                </div>
              </CardContent>
            </Card>

            {/* Gate 3 */}
            <Card className="border-2 hover:border-orange-200 transition">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <CheckSquare className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Gate 3</CardTitle>
                <CardDescription>Investment Decision</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>25 procurement criteria</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>Delivery strategy validation</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>Readiness to procure</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">The Cost of Getting It Wrong</h2>
            <p className="text-xl text-slate-600">
              72% of major projects are rated AMBER. 12% are RED. Don't be a statistic.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Without */}
            <Card className="border-2 border-red-200 bg-red-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 text-2xl">
                  <XCircle className="h-7 w-7" />
                  Without Gateway Success
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700">Gaps discovered during NISTA review (too late)</p>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700">Business case sent back (6-12 month delay)</p>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700">Treasury questions delivery confidence</p>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700 font-semibold">Join 12% rated RED (£96.8bn at risk)</p>
                </div>
              </CardContent>
            </Card>

            {/* With */}
            <Card className="border-2 border-green-200 bg-green-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 text-2xl">
                  <CheckCircle2 className="h-7 w-7" />
                  With Gateway Success
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-green-700">Identify gaps before submission</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-green-700">Pass on first submission (no delays)</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-green-700">Demonstrate delivery confidence</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-green-700 font-semibold">Join 11% rated GREEN</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Three Steps to GREEN</h2>
            <p className="text-xl text-slate-600">Simple. Fast. Effective.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold mx-auto">
                1
              </div>
              <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold">Upload</h3>
              <p className="text-slate-600">
                Upload your business case, strategic outline, or project brief
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-orange-500 text-white flex items-center justify-center text-3xl font-bold mx-auto">
                2
              </div>
              <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center mx-auto">
                <Brain className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold">Assess</h3>
              <p className="text-slate-600">
                AI analyzes against NISTA criteria. Get RAG ratings in 2 minutes
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center text-3xl font-bold mx-auto">
                3
              </div>
              <div className="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center mx-auto">
                <CheckSquare className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold">Fix & Pass</h3>
              <p className="text-slate-600">
                Address gaps with AI recommendations. Enter review ready to pass
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={scrollToDemo} className="bg-orange-500 hover:bg-orange-600 text-lg px-10 h-12 inline-flex items-center gap-2">
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section - Blue Background */}
      <section className="py-20 bg-gradient-to-br from-blue-700 to-blue-900 text-white relative overflow-hidden">
        {/* Geometric Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(30deg, transparent 48%, rgba(255,255,255,0.1) 49%, rgba(255,255,255,0.1) 51%, transparent 52%),
              linear-gradient(150deg, transparent 48%, rgba(255,255,255,0.1) 49%, rgba(255,255,255,0.1) 51%, transparent 52%)
            `,
            backgroundSize: '80px 140px',
          }}
        />

        <div className="container mx-auto relative px-4">
          <div className="text-center space-y-12">
            <div>
              <h2 className="text-4xl font-bold mb-4">The Stakes Are High</h2>
              <p className="text-xl text-blue-100">NISTA Annual Report 2023-24</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
              <div>
                <div className="text-6xl font-bold text-orange-400 mb-2">227</div>
                <div className="text-lg text-blue-100">GMPP Projects</div>
              </div>
              <div>
                <div className="text-6xl font-bold text-orange-400 mb-2">£834bn</div>
                <div className="text-lg text-blue-100">Total Portfolio Value</div>
              </div>
              <div>
                <div className="text-6xl font-bold text-orange-400 mb-2">12%</div>
                <div className="text-lg text-blue-100">Rated RED</div>
              </div>
            </div>

            <p className="text-2xl font-medium">Don't let your project become a statistic.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Gateway Success Works</h2>
            <p className="text-xl text-slate-600">
              Built for UK infrastructure projects. Aligned to NISTA standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>NISTA-Aligned</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Same framework the Infrastructure & Projects Authority uses. No guesswork.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>AI-Powered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Upload documents. Get RAG ratings across 70+ criteria in minutes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Critical Flags</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Identifies non-negotiable issues. Critical RED = overall RED.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Actionable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Not just scores—specific actions to strengthen your case.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="demo" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-2 border-blue-200">
            <CardHeader className="text-center space-y-4 pb-8">
              <CardTitle className="text-4xl font-bold">
                Ready to Pass Your Gate Review?
              </CardTitle>
              <CardDescription className="text-lg">
                Book a free 30-minute demo. See how Gateway Success identifies gaps,
                strengthens your case, and helps you pass with confidence.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="bg-blue-50 rounded-lg p-8">
                <h3 className="font-semibold text-xl mb-6">In 30 minutes, you'll see:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>How to upload and assess documents</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>How AI identifies gaps</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>How to interpret RAG ratings</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>How it fits your process</span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-6">
                <a href="mailto:hello@gatewaysuccess.co.uk?subject=Demo Request">
                  <Button
                    size="lg"
                    className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-12 h-14 inline-flex items-center gap-2"
                  >
                    Schedule a Demo
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </a>
                <p className="text-sm text-slate-600">
                  No sales pitch. No pressure. Just a practical demonstration.
                </p>
                <p className="text-sm text-slate-600">
                  Or email{" "}
                  <a href="mailto:hello@gatewaysuccess.co.uk" className="text-blue-600 hover:underline font-medium">
                    hello@gatewaysuccess.co.uk
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="font-semibold text-lg">Gateway Success</span>
            </div>
            <p className="text-sm text-slate-600">
              Helping UK infrastructure projects pass NISTA gate reviews with confidence
            </p>
            <p className="text-xs text-slate-600">
              © 2025 Gateway Success. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
