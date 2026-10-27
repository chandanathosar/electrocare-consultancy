import React from 'react';
import { Zap, ShieldCheck, Mail, Phone, MapPin, ArrowRight, Shield, Award, CheckCircle } from 'lucide-react';
import { PageId } from '../types';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  onOpenTrackModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenTrackModal }) => {
  const handleNav = (page: PageId) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-sm">
      {/* Top Banner / Guarantee */}
      <div className="border-b border-slate-800/60 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-base font-bold font-heading text-white">
                Guaranteed Electricity Bill Reduction & Equipment Longevity
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Independent, certified electrical engineers delivering data-backed energy audits across residential and commercial sectors.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleNav('enquiry')}
            className="shrink-0 flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <span>Request Free Initial Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Footer Links Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
        {/* Brand Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-md shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold font-heading text-white">
                Electro<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Care</span>
              </span>
              <span className="text-[10px] tracking-widest font-mono text-slate-400 uppercase block -mt-1">
                Consultancy
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            ElectroCare Consultancy is a premier electronic engineering and energy optimization consultancy. We empower businesses, facilities, and homeowners to curtail excessive power expenses, rectify harmonic distortion, and extend appliance lifecycle.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Certified & Secure Database</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Customer enquiries are saved permanently in our verified backend repository with zero third-party disclosure.
            </p>
          </div>
        </div>

        {/* Quick Pages Navigation (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Navigation</h5>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                type="button"
                onClick={() => handleNav('home')}
                className="hover:text-blue-400 transition-colors"
              >
                Home
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNav('about')}
                className="hover:text-blue-400 transition-colors"
              >
                About Us
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNav('services')}
                className="hover:text-blue-400 transition-colors"
              >
                Our Services
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNav('energy-saving')}
                className="hover:text-blue-400 transition-colors"
              >
                Energy Saving Solutions
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNav('products')}
                className="hover:text-blue-400 transition-colors text-yellow-300 font-medium"
              >
                Gadgets Store (₹)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNav('booking')}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center space-x-1"
              >
                <span>Book Consultation</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300">Live</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNav('contact')}
                className="hover:text-blue-400 transition-colors"
              >
                Contact Us
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNav('enquiry')}
                className="hover:text-blue-400 transition-colors"
              >
                Customer Enquiry Form
              </button>
            </li>
          </ul>
        </div>

        {/* Core Services (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Our Services</h5>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                type="button"
                onClick={() => handleNav('services')}
                className="text-left hover:text-blue-400 transition-colors flex items-center space-x-1.5"
              >
                <CheckCircle className="w-3 h-3 text-blue-500 shrink-0" />
                <span>Electricity Bill Reduction</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNav('services')}
                className="text-left hover:text-blue-400 transition-colors flex items-center space-x-1.5"
              >
                <CheckCircle className="w-3 h-3 text-indigo-500 shrink-0" />
                <span>Energy Efficiency Advice</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNav('services')}
                className="text-left hover:text-blue-400 transition-colors flex items-center space-x-1.5"
              >
                <CheckCircle className="w-3 h-3 text-purple-500 shrink-0" />
                <span>Electronic Appliance Advice</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNav('services')}
                className="text-left hover:text-blue-400 transition-colors flex items-center space-x-1.5"
              >
                <CheckCircle className="w-3 h-3 text-pink-500 shrink-0" />
                <span>Energy Audit Guidance</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNav('services')}
                className="text-left hover:text-blue-400 transition-colors flex items-center space-x-1.5"
              >
                <CheckCircle className="w-3 h-3 text-cyan-500 shrink-0" />
                <span>Energy-Saving Products</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Contact Info & Admin Access (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Consultation Desk</h5>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Suite 408, Power Plaza, Innovation Boulevard, Technology Park</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>+1 (800) 482-9382 / (555) 728-3920</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-purple-400 shrink-0" />
              <span>consult@electrocare.com</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col space-y-2">
            <button
              type="button"
              onClick={onOpenTrackModal}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1.5"
            >
              <span>Track Your Enquiry By Reference Code</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleNav('admin')}
              className="inline-flex items-center space-x-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors pt-1"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Secure Admin Management Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 bg-slate-950/90 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ElectroCare Consultancy. All Rights Reserved. Professional Electrical & Electronic Engineering.</p>
          <div className="flex items-center space-x-6">
            <button type="button" onClick={() => handleNav('about')} className="hover:text-slate-300">ISO Standards</button>
            <button type="button" onClick={() => handleNav('contact')} className="hover:text-slate-300">Privacy Policy</button>
            <button type="button" onClick={() => handleNav('admin')} className="text-purple-400 hover:text-purple-300">Admin Login</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
