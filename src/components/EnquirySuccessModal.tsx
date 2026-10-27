import React, { useState } from 'react';
import { CheckCircle, Copy, Check, X, ArrowRight, ShieldCheck, Clock, Mail } from 'lucide-react';
import { PageId } from '../types';

interface EnquirySuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  referenceId: string;
  customerName: string;
  email: string;
  category: string;
  onTrackEnquiry: (id: string) => void;
  onNavigate?: (page: PageId) => void;
}

export const EnquirySuccessModal: React.FC<EnquirySuccessModalProps> = ({
  isOpen,
  onClose,
  referenceId,
  customerName,
  email,
  category,
  onTrackEnquiry,
  onNavigate
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedCategory = category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-emerald-500/40 bg-slate-900 p-6 md:p-8 shadow-2xl shadow-emerald-500/10 overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/25">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold font-heading text-white mb-1">
          Enquiry Registered Successfully!
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          Thank you, <strong className="text-white">{customerName}</strong>. Your consultation request for{' '}
          <span className="text-emerald-300 font-medium">{formattedCategory}</span> has been permanently stored in the ElectroCare database.
        </p>

        {/* Unique Reference Number Badge */}
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-800/80 p-4 mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Your Unique Tracking Reference Code:</span>
            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Saved Permanently
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold font-mono tracking-widest text-cyan-300">
              {referenceId}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Service Commitment Steps */}
        <div className="space-y-3 mb-6 text-xs text-slate-300">
          <div className="flex items-start space-x-3">
            <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Guaranteed 24-Hour Review:</strong> Our senior energy engineer will examine your appliance/property requirements.
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Mail className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Direct Communication:</strong> You will receive a tailored diagnosis via <span className="text-cyan-300">{email}</span>.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onTrackEnquiry(referenceId);
            }}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border border-indigo-500/50 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <span>Live Status Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-blue-600/20 cursor-pointer text-center"
          >
            Return to Website
          </button>
        </div>
      </div>
    </div>
  );
};
