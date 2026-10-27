import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Mail,
  Phone,
  User,
  ArrowRight,
  Zap,
  Sparkles,
  Loader2,
  FileText,
  MessageSquare
} from 'lucide-react';
import { ConsultationBooking, ServiceCategory } from '../types';
import { apiService } from '../services/api';
import { DemoAccessModal } from '../components/DemoAccessModal';

interface BookingPageProps {
  initialService?: string;
  onNavigateHome: () => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  initialService = 'Electricity Bill Reduction Consultation',
  onNavigateHome
}) => {
  // Booking Form State
  const [customerName, setCustomerName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [serviceName, setServiceName] = useState<string>(initialService);

  // Default to tomorrow's date formatted as YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];
  const [preferredDate, setPreferredDate] = useState<string>(minDateStr);

  const [preferredTime, setPreferredTime] = useState<string>('10:30 AM');
  const [consultationType, setConsultationType] = useState<'Online' | 'In-person'>('Online');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [whatsappConsent, setWhatsappConsent] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);

  // Success Confirmation State
  const [confirmedBooking, setConfirmedBooking] = useState<ConsultationBooking | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Presentation Quick Fill Helper
  const fillSampleDemoData = () => {
    setCustomerName('Prof. Rajesh Sharma (College Demo)');
    setEmail('rajesh.demo@electrocare.edu');
    setPhone('9822012345');
    setServiceName('Electricity Bill Reduction Consultation');
    setConsultationType('Online');
    setNotes('Demonstrating 3-phase commercial electrical inspection and harmonic load analysis.');
    setFormErrors({});
    setServerError(null);
  };

  const servicesList = [
    'Electricity Bill Reduction Consultation',
    'Energy Efficiency Advice & Strategies',
    'Electronic Appliance Health & Diagnostics',
    'Level 2 Energy Audit Guidance & Inspection',
    'Energy-Saving Product Consultation',
    'Commercial & Industrial Multi-Site Package'
  ];

  const timeSlots = [
    '09:30 AM - 10:30 AM',
    '10:30 AM - 11:30 AM',
    '11:30 AM - 12:30 PM',
    '02:00 PM - 03:00 PM',
    '03:30 PM - 04:30 PM',
    '05:00 PM - 06:00 PM'
  ];

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!customerName.trim() || customerName.trim().length < 2) {
      errs.name = 'Please enter your full name (at least 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address for appointment confirmation.';
    }

    if (!phone.trim() || phone.trim().length < 8) {
      errs.phone = 'Please enter a valid contact phone or WhatsApp number.';
    }

    if (!preferredDate) {
      errs.date = 'Please select a consultation date.';
    }

    if (consultationType === 'In-person' && !address.trim()) {
      errs.address = 'Please provide the property address for the on-site visit.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await apiService.createBooking({
        customerName,
        email,
        phone,
        serviceName,
        preferredDate,
        preferredTime,
        consultationType,
        notes,
        address: consultationType === 'In-person' ? address : undefined,
        whatsappConsent
      });

      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
      } else {
        setServerError('Unable to book consultation. Please verify time slot.');
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Server error while booking.';
      setServerError(msg);
      if (msg.includes('Access Restricted') || msg.includes('Unauthorized') || msg.includes('demo access code')) {
        setDemoModalOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyBookingId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // SUCCESS CONFIRMATION VIEW
  if (confirmedBooking) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
        <div className="rounded-3xl border border-emerald-500/40 bg-slate-900/95 p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
              {confirmedBooking.isDemo ? '🎓 Demonstration Record Stored' : 'Permanent Database Record Stored'}
            </span>
            <h1 className="text-3xl font-extrabold font-heading text-white mt-3">
              Consultation Confirmed!
            </h1>
            <p className="text-sm text-slate-300 max-w-md mx-auto mt-2">
              Thank you, <strong className="text-white">{confirmedBooking.customerName}</strong>. A certified electrical engineer from <strong>ElectroCare Consultancy</strong> has been scheduled for your session.
            </p>
          </div>

          {/* Demo Submission Banner */}
          {confirmedBooking.isDemo && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-left space-y-1 max-w-lg mx-auto">
              <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider text-amber-400">
                <span>🎓</span>
                <span>College Demonstration Submission — Sample Record</span>
              </div>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                This booking is registered as a demonstration record (<strong>{confirmedBooking.id}</strong>). Confirmation emails are running in Demo Inbox Mode, delivering sample copies to your presentation inbox while isolating third-party inboxes.
              </p>
            </div>
          )}

          {/* Booking ID Badge */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Your Booking Reference ID</span>
              <span className="text-2xl font-bold font-mono text-cyan-300">{confirmedBooking.id}</span>
            </div>
            <button
              type="button"
              onClick={() => copyBookingId(confirmedBooking.id)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold cursor-pointer"
            >
              {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedId ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Session Details Card */}
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-left space-y-3 max-w-lg mx-auto text-xs">
            <div className="flex justify-between py-1 border-b border-slate-700/50">
              <span className="text-slate-400">Consultation Service:</span>
              <span className="font-semibold text-white">{confirmedBooking.serviceName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700/50">
              <span className="text-slate-400">Appointment Date:</span>
              <span className="font-bold text-white">{confirmedBooking.preferredDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700/50">
              <span className="text-slate-400">Time Slot:</span>
              <span className="font-bold text-emerald-400">{confirmedBooking.preferredTime}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700/50">
              <span className="text-slate-400">Consultation Format:</span>
              <span className="font-semibold text-purple-300">{confirmedBooking.consultationType} (Certified Lead Engineer)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700/50">
              <span className="text-slate-400">Notification Email:</span>
              <span className="font-mono text-cyan-300">{confirmedBooking.email}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Mobile / WhatsApp:</span>
              <span className="font-mono text-slate-200">{confirmedBooking.phone}</span>
            </div>
          </div>

          {/* Notification System Delivery Status Indicators */}
          <div className="max-w-lg mx-auto p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2.5 text-xs">
            <span className="text-[11px] font-mono text-purple-400 uppercase font-semibold block">
              Automated Notification Audit Status:
            </span>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                Customer Confirmation Email:
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                  confirmedBooking.emailNotification?.customerStatus === 'sent'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : confirmedBooking.emailNotification?.customerStatus === 'not_configured'
                    ? 'bg-slate-800 text-slate-400 border border-slate-700'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {confirmedBooking.emailNotification?.customerStatus === 'sent'
                  ? 'Delivered'
                  : confirmedBooking.emailNotification?.customerStatus === 'not_configured'
                  ? 'Ready (Key In Server)'
                  : 'Processed'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp Booking Alert:
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                  confirmedBooking.whatsappNotification?.customerStatus === 'sent'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : confirmedBooking.whatsappNotification?.customerStatus === 'not_configured'
                    ? 'bg-slate-800 text-slate-400 border border-slate-700'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {confirmedBooking.whatsappNotification?.customerStatus === 'sent'
                  ? 'Dispatched'
                  : confirmedBooking.whatsappNotification?.customerStatus === 'not_configured'
                  ? 'Server Logged'
                  : 'Processed'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 pt-1">
              Admin dispatch notifications were also broadcasted to the ElectroCare management console.
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <button
              type="button"
              onClick={onNavigateHome}
              className="py-3 px-6 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer shadow-lg"
            >
              Return to Website
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmedBooking(null);
                setCustomerName('');
                setEmail('');
                setPhone('');
                setNotes('');
              }}
              className="py-3 px-6 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer"
            >
              Book Another Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // BOOKING FORM VIEW
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-Time Consultant Scheduling</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          Book an Electrical & Electronic Consultation
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
          Reserve an appointment with our certified power engineers. Automatic email and WhatsApp notifications are dispatched instantly upon confirmation.
        </p>
      </div>

      {/* Main Booking Container */}
      <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/90 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {serverError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
            <div>
              <strong className="block font-semibold">Booking Notice:</strong>
              <span>{serverError}</span>
            </div>
          </div>
        )}

        {/* Presentation Sample Data Quick Loader */}
        <div className="mb-6 p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 text-xs text-purple-300">
            <span className="text-lg">🎓</span>
            <div>
              <span className="font-semibold text-white block sm:inline">College Demo Presentation Mode:</span>{' '}
              <span className="text-slate-300">Quick-fill standard test data across all 7 fields to demonstrate the booking process.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={fillSampleDemoData}
            className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold cursor-pointer shrink-0 transition-colors"
          >
            Load Sample Data
          </button>
        </div>

        <form onSubmit={handleBookingSubmit} className="space-y-6">
          {/* 1. Service Selection */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>1. Select Consultation Service</span>
            </label>
            <select
              value={serviceName}
              onChange={e => setServiceName(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {servicesList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* 2. Format: Online vs In-person */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold mb-2">
              2. Consultation Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConsultationType('Online')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start space-x-3 ${
                  consultationType === 'Online'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Online Video Consultation</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Share past electricity utility bills & equipment ratings on a private video conference.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConsultationType('In-person')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start space-x-3 ${
                  consultationType === 'In-person'
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">On-Site In-Person Audit</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Senior engineer arrives with FLIR thermal camera and Fluke 3-phase power loggers.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Schedule: Date & Time Picker */}
          <div className="pt-2 border-t border-slate-800">
            <h3 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>3. Choose Date & Time Slot</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  required
                  min={minDateStr}
                  value={preferredDate}
                  onChange={e => setPreferredDate(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                {formErrors.date && <p className="text-red-400 text-[11px] mt-1">{formErrors.date}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Preferred Time Slot *
                </label>
                <select
                  value={preferredTime}
                  onChange={e => setPreferredTime(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {timeSlots.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 4. Customer Details */}
          <div className="pt-2 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>4. Your Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Mehta"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className={`w-full bg-slate-800/80 border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 ${
                    formErrors.name ? 'border-red-500' : 'border-slate-700'
                  }`}
                />
                {formErrors.name && <p className="text-red-400 text-[11px] mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address * (For Confirmation)
                </label>
                <input
                  type="email"
                  required
                  placeholder="vikram@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full bg-slate-800/80 border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 ${
                    formErrors.email ? 'border-red-500' : 'border-slate-700'
                  }`}
                />
                {formErrors.email && <p className="text-red-400 text-[11px] mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Contact Phone / WhatsApp Mobile *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold font-mono text-slate-400 pointer-events-none">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="98220 12345"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className={`w-full bg-slate-800/80 border rounded-xl pl-16 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono ${
                      formErrors.phone ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                </div>
                {formErrors.phone && <p className="text-red-400 text-[11px] mt-1">{formErrors.phone}</p>}
                
                {/* WhatsApp Notification Consent */}
                <label className="flex items-start gap-2 mt-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={whatsappConsent}
                    onChange={e => setWhatsappConsent(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-400 border-slate-700 bg-slate-800 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 leading-tight">
                    Send booking confirmation and appointment reminders to this number via WhatsApp (+91)
                  </span>
                </label>
              </div>
            </div>

            {consultationType === 'In-person' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Property / Facility Address for On-Site Audit *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Building / Plot No., Sector, City, Landmark"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className={`w-full bg-slate-800/80 border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 ${
                    formErrors.address ? 'border-red-500' : 'border-slate-700'
                  }`}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Notes or Specific Problem Area (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Unexplained summer tariff spikes, motor harmonic noise, server room tripping..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Reassurance Banner */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex items-center space-x-2 text-slate-200 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Guaranteed Booking & Notification Delivery</span>
            </div>
            <p>
              Your booking is stored permanently in the ElectroCare database. Automated confirmation notices are dispatched to your email and WhatsApp number.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 cursor-pointer disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Reserving Consultation Slot & Dispatching Notices...</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                <span>Confirm & Book Consultation Appointment</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* College Demonstration Authorization Modal */}
      <DemoAccessModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onSuccess={() => {
          setDemoModalOpen(false);
          setServerError(null);
        }}
      />
    </div>
  );
};
