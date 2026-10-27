import React from 'react';
import {
  ShieldCheck,
  Award,
  Zap,
  CheckCircle2,
  Cpu,
  ArrowRight,
  TrendingUp,
  Search,
  Users,
  Target,
  FileText
} from 'lucide-react';
import { PageId } from '../types';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const processSteps = [
    {
      step: '01',
      title: 'Preliminary Diagnostic & Tariff Review',
      desc: 'We examine your past 3 to 12 months of utility invoices, maximum peak demand charges, and time-of-day tariff structures to establish a baseline.'
    },
    {
      step: '02',
      title: 'On-Site 3-Phase Power & Thermal Logging',
      desc: 'Our engineers deploy industrial Fluke power analyzers and FLIR infrared thermography cameras to capture voltage sags, harmonics, and hot-spot circuit leaks.'
    },
    {
      step: '03',
      title: 'Thermodynamic & Harmonic Analysis',
      desc: 'We calculate true power factor (PF), total harmonic distortion (THD), motor load efficiency curves, and vampire standby losses across all circuits.'
    },
    {
      step: '04',
      title: 'Tailored Engineering Blueprint & ROI Schedule',
      desc: 'You receive a comprehensive report with prioritized Energy Conservation Measures (ECMs), exact hardware payback models, and zero-cost behavioral tweaks.'
    },
    {
      step: '05',
      title: 'Implementation Guidance & Post-Verification',
      desc: 'We guide your internal electricians or contractors during installation and conduct a second round of power logging to certify the achieved savings.'
    }
  ];

  const teamMembers = [
    {
      name: 'Dr. Aris Thorne, Ph.D., PE',
      role: 'Chief Energy Architect & Lead Auditor',
      credentials: 'CEM | IEEE Senior Member | 18+ Years Experience',
      bio: 'Former senior power systems researcher specializing in 3-phase microgrid stability and commercial peak-demand shaving.'
    },
    {
      name: 'Samantha Wei, M.S. EE',
      role: 'Principal Electronic Systems Consultant',
      credentials: 'Certified Energy Manager | ISO 50001 Lead Auditor',
      bio: 'Expert in inverter motor drives, thermal dissipation in dense server rooms, and residential high-efficiency HVAC scheduling.'
    },
    {
      name: 'Kavita Menon, B.Tech Electrical',
      role: 'Senior Power Quality & Harmonics Analyst',
      credentials: 'Fluke Certified Power Quality Specialist',
      bio: 'Focuses on dirty power mitigation, capacitor bank sizing, and transient surge protection for high-value lab electronics.'
    }
  ];

  const instruments = [
    {
      name: 'Fluke 435 Series II Power Quality Analyzer',
      spec: 'Captures 3-phase transients, THD, voltage unbalance, and energy loss quantification.'
    },
    {
      name: 'FLIR E8-XT High-Resolution Thermal Imager',
      spec: 'Detects overloaded circuit breakers, loose terminations, and transformer hotspot hazards.'
    },
    {
      name: 'Hioki PW3360-20 Compact Clamp Logger',
      spec: 'Continuous multi-day circuit load profiling for residential and light-commercial panels.'
    },
    {
      name: 'Keysight Digital Storage Oscilloscope',
      spec: 'High-frequency waveform and switching noise inspection on sensitive electronic appliances.'
    }
  ];

  return (
    <div className="space-y-24 py-12 md:py-16">
      {/* HEADER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pioneering Electronic & Energy Consulting</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
            About ElectroCare Consultancy
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            We are independent electrical engineers and electronic diagnostics specialists dedicated to stopping energy waste, extending device lifespans, and protecting your bottom line.
          </p>
        </div>
      </section>

      {/* CORE PHILOSOPHY & STORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-purple-400">
              <Target className="w-4 h-4" />
              <span>Our Mission & Core Philosophy</span>
            </div>

            <h2 className="text-3xl font-bold font-heading text-white leading-tight">
              Bridging the Gap Between Electrical Utility Rates & Electronic Engineering
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Most businesses and homeowners treat their electricity bill as an unavoidable fixed tax. Meanwhile, traditional electricians only wire up new switches or fix tripped fuses, rarely understanding the complex harmonic distortion, poor power factor, or standby vampire loads draining thousands of kilowatt-hours in the background.
            </p>

            <p className="text-sm text-slate-300 leading-relaxed">
              ElectroCare Consultancy was founded to provide transparent, high-precision electronic diagnostics. We do not sell retail appliances and we never accept manufacturer commissions. Our sole fidelity is to your data, your electrical safety, and your financial savings.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-2xl font-bold text-cyan-400 font-mono">100%</div>
                <div className="text-xs text-slate-400 mt-1">Vendor-Independent Consultation</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-2xl font-bold text-indigo-400 font-mono">ISO 50001</div>
                <div className="text-xs text-slate-400 mt-1">Compliant Energy Management</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl border border-blue-500/30 bg-gradient-to-tr from-slate-900 via-indigo-950/30 to-slate-900 p-8 shadow-2xl space-y-6">
              <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>The ElectroCare Quality Promise</span>
              </h3>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Empirical Measurement Over Guesswork:</strong> Every recommendation is backed by calibrated 3-phase logging instruments.
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Fast Payback Engineering:</strong> We prioritize zero-cost adjustments and rapid-payback ECMs that recoup their cost in months, not decades.
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Appliance Health & Safety:</strong> Beyond financial savings, we identify fire hazards, loose terminations, and severe harmonic resonance before equipment failure occurs.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 font-mono">
                🔒 System Policy: Customer enquiries are permanently recorded in our enterprise database and assigned to a certified engineer within 24 hours.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-STEP METHODOLOGY ROADMAP */}
      <section className="border-y border-slate-800 bg-slate-950/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-blue-400">
              <TrendingUp className="w-4 h-4" />
              <span>Our Structured Approach</span>
            </div>
            <h2 className="text-3xl font-bold font-heading text-white">
              The 5-Step Consulting Process
            </h2>
            <p className="text-sm text-slate-400">
              A scientific, repeatable roadmap that guarantees transparency and measurable kilowatt-hour drops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {processSteps.map((step, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 block mb-2">
                    {step.step}
                  </span>
                  <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFIED TEAM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
            <Users className="w-4 h-4" />
            <span>Meet Our Leadership</span>
          </div>
          <h2 className="text-3xl font-bold font-heading text-white">
            Certified Engineers & Energy Specialists
          </h2>
          <p className="text-sm text-slate-400">
            Guided by decades of combined experience in power engineering, electrical safety, and industrial automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-800 bg-slate-900/70 p-7 space-y-4 hover:border-indigo-500/40 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 p-0.5 shadow-lg">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-base text-white">
                  {member.name.slice(0, 2)}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{member.name}</h3>
                <div className="text-xs text-blue-400 font-semibold">{member.role}</div>
                <div className="text-[11px] text-purple-300 font-mono mt-0.5">{member.credentials}</div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* STATE OF THE ART INSTRUMENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 md:p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">Hardware Fleet</span>
              <h3 className="text-2xl font-bold font-heading text-white mt-1">
                Precision Test & Measurement Technology
              </h3>
            </div>
            <span className="text-xs text-slate-400">Calibrated Annually to NIST Standards</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {instruments.map((inst, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400">
                  <Cpu className="w-4 h-4" />
                  <span className="text-xs font-mono font-semibold">Instrument 0{i + 1}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{inst.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{inst.spec}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
          Work with Certified Electronic Energy Consultants
        </h3>
        <p className="text-sm text-slate-300">
          Book an energy audit or consultation today and take the first step towards optimized operations.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('enquiry')}
          className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-2xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/20 cursor-pointer"
        >
          <span>Submit Consultation Request</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
