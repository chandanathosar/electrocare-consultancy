import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  User,
  LogOut,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Trash2,
  MessageSquare,
  RefreshCw,
  Plus,
  KeyRound,
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
  Loader2,
  Eye,
  Check,
  Edit3,
  Save,
  X,
  Phone,
  MapPin,
  Tag,
  Mail,
  Calendar,
  Video,
  Send,
  Settings,
  Bell,
  Radio,
  RotateCcw
} from 'lucide-react';
import {
  Enquiry,
  CustomerOrder,
  AdminStats,
  GadgetProduct,
  ConsultationBooking,
  NotificationConfigStatus,
  NotificationLog,
  NotificationStatus
} from '../types';
import { apiService } from '../services/api';

interface AdminDashboardProps {
  onLogoutSuccess?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogoutSuccess }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [loginUsername, setLoginUsername] = useState<string>('admin@electrocare.com');
  const [loginPassword, setLoginPassword] = useState<string>('ElectroCare2026!');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'bookings' | 'orders' | 'notifications' | 'products' | 'enquiries' | 'metrics' | 'settings'
  >('bookings');

  // Consultation Bookings State
  const [bookings, setBookings] = useState<ConsultationBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState<boolean>(false);
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<ConsultationBooking | null>(null);
  const [retryingBookingNotification, setRetryingBookingNotification] = useState<string | null>(null);

  // Orders State
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [retryingOrderNotification, setRetryingOrderNotification] = useState<string | null>(null);

  // Notification Gateway & Logs State
  const [notificationConfig, setNotificationConfig] = useState<NotificationConfigStatus | null>(null);
  const [notificationLoading, setNotificationLoading] = useState<boolean>(false);
  const [adminEmailInput, setAdminEmailInput] = useState<string>('');
  const [adminWhatsAppInput, setAdminWhatsAppInput] = useState<string>('');
  const [savingNotificationConfig, setSavingNotificationConfig] = useState<boolean>(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState<string>('');
  const [testWhatsAppRecipient, setTestWhatsAppRecipient] = useState<string>('');
  const [testingNotification, setTestingNotification] = useState<'email' | 'whatsapp' | null>(null);
  const [testResult, setTestResult] = useState<{ channel: string; status: string; details: string } | null>(null);

  // Products Data & Price Management (₹)
  const [products, setProducts] = useState<GadgetProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<GadgetProduct | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<string>('');
  const [editOriginalPriceVal, setEditOriginalPriceVal] = useState<string>('');
  const [editStockVal, setEditStockVal] = useState<boolean>(true);
  const [editNameVal, setEditNameVal] = useState<string>('');
  const [savingProduct, setSavingProduct] = useState<boolean>(false);

  // Add Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [newProdName, setNewProdName] = useState<string>('');
  const [newProdCategory, setNewProdCategory] = useState<string>('Cooling & Fans');
  const [newProdPrice, setNewProdPrice] = useState<string>('');
  const [newProdEnergyRating, setNewProdEnergyRating] = useState<string>('5-Star Energy Saver');
  const [newProdDesc, setNewProdDesc] = useState<string>('');
  const [newProdImg, setNewProdImg] = useState<string>('');

  // Enquiries Data
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [newNoteText, setNewNoteText] = useState<string>('');

  // Metrics
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Password Change
  const [currentPass, setCurrentPass] = useState<string>('');
  const [newPass, setNewPass] = useState<string>('');
  const [passMsg, setPassMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Notifications Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setCheckingAuth(true);
    const valid = await apiService.checkAdminAuth();
    setIsAuthenticated(valid);
    setCheckingAuth(false);
    if (valid) {
      loadAllAdminData();
    }
  };

  const loadAllAdminData = async () => {
    loadBookings();
    loadOrders();
    loadNotificationStatus();
    loadProducts();
    loadEnquiries();
    loadStats();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await apiService.adminLogin(loginUsername, loginPassword);
      if (res.success) {
        setIsAuthenticated(true);
        loadAllAdminData();
        showToast('Logged in successfully as Administrator.');
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Invalid credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await apiService.adminLogout();
    setIsAuthenticated(false);
    setSelectedBooking(null);
    setSelectedOrder(null);
    setSelectedEnquiry(null);
    if (onLogoutSuccess) onLogoutSuccess();
  };

  // 1. Load Bookings
  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await apiService.getAdminBookings({
        status: bookingStatusFilter,
        search: bookingSearch
      });
      if (res.success) {
        setBookings(res.bookings);
        if (selectedBooking) {
          const fresh = res.bookings.find(b => b.id === selectedBooking.id);
          if (fresh) setSelectedBooking(fresh);
        }
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Re-fetch bookings on filter/search change
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        loadBookings();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [bookingStatusFilter, bookingSearch, isAuthenticated]);

  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const res = await apiService.updateBooking(id, { status: newStatus });
      if (res.success) {
        setBookings(prev => prev.map(b => (b.id === id ? res.booking : b)));
        if (selectedBooking?.id === id) setSelectedBooking(res.booking);
        showToast(`Consultation booking ${id} status marked as "${newStatus}".`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating booking');
    }
  };

  const handleRetryBookingNotification = async (id: string, channel: 'email' | 'whatsapp') => {
    setRetryingBookingNotification(`${id}-${channel}`);
    try {
      const res = await apiService.retryBookingNotification(id, channel);
      showToast(`Booking ${id} ${channel.toUpperCase()} notification result: ${res.status.toUpperCase()} (${res.details})`);
      loadBookings();
      loadNotificationStatus();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to retry booking notification');
    } finally {
      setRetryingBookingNotification(null);
    }
  };

  // 2. Load Orders
  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await apiService.getAdminOrders();
      if (res.success) {
        setOrders(res.orders);
        if (selectedOrder) {
          const fresh = res.orders.find(o => o.id === selectedOrder.id);
          if (fresh) setSelectedOrder(fresh);
        }
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await apiService.updateOrder(id, { status: newStatus });
      if (res.success) {
        setOrders(prev => prev.map(o => (o.id === id ? res.order : o)));
        if (selectedOrder?.id === id) setSelectedOrder(res.order);
        showToast(`Order ${id} status set to "${newStatus}". Notification status updated.`);
        loadNotificationStatus();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating order status');
    }
  };

  const handleRetryOrderNotification = async (id: string, channel: 'email' | 'whatsapp') => {
    setRetryingOrderNotification(`${id}-${channel}`);
    try {
      const res = await apiService.retryOrderNotification(id, channel);
      showToast(`Order ${id} ${channel.toUpperCase()} retry: ${res.status.toUpperCase()} (${res.details})`);
      loadOrders();
      loadNotificationStatus();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to retry order notification');
    } finally {
      setRetryingOrderNotification(null);
    }
  };

  // 3. Notification Gateway & Logs
  const loadNotificationStatus = async () => {
    setNotificationLoading(true);
    try {
      const data = await apiService.getNotificationStatus();
      setNotificationConfig(data);
      setAdminEmailInput(data.adminEmail || '');
      setAdminWhatsAppInput(data.adminWhatsApp || '');
    } catch (err) {
      console.error('Failed to load notification config:', err);
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleSaveNotificationConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotificationConfig(true);
    try {
      await apiService.updateNotificationConfig({
        adminEmail: adminEmailInput,
        adminWhatsApp: adminWhatsAppInput
      });
      showToast('Admin notification endpoints updated successfully.');
      loadNotificationStatus();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update notification config');
    } finally {
      setSavingNotificationConfig(false);
    }
  };

  const handleSendTestNotification = async (channel: 'email' | 'whatsapp') => {
    setTestingNotification(channel);
    setTestResult(null);
    try {
      const recipient = channel === 'email' ? testEmailRecipient : testWhatsAppRecipient;
      const res = await apiService.sendTestNotification(channel, recipient || undefined);
      setTestResult({ channel, status: res.status, details: res.details });
      showToast(`Test ${channel.toUpperCase()} executed: ${res.status.toUpperCase()}`);
      loadNotificationStatus();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send test notification');
    } finally {
      setTestingNotification(null);
    }
  };

  // 4. Products & Price Management in ₹
  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await apiService.getProducts();
      if (res.success && res.products) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const startEditProduct = (p: GadgetProduct) => {
    setEditingProduct(p);
    setEditPriceVal(String(p.price));
    setEditOriginalPriceVal(String(p.originalPrice || Math.round(p.price * 1.25)));
    setEditStockVal(p.inStock);
    setEditNameVal(p.name);
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setSavingProduct(true);
    try {
      const priceNum = Math.max(1, Math.round(Number(editPriceVal)));
      const origPriceNum = Math.max(priceNum, Math.round(Number(editOriginalPriceVal)));

      const res = await apiService.updateProduct(editingProduct.id, {
        name: editNameVal,
        price: priceNum,
        originalPrice: origPriceNum,
        inStock: editStockVal
      });

      if (res.success) {
        setProducts(prev => prev.map(p => (p.id === editingProduct.id ? res.product : p)));
        setEditingProduct(null);
        showToast(`Saved new price ₹${priceNum.toLocaleString('en-IN')} for ${res.product.name}!`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving product');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleCreateNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    try {
      const res = await apiService.addProduct({
        name: newProdName,
        category: newProdCategory,
        price: Number(newProdPrice),
        energyRating: newProdEnergyRating,
        shortDesc: newProdDesc || 'Energy-efficient electronic appliance.',
        imageUrl: newProdImg || '/products/refrigerator.jpg'
      });

      if (res.success) {
        setProducts(prev => [...prev, res.product]);
        setShowAddProductModal(false);
        setNewProdName('');
        setNewProdPrice('');
        setNewProdDesc('');
        setNewProdImg('');
        showToast(`Added new product ${res.product.name} at ₹${res.product.price}!`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error adding product');
    }
  };

  // 5. Enquiries
  const loadEnquiries = async () => {
    setEnquiriesLoading(true);
    try {
      const res = await apiService.getAdminEnquiries();
      if (res.success) {
        let filtered = res.enquiries;
        if (statusFilter !== 'all') filtered = filtered.filter(e => e.status === statusFilter);
        if (categoryFilter !== 'all') filtered = filtered.filter(e => e.category === categoryFilter);
        if (priorityFilter !== 'all') filtered = filtered.filter(e => e.priority === priorityFilter);
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            e =>
              e.name.toLowerCase().includes(q) ||
              e.email.toLowerCase().includes(q) ||
              e.id.toLowerCase().includes(q) ||
              e.message.toLowerCase().includes(q)
          );
        }
        setEnquiries(filtered);
      }
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setEnquiriesLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        loadEnquiries();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [statusFilter, categoryFilter, priorityFilter, searchQuery, isAuthenticated]);

  const handleUpdateEnquiryStatus = async (id: string, newStatus: string) => {
    try {
      const res = await apiService.updateEnquiry(id, { status: newStatus });
      if (res.success) {
        setEnquiries(prev => prev.map(e => (e.id === id ? res.enquiry : e)));
        setSelectedEnquiry(res.enquiry);
        showToast(`Enquiry ${id} status updated to "${newStatus}".`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating status');
    }
  };

  const handleUpdateEnquiryPriority = async (id: string, newPriority: string) => {
    try {
      const res = await apiService.updateEnquiry(id, { priority: newPriority });
      if (res.success) {
        setEnquiries(prev => prev.map(e => (e.id === id ? res.enquiry : e)));
        setSelectedEnquiry(res.enquiry);
        showToast(`Priority adjusted to "${newPriority}".`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating priority');
    }
  };

  const handleAddNote = async (id: string) => {
    if (!newNoteText.trim()) return;
    try {
      const res = await apiService.updateEnquiry(id, { note: newNoteText });
      if (res.success) {
        setEnquiries(prev => prev.map(e => (e.id === id ? res.enquiry : e)));
        setSelectedEnquiry(res.enquiry);
        setNewNoteText('');
        showToast('Engineering review note appended.');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error adding note');
    }
  };

  const handleDeleteEnquiry = async (id: string) => {
    if (!confirm(`Are you sure you want to permanently delete enquiry ${id} from the database?`)) {
      return;
    }
    try {
      await apiService.deleteEnquiry(id);
      setEnquiries(prev => prev.filter(e => e.id !== id));
      setSelectedEnquiry(null);
      showToast(`Enquiry ${id} deleted.`);
      loadStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting enquiry');
    }
  };

  const handleExportCSV = () => {
    if (enquiries.length === 0) return;

    const headers = ['Reference ID', 'Date', 'Customer Name', 'Email', 'Phone', 'Category', 'Property Type', 'Monthly Bill (₹)', 'Status', 'Priority', 'Message'];
    const rows = enquiries.map(e => [
      `"${e.id}"`,
      `"${new Date(e.createdAt).toLocaleDateString()}"`,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.email.replace(/"/g, '""')}"`,
      `"${(e.phone || '').replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${e.propertyType}"`,
      `"${e.estimatedMonthlyBill || ''}"`,
      `"${e.status}"`,
      `"${e.priority}"`,
      `"${e.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ElectroCare_Enquiries_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 6. Metrics & Settings
  const loadStats = async () => {
    try {
      const res = await apiService.getAdminStats();
      if (res.success) {
        setStats(res.metrics);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    try {
      await apiService.changePassword(currentPass, newPass);
      setPassMsg({ text: 'Admin password successfully updated.', error: false });
      setCurrentPass('');
      setNewPass('');
    } catch (err) {
      setPassMsg({ text: err instanceof Error ? err.message : 'Failed to change password.', error: true });
    }
  };

  const handleResetDemoData = async () => {
    if (!confirm('Re-seed initial demo bookings, orders, enquiries, and gadgets in the database?')) return;
    try {
      await apiService.resetDemoData();
      loadAllAdminData();
      showToast('Database reset to fresh demo benchmark state.');
    } catch (err) {
      alert('Failed to reset demo data');
    }
  };

  // Status Badge Helper
  const renderNotificationBadge = (status: NotificationStatus | undefined) => {
    if (status === 'sent') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
          <span>SENT</span>
        </span>
      );
    }
    if (status === 'not_configured') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700" title="API token not entered in environment. Server logged safely.">
          <Clock className="w-2.5 h-2.5 text-slate-400" />
          <span>NOT CONFIGURED</span>
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
          <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
          <span>FAILED</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
        <span>PENDING</span>
      </span>
    );
  };

  // Checking session
  if (checkingAuth) {
    return (
      <div className="py-24 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-400" />
        <span>Verifying security credentials...</span>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="rounded-3xl border border-purple-500/30 bg-slate-900/95 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -z-10" />

          {/* Logo / Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-400">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-white">
              ElectroCare Staff Portal
            </h1>
            <p className="text-xs text-slate-400">
              Authorized access to manage bookings, orders, notification gateways, and customer data.
            </p>
          </div>

          {/* Login Error */}
          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Quick Demo Pre-fill Helper */}
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-purple-300 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Demo Credentials:
              </span>
              <button
                type="button"
                onClick={() => {
                  setLoginUsername('admin@electrocare.com');
                  setLoginPassword('ElectroCare2026!');
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
              >
                Auto Fill
              </button>
            </div>
            <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
              <div>User: <span className="text-white">admin@electrocare.com</span></div>
              <div>Pass: <span className="text-white">ElectroCare2026!</span></div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Username / Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="admin@electrocare.com"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate & Open Admin Console</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 text-xs shadow-2xl flex items-center space-x-2 animate-fade-in max-w-md">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs uppercase font-mono tracking-wider text-purple-400 font-semibold">
              Authorized Management Session
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1">
            ElectroCare Management Console
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time consultation bookings, gadget order fulfillment, and multi-channel email/WhatsApp notification controls.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={loadAllAdminData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer flex items-center space-x-1.5 text-xs"
            title="Refresh Database Records"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/50 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            Consultation Bookings
          </span>
          <div className="text-2xl font-bold font-mono text-cyan-300">{bookings.length}</div>
          <span className="text-[10px] text-slate-400">
            {bookings.filter(b => b.status === 'confirmed').length} scheduled upcoming
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            Gadget Orders
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">{orders.length}</div>
          <span className="text-[10px] text-slate-400">
            ₹{orders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString('en-IN')} total volume
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-purple-400" />
            Notification System
          </span>
          <div className="text-2xl font-bold font-mono text-purple-300">
            {notificationConfig?.emailConfigured ? 'Email Active' : 'Email Ready'}
          </div>
          <span className="text-[10px] text-slate-400">
            {notificationConfig?.totalLogsCount || 0} audit logs tracked
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            General Enquiries
          </span>
          <div className="text-2xl font-bold font-mono text-blue-400">{enquiries.length}</div>
          <span className="text-[10px] text-purple-400/80">
            {enquiries.filter(e => e.status === 'new').length} pending review
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'bookings'
              ? 'border-cyan-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Consultation Bookings ({bookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Customer Orders ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'border-purple-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notification Gateway & Logs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Gadgets & Prices in ₹ ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('enquiries')}
          className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'enquiries'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Customer Enquiries ({enquiries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'metrics'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Metrics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'border-slate-400 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CONSULTATION BOOKINGS */}
      {/* ========================================================================= */}
      {activeTab === 'bookings' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search booking ID, customer, phone, service..."
                value={bookingSearch}
                onChange={e => setBookingSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={bookingStatusFilter}
                onChange={e => setBookingStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Booking Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
            {bookingsLoading ? (
              <div className="text-center py-16 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                <span>Loading consultation bookings...</span>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <Calendar className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs">No consultation bookings match your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Booking ID</th>
                      <th className="p-3.5">Customer & Phone</th>
                      <th className="p-3.5">Service & Format</th>
                      <th className="p-3.5">Appointment Date/Time</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Email Status</th>
                      <th className="p-3.5">WhatsApp Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {bookings.map(b => (
                      <tr
                        key={b.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          selectedBooking?.id === b.id ? 'bg-cyan-950/20' : ''
                        }`}
                      >
                        <td className="p-3.5 font-mono font-bold text-cyan-300">{b.id}</td>
                        <td className="p-3.5">
                          <div className="font-semibold text-white">{b.customerName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{b.email}</div>
                          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            {b.phone}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-200">{b.serviceName}</div>
                          <span className="inline-flex items-center space-x-1 mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {b.consultationType === 'Online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                            <span>{b.consultationType}</span>
                          </span>
                        </td>
                        <td className="p-3.5 font-mono">
                          <div className="text-white font-medium">{b.preferredDate}</div>
                          <div className="text-[11px] text-cyan-400">{b.preferredTime}</div>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={b.status}
                            onChange={e => handleUpdateBookingStatus(b.id, e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white"
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="rescheduled">Rescheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <div>{renderNotificationBadge(b.emailNotification?.customerStatus)}</div>
                            <button
                              type="button"
                              disabled={retryingBookingNotification === `${b.id}-email`}
                              onClick={() => handleRetryBookingNotification(b.id, 'email')}
                              className="text-[10px] text-blue-400 hover:text-blue-300 underline font-mono flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>{retryingBookingNotification === `${b.id}-email` ? 'Retrying...' : 'Resend Email'}</span>
                            </button>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <div>{renderNotificationBadge(b.whatsappNotification?.customerStatus)}</div>
                            <button
                              type="button"
                              disabled={retryingBookingNotification === `${b.id}-whatsapp`}
                              onClick={() => handleRetryBookingNotification(b.id, 'whatsapp')}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-mono flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>{retryingBookingNotification === `${b.id}-whatsapp` ? 'Retrying...' : 'Resend WhatsApp'}</span>
                            </button>
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(b)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-600 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* BOOKING DETAIL MODAL */}
          {selectedBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
              <div className="relative w-full max-w-lg rounded-3xl border border-cyan-500/40 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                      Booking Information & Diagnostics
                    </span>
                    <h3 className="text-xl font-bold font-mono text-white mt-0.5">
                      {selectedBooking.id}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Customer Name:</span>
                      <strong className="text-white">{selectedBooking.customerName}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Email Address:</span>
                      <span className="font-mono text-cyan-300">{selectedBooking.email}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Phone / WhatsApp:</span>
                      <span className="font-mono text-emerald-400">{selectedBooking.phone}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Service:</span>
                      <span className="text-slate-200">{selectedBooking.serviceName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Scheduled:</span>
                      <span className="font-bold text-white font-mono">
                        {selectedBooking.preferredDate} at {selectedBooking.preferredTime}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Format:</span>
                      <span className="text-purple-300 font-semibold">{selectedBooking.consultationType}</span>
                    </div>
                    {selectedBooking.address && (
                      <div className="py-1">
                        <span className="text-slate-400 block mb-0.5">Audit Facility Address:</span>
                        <span className="text-slate-200">{selectedBooking.address}</span>
                      </div>
                    )}
                    {selectedBooking.notes && (
                      <div className="py-1 border-t border-slate-800">
                        <span className="text-slate-400 block mb-0.5">Problem Notes / Special Instructions:</span>
                        <p className="text-slate-300 italic">{selectedBooking.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Notification Status Detail */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-mono uppercase text-purple-400 font-semibold flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5" />
                      <span>Notification Delivery Diagnostics</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Customer Email</span>
                        <div>{renderNotificationBadge(selectedBooking.emailNotification?.customerStatus)}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {selectedBooking.emailNotification?.customerDetails || 'Logged on booking creation'}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRetryBookingNotification(selectedBooking.id, 'email')}
                          className="w-full mt-1 py-1 rounded bg-blue-600/20 text-blue-300 text-[10px] font-semibold hover:bg-blue-600 hover:text-white"
                        >
                          Trigger Resend Email
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Customer WhatsApp</span>
                        <div>{renderNotificationBadge(selectedBooking.whatsappNotification?.customerStatus)}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {selectedBooking.whatsappNotification?.customerDetails || 'Logged on booking creation'}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRetryBookingNotification(selectedBooking.id, 'whatsapp')}
                          className="w-full mt-1 py-1 rounded bg-emerald-600/20 text-emerald-300 text-[10px] font-semibold hover:bg-emerald-600 hover:text-white"
                        >
                          Trigger Resend WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBooking(null)}
                      className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CUSTOMER ORDERS */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-heading text-white">
                Customer Gadget Orders & Delivery Dispatch
              </h2>
              <p className="text-xs text-slate-400">
                Itemized receipts, customer phone & address, Indian Rupee (₹) totals, and notification audit statuses.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
            {ordersLoading ? (
              <div className="text-center py-16 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                <span>Loading orders...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <Package className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs">No customer orders recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Customer & Phone</th>
                      <th className="p-3.5">Delivery Address</th>
                      <th className="p-3.5">Ordered Items</th>
                      <th className="p-3.5">Total (₹)</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Delivery Status</th>
                      <th className="p-3.5">Email Status</th>
                      <th className="p-3.5">WhatsApp Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono font-bold text-cyan-300">{o.id}</td>
                        <td className="p-3.5">
                          <div className="font-semibold text-white">{o.customer.name}</div>
                          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {o.customer.phone}
                          </div>
                          {o.customer.email && (
                            <div className="text-[10px] text-slate-400 font-mono">{o.customer.email}</div>
                          )}
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <div className="text-slate-200 line-clamp-1">{o.customer.address}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {o.customer.city} {o.customer.pincode ? `• PIN: ${o.customer.pincode}` : ''}
                          </div>
                        </td>
                        <td className="p-3.5">
                          {o.items.map((it, idx) => (
                            <div key={idx} className="text-[11px] text-slate-300 truncate max-w-xs">
                              {it.quantity}x {it.name} (₹{it.price.toLocaleString('en-IN')})
                            </div>
                          ))}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400 text-sm">
                          ₹{o.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5">
                          {o.paymentStatus === 'paid' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <Check className="w-2.5 h-2.5" />
                              <span>PAID</span>
                            </span>
                          ) : o.paymentStatus === 'failed' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              <span>FAILED</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              <span>UNPAID</span>
                            </span>
                          )}
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase truncate max-w-[100px]">
                            {o.paymentMethod.replace(/_/g, ' ')}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={o.status}
                            onChange={e => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">In Testing / Packed</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {o.trackingNumber && (
                            <div className="text-[10px] text-cyan-400 font-mono mt-0.5 truncate max-w-[110px]">
                              Trk: {o.trackingNumber}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <div>{renderNotificationBadge(o.emailNotification?.customerStatus)}</div>
                            <button
                              type="button"
                              disabled={retryingOrderNotification === `${o.id}-email`}
                              onClick={() => handleRetryOrderNotification(o.id, 'email')}
                              className="text-[10px] text-blue-400 hover:text-blue-300 underline font-mono flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>{retryingOrderNotification === `${o.id}-email` ? 'Retrying...' : 'Resend Email'}</span>
                            </button>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <div>{renderNotificationBadge(o.whatsappNotification?.customerStatus)}</div>
                            <button
                              type="button"
                              disabled={retryingOrderNotification === `${o.id}-whatsapp`}
                              onClick={() => handleRetryOrderNotification(o.id, 'whatsapp')}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-mono flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>{retryingOrderNotification === `${o.id}-whatsapp` ? 'Retrying...' : 'Resend WhatsApp'}</span>
                            </button>
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(o)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ORDER RECEIPT MODAL */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
              <div className="relative w-full max-w-lg rounded-3xl border border-emerald-500/40 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                      Order Invoice & Itemized Receipt
                    </span>
                    <h3 className="text-xl font-bold font-mono text-white mt-0.5">
                      {selectedOrder.id}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Customer Details */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Customer Name:</span>
                      <strong className="text-white">{selectedOrder.customer.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contact Phone:</span>
                      <span className="font-mono text-emerald-400">{selectedOrder.customer.phone}</span>
                    </div>
                    {selectedOrder.customer.email && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Customer Email:</span>
                        <span className="font-mono text-cyan-300">{selectedOrder.customer.email}</span>
                      </div>
                    )}
                    <div className="pt-1 border-t border-slate-800">
                      <span className="text-slate-400 block mb-0.5">Shipping Destination:</span>
                      <span className="text-slate-200">{selectedOrder.customer.address}, {selectedOrder.customer.city} {selectedOrder.customer.pincode ? `(${selectedOrder.customer.pincode})` : ''}</span>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Ordered Appliances</span>
                    <div className="divide-y divide-slate-800">
                      {selectedOrder.items.map((it, idx) => (
                        <div key={idx} className="py-2 flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-white block">{it.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {it.quantity} unit{it.quantity > 1 ? 's' : ''} × ₹{it.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-emerald-400">
                            ₹{(it.quantity * it.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm">
                      <strong className="text-white font-heading">Total Amount (₹):</strong>
                      <span className="font-mono font-extrabold text-emerald-400 text-base">
                        ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Payment & Gateway Verification Audit Card */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block flex items-center justify-between">
                      <span>Payment Gateway Verification</span>
                      {selectedOrder.paymentStatus === 'paid' ? (
                        <span className="text-emerald-400 font-bold">✓ VERIFIED & PAID</span>
                      ) : (
                        <span className="text-amber-400 font-bold">• PAYMENT PENDING</span>
                      )}
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-slate-500 block">Payment Method:</span>
                        <span className="text-white font-semibold uppercase">{selectedOrder.paymentMethod.replace(/_/g, ' ')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Gateway Ref:</span>
                        <span className="text-cyan-300 font-mono truncate block">
                          {selectedOrder.paymentDetails?.razorpayPaymentId || selectedOrder.paymentDetails?.upiTransactionRef || 'Pending Gateway Confirmation'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Verified Timestamp:</span>
                        <span className="text-slate-300 font-mono text-[10px]">
                          {selectedOrder.paymentDetails?.verifiedAt ? new Date(selectedOrder.paymentDetails.verifiedAt).toLocaleString('en-IN') : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Mode:</span>
                        <span className="text-slate-300 font-mono">
                          {selectedOrder.paymentDetails?.isTestMode ? 'Test Sandbox' : 'Production'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Order Status Transitions (Dispatched, Delivered, Paid) */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Dispatch & Delivery Actions (Triggers Automated Customer Emails)
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedOrder.status !== 'dispatched' && (
                        <button
                          type="button"
                          onClick={() => {
                            const tracking = prompt('Enter logistics tracking number:', selectedOrder.trackingNumber || `TRK-EXP-${Date.now().toString().slice(-6)}`);
                            if (tracking !== null) {
                              const carrier = prompt('Enter carrier name:', selectedOrder.carrierName || 'ElectroCare Express Logistics') || 'ElectroCare Express Logistics';
                              apiService.updateOrder(selectedOrder.id, {
                                status: 'dispatched',
                                trackingNumber: tracking.trim(),
                                carrierName: carrier.trim()
                              }).then(res => {
                                if (res.success) {
                                  setSelectedOrder(res.order);
                                  setOrders(prev => prev.map(o => o.id === res.order.id ? res.order : o));
                                  showToast(`Order ${selectedOrder.id} dispatched! Customer notification email sent.`);
                                }
                              }).catch(err => alert(err.message));
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-semibold cursor-pointer transition-all"
                        >
                          🚚 Mark Dispatched (Sends Dispatch Email)
                        </button>
                      )}

                      {selectedOrder.status !== 'delivered' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Mark order ${selectedOrder.id} as Delivered? Customer will receive warranty & delivery confirmation email.`)) {
                              apiService.updateOrder(selectedOrder.id, { status: 'delivered' }).then(res => {
                                if (res.success) {
                                  setSelectedOrder(res.order);
                                  setOrders(prev => prev.map(o => o.id === res.order.id ? res.order : o));
                                  showToast(`Order ${selectedOrder.id} marked as Delivered! Warranty activated email sent.`);
                                }
                              }).catch(err => alert(err.message));
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-semibold cursor-pointer transition-all"
                        >
                          🎉 Mark Delivered (Sends Delivery Email)
                        </button>
                      )}

                      {selectedOrder.paymentStatus !== 'paid' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Verify and mark payment as PAID for order ${selectedOrder.id}? Customer will receive payment receipt email.`)) {
                              apiService.updateOrder(selectedOrder.id, { paymentStatus: 'paid' }).then(res => {
                                if (res.success) {
                                  setSelectedOrder(res.order);
                                  setOrders(prev => prev.map(o => o.id === res.order.id ? res.order : o));
                                  showToast(`Payment marked as PAID! Official receipt email sent.`);
                                }
                              }).catch(err => alert(err.message));
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-semibold cursor-pointer transition-all"
                        >
                          💳 Mark as Paid (Sends Receipt Email)
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NOTIFICATION GATEWAY & LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-lg font-bold font-heading text-white">
              Notification Gateway, Secret Integrations & Live Audit Logs
            </h2>
            <p className="text-xs text-slate-400">
              Automated customer booking confirmations, admin new-order alerts, and WhatsApp Business API integration.
            </p>
          </div>

          {/* Gateway Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Gateway Status */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Server-Side Email Gateway</h3>
                    <span className="text-[11px] text-slate-400">Resend / SendGrid REST Engine</span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    notificationConfig?.emailConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {notificationConfig?.emailConfigured ? 'Provider Active' : 'Fallback Engine (Safe Log)'}
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 font-mono p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Provider:</span>
                  <span className="text-cyan-400 uppercase font-bold">{notificationConfig?.emailProvider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sender Address:</span>
                  <span className="text-slate-200">{notificationConfig?.emailFrom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Admin Alert Recipient:</span>
                  <span className="text-purple-300">{notificationConfig?.adminEmail}</span>
                </div>
              </div>

              {/* Email Live Test Probe */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-mono text-blue-400 uppercase block font-semibold">
                  Test Email Delivery Probe
                </span>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter recipient email (e.g. test@example.com)..."
                    value={testEmailRecipient}
                    onChange={e => setTestEmailRecipient(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    disabled={testingNotification === 'email'}
                    onClick={() => handleSendTestNotification('email')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer disabled:opacity-50 flex items-center space-x-1"
                  >
                    {testingNotification === 'email' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Send Probe</span>
                  </button>
                </div>
              </div>
            </div>

            {/* WhatsApp Gateway Status */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">WhatsApp Business Cloud API</h3>
                    <span className="text-[11px] text-slate-400">Official Meta Cloud API / Twilio</span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    notificationConfig?.whatsappConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {notificationConfig?.whatsappConfigured ? 'Meta API Active' : 'Fallback Engine (Safe Log)'}
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 font-mono p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Provider:</span>
                  <span className="text-emerald-400 uppercase font-bold">{notificationConfig?.whatsappProvider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Admin WhatsApp Number:</span>
                  <span className="text-purple-300">{notificationConfig?.adminWhatsApp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Credential Storage:</span>
                  <span className="text-emerald-400 font-bold">Server-side Environment Only</span>
                </div>
              </div>

              {/* WhatsApp Live Test Probe */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-mono text-emerald-400 uppercase block font-semibold">
                  Test WhatsApp Delivery Probe
                </span>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="Enter phone with country code (e.g. +919822000000)..."
                    value={testWhatsAppRecipient}
                    onChange={e => setTestWhatsAppRecipient(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    disabled={testingNotification === 'whatsapp'}
                    onClick={() => handleSendTestNotification('whatsapp')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 cursor-pointer disabled:opacity-50 flex items-center space-x-1"
                  >
                    {testingNotification === 'whatsapp' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Send Probe</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Test Result Banner */}
          {testResult && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/40 text-xs space-y-1 animate-fade-in">
              <div className="flex items-center space-x-2 font-bold text-white">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Last Probe Result ({testResult.channel.toUpperCase()}):</span>
                {renderNotificationBadge(testResult.status as NotificationStatus)}
              </div>
              <p className="text-slate-300 font-mono text-[11px]">{testResult.details}</p>
            </div>
          )}

          {/* Real-Time Configuration Form */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Admin Notification Dispatch Settings</h3>
              <p className="text-xs text-slate-400">
                Update the official administrator destinations that receive immediate alerts when customer consultations are booked or gadget orders are placed.
              </p>
            </div>

            <form onSubmit={handleSaveNotificationConfig} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Admin Alert Email
                </label>
                <input
                  type="email"
                  required
                  value={adminEmailInput}
                  onChange={e => setAdminEmailInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Admin Alert WhatsApp Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+919822012345"
                  value={adminWhatsAppInput}
                  onChange={e => setAdminWhatsAppInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingNotificationConfig}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {savingNotificationConfig ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Notification Endpoints</span>
                </button>
              </div>
            </form>
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl space-y-0">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-mono uppercase text-slate-300 font-bold">
                  Notification Dispatch Audit Trail
                </h3>
                <span className="text-[11px] text-slate-400">
                  Detailed timeline of every booking, order, and test notification attempt.
                </span>
              </div>
              <button
                type="button"
                onClick={loadNotificationStatus}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh Log</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Recipient Type</th>
                    <th className="p-3">Recipient Address / Phone</th>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Diagnostic Log</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {notificationConfig?.recentLogs && notificationConfig.recentLogs.length > 0 ? (
                    notificationConfig.recentLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-800/40 font-mono text-[11px]">
                        <td className="p-3 text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.channel === 'email' ? 'bg-blue-500/10 text-blue-300' : 'bg-emerald-500/10 text-emerald-300'
                          }`}>
                            {log.channel}
                          </span>
                        </td>
                        <td className="p-3 capitalize text-slate-300">{log.recipientType}</td>
                        <td className="p-3 text-white font-medium">{log.recipient}</td>
                        <td className="p-3 text-cyan-300">{log.entityId}</td>
                        <td className="p-3">{renderNotificationBadge(log.status)}</td>
                        <td className="p-3 text-slate-400 truncate max-w-xs">{log.details}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500 italic">
                        No notification logs recorded yet. Book a consultation or place an order to test!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MANAGE PRODUCTS & SAMPLE PRICES IN ₹ */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-heading text-white">
                Gadgets Catalog & Live Price Management
              </h2>
              <p className="text-xs text-slate-400">
                All prices are stored and rendered in Indian Rupees (₹). Click <strong className="text-white">"Edit Price"</strong> on any product to update sample prices in real time.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddProductModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price in ₹ (INR)</th>
                    <th className="p-3.5">Original / MRP</th>
                    <th className="p-3.5">Energy Rating</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5 text-right">Edit Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 flex items-center space-x-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0 bg-slate-800"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fallbackPath = `/products/${p.id.replace(/^prod-\d+-/, '').replace(/-/g, '_')}.jpg`;
                            if (!target.src.endsWith(fallbackPath)) {
                              target.src = fallbackPath;
                            }
                          }}
                        />
                        <div>
                          <div className="font-bold text-white text-xs">{p.name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{p.shortDesc}</div>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-300">{p.category}</td>
                      <td className="p-3.5">
                        <span className="font-bold font-mono text-emerald-400 text-sm">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-500 text-xs line-through">
                        ₹{p.originalPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {p.energyRating}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.inStock
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => startEditProduct(p)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Price</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* EDIT PRODUCT PRICE MODAL */}
          {editingProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
              <div className="relative w-full max-w-md rounded-3xl border border-blue-500/40 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-blue-400 font-bold block">
                      Edit Sample Price & Details
                    </span>
                    <h3 className="text-lg font-bold font-heading text-white mt-0.5">
                      {editingProduct.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveProductEdit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editNameVal}
                      onChange={e => setEditNameVal(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Sale Price in ₹ (Rupees) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                        <input
                          type="number"
                          required
                          min={1}
                          value={editPriceVal}
                          onChange={e => setEditPriceVal(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-mono font-bold focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Original / MRP in ₹
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                        <input
                          type="number"
                          min={1}
                          value={editOriginalPriceVal}
                          onChange={e => setEditOriginalPriceVal(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Availability Status
                    </label>
                    <select
                      value={editStockVal ? 'true' : 'false'}
                      onChange={e => setEditStockVal(e.target.value === 'true')}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="true">In Stock (Available for Purchase)</option>
                      <option value="false">Out of Stock (Temporarily Unavailable)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-300 bg-slate-800 hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProduct}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {savingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Save New Price in Database</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ADD PRODUCT MODAL */}
          {showAddProductModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
              <div className="relative w-full max-w-md rounded-3xl border border-blue-500/40 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold font-heading text-white">
                    Add New Electronic Gadget
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateNewProduct} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Induction Cooktop (2000W)"
                      value={newProdName}
                      onChange={e => setNewProdName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                      <select
                        value={newProdCategory}
                        onChange={e => setNewProdCategory(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="Cooling & Fans">Cooling & Fans</option>
                        <option value="Kitchen Appliances">Kitchen Appliances</option>
                        <option value="Laundry & Care">Laundry & Care</option>
                        <option value="Home Entertainment">Home Entertainment</option>
                        <option value="Water & Purification">Water & Purification</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Price in ₹ *</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 3499"
                        value={newProdPrice}
                        onChange={e => setNewProdPrice(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Short Description</label>
                    <textarea
                      rows={2}
                      placeholder="Brief overview of features and power-saving capabilities..."
                      value={newProdDesc}
                      onChange={e => setNewProdDesc(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Photo Image URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newProdImg}
                      onChange={e => setNewProdImg(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white text-[11px]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(false)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-300 bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500"
                    >
                      Create Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CUSTOMER ENQUIRIES */}
      {/* ========================================================================= */}
      {activeTab === 'enquiries' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, code, message..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Statuses</option>
                <option value="new">New (Unassigned)</option>
                <option value="in_progress">In Progress</option>
                <option value="contacted">Client Contacted</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </select>

              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
                title="Export to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
            {enquiriesLoading ? (
              <div className="text-center py-16 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                <span>Fetching records...</span>
              </div>
            ) : enquiries.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs">No customer enquiries match your search or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Ref ID</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Facility / Bill</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Priority</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {enquiries.map(enq => (
                      <tr
                        key={enq.id}
                        className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                          selectedEnquiry?.id === enq.id ? 'bg-purple-950/20' : ''
                        }`}
                        onClick={() => setSelectedEnquiry(enq)}
                      >
                        <td className="p-3.5 font-mono font-bold text-cyan-300">{enq.id}</td>
                        <td className="p-3.5">
                          <div className="font-semibold text-white">{enq.name}</div>
                          <div className="text-[11px] text-slate-400">{enq.email} • {enq.phone || ''}</div>
                        </td>
                        <td className="p-3.5 capitalize">{enq.category.replace(/_/g, ' ')}</td>
                        <td className="p-3.5">
                          <div>{enq.propertyType}</div>
                          <span className="text-[11px] text-slate-400">{enq.estimatedMonthlyBill}</span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              enq.status === 'new'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                : enq.status === 'in_progress' || enq.status === 'contacted'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : enq.status === 'resolved'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-700/30 text-slate-400'
                            }`}
                          >
                            {enq.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`font-semibold text-[11px] uppercase ${
                              enq.priority === 'urgent'
                                ? 'text-red-400'
                                : enq.priority === 'high'
                                ? 'text-amber-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {enq.priority}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                          {new Date(enq.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedEnquiry(enq);
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                          >
                            View & Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* DETAIL DRAWER FOR SELECTED ENQUIRY */}
          {selectedEnquiry && (
            <div className="rounded-3xl border border-indigo-500/40 bg-slate-900/95 p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold font-mono text-cyan-300">{selectedEnquiry.id}</span>
                    <span className="text-xs text-slate-400">
                      • Logged on {new Date(selectedEnquiry.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedEnquiry.name} ({selectedEnquiry.email})
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteEnquiry(selectedEnquiry.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs hover:bg-red-900/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedEnquiry(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                    Update Status:
                  </label>
                  <select
                    value={selectedEnquiry.status}
                    onChange={e => handleUpdateEnquiryStatus(selectedEnquiry.id, e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="new">New (Unassigned)</option>
                    <option value="in_progress">In Technical Review</option>
                    <option value="contacted">Client Contacted</option>
                    <option value="resolved">Resolved (Audit Completed)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                    Set Priority:
                  </label>
                  <select
                    value={selectedEnquiry.priority}
                    onChange={e => handleUpdateEnquiryPriority(selectedEnquiry.id, e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Escalation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                    Preferred Callback:
                  </label>
                  <div className="p-2 text-xs text-slate-300 font-medium bg-slate-900 rounded-xl border border-slate-800">
                    {selectedEnquiry.preferredContactTime || 'Anytime'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold">
                  Customer Message:
                </h4>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedEnquiry.message}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs uppercase font-mono tracking-wider text-purple-400 font-semibold flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Engineering Staff Audit Notes ({selectedEnquiry.adminNotes?.length || 0})</span>
                </h4>

                <div className="space-y-2">
                  {selectedEnquiry.adminNotes && selectedEnquiry.adminNotes.length > 0 ? (
                    selectedEnquiry.adminNotes.map(n => (
                      <div key={n.id} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-semibold text-blue-400">{n.author}</span>
                          <span>{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-200">{n.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No internal engineer notes logged yet.</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add an internal finding or update..."
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddNote(selectedEnquiry.id)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: METRICS */}
      {/* ========================================================================= */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Consulting Enquiries & Bookings</span>
            </h3>
            <div className="space-y-3">
              {stats?.categoryBreakdown && Object.entries(stats.categoryBreakdown).map(([cat, count]) => (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize text-slate-300">{cat.replace(/_/g, ' ')}</span>
                    <span className="font-mono font-bold text-white">{count} enquiries</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${Math.min(100, (count / (stats.totalEnquiries || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Orders & Saved Energy Impact</span>
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>Audits Guided & Completed:</span>
                <span className="font-bold font-mono text-cyan-400 text-base">
                  1,420+
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>Total Saved Energy (kWh):</span>
                <span className="font-bold font-mono text-purple-400 text-base">
                  ~38.5 Lakh kWh
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>Total Store Order Revenue:</span>
                <span className="font-bold font-mono text-emerald-400 text-base">
                  ₹{orders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: SETTINGS & CREDENTIALS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-8 animate-fade-in">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white">Change Admin Password</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update the cryptographic scrypt credential used to unlock this dashboard.
              </p>
            </div>

            {passMsg && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  passMsg.error
                    ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                }`}
              >
                {passMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={e => setCurrentPass(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>

          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Database Seed & Diagnostics</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Reset database records to the initial verified benchmark dataset (10 gadget items with Indian Rupee prices, sample bookings, and enquiries).
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetDemoData}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer"
            >
              Reset to Demo Records
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
