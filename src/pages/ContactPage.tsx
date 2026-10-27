import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ArrowRight,
  Zap,
  Building
} from 'lucide-react';
import { PageId } from '../types';
import { ENERGY_SOLUTIONS_FAQS } from '../data/servicesData';

interface ContactPageProps {
  onNavigate: (page: PageId) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-20 py-12 md:py-16">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Direct Engineering Consultation</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
            Contact ElectroCare Consultancy
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            Have questions about an upcoming electrical audit, harmonic distortion, or lowering your monthly tariff charges? Our certified engineers are here to advise you.
          </p>
        </div>
      </section>

      {/* Contact Channels Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Channel 1: Headquarters */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Central Engineering HQ</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Suite 408, Power Plaza, Innovation Boulevard, High-Tech Corridor, Metro City
              </p>
            </div>
            <div className="text-[11px] text-cyan-300 font-mono">
              On-site diagnostic dispatch available
            </div>
          </div>

          {/* Channel 2: Telephone */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Direct Advisory Helplines</h3>
              <p className="text-xs text-slate-300 mt-1 font-mono font-medium">
                Toll-Free: +1 (800) 482-9382
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Direct Line: +1 (555) 728-3920
              </p>
            </div>
            <div className="text-[11px] text-emerald-400">
              Emergency assistance available for critical plants
            </div>
          </div>

          {/* Channel 3: Email */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Technical Inquiries</h3>
              <p className="text-xs text-slate-300 mt-1 font-mono">
                consult@electrocare.com
              </p>
              <p className="text-xs text-slate-400 font-mono">
                audits@electrocare.com
              </p>
            </div>
            <div className="text-[11px] text-purple-300">
              Guaranteed review within 24 business hours
            </div>
          </div>

          {/* Channel 4: Working Hours */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Consulting Schedule</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Monday – Friday: 8:00 AM – 6:30 PM<br />
                Saturday: 9:00 AM – 3:00 PM<br />
                Sunday: Closed for field testing
              </p>
            </div>
            <div className="text-[11px] text-indigo-300">
              Time-zone flexible remote tariff assessments
            </div>
          </div>
        </div>
      </section>

      {/* QUICK INQUIRY LAUNCHER CARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-blue-500/40 bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Instant Registration
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Prefer to send your specs through our secure database form?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Submit your property details, upload bill ranges, and get assigned an electrical engineering consultant with a tracking reference code.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('enquiry')}
            className="shrink-0 flex items-center space-x-2 px-8 py-4 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <span>Open Customer Enquiry Form</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-purple-400">
            <HelpCircle className="w-4 h-4" />
            <span>Common Questions</span>
          </div>
          <h2 className="text-3xl font-bold font-heading text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Clear, transparent answers about our electrical consultancy, auditing methods, and database storage.
          </p>
        </div>

        <div className="space-y-3">
          {ENERGY_SOLUTIONS_FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <span className="pr-4">{faq.question}</span>
                  <div className="p-1 rounded-lg bg-slate-800 text-slate-400">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
