export type PageId =
  | 'home'
  | 'about'
  | 'services'
  | 'energy-saving'
  | 'products'
  | 'booking'
  | 'contact'
  | 'enquiry'
  | 'admin';

export type ServiceCategory =
  | 'electricity_bill_reduction'
  | 'energy_efficiency'
  | 'electronic_appliances'
  | 'energy_audit'
  | 'product_recommendation'
  | 'commercial_industrial'
  | 'other';

export interface ServiceDetail {
  id: ServiceCategory;
  title: string;
  shortDesc: string;
  iconName: string;
  tagline: string;
  targetSavings: string;
  turnaroundTime: string;
  features: string[];
  deliverables: string[];
  badgeColor: string;
  idealFor: string;
}

export interface EnquiryNote {
  id: string;
  text: string;
  createdAt: string;
  author: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category: ServiceCategory | string;
  propertyType: string;
  estimatedMonthlyBill?: string;
  preferredContactTime?: string;
  message: string;
  status: 'new' | 'in_progress' | 'contacted' | 'resolved' | 'archived';
  priority: 'normal' | 'high' | 'urgent';
  adminNotes: EnquiryNote[];
  emailNotification?: NotificationState;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerEnquiryPayload {
  name: string;
  email: string;
  phone?: string;
  category: string;
  propertyType: string;
  estimatedMonthlyBill?: string;
  preferredContactTime?: string;
  message: string;
}

export interface SubmissionResponse {
  success: boolean;
  referenceId?: string;
  message: string;
  error?: string;
  enquiry?: {
    id: string;
    name: string;
    email: string;
    category: string;
    createdAt: string;
  };
}

export interface GadgetProduct {
  id: string;
  name: string;
  category: string;
  price: number; // In Indian Rupees (₹)
  originalPrice: number; // In Indian Rupees (₹)
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  energyRating: string;
  shortDesc: string;
  description: string;
  imageUrl: string;
  specs: string[];
  badge?: string;
}

export interface CartItem {
  product: GadgetProduct;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number; // In ₹
  quantity: number;
  imageUrl?: string;
}

export type NotificationStatus = 'sent' | 'pending' | 'failed' | 'not_configured';

export interface NotificationState {
  customerStatus: NotificationStatus;
  adminStatus: NotificationStatus;
  lastAttemptAt?: string;
  customerDetails?: string;
  adminDetails?: string;
  error?: string;
}

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'cancelled' | 'refunded';

export interface OrderPaymentDetails {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  upiTransactionRef?: string;
  upiApp?: 'phonepe' | 'gpay' | 'paytm' | 'bhim' | 'other_upi' | 'razorpay' | 'cash_on_delivery' | string;
  paymentMethodType?: string; // 'upi' | 'card' | 'netbanking' | 'wallet' | 'cash_on_delivery'
  vpa?: string;
  bank?: string;
  cardNetwork?: string;
  cardLast4?: string;
  paidAt?: string;
  failureReason?: string;
  verifiedAt?: string;
  isTestMode?: boolean;
}

export interface CustomerOrder {
  id: string; // e.g. ORD-IN-84190
  items: OrderItem[];
  customer: {
    name: string;
    phone: string;
    address: string;
    email?: string;
    city?: string;
    pincode?: string;
    notes?: string;
    whatsappConsent?: boolean;
  };
  totalAmount: number; // In ₹
  status: 'pending' | 'confirmed' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';
  paymentStatus: PaymentStatus;
  paymentMethod: 'phonepe' | 'online_upi' | 'razorpay_online' | 'cash_on_delivery' | 'card_payment' | 'invoice' | string;
  paymentDetails?: OrderPaymentDetails;
  trackingNumber?: string;
  carrierName?: string;
  emailNotification: NotificationState;
  whatsappNotification: NotificationState;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentGatewayConfig {
  isConfigured: boolean;
  razorpayConfigured: boolean;
  razorpayKeyId: string | null;
  phonepeConfigured: boolean;
  phonepeMerchantId?: string | null;
  upiVpa: string;
  merchantName: string;
  isTestMode: boolean;
  currency: string;
  currencySymbol: string;
}

export interface PaymentIntentResponse {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  currencySymbol: string;
  upiUri: string;
  qrCodeDataUrl: string;
  phonepeIntent: string;
  gpayIntent: string;
  paytmIntent: string;
  razorpayOrderId?: string | null;
  razorpayKeyId?: string | null;
  testMode: boolean;
  merchantName: string;
  vpa: string;
}

export interface ConsultationBooking {
  id: string; // e.g. BK-EC-74921 or BK-DEMO-74921
  customerName: string;
  email: string;
  phone: string;
  whatsappConsent?: boolean;
  serviceName: string;
  preferredDate: string; // YYYY-MM-DD
  preferredTime: string; // e.g. "10:30 AM"
  consultationType: 'Online' | 'In-person';
  notes?: string;
  address?: string;
  status: 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
  emailNotification: NotificationState;
  whatsappNotification: NotificationState;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DemoAuthResponse {
  success: boolean;
  token?: string;
  expiresAt?: number;
  role?: string;
  message?: string;
  error?: string;
}

export interface NotificationLog {
  id: string;
  entityType: 'booking' | 'order' | 'enquiry' | 'test';
  entityId: string;
  channel: 'email' | 'whatsapp';
  recipient: string;
  recipientType: 'customer' | 'admin';
  status: NotificationStatus;
  details: string;
  timestamp: string;
}

export interface NotificationConfigStatus {
  emailConfigured: boolean;
  emailProvider: 'resend' | 'sendgrid' | 'smtp' | 'none';
  smtpConfigured: boolean;
  whatsappConfigured: boolean;
  whatsappProvider: 'meta_cloud' | 'twilio' | 'none';
  adminEmail: string;
  adminWhatsApp: string;
  emailFrom: string;
  resendApiKeyMasked?: string;
  sendgridApiKeyMasked?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  lastEmailError?: string;
  razorpayConfigured?: boolean;
  razorpayKeyIdMasked?: string;
  phonepeConfigured?: boolean;
  phonepeMerchantIdMasked?: string;
  upiVpa?: string;
  paymentTestMode?: boolean;
  totalLogsCount: number;
  recentLogs: NotificationLog[];
}

export interface AdminStats {
  totalEnquiries: number;
  newEnquiries: number;
  inProgress: number;
  resolved: number;
  categoryBreakdown: Record<string, number>;
  totalOrders: number;
  totalOrderRevenue: number;
  totalBookings: number;
  upcomingBookings: number;
  totalAuditsCompleted: number;
  estimatedSavedKWh: number;
}
