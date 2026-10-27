import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  QrCode,
  Smartphone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  RefreshCw,
  X,
  Lock,
  ArrowRight,
  Info
} from 'lucide-react';
import { CustomerOrder, PaymentIntentResponse, PaymentGatewayConfig } from '../types';
import { apiService } from '../services/api';

interface PaymentModalProps {
  order: CustomerOrder;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (updatedOrder: CustomerOrder) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onPaymentSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'phonepe_upi' | 'qr_code' | 'razorpay'>('phonepe_upi');
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentResponse | null>(null);
  const [gatewayConfig, setGatewayConfig] = useState<PaymentGatewayConfig | null>(null);
  const [loadingIntent, setLoadingIntent] = useState<boolean>(true);
  const [intentError, setIntentError] = useState<string | null>(null);
  
  // Polling and status
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [paymentVerified, setPaymentVerified] = useState<boolean>(false);
  const [verifiedOrder, setVerifiedOrder] = useState<CustomerOrder | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  // UI helpers
  const [copiedVpa, setCopiedVpa] = useState<boolean>(false);
  const [copiedOrderId, setCopiedOrderId] = useState<boolean>(false);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user is on mobile browser
    const checkMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    setIsMobileDevice(checkMobile);
  }, []);

  // Fetch payment intent and config on modal open
  useEffect(() => {
    if (isOpen && order) {
      initPayment();
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, order.id]);

  const initPayment = async () => {
    setLoadingIntent(true);
    setIntentError(null);
    setVerificationError(null);
    try {
      const [intentRes, configRes] = await Promise.all([
        apiService.createPaymentIntent(order.id),
        apiService.getPaymentConfig()
      ]);
      setPaymentIntent(intentRes);
      if (configRes.success && configRes.gateway) {
        setGatewayConfig(configRes.gateway);
      }

      // Start polling for payment status (e.g. from mobile app completion or webhook)
      startPolling(order.id);
    } catch (err) {
      console.error('Error initiating payment:', err);
      setIntentError(err instanceof Error ? err.message : 'Could not generate payment gateway session.');
    } finally {
      setLoadingIntent(false);
    }
  };

  const startPolling = (orderId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setIsPolling(true);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await apiService.getPaymentStatus(orderId);
        if (res.success && res.paymentStatus === 'paid') {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsPolling(false);
          setPaymentVerified(true);
          const fullOrderRes = await apiService.trackOrder(orderId);
          if (fullOrderRes.success && fullOrderRes.order) {
            const finalOrder = fullOrderRes.order as CustomerOrder;
            setVerifiedOrder(finalOrder);
            onPaymentSuccess(finalOrder);
          }
        }
      } catch (e) {
        // Silent failure during polling
      }
    }, 3000);
  };

  // Launch official Razorpay standard checkout if enabled
  const handleRazorpayCheckout = () => {
    if (!paymentIntent?.razorpayKeyId) {
      setVerificationError('Razorpay Live Key is not configured on the backend. Please use UPI/PhonePe or Sandbox Mode.');
      return;
    }

    if (!(window as any).Razorpay) {
      // Dynamically load Razorpay checkout script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => triggerRazorpayModal();
      script.onerror = () => setVerificationError('Failed to load Razorpay checkout SDK.');
      document.body.appendChild(script);
    } else {
      triggerRazorpayModal();
    }
  };

  const triggerRazorpayModal = () => {
    if (!paymentIntent?.razorpayKeyId) return;

    const options = {
      key: paymentIntent.razorpayKeyId,
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      name: 'ElectroCare Consultancy',
      description: `Payment for Order ${order.id}`,
      order_id: paymentIntent.razorpayOrderId,
      prefill: {
        name: order.customer.name,
        email: order.customer.email || '',
        contact: order.customer.phone
      },
      theme: {
        color: '#1e40af'
      },
      handler: async (response: any) => {
        setVerifyingPayment(true);
        setVerificationError(null);
        try {
          const verifyRes = await apiService.verifyRazorpayPayment({
            orderId: order.id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });

          if (verifyRes.success && verifyRes.verified) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setPaymentVerified(true);
            setVerifiedOrder(verifyRes.order);
            onPaymentSuccess(verifyRes.order);
          } else {
            setVerificationError(verifyRes.message || 'Payment signature verification failed.');
          }
        } catch (err) {
          setVerificationError(err instanceof Error ? err.message : 'Server verification failed.');
        } finally {
          setVerifyingPayment(false);
        }
      },
      modal: {
        ondismiss: () => {
          console.log('Razorpay modal dismissed by user');
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  // Test mode sandbox verification
  const handleSimulateSandboxVerification = async () => {
    setVerifyingPayment(true);
    setVerificationError(null);
    try {
      const mockRef = `UPI-SANDBOX-${Date.now().toString().slice(-6)}`;
      const verifyRes = await apiService.verifyUpiPayment({
        orderId: order.id,
        transactionRef: mockRef,
        upiApp: 'phonepe',
        isTestConfirmation: true
      });

      if (verifyRes.success && verifyRes.verified) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setPaymentVerified(true);
        setVerifiedOrder(verifyRes.order);
        onPaymentSuccess(verifyRes.order);
      } else {
        setVerificationError(verifyRes.message || 'Payment verification failed.');
      }
    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setVerifyingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col my-auto transition-all">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-6 py-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-bold tracking-wider uppercase text-blue-200">
                Official Secure Payment Gateway
              </span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight font-heading flex items-center gap-2">
              <span>Complete Payment</span>
              <Lock className="w-4 h-4 text-cyan-300" />
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Details Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Order Reference</div>
            <div className="font-mono font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <span>{order.id}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(order.id);
                  setCopiedOrderId(true);
                  setTimeout(() => setCopiedOrderId(false), 2000);
                }}
                className="text-slate-400 hover:text-blue-600"
                title="Copy Order ID"
              >
                {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Payable Amount</div>
            <div className="text-xl font-extrabold font-mono text-emerald-600">
              ₹{order.totalAmount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 flex-1">
          {/* VERIFIED SUCCESS SCREEN */}
          {paymentVerified ? (
            <div className="text-center py-6 space-y-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-2xl font-extrabold text-slate-900 font-heading">
                  Payment Verified!
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  Your payment of <strong className="text-emerald-700 font-mono">₹{order.totalAmount.toLocaleString('en-IN')}</strong> has been confirmed by the server and permanently recorded.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-800 font-semibold">Payment Status:</span>
                  <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    PAID (Verified)
                  </span>
                </div>
                {verifiedOrder?.paymentDetails?.razorpayPaymentId && (
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600">Razorpay Payment ID:</span>
                    <span className="font-mono font-semibold text-slate-800">{verifiedOrder.paymentDetails.razorpayPaymentId}</span>
                  </div>
                )}
                {verifiedOrder?.paymentDetails?.upiTransactionRef && (
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600">UPI Transaction Ref:</span>
                    <span className="font-mono font-semibold text-slate-800">{verifiedOrder.paymentDetails.upiTransactionRef}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-600">Customer:</span>
                  <span className="font-semibold text-slate-800">{order.customer.name}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-600">Recipient Email:</span>
                  <span className="font-semibold text-slate-800">{order.customer.email || 'N/A'}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 text-left flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  A confirmation email with the verified tax receipt has been dispatched to <strong>{order.customer.email}</strong>, and our dispatch team has been notified.
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md cursor-pointer transition-all"
              >
                Close & View Order Details
              </button>
            </div>
          ) : loadingIntent ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-semibold">Generating dynamic UPI payment session...</p>
            </div>
          ) : intentError ? (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Unable to Initialize Payment Session</span>
              </div>
              <p>{intentError}</p>
              <button
                type="button"
                onClick={initPayment}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : (
            <>
              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('phonepe_upi')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'phonepe_upi'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-purple-600" />
                  <span>PhonePe & UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('qr_code')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'qr_code'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>Dynamic QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('razorpay')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'razorpay'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Cards / Gateway</span>
                </button>
              </div>

              {verificationError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>{verificationError}</div>
                </div>
              )}

              {/* TAB 1: PHONEPE & UPI APPS */}
              {activeTab === 'phonepe_upi' && paymentIntent && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-slate-600">
                      Tap below to launch your approved UPI app with the exact amount prefilled:
                    </p>
                  </div>

                  {/* Prominent PhonePe Button */}
                  <a
                    href={paymentIntent.phonepeIntent || paymentIntent.upiUri}
                    className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-[#5f259f] to-[#7c3aed] hover:opacity-95 shadow-lg shadow-purple-600/25 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-white text-[#5f259f] font-black text-sm flex items-center justify-center shadow-sm">
                        Pe
                      </div>
                      <div className="text-left">
                        <div className="font-extrabold text-sm">Pay with PhonePe</div>
                        <div className="text-[10px] text-purple-200 font-normal">Official UPI Intent Flow</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs font-mono font-bold bg-white/20 px-3 py-1.5 rounded-xl">
                      <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </a>

                  {/* Other UPI Apps */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href={paymentIntent.gpayIntent || paymentIntent.upiUri}
                      className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 transition-all flex items-center space-x-2 text-slate-800 cursor-pointer shadow-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-blue-600 font-heading">
                        G
                      </div>
                      <div className="text-left leading-tight">
                        <div className="text-xs font-bold">Google Pay</div>
                        <div className="text-[10px] text-slate-400">Instant UPI</div>
                      </div>
                    </a>

                    <a
                      href={paymentIntent.paytmIntent || paymentIntent.upiUri}
                      className="p-3 rounded-xl border border-slate-200 hover:border-cyan-400 bg-white hover:bg-slate-50 transition-all flex items-center space-x-2 text-slate-800 cursor-pointer shadow-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-cyan-50 flex items-center justify-center font-bold text-xs text-cyan-600 font-heading">
                        Pay
                      </div>
                      <div className="text-left leading-tight">
                        <div className="text-xs font-bold">Paytm UPI</div>
                        <div className="text-[10px] text-slate-400">Fast Checkout</div>
                      </div>
                    </a>
                  </div>

                  {/* Manual UPI VPA copy option */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Merchant UPI VPA:</span>
                      <span className="font-mono font-bold text-slate-800">{paymentIntent.vpa}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Payee Name:</span>
                      <span className="font-semibold text-slate-800">{paymentIntent.merchantName}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Payment Note / Tag:</span>
                      <span className="font-mono font-bold text-blue-700">{order.id}</span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 py-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                    <span>Waiting for transaction authorization from PhonePe / UPI...</span>
                  </div>
                </div>
              )}

              {/* TAB 2: DYNAMIC UPI QR CODE */}
              {activeTab === 'qr_code' && paymentIntent && (
                <div className="space-y-4 text-center">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600">
                      Scan this dynamic QR code with <strong>PhonePe</strong>, <strong>GPay</strong>, <strong>Paytm</strong>, or any UPI app:
                    </p>
                  </div>

                  {/* High Quality Rendered QR */}
                  <div className="p-4 bg-white rounded-3xl border-2 border-slate-200 shadow-md inline-block mx-auto relative group">
                    <img
                      src={paymentIntent.qrCodeDataUrl}
                      alt={`Dynamic UPI QR Code for ${order.id}`}
                      className="w-56 h-56 mx-auto object-contain rounded-xl"
                    />
                    <div className="mt-2 text-xs font-mono font-extrabold text-slate-800">
                      Amount: ₹{order.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Ref: {order.id}
                    </div>
                  </div>

                  {/* Auto polling status */}
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between text-xs text-blue-900">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Live status polling active</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-blue-600">Checks every 3s</span>
                  </div>
                </div>
              )}

              {/* TAB 3: RAZORPAY HOSTED CHECKOUT */}
              {activeTab === 'razorpay' && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">
                      Cards, NetBanking, Wallets & Gateway UPI
                    </h4>
                    <p className="text-xs text-slate-500">
                      Powered by Razorpay's RBI-compliant hosted payment gateway.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-600">Payment Gateway:</span>
                      <span className="font-bold text-indigo-700">Razorpay Enterprise</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-600">Security:</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Bank Grade
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-600">Supported Methods:</span>
                      <span className="font-semibold text-slate-800">PhonePe, Cards, NetBanking, UPI</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRazorpayCheckout}
                    disabled={verifyingPayment}
                    className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-600/25 flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {verifyingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Cryptographic Signature...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay via Razorpay (₹{order.totalAmount.toLocaleString('en-IN')})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TEST MODE / SANDBOX BANNER & VERIFICATION */}
              {paymentIntent?.testMode && (
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Info className="w-3.5 h-3.5" /> Test Mode / Gateway Sandbox
                    </span>
                    <span className="text-[11px] text-slate-400">Merchant Account Testing</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Live production credentials (Razorpay / PhonePe) are not yet supplied in the server environment. You can simulate and verify a successful test payment below to test the full order & email receipt workflow.
                  </p>
                  <button
                    type="button"
                    onClick={handleSimulateSandboxVerification}
                    disabled={verifyingPayment}
                    className="w-full py-2.5 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {verifyingPayment ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Simulate Verified Payment in Sandbox Mode</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted • No UPI PIN or OTP stored</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            {paymentVerified ? 'Close' : 'Cancel & Pay Later'}
          </button>
        </div>
      </div>
    </div>
  );
};
