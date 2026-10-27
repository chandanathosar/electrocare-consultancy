import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Tag,
  Building2,
  ShieldCheck,
  Loader2,
  Package,
  Phone,
  Video,
  MapPin,
  Mail
} from 'lucide-react';
import { apiService } from '../services/api';

interface TrackEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

export const TrackEnquiryModal: React.FC<TrackEnquiryModalProps> = ({
  isOpen,
  onClose,
  initialCode = ''
}) => {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results
  const [bookingResult, setBookingResult] = useState<any | null>(null);
  const [orderResult, setOrderResult] = useState<any | null>(null);
  const [enquiryResult, setEnquiryResult] = useState<any | null>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      handleSearch(initialCode);
    }
  }, [initialCode]);

  if (!isOpen) return null;

  const handleSearch = async (targetCode?: string) => {
    const searchCode = (targetCode || code).trim();
    if (!searchCode) {
      setError('Please enter a Reference Code (e.g. BK-EC-..., ORD-IN-..., or EC-...).');
      return;
    }

    setLoading(true);
    setError(null);
    setBookingResult(null);
    setOrderResult(null);
    setEnquiryResult(null);

    const upper = searchCode.toUpperCase();

    // 1. If code starts with BK- or contains BK
    if (upper.startsWith('BK-') || upper.startsWith('BK')) {
      try {
        const res = await apiService.trackBooking(upper);
        if (res.success && res.booking) {
          setBookingResult(res.booking);
          setLoading(false);
          return;
        }
      } catch (err) {
        // Fallback to enquiry/order check
      }
    }

    // 2. If code starts with ORD-
    if (upper.startsWith('ORD-') || upper.startsWith('ORD')) {
      try {
        const res = await apiService.trackOrder(upper);
        if (res.success && res.order) {
          setOrderResult(res.order);
          setLoading(false);
          return;
        }
      } catch (err) {
        // Fallback
      }
    }

    // 3. Enquiry track check
    try {
      const res = await apiService.trackEnquiry(upper);
      if (res.success && res.enquiry) {
        setEnquiryResult(res.enquiry);
        setLoading(false);
        return;
      }
    } catch {
      // try other types
    }

    // Fallback try booking
    try {
      const res = await apiService.trackBooking(upper);
      if (res.success && res.booking) {
        setBookingResult(res.booking);
        setLoading(false);
        return;
      }
    } catch {}

    // Fallback try order
    try {
      const res = await apiService.trackOrder(upper);
      if (res.success && res.order) {
        setOrderResult(res.order);
        setLoading(false);
        return;
      }
    } catch {}

    setError(`No record found matching reference code "${searchCode}". Please verify your email or order confirmation.`);
    setLoading(false);
  };

  const renderBadge = (status?: string) => {
    switch (status) {
      case 'confirmed':
      case 'resolved':
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            {status.toUpperCase()}
          </span>
        );
      case 'in_progress':
      case 'processing':
      case 'dispatched':
      case 'contacted':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {status.toUpperCase().replace('_', ' ')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {(status || 'PENDING').toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-blue-500/30 bg-slate-900 p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading text-white">Track Booking, Order & Enquiry</h3>
            <p className="text-xs text-slate-400">Query live backend database with your Reference Code</p>
          </div>
        </div>

        {/* Search input form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSearch();
          }}
          className="mb-6"
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g. BK-EC-..., ORD-IN-..., or EC-..."
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Lookup</span>
                </>
              )}
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 mt-2 px-1 gap-1">
            <span>Examples:</span>
            <button type="button" onClick={() => { setCode('EC-94812'); handleSearch('EC-94812'); }} className="text-blue-400 underline hover:text-blue-300">EC-94812 (Enquiry)</button>
            <button type="button" onClick={() => { setCode('ORD-IN-84190'); handleSearch('ORD-IN-84190'); }} className="text-emerald-400 underline hover:text-emerald-300">ORD-IN-84190 (Order)</button>
          </div>
        </form>

        {/* Error Feedback */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start space-x-2.5 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. CONSULTATION BOOKING RESULT */}
        {bookingResult && (
          <div className="rounded-2xl border border-cyan-500/40 bg-slate-800/60 p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div>
                <span className="text-[10px] uppercase font-mono text-cyan-400 block font-semibold">Consultation Booking</span>
                <span className="text-lg font-bold font-mono text-cyan-300">{bookingResult.id}</span>
              </div>
              <div>{renderBadge(bookingResult.status)}</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Service:</span>
                <strong className="text-white">{bookingResult.serviceName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Scheduled Date & Time:</span>
                <span className="font-mono text-emerald-400 font-bold">{bookingResult.preferredDate} at {bookingResult.preferredTime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Format:</span>
                <span className="text-purple-300 font-medium">{bookingResult.consultationType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Client:</span>
                <span className="text-slate-200">{bookingResult.customerName}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Certified Lead Power Engineer assigned to your appointment.</span>
            </div>
          </div>
        )}

        {/* 2. GADGET ORDER RESULT */}
        {orderResult && (
          <div className="rounded-2xl border border-emerald-500/40 bg-slate-800/60 p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div>
                <span className="text-[10px] uppercase font-mono text-emerald-400 block font-semibold">Gadget Order Details</span>
                <span className="text-lg font-bold font-mono text-cyan-300">{orderResult.id}</span>
              </div>
              <div>{renderBadge(orderResult.status)}</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Customer Name:</span>
                <strong className="text-white">{orderResult.customer?.name}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Total Amount:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ₹{orderResult.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="text-slate-200 capitalize font-mono">
                  {orderResult.paymentMethod?.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="py-1">
                <span className="text-slate-400 block mb-1">Ordered Appliances:</span>
                <div className="space-y-1">
                  {orderResult.items?.map((it: any, idx: number) => (
                    <div key={idx} className="text-slate-200 font-mono text-[11px] flex justify-between">
                      <span>{it.quantity}x {it.name}</span>
                      <span>₹{(it.quantity * it.price).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. ENQUIRY RESULT */}
        {enquiryResult && (
          <div className="rounded-2xl border border-indigo-500/30 bg-slate-800/60 p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Enquiry ID</span>
                <span className="text-lg font-bold font-mono text-cyan-300">{enquiryResult.id}</span>
              </div>
              <div>{renderBadge(enquiryResult.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-blue-400" />
                  Category:
                </span>
                <span className="font-medium text-white capitalize">
                  {enquiryResult.category?.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-purple-400" />
                  Facility:
                </span>
                <span className="font-medium text-white">{enquiryResult.propertyType || 'Residential'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  Registered Date:
                </span>
                <span className="font-medium text-slate-200">
                  {enquiryResult.createdAt ? new Date(enquiryResult.createdAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  Client Name:
                </span>
                <span className="font-medium text-slate-200">{enquiryResult.name}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300">
              💡 Our engineering team has logged this request in our active roster. If urgent action is required, reach out directly with this Reference ID.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
