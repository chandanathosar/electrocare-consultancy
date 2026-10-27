import React, { useState } from 'react';
import { Calculator, ArrowRight, CheckCircle2, Zap, DollarSign, Sparkles } from 'lucide-react';
import { PageId, ServiceCategory } from '../types';

interface SavingsCalculatorProps {
  onOpenEnquiryWithPreset?: (category: ServiceCategory, monthlyBill: string, propertyType: string) => void;
  onNavigate?: (page: PageId) => void;
}

export const SavingsCalculator: React.FC<SavingsCalculatorProps> = ({
  onOpenEnquiryWithPreset,
  onNavigate
}) => {
  const [billAmount, setBillAmount] = useState<number>(450);
  const [propertyType, setPropertyType] = useState<string>('Residential');
  const [selectedLoads, setSelectedLoads] = useState<string[]>([
    'Air Conditioning & Heat Pumps',
    'Refrigeration & Cooling'
  ]);

  const loadOptions = [
    { id: 'ac', label: 'Air Conditioning & Heat Pumps', drain: 0.16 },
    { id: 'refrig', label: 'Refrigeration & Cooling', drain: 0.10 },
    { id: 'motors', label: 'Motors, Pumps & Fans', drain: 0.14 },
    { id: 'lighting', label: 'Continuous Lighting & Signage', drain: 0.08 },
    { id: 'servers', label: 'Server Racks & High-Power Electronics', drain: 0.12 },
    { id: 'heaters', label: 'Water Heaters & Boilers', drain: 0.11 }
  ];

  const toggleLoad = (label: string) => {
    if (selectedLoads.includes(label)) {
      if (selectedLoads.length > 1) {
        setSelectedLoads(selectedLoads.filter(l => l !== label));
      }
    } else {
      setSelectedLoads([...selectedLoads, label]);
    }
  };

  // Base savings percentage calculation
  let savingsFactor = 0.22; // 22% base
  if (propertyType === 'Commercial Office') savingsFactor = 0.28;
  if (propertyType === 'Industrial / Factory') savingsFactor = 0.35;
  if (propertyType === 'Retail / Hospitality') savingsFactor = 0.30;

  // Add load multiplier
  const loadBonus = (selectedLoads.length * 0.025);
  const totalSavingsPercentage = Math.min(Math.round((savingsFactor + loadBonus) * 100), 45);

  const estimatedMonthlySavings = Math.round(billAmount * (totalSavingsPercentage / 100));
  const estimatedAnnualSavings = estimatedMonthlySavings * 12;
  const estimatedCarbonOffsetTons = (estimatedAnnualSavings * 0.0058).toFixed(1);

  const handleConsultationClick = () => {
    let category: ServiceCategory = 'electricity_bill_reduction';
    if (propertyType === 'Industrial / Factory') category = 'energy_audit';
    else if (selectedLoads.includes('Air Conditioning & Heat Pumps')) category = 'electronic_appliances';

    const billRangeString = `$${billAmount} / month`;
    if (onOpenEnquiryWithPreset) {
      onOpenEnquiryWithPreset(category, billRangeString, propertyType);
    } else if (onNavigate) {
      onNavigate('enquiry');
    }
  };

  return (
    <div className="relative rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950 p-6 md:p-10 shadow-2xl overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold font-heading text-white">
            Estimate Your Bill Reduction Potential
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            See how much ElectroCare’s specialized circuit tuning and energy audits can save you.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto px-4 py-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Average client saves 28% to 42%</span>
        </div>
      </div>

      {/* Calculator Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Monthly Bill Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-200">
                Current Monthly Electricity Bill:
              </label>
              <span className="text-2xl font-bold font-heading text-cyan-400 font-mono">
                ${billAmount.toLocaleString()}
                <span className="text-xs text-slate-400 font-normal"> / mo</span>
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={5000}
              step={50}
              value={billAmount}
              onChange={e => setBillAmount(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 transition-all hover:bg-slate-700"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
              <span>$100 (Home)</span>
              <span>$1,500 (Office)</span>
              <span>$3,000 (Commercial)</span>
              <span>$5,000+ (Industrial)</span>
            </div>
          </div>

          {/* Property Type Radio */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2.5">
              Property or Facility Category:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                'Residential',
                'Commercial Office',
                'Retail / Hospitality',
                'Industrial / Factory'
              ].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPropertyType(type)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left border ${
                    propertyType === type
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Electronic Loads */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Major High-Consumption Equipment in Use:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {loadOptions.map(option => {
                const isSelected = selectedLoads.includes(option.label);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleLoad(option.label)}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs text-left transition-all ${
                      isSelected
                        ? 'bg-purple-900/30 border-purple-500/70 text-purple-200'
                        : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-purple-600 text-white' : 'border border-slate-600'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Outputs Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/60 via-slate-900 to-purple-950/40 p-6 shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs uppercase tracking-wider font-semibold text-blue-300">
                Projected Reduction
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {totalSavingsPercentage}% Lower Bills
              </span>
            </div>

            {/* Savings Numbers */}
            <div className="my-6 space-y-4">
              <div>
                <span className="text-xs text-slate-400 block">Estimated Monthly Savings:</span>
                <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 font-mono">
                  ${estimatedMonthlySavings.toLocaleString()}
                  <span className="text-sm text-slate-400 font-sans font-normal"> / month</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Annual Recaptured Capital:</span>
                  <span className="font-bold text-white font-mono">
                    ${estimatedAnnualSavings.toLocaleString()} / yr
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Carbon Footprint Saved:</span>
                  <span className="font-semibold text-emerald-400 font-mono">
                    ~{estimatedCarbonOffsetTons} Tons CO2 / yr
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Typical Payback Timeline:</span>
                  <span className="font-semibold text-purple-300 font-mono">
                    2.4 to 4.8 Months
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Based on empirical data from 1,200+ audited systems. We optimize harmonic loss, standby leakage, and time-of-day tariffs.
            </p>
          </div>

          <button
            type="button"
            onClick={handleConsultationClick}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 cursor-pointer"
          >
            <span>Lock In These Savings (Get Plan)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
