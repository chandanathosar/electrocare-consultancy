import React, { useState } from 'react';
import {
  Zap,
  TrendingDown,
  Cpu,
  SearchCheck,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';
import { PageId, ServiceCategory } from '../types';
import { SERVICES_LIST } from '../data/servicesData';

interface ServicesPageProps {
  onNavigate: (page: PageId) => void;
  onOpenEnquiryWithPreset: (category: ServiceCategory) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  onNavigate,
  onOpenEnquiryWithPreset
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'residential' | 'commercial'>('all');

  return (
    <div className="space-y-24 py-12 md:py-16">
      {/* HEADER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Independent Engineering Advisory</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
            Our Specialized Consulting Services
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            Designed to address high power costs, appliance thermal degradation, and un-optimized electrical distribution. Backed by certified data and guaranteed savings metrics.
          </p>
        </div>
      </section>

      {/* DETAILED SERVICES EXPANDED BREAKDOWN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {SERVICES_LIST.map((service, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              key={service.id}
              id={service.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden"
            >
              {/* Background gradient splash */}
              <div
                className={`absolute top-0 ${isEven ? 'right-0' : 'left-0'} w-96 h-96 bg-gradient-to-br ${
                  service.badgeColor
                } opacity-10 rounded-full blur-3xl -z-10 pointer-events-none`}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Information Column (7 cols) */}
                <div className={`lg:col-span-7 space-y-6 ${isEven ? '' : 'lg:order-2'}`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Service #{index + 1}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      Target: {service.targetSavings}
                    </span>
                    <span className="flex items-center text-xs text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {service.turnaroundTime}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                      {service.title}
                    </h2>
                    <p className="text-sm font-medium text-cyan-300 mt-1">
                      {service.tagline}
                    </p>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {service.shortDesc}
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                    <span className="text-slate-400 font-medium">Recommended for: </span>
                    <span className="text-white font-semibold">{service.idealFor}</span>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 font-mono">
                      Key Technical Areas Covered:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {service.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start space-x-2 text-xs text-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onOpenEnquiryWithPreset(service.id)}
                      className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                    >
                      <span>Enquire for {service.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Deliverables Card (5 cols) */}
                <div className={`lg:col-span-5 ${isEven ? '' : 'lg:order-1'}`}>
                  <div className="rounded-2xl border border-indigo-500/30 bg-slate-950/90 p-6 space-y-5 shadow-lg">
                    <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Tangible Deliverables</h4>
                        <span className="text-[11px] text-slate-400">What you receive upon completion</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {service.deliverables.map((deliv, dIdx) => (
                        <div key={dIdx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                            {dIdx + 1}
                          </span>
                          <span className="leading-snug">{deliv}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                      <span className="text-emerald-400 font-semibold block">⚡ No Long-Term Lock In</span>
                      <span>Consultation is delivered on a fixed-fee milestone or performance savings basis.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* RESIDENTIAL VS COMMERCIAL MATRIX */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-purple-400">
            <BarChart3 className="w-4 h-4" />
            <span>Consultation Comparison</span>
          </div>
          <h2 className="text-3xl font-bold font-heading text-white">
            Residential vs Commercial Service Scopes
          </h2>
          <p className="text-sm text-slate-400">
            Every electrical setup requires distinct auditing protocols and measurement frequencies.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-white font-mono uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4 sm:p-5">Consultation Dimension</th>
                  <th className="p-4 sm:p-5 text-blue-400">Residential & Smart Homes</th>
                  <th className="p-4 sm:p-5 text-purple-400">Commercial & Industrial Facilities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr className="hover:bg-slate-800/30">
                  <td className="p-4 sm:p-5 font-semibold text-white">Typical Monthly Bill</td>
                  <td className="p-4 sm:p-5">$150 – $900</td>
                  <td className="p-4 sm:p-5">$1,500 – $50,000+</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-4 sm:p-5 font-semibold text-white">Electrical Phase</td>
                  <td className="p-4 sm:p-5">Single Phase (120V/240V) or Split-Phase</td>
                  <td className="p-4 sm:p-5">3-Phase (480V/415V/208V) with Transformer banks</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-4 sm:p-5 font-semibold text-white">Primary Energy Drains</td>
                  <td className="p-4 sm:p-5">HVAC compressors, heat pumps, water heaters, standby TVs/consoles</td>
                  <td className="p-4 sm:p-5">Air handlers, chillers, server racks, heavy motor pumps, lighting grids</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-4 sm:p-5 font-semibold text-white">Audit Instruments Used</td>
                  <td className="p-4 sm:p-5">FLIR Compact Thermography, Hioki Clamp logger</td>
                  <td className="p-4 sm:p-5">Fluke 435 II 3-Phase Analyzer, Transient Oscilloscope, Lux meters</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-4 sm:p-5 font-semibold text-white">Average Payback Timeline</td>
                  <td className="p-4 sm:p-5">1.5 to 3.5 Months</td>
                  <td className="p-4 sm:p-5">2.5 to 6 Months</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
          Need a Custom Combination of Services?
        </h3>
        <p className="text-sm text-slate-300">
          Our senior consultants can bundle bill reduction, appliance stress tests, and full energy audits into one unified project.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('enquiry')}
          className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-indigo-600/25 cursor-pointer"
        >
          <span>Open Customer Enquiry Form</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
