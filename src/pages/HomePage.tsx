import React, { useState } from 'react';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Cpu,
  SearchCheck,
  Clock,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Building,
  Home as HomeIcon,
  Factory
} from 'lucide-react';
import { PageId, ServiceCategory } from '../types';
import { CircuitHeroIllustration } from '../components/ElectricVisuals';
import { SavingsCalculator } from '../components/SavingsCalculator';
import { SERVICES_LIST, CLIENT_TESTIMONIALS } from '../data/servicesData';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onOpenEnquiryWithPreset: (category: ServiceCategory, monthlyBill?: string, propertyType?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenEnquiryWithPreset
}) => {
  // Mini interactive diagnostic check state
  const [quizStep, setQuizStep] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  const quizQuestions = [
    {
      q: 'Do you notice electronic appliances or power plugs getting unusually hot during standard operation?',
      options: [
        { label: 'Yes, frequently on multiple units', score: 3 },
        { label: 'Occasionally during heavy summer loads', score: 2 },
        { label: 'Never or rarely', score: 0 }
      ]
    },
    {
      q: 'How old are your primary high-consumption electronics (HVAC, compressors, server supplies, motors)?',
      options: [
        { label: 'Over 8 years old without inverter drives', score: 3 },
        { label: 'Between 4 to 8 years old', score: 2 },
        { label: 'Under 3 years (modern 5-star / inverter rated)', score: 0 }
      ]
    },
    {
      q: 'Has your electricity utility bill spiked even though your operating hours stayed unchanged?',
      options: [
        { label: 'Yes, a sharp 20%+ increase recently', score: 3 },
        { label: 'Mild creeping rise over the past year', score: 2 },
        { label: 'No, fairly steady', score: 0 }
      ]
    }
  ];

  const handleQuizAnswer = (score: number) => {
    const nextScore = quizScore + score;
    setQuizScore(nextScore);
    if (quizStep + 1 < quizQuestions.length) {
      setQuizStep(quizStep + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        {/* Glow background orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-purple-600/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Next-Gen Electronic & Energy Consulting</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-heading text-white tracking-tight leading-[1.12]">
                Stop Overpaying for Power.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                  Optimize Your Electronics.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                ElectroCare Consultancy specializes in independent <strong>electricity bill reduction</strong>, <strong>electronic appliance diagnostics</strong>, and certified <strong>energy audits</strong>. We eliminate phantom loads, balance 3-phase circuits, and engineer real savings.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('enquiry')}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-7 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-cyan-300" />
                  <span>Book Consultation & Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl font-semibold text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
                >
                  <span>Explore Our 5 Services</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Permanent Verified Database</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>24-Hour Review Turnaround</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>No Sales Bias Guarantee</span>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Dynamic SVG Hardware Card */}
            <div className="lg:col-span-5">
              <CircuitHeroIllustration />
            </div>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="mt-16 border-y border-slate-800/80 bg-slate-950/60 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-cyan-400 font-mono">1,420+</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Audits Completed</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-indigo-400 font-mono">34.8%</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Avg. Bill Reduction</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-purple-400 font-mono">$3.8M+</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Recaptured Client Capital</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-emerald-400 font-mono">99.4%</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE BILL SAVINGS CALCULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SavingsCalculator
          onOpenEnquiryWithPreset={onOpenEnquiryWithPreset}
          onNavigate={onNavigate}
        />
      </section>

      {/* CORE SERVICES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <span>Specialized Engineering Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
            Tailored Electronic & Energy Solutions
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            From high-draw residential villas to complex commercial facilities, our consulting packages deliver measurable, verified ROI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_LIST.map((service, index) => (
            <div
              key={service.id}
              className="group relative rounded-3xl border border-slate-800 bg-slate-900/80 hover:bg-slate-900 hover:border-blue-500/50 p-7 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-blue-500/10"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${service.badgeColor} p-0.5 shadow-lg`}>
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                      {index === 0 && <Zap className="w-6 h-6 text-blue-400" />}
                      {index === 1 && <TrendingDown className="w-6 h-6 text-indigo-400" />}
                      {index === 2 && <Cpu className="w-6 h-6 text-purple-400" />}
                      {index === 3 && <SearchCheck className="w-6 h-6 text-cyan-400" />}
                      {index === 4 && <ShieldCheck className="w-6 h-6 text-pink-400" />}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {service.targetSavings}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold font-heading text-white group-hover:text-blue-300 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {service.shortDesc}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  {service.features.slice(0, 3).map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onOpenEnquiryWithPreset(service.id)}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <span>Enquire For This</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}

          {/* 6th Card: All-Inclusive Corporate Package */}
          <div className="relative rounded-3xl border border-purple-500/40 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/60 p-7 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Custom Facility Package
                </span>
                <span className="text-xs text-slate-400 font-mono">Turnkey</span>
              </div>
              <h3 className="text-xl font-bold font-heading text-white">
                Comprehensive Multi-Site Energy Transformation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Operating multiple commercial spaces or manufacturing plants? Get a customized multi-point electronic inspection, sub-metering, and utility rate re-negotiation.
              </p>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-cyan-300">
                ⚡ Includes FLIR Thermal Scans + 3-Phase Data Logging + Dedicated Account Engineer.
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenEnquiryWithPreset('commercial_industrial')}
              className="mt-6 w-full py-3 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all text-center cursor-pointer shadow-lg shadow-purple-600/20"
            >
              Consult On Enterprise Scope
            </button>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE ELECTROCARE (4 PILLARS) */}
      <section className="border-y border-slate-800 bg-slate-950/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold font-heading text-white">
              Why ElectroCare Consultancy?
            </h2>
            <p className="text-sm text-slate-400">
              The difference between generic electricians and specialized electronic energy engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">100% Unbiased Advice</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                We don’t manufacture appliances. Our sole mandate is finding what saves you the most money with zero vendor kickbacks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Harmonic & Thermal Tech</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                We inspect behind walls and inside circuit breakers using Fluke 3-phase loggers and FLIR infrared cameras.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Fast 24h Diagnosis</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Submit your electricity bill & equipment profile; our team returns actionable quick wins within 24 business hours.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Contractual Payback</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our recommended energy conservation measures typically pay for themselves within 3 to 6 months of execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK DIAGNOSTIC CHECK WIDGET */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/90 p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>30-Second Energy Health Check</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Is Your Facility Bleeding Power Unnoticed?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-6">
              Answer 3 fast diagnostic questions to determine if an electrical inspection is needed.
            </p>

            {!quizCompleted ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-slate-800">
                  <span>Question {quizStep + 1} of {quizQuestions.length}</span>
                  <span>Step {quizStep + 1} / 3</span>
                </div>
                <h4 className="text-base font-medium text-slate-200">
                  {quizQuestions[quizStep].q}
                </h4>
                <div className="space-y-2 pt-2">
                  {quizQuestions[quizStep].options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleQuizAnswer(opt.score)}
                      className="w-full text-left p-3.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-blue-500/60 text-xs sm:text-sm text-slate-200 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <span>{opt.label}</span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="p-5 rounded-2xl border border-amber-500/40 bg-amber-500/10 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {quizScore >= 4
                        ? 'High Energy Inefficiency Detected (Priority Audit Advised)'
                        : 'Moderate Inefficiency Potential Detected'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Based on your responses, your facility is likely losing between <strong>25% and 40%</strong> in wasted heat dissipation, harmonic loss, or un-optimized standby power.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenEnquiryWithPreset('energy_audit')}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all text-center shadow-lg cursor-pointer"
                  >
                    Request Free Audit Inspection
                  </button>
                  <button
                    type="button"
                    onClick={resetQuiz}
                    className="py-3 px-4 rounded-xl text-xs text-slate-400 hover:text-white border border-slate-800 bg-slate-800/30"
                  >
                    Retake Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CLIENT TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold font-heading text-white">
            Client Success Stories
          </h2>
          <p className="text-sm text-slate-400">
            Real power savings achieved across residential, commercial, and industrial facilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CLIENT_TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    {t.saving}
                  </span>
                  <div className="flex text-amber-400 text-xs">★★★★★</div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-slate-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-[11px] text-slate-400">{t.role}, {t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-blue-500/40 bg-gradient-to-r from-blue-950/80 via-slate-900 to-purple-950/80 p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              Ready to Slash Your Electric Bill?
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Submit your enquiry in under 2 minutes. Our certified engineers analyze your requirements and reach out with a data-driven reduction plan.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('enquiry')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-blue-500/30 transition-all cursor-pointer"
              >
                Submit Customer Enquiry Form
              </button>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-semibold text-sm text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all cursor-pointer"
              >
                Speak with a Consultant
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
