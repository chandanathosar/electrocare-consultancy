import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, AlertCircle, Sparkles, CheckCircle2, X } from 'lucide-react';
import { apiService } from '../services/api';

interface DemoAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

export const DemoAccessModal: React.FC<DemoAccessModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'College Demonstration Access Required',
  description = 'To protect this private college project from unauthorized internet submissions, booking and ordering require demonstration authorization.'
}) => {
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the demonstration passcode.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiService.verifyDemoPasscode(passcode.trim());
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setPasscode('');
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid demonstration passcode. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDefaultCode = () => {
    setPasscode('ELECTRO-DEMO-2026');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-blue-600/30 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-400 shadow-lg shadow-purple-500/10">
            {success ? <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-scale-in" /> : <Lock className="w-7 h-7" />}
          </div>

          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Private Presentation Guard</span>
            </div>
            <h3 className="text-xl font-bold font-heading text-white">{title}</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {description}
            </p>
          </div>

          {success ? (
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Demo Mode Authorized! Unlocking features...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Demonstration Access Passcode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter demo passcode"
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 focus:border-purple-500 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-mono"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Presentation helper button */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Presentation Code:</span>
                <button
                  type="button"
                  onClick={handleUseDefaultCode}
                  className="font-mono text-purple-400 hover:text-purple-300 underline font-semibold cursor-pointer"
                >
                  ELECTRO-DEMO-2026
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Verifying Passcode...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Unlock Demonstration Mode</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="text-[11px] text-slate-500 text-center">
            Demo submissions are marked as sample records and protected by backend authorization.
          </p>
        </div>
      </div>
    </div>
  );
};
