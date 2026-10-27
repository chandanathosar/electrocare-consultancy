import React, { useState } from 'react';
import {
  Send,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Building2,
  DollarSign,
  Phone,
  Mail,
  User,
  MessageSquare,
  FileText,
  Loader2
} from 'lucide-react';
import { ServiceCategory, CustomerEnquiryPayload } from '../types';
import { apiService } from '../services/api';

interface EnquiryPageProps {
  initialCategory?: ServiceCategory;
  initialMonthlyBill?: string;
  initialPropertyType?: string;
  onSuccess: (referenceId: string, name: string, email: string, category: string) => void;
}

export const EnquiryPage: React.FC<EnquiryPageProps> = ({
  initialCategory = 'electricity_bill_reduction',
  initialMonthlyBill = '$300 - $600',
  initialPropertyType = 'Residential',
  onSuccess
}) => {
  const [formData, setFormData] = useState<CustomerEnquiryPayload>({
    name: '',
    email: '',
    phone: '',
    category: initialCategory,
    propertyType: initialPropertyType,
    estimatedMonthlyBill: initialMonthlyBill,
    preferredContactTime: 'Anytime',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const categories = [
    { value: 'electricity_bill_reduction', label: 'Electricity Bill Reduction Consultation' },
    { value: 'energy_efficiency', label: 'Energy Efficiency Advice & Strategies' },
    { value: 'electronic_appliances', label: 'Electronic Appliance Health & Upgrades' },
    { value: 'energy_audit', label: 'Full Energy Audit Guidance & Inspection' },
    { value: 'product_recommendation', label: 'Energy-Saving Product Consultation' },
    { value: 'commercial_industrial', label: 'Commercial & Industrial Facility Package' },
    { value: 'other', label: 'Other Electronic Consultancy Needs' }
  ];

  const propertyTypes = [
    'Residential Home / Villa',
    'Apartment / Condominium',
    'Commercial Office Space',
    'Retail Shop / Supermarket',
    'Healthcare / Diagnostic Lab',
    'Warehouse / Light Industrial',
    'Educational Campus'
  ];

  const billRanges = [
    'Under $150 / month',
    '$150 - $350 / month',
    '$350 - $700 / month',
    '$700 - $1,500 / month',
    '$1,500 - $3,500 / month',
    '$3,500 - $8,000 / month',
    '$8,000+ / month (Enterprise)'
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please provide your full name (at least 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Please provide a description of your requirement (min 10 characters).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.submitEnquiry(formData);
      if (response.success && response.referenceId) {
        onSuccess(
          response.referenceId,
          formData.name,
          formData.email,
          formData.category
        );
        // Clear form
        setFormData({
          name: '',
          email: '',
          phone: '',
          category: 'electricity_bill_reduction',
          propertyType: 'Residential Home / Villa',
          estimatedMonthlyBill: '$350 - $700 / month',
          preferredContactTime: 'Anytime',
          message: ''
        });
      } else {
        setServerError(response.error || 'Failed to submit enquiry.');
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Server error while submitting enquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Permanently Recorded & Protected Database</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          Customer Consultation Enquiry
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
          Submit your electrical setup details. Our senior consulting engineers will assess your tariff rates and return a diagnostic plan within 24 hours.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/90 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Server Error Banner */}
        {serverError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
            <div>
              <strong className="block font-semibold">Submission Encountered an Issue:</strong>
              <span>{serverError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Customer Info */}
          <div>
            <h3 className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold mb-4 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>1. Contact & Identity Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alexander Vance"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full bg-slate-800/80 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors ${
                      errors.name ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-red-400 text-[11px] mt-1">{errors.name}</p>}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="alexander@company.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full bg-slate-800/80 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors ${
                      errors.email ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Preferred Contact Time */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Preferred Callback Time
                </label>
                <select
                  value={formData.preferredContactTime}
                  onChange={e => setFormData({ ...formData, preferredContactTime: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Anytime">Anytime during business hours</option>
                  <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon (12 PM - 5 PM)">Afternoon (12 PM - 5 PM)</option>
                  <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Consultation Scope */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs uppercase font-mono tracking-wider text-purple-400 font-semibold mb-4 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>2. Consultation Category & Facility Specifications</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Enquiry Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Property or Facility Type
                </label>
                <select
                  value={formData.propertyType}
                  onChange={e => setFormData({ ...formData, propertyType: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  {propertyTypes.map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monthly Bill Range */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Current Estimated Monthly Bill
                </label>
                <select
                  value={formData.estimatedMonthlyBill}
                  onChange={e => setFormData({ ...formData, estimatedMonthlyBill: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  {billRanges.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Detailed Description */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-semibold mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>3. Description of Requirement or Electrical Pain Points</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Explain your specific challenge or equipment setup <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Please describe your key appliances (e.g. AC compressors, heavy refrigeration, pumps, server racks), any unusual voltage fluctuations, or specific percentage reduction you are aiming for..."
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className={`w-full bg-slate-800/80 border rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors ${
                  errors.message ? 'border-red-500' : 'border-slate-700'
                }`}
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                <span>{errors.message ? <span className="text-red-400">{errors.message}</span> : 'Minimum 10 characters required.'}</span>
                <span>{formData.message.length} / 3000 chars</span>
              </div>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="flex items-center space-x-2 text-slate-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacy & Storage Assurance</span>
            </div>
            <p className="leading-relaxed">
              Your contact and utility data are permanently secured in our private server database. They are accessed strictly by certified ElectroCare engineers to generate your diagnostic assessment.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2.5 py-4 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Recording in Database...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Customer Enquiry Form</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
