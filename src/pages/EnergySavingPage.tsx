import React, { useState } from 'react';
import {
  Zap,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  Thermometer,
  Cpu
} from 'lucide-react';
import { PageId } from '../types';

interface EnergySavingPageProps {
  onNavigate: (page: PageId) => void;
  onOpenEnquiryWithPreset: (category: any) => void;
}

export const EnergySavingPage: React.FC<EnergySavingPageProps> = ({
  onNavigate,
  onOpenEnquiryWithPreset
}) => {
  // Interactive checklist state
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    0: true,
    2: true
  });

  const top10Tweaks = [
    {
      title: 'Eliminate Phantom "Vampire" Standby Power',
      saving: 'Up to 12% Total Bill',
      difficulty: 'Easy / Zero Cost',
      desc: 'Consumer electronics, game consoles, microwave clocks, and AV receivers consume continuous wattage even when switched off. Installing smart master/slave smart power strips completely cuts the line voltage when the main appliance sleeps.'
    },
    {
      title: 'Power Factor Correction (kVA to kW Optimization)',
      saving: '10% - 25% Utility Penalty Cut',
      difficulty: 'Medium / Hardware',
      desc: 'Inductive motor loads (AC compressors, pool pumps, elevator drives) cause the current to lag voltage. Sizing and installing automatic capacitor banks brings power factor close to 0.99, eliminating utility penalties.'
    },
    {
      title: 'Variable Frequency Drive (VFD) Retrofits on Motors',
      saving: '30% - 50% Motor Consumption',
      difficulty: 'Engineering Retrofit',
      desc: 'Traditional single-speed pumps and air blower fans run at 100% capacity and throttle airflow with dampers. Fitting VFDs enables motors to run at 70% speed when demand is lower, saving dramatic power due to the cubic affinity law.'
    },
    {
      title: 'Dynamic Time-of-Use (TOU) Peak Demand Shaving',
      saving: '18% - 35% Cost Reduction',
      difficulty: 'Behavioral / Automated',
      desc: 'Most power utilities charge 2x to 3x higher rates between 2 PM and 8 PM. Automating water heaters, dishwashers, and thermal pre-cooling before 2 PM shifts high wattage to cheap off-peak hours.'
    },
    {
      title: 'Micro-Zone Smart Thermostat Algorithms',
      saving: '15% - 28% HVAC Cost',
      difficulty: 'Easy / Smart Device',
      desc: 'Cooling unoccupied zones wastes immense thermal power. Multi-sensor micro-zoning adjusts airflow based on occupancy and prevents short-cycling of compressor motors.'
    },
    {
      title: 'LED Lumen Matching & Motion Harvesting',
      saving: '40% - 70% Lighting Power',
      difficulty: 'Easy / Low Cost',
      desc: 'Upgrading fluorescent or halogen fixtures to high-CRI LED tubes with passive infrared (PIR) motion sensors in corridors, bathrooms, and warehouses.'
    },
    {
      title: 'Harmonic Filter Chokes for Sensitive Electronics',
      saving: '10% Waste Heat Reduction',
      difficulty: 'Specialized Engineering',
      desc: 'Non-linear loads like variable speed drives and PC power supplies inject triplen harmonics into the neutral conductor, overheating cables. Harmonic traps clean the waveform.'
    },
    {
      title: 'Compressor Coil Chemical Cleaning & Thermal Insulation',
      saving: '12% - 20% Cooling Efficiency',
      difficulty: 'Maintenance Task',
      desc: 'Dust-caked condenser coils force the compressor to work at elevated condensing temperatures, drawing 25% more current. Routine chemical foaming restores heat transfer.'
    },
    {
      title: 'Inverter-Driven Star Rated Appliance Upgrades',
      saving: 'Up to $1,400 / Year',
      difficulty: 'CapEx Upgrade',
      desc: 'Replacing 10+ year old split AC units with BLDC (Brushless DC) inverter compressors that modulate speeds smoothly without massive starting current surges.'
    },
    {
      title: 'Sub-Metering & IoT Circuit Telemetry',
      saving: 'Actionable 20% Awareness Gain',
      difficulty: 'Moderate',
      desc: 'You cannot manage what you do not measure. Installing split-core CT sensor monitors inside the main electrical panel gives second-by-second visibility into which appliance is burning money.'
    }
  ];

  const checklistItems = [
    'Check electrical panel breaker terminals with a thermal gun for hot spots',
    'Verify that your 3-phase power load is evenly balanced across all 3 phases (under 5% deviation)',
    'Confirm that refrigerator and freezer door gaskets seal airtight (dollar-bill test)',
    'Check water heater temperature is set to optimal 120°F (49°C) instead of 140°F',
    'Ensure all outdoor AC condenser units have at least 2 feet of clear breathing clearance',
    'Schedule heavy battery chargers and pool filtration pumps to run strictly off-peak',
    'Replace non-inverter motor starters with soft-starters or variable frequency drives'
  ];

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="space-y-24 py-12 md:py-16">
      {/* HEADER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Proven Engineering Blueprints</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
            Energy Saving Solutions
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            Scientific, actionable strategies to eliminate electrical waste, optimize circuit thermodynamics, and permanently reduce your utility bills.
          </p>
        </div>
      </section>

      {/* TOP 10 HIGH IMPACT ELECTRONIC TWEAKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-blue-400">
              <Zap className="w-4 h-4" />
              <span>Engineered Interventions</span>
            </div>
            <h2 className="text-3xl font-bold font-heading text-white mt-1">
              Top 10 High-Impact Electronic Tweaks
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Ranked by return-on-investment and implementation speed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {top10Tweaks.map((tweak, i) => (
            <div
              key={i}
              className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 space-y-4 hover:border-blue-500/40 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-500/30 font-mono font-bold text-xs flex items-center justify-center">
                    0{i + 1}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                      {tweak.saving}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                      {tweak.difficulty}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {tweak.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {tweak.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onOpenEnquiryWithPreset('energy_efficiency')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
                >
                  <span>Request Implementation Plan</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE ENERGY AUDIT CHECKLIST */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/90 p-8 md:p-10 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400">Self-Inspection</span>
              <h3 className="text-2xl font-bold font-heading text-white mt-1">
                Facility & Home Energy Health Checklist
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Check off measures already completed to benchmark your facility’s baseline readiness.
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-purple-300 text-xs font-mono text-center">
              <span className="text-lg font-bold text-white block">{completedCount} / {checklistItems.length}</span>
              <span>Completed</span>
            </div>
          </div>

          <div className="space-y-3">
            {checklistItems.map((item, idx) => {
              const isChecked = !!checkedItems[idx];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleCheck(idx)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm flex items-start space-x-3 transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <span className={isChecked ? 'line-through text-slate-400' : 'text-slate-200'}>
                    {item}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Need a professional engineer to perform a complete on-site thermal and power audit?
            </span>
            <button
              type="button"
              onClick={() => onOpenEnquiryWithPreset('energy_audit')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg cursor-pointer"
            >
              Book Full Certified Audit
            </button>
          </div>
        </div>
      </section>

      {/* CASE STUDIES WITH METRICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <Layers className="w-4 h-4" />
            <span>Proven Benchmarks</span>
          </div>
          <h2 className="text-3xl font-bold font-heading text-white">
            Real Operational Case Studies
          </h2>
          <p className="text-sm text-slate-400">
            Empirical data from actual ElectroCare client implementations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Case Study 1 */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Commercial Office (4 Floors)
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">$18,400 / Yr Saved</span>
            </div>

            <h3 className="text-xl font-bold font-heading text-white">
              Centennial Tower: Chiller VFD & Daylight Harvesting
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>The Problem:</strong> The property experienced 45 kVA unmetered peak penalties during summer afternoons due to fixed-speed ventilation fans and simultaneous elevator usage.
            </p>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Pre-Audit Bill</span>
                <span className="font-bold text-rose-400 font-mono">$6,200/mo</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Post-Audit Bill</span>
                <span className="font-bold text-emerald-400 font-mono">$4,350/mo</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Payback Time</span>
                <span className="font-bold text-cyan-400 font-mono">3.8 Months</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 italic">
              "ElectroCare’s harmonic filters and automatic capacitor banks paid for themselves before our second quarterly review."
            </p>
          </div>

          {/* Case Study 2 */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Luxury Smart Villa (6,500 sq ft)
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">$4,850 / Yr Saved</span>
            </div>

            <h3 className="text-xl font-bold font-heading text-white">
              The Ridge Residence: Standby Power & Inverter Tuning
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>The Problem:</strong> The homeowner had 9 split AC units, pool pumps, and a home cinema setup drawing 3.4 kW continuously even when the family was away at work.
            </p>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Pre-Audit Bill</span>
                <span className="font-bold text-rose-400 font-mono">$1,180/mo</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Post-Audit Bill</span>
                <span className="font-bold text-emerald-400 font-mono">$690/mo</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Payback Time</span>
                <span className="font-bold text-cyan-400 font-mono">2.1 Months</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 italic">
              "We dropped our electric bill by 41% without changing our lifestyle, simply by eliminating silent vampire loops."
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
          Ready to Implement These Solutions on Your Property?
        </h3>
        <p className="text-sm text-slate-300">
          Tell us about your property and current electricity bill. We will formulate a tailored energy blueprint.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('enquiry')}
          className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-blue-500/20 cursor-pointer"
        >
          <span>Get Your Custom Energy Blueprint</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
