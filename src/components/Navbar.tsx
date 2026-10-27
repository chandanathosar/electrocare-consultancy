import React, { useState } from 'react';
import { Zap, Menu, X, Shield, Search, ArrowRight, Activity, ShoppingBag, Calendar } from 'lucide-react';
import { PageId } from '../types';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenTrackModal: () => void;
  isAdminLoggedIn?: boolean;
  isDemoAuthorized?: boolean;
  onOpenDemoModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenTrackModal,
  isAdminLoggedIn = false,
  isDemoAuthorized = false,
  onOpenDemoModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: PageId; label: string; badge?: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'services', label: 'Our Services' },
    { id: 'energy-saving', label: 'Energy Saving Solutions' },
    { id: 'products', label: 'Gadgets & Appliances', badge: '₹ Store' },
    { id: 'booking', label: 'Book Consultation', badge: 'Instant' },
    { id: 'contact', label: 'Contact Us' }
  ];

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      {/* Top micro bar */}
      <div className="hidden md:block border-b border-slate-800/50 bg-slate-900/60 py-1.5 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Certified Electrical & Electronic Energy Auditors</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">ISO 50001 / IEEE Compliant Protocols</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* College Demo Mode Trigger Badge */}
            <button
              type="button"
              onClick={onOpenDemoModal}
              className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                isDemoAuthorized
                  ? 'bg-purple-950/80 border-purple-500/50 text-purple-300 hover:bg-purple-900/60'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-purple-500/50 hover:text-white'
              }`}
            >
              <span>🎓</span>
              <span>{isDemoAuthorized ? 'Demo Mode Active' : 'Unlock College Demo'}</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={onOpenTrackModal}
              className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              <Search className="w-3 h-3" />
              <span>Track Enquiry / Order</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              className={`flex items-center space-x-1 transition-colors cursor-pointer ${
                currentPage === 'admin'
                  ? 'text-purple-400 font-semibold'
                  : 'text-slate-400 hover:text-purple-300'
              }`}
            >
              <Shield className="w-3 h-3 text-purple-400" />
              <span>{isAdminLoggedIn ? 'Admin Active' : 'Admin Portal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 group text-left cursor-pointer focus:outline-none"
          >
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Zap className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xl font-extrabold tracking-tight font-heading text-white">
                  Electro<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Care</span>
                </span>
              </div>
              <span className="text-[10px] tracking-widest font-mono text-slate-400 uppercase block -mt-1">
                Consultancy
              </span>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map(link => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs xl:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white bg-slate-800/80 shadow-inner border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleNavClick('booking')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl font-semibold text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/50 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Book Consultation</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('enquiry')}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 cursor-pointer"
            >
              <span>Enquire</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button
              type="button"
              onClick={onOpenTrackModal}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Track Reference"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          <div className="space-y-1">
            {navLinks.map(link => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-blue-600/20 text-white border border-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <button
              type="button"
              onClick={() => handleNavClick('booking')}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-xs text-cyan-200 bg-cyan-950/60 border border-cyan-500/40 shadow-lg"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Book Consultation Appointment</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('enquiry')}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-indigo-600/20"
            >
              <span>Submit Customer Enquiry</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTrackModal();
                }}
                className="py-2.5 px-3 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 flex items-center justify-center space-x-1.5"
              >
                <Search className="w-3.5 h-3.5 text-blue-400" />
                <span>Track Status</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('admin')}
                className="py-2.5 px-3 rounded-xl text-xs font-medium text-purple-300 bg-purple-950/30 border border-purple-500/30 flex items-center justify-center space-x-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin Login</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
