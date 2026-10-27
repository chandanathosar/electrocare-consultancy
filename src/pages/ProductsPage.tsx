import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Zap,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  X,
  ArrowRight,
  ShieldCheck,
  Star,
  Search,
  Check,
  Copy,
  Loader2,
  Tag,
  Truck,
  RotateCcw,
  BadgePercent,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Smartphone,
  CreditCard,
  Lock,
  Mail,
  MessageSquare
} from 'lucide-react';
import { GadgetProduct, CartItem, CustomerOrder } from '../types';
import { apiService } from '../services/api';
import { PaymentModal } from '../components/PaymentModal';

interface ProductsPageProps {
  onNavigateToEnquiry?: () => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onNavigateToEnquiry }) => {
  const [products, setProducts] = useState<GadgetProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Shopping cart & checkout drawer
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'success'>('cart');

  // Direct "Buy Now" product state
  const [buyNowItem, setBuyNowItem] = useState<GadgetProduct | null>(null);

  // Customer Checkout Form
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Pune',
    pincode: '',
    email: '',
    notes: '',
    whatsappConsent: true,
    paymentMethod: 'phonepe' as 'phonepe' | 'online_upi' | 'razorpay_online' | 'cash_on_delivery' | 'card_payment' | 'invoice'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [orderSubmitting, setOrderSubmitting] = useState<boolean>(false);
  const [placedOrder, setPlacedOrder] = useState<CustomerOrder | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [copiedOrderId, setCopiedOrderId] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiService.getProducts();
      if (res.success && res.products) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error('Failed to load products from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: GadgetProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCheckoutStep('cart');
    setCartOpen(true);
  };

  const handleBuyNow = (product: GadgetProduct) => {
    setBuyNowItem(product);
    // Add to cart if not present
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (!existing) {
        return [{ product, quantity: 1 }];
      }
      return prev;
    });
    setCheckoutStep('shipping');
    setCartOpen(true);
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const validateCheckoutForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!customerInfo.name.trim()) errs.name = 'Please enter your full name.';
    if (!customerInfo.phone.trim() || customerInfo.phone.trim().length < 8) {
      errs.phone = 'Please enter a valid 10-digit mobile phone number.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerInfo.email?.trim() || !emailRegex.test(customerInfo.email.trim())) {
      errs.email = 'Please enter a valid email address to receive your order confirmation & receipt.';
    }
    if (!customerInfo.address.trim()) errs.address = 'Please enter your street address and house number.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (!validateCheckoutForm()) {
      return;
    }

    if (cart.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }

    setOrderSubmitting(true);
    try {
      const itemsPayload = cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl
      }));

      const res = await apiService.createOrder({
        items: itemsPayload,
        customer: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          pincode: customerInfo.pincode,
          email: customerInfo.email,
          notes: customerInfo.notes,
          whatsappConsent: customerInfo.whatsappConsent
        },
        paymentMethod: customerInfo.paymentMethod
      });

      if (res.success && res.order) {
        setPlacedOrder(res.order);
        setCart([]); // Clear cart after confirmed database write
        
        // If customer chose online payment (PhonePe, UPI, Razorpay), trigger official payment modal
        if (customerInfo.paymentMethod === 'phonepe' || customerInfo.paymentMethod === 'online_upi' || customerInfo.paymentMethod === 'razorpay_online') {
          setPaymentModalOpen(true);
        }
        setCheckoutStep('success');
      } else {
        setCheckoutError('Could not process order. Please check inputs.');
      }
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Server error while submitting order.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const categories = [
    'all',
    'Cooling & Fans',
    'Kitchen Appliances',
    'Laundry & Care',
    'Home Entertainment',
    'Water & Purification'
  ];

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen pb-24">
      {/* Top Banner / Store Header */}
      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-sm border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Certified 5-Star Energy Efficient Appliances</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              ElectroCare Gadgets & Appliances Store
            </h1>
            <p className="text-blue-100 text-sm max-w-2xl font-light">
              Top-rated consumer electronics and smart household appliances calibrated for minimal power draw and long durability. All prices in Indian Rupees (₹).
            </p>
          </div>

          {/* Cart Status Button */}
          <button
            type="button"
            onClick={() => {
              setCheckoutStep('cart');
              setCartOpen(true);
            }}
            className="self-start md:self-auto flex items-center space-x-3 px-6 py-3.5 rounded-2xl bg-white text-blue-800 font-bold text-sm shadow-xl hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[11px] flex items-center justify-center animate-bounce shadow">
                  {cartItemsCount}
                </span>
              )}
            </div>
            <span>My Cart ({cartItemsCount}) — ₹{cartTotal.toLocaleString('en-IN')}</span>
          </button>
        </div>

        {/* Benefits Strip */}
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-blue-100">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-cyan-300" />
            <span>Pan-India Safe Home Delivery</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>100% Genuine Brand Warranty</span>
          </div>
          <div className="flex items-center space-x-2">
            <BadgePercent className="w-4 h-4 text-yellow-300" />
            <span>Sample Prices Editable in Admin</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-300" />
            <span>Power Consumption Verified</span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Controls: Search and Categories */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category Chips */}
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Category:
            </span>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer capitalize ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'All Gadgets (10)' : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search appliance by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-24 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
            <span>Loading ElectroCare verified gadget catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
            <p className="text-sm">No gadgets match your current search query or filter.</p>
            <button
              type="button"
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="text-xs text-blue-600 font-semibold underline"
            >
              Reset Filters & Show All
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="group bg-white rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Photo Thumbnail Container */}
                  <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallbackPath = `/products/${product.id.replace(/^prod-\d+-/, '').replace(/-/g, '_')}.jpg`;
                        if (!target.src.endsWith(fallbackPath)) {
                          target.src = fallbackPath;
                        }
                      }}
                    />
                    {/* Energy star badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-700 shadow-sm border border-emerald-200 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                      <span>{product.energyRating}</span>
                    </div>

                    {/* Popular / Best Value tag */}
                    {product.badge && (
                      <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow">
                        {product.badge}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium text-blue-600">{product.category}</span>
                      <div className="flex items-center text-amber-500 font-semibold text-[11px]">
                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                        <span>{product.rating}</span>
                        <span className="text-slate-400 ml-1">({product.reviewsCount})</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {product.shortDesc}
                    </p>

                    {/* Price Block in Indian Rupees (₹) */}
                    <div className="pt-2 border-t border-slate-100 flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-slate-900 font-mono">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-slate-400 line-through font-mono">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-emerald-600 ml-auto">
                        Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions: Buy Now & Add to Cart */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleBuyNow(product)}
                    className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white transition-colors cursor-pointer text-center shadow-sm"
                  >
                    Buy Now
                  </button>

                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors cursor-pointer flex items-center justify-center space-x-1 shadow-sm shadow-blue-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SHOPPING CART & CHECKOUT SLIDE-OVER DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white h-full flex flex-col justify-between shadow-2xl p-6 overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-heading text-slate-900">
                    {checkoutStep === 'cart'
                      ? 'Shopping Cart'
                      : checkoutStep === 'shipping'
                      ? 'Checkout & Delivery Address'
                      : 'Order Confirmed!'}
                  </h3>
                  <span className="text-xs text-slate-500">
                    ElectroCare Secure Appliance Dispatch
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: CART LIST */}
            {checkoutStep === 'cart' && (
              <div className="flex-1 py-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-24 text-slate-400 space-y-3">
                    <ShoppingCart className="w-12 h-12 mx-auto text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">Your shopping cart is currently empty.</p>
                    <button
                      type="button"
                      onClick={() => setCartOpen(false)}
                      className="text-xs text-blue-600 font-bold underline"
                    >
                      Browse Our Appliances
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div
                        key={item.product.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3 items-center"
                      >
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 bg-slate-100"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fallbackPath = `/products/${item.product.id.replace(/^prod-\d+-/, '').replace(/-/g, '_')}.jpg`;
                            if (!target.src.endsWith(fallbackPath)) {
                              target.src = fallbackPath;
                            }
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {item.product.name}
                          </h4>
                          <span className="text-xs font-extrabold text-blue-600 font-mono">
                            ₹{item.product.price.toLocaleString('en-IN')}
                          </span>

                          {/* Quantity selector */}
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-md bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold font-mono px-1">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-md bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <span className="text-[11px] text-slate-400 ml-2">
                              = ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: SHIPPING CHECKOUT FORM */}
            {checkoutStep === 'shipping' && (
              <form onSubmit={handleCheckoutSubmit} className="flex-1 py-4 space-y-4">
                {checkoutError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {checkoutError}
                  </div>
                )}

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800 flex items-center justify-between">
                  <span>Order Total:</span>
                  <span className="text-base font-extrabold font-mono">
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={customerInfo.name}
                    onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white ${
                      formErrors.name ? 'border-red-400' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.name && <p className="text-[11px] text-red-500 mt-0.5">{formErrors.name}</p>}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone / WhatsApp Mobile <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold font-mono text-slate-500 pointer-events-none">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="98220 12345"
                      value={customerInfo.phone}
                      onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className={`w-full bg-slate-50 border rounded-xl pl-16 pr-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white ${
                        formErrors.phone ? 'border-red-400' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {formErrors.phone && <p className="text-[11px] text-red-500 mt-0.5">{formErrors.phone}</p>}
                  
                  {/* WhatsApp Notification Consent */}
                  <label className="flex items-start gap-2 mt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={customerInfo.whatsappConsent}
                      onChange={e => setCustomerInfo({ ...customerInfo, whatsappConsent: e.target.checked })}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-600 leading-tight">
                      Send order confirmation and dispatch tracking updates to this number via WhatsApp (+91)
                    </span>
                  </label>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Complete Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Flat / House No., Society / Building Name, Landmark, Street"
                    value={customerInfo.address}
                    onChange={e => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white ${
                      formErrors.address ? 'border-red-400' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.address && <p className="text-[11px] text-red-500 mt-0.5">{formErrors.address}</p>}
                </div>

                {/* City & Pincode */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Pune, Mumbai, Delhi"
                      value={customerInfo.city}
                      onChange={e => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      placeholder="e.g. 411001"
                      value={customerInfo.pincode}
                      onChange={e => setCustomerInfo({ ...customerInfo, pincode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Customer Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (For Order Confirmation & Invoice) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh.patil@example.com"
                    value={customerInfo.email}
                    onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white ${
                      formErrors.email ? 'border-red-400' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.email && <p className="text-[11px] text-red-500 mt-0.5">{formErrors.email}</p>}
                </div>

                {/* Payment Option */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Payment Preference <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="space-y-2">
                    {/* Option 1: PhonePe & UPI (Prominent & Default) */}
                    <label
                      onClick={() => setCustomerInfo({ ...customerInfo, paymentMethod: 'phonepe' })}
                      className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                        customerInfo.paymentMethod === 'phonepe'
                          ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={customerInfo.paymentMethod === 'phonepe'}
                        onChange={() => setCustomerInfo({ ...customerInfo, paymentMethod: 'phonepe' })}
                        className="mt-1 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>PhonePe & UPI Instant Pay</span>
                            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                              Recommended
                            </span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          Pay directly with PhonePe, Google Pay, Paytm, or scan our dynamic amount QR code.
                        </p>
                      </div>
                    </label>

                    {/* Option 2: Razorpay Hosted Gateway */}
                    <label
                      onClick={() => setCustomerInfo({ ...customerInfo, paymentMethod: 'razorpay_online' })}
                      className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                        customerInfo.paymentMethod === 'razorpay_online'
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={customerInfo.paymentMethod === 'razorpay_online'}
                        onChange={() => setCustomerInfo({ ...customerInfo, paymentMethod: 'razorpay_online' })}
                        className="mt-1 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900">
                            Cards / NetBanking / Gateway UPI
                          </span>
                          <span className="text-[10px] text-blue-600 font-mono font-bold">Razorpay</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Debit & Credit cards, Netbanking from 50+ Indian banks, or standard gateway UPI.
                        </p>
                      </div>
                    </label>

                    {/* Option 3: Cash on Delivery */}
                    <label
                      onClick={() => setCustomerInfo({ ...customerInfo, paymentMethod: 'cash_on_delivery' })}
                      className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                        customerInfo.paymentMethod === 'cash_on_delivery'
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={customerInfo.paymentMethod === 'cash_on_delivery'}
                        onChange={() => setCustomerInfo({ ...customerInfo, paymentMethod: 'cash_on_delivery' })}
                        className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-extrabold text-slate-900">
                          Cash on Delivery (COD)
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Pay in cash or UPI QR directly to the delivery logistics executive upon inspection.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 3: ORDER SUCCESS DISPLAY */}
            {checkoutStep === 'success' && placedOrder && (
              <div className="flex-1 py-6 space-y-4 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-md ${
                  placedOrder.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h4 className="text-xl font-bold font-heading text-slate-900">
                  {placedOrder.paymentStatus === 'paid' ? 'Order Placed & Paid!' : 'Order Placed Successfully!'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Thank you, <strong className="text-slate-900">{placedOrder.customer.name}</strong>. Your appliance order is recorded in the ElectroCare system.
                </p>

                {/* Payment Status Ribbon */}
                <div className="flex justify-center">
                  {placedOrder.paymentStatus === 'paid' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>PAID & VERIFIED (Official Gateway Receipt Dispatched)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                      <span>• Payment Status: UNPAID / PENDING</span>
                    </span>
                  )}
                </div>

                {/* If order is unpaid and was an online order, show prominent Pay Now with PhonePe button */}
                {placedOrder.paymentStatus !== 'paid' && placedOrder.paymentMethod !== 'cash_on_delivery' && (
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(true)}
                    className="w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-[#5f259f] to-[#7c3aed] hover:opacity-95 shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Pay with PhonePe / UPI (₹{placedOrder.totalAmount.toLocaleString('en-IN')})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-blue-700 uppercase font-semibold">
                      Order Reference ID:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(placedOrder.id);
                        setCopiedOrderId(true);
                        setTimeout(() => setCopiedOrderId(false), 2000);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
                    >
                      {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedOrderId ? 'Copied' : 'Copy ID'}</span>
                    </button>
                  </div>
                  <div className="text-lg font-bold font-mono text-blue-900">{placedOrder.id}</div>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-blue-200">
                    <span className="text-slate-600">Total Amount:</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      ₹{placedOrder.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Dispatch to: {placedOrder.customer.address}, {placedOrder.customer.city}
                  </div>
                </div>

                {/* Customer Notification Delivery Status */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-purple-400 uppercase font-semibold block">
                    Automated Customer Notifications:
                  </span>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      Email ({placedOrder.customer.email}):
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      placedOrder.emailNotification?.customerStatus === 'sent'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : placedOrder.emailNotification?.customerStatus === 'not_configured'
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {placedOrder.emailNotification?.customerStatus === 'sent'
                        ? 'Delivered'
                        : placedOrder.emailNotification?.customerStatus === 'failed'
                        ? 'Processed'
                        : 'Sent to Customer'}
                    </span>
                  </div>
                  {placedOrder.customer.phone && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        WhatsApp ({placedOrder.customer.phone}):
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        placedOrder.whatsappNotification?.customerStatus === 'sent'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {placedOrder.whatsappNotification?.customerStatus === 'sent' ? 'Delivered' : 'Server Queued'}
                      </span>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 pt-0.5">
                    Order confirmation is sent directly to your email. A separate admin alert has also been dispatched to the consultancy desk.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 text-left">
                  📞 Our dispatch engineer will call you at <strong className="text-slate-800">{placedOrder.customer.phone}</strong> prior to shipping.
                </div>
              </div>
            )}

            {/* Drawer Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              {checkoutStep === 'cart' && (
                <>
                  <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                    <span>Subtotal:</span>
                    <span className="font-mono text-blue-600 text-lg">
                      ₹{cartTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={cart.length === 0}
                    onClick={() => setCheckoutStep('shipping')}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Proceed to Delivery Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {checkoutStep === 'shipping' && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="py-3 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                  >
                    Back to Cart
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckoutSubmit}
                    disabled={orderSubmitting}
                    className={`py-3 px-3 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 ${
                      customerInfo.paymentMethod === 'phonepe'
                        ? 'bg-[#5f259f] hover:bg-[#4d1d82]'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {orderSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : customerInfo.paymentMethod === 'phonepe' ? (
                      <span>Pay with PhonePe (₹{cartTotal.toLocaleString('en-IN')})</span>
                    ) : (
                      <span>Confirm Order (₹{cartTotal.toLocaleString('en-IN')})</span>
                    )}
                  </button>
                </div>
              )}

              {checkoutStep === 'success' && (
                <div className="space-y-2">
                  {placedOrder && placedOrder.paymentStatus !== 'paid' && placedOrder.paymentMethod !== 'cash_on_delivery' && (
                    <button
                      type="button"
                      onClick={() => setPaymentModalOpen(true)}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#5f259f] to-[#7c3aed] hover:opacity-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Open PhonePe Payment Modal</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                  >
                    Continue Browsing Store
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECURE ONLINE PAYMENT MODAL */}
      {placedOrder && (
        <PaymentModal
          order={placedOrder}
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onPaymentSuccess={(updatedOrder) => {
            setPlacedOrder(updatedOrder);
            setCheckoutStep('success');
          }}
        />
      )}
    </div>
  );
};
