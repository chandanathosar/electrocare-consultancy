import {
  CustomerEnquiryPayload,
  SubmissionResponse,
  Enquiry,
  AdminStats,
  GadgetProduct,
  CustomerOrder,
  ConsultationBooking,
  NotificationConfigStatus,
  NotificationStatus,
  PaymentGatewayConfig,
  PaymentIntentResponse,
  DemoAuthResponse
} from '../types';

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const demoToken = sessionStorage.getItem('electro_demo_token');
  const adminToken = localStorage.getItem('electrocare_admin_token');
  const token = adminToken || demoToken;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const apiService = {
  // Demonstration Authentication
  async verifyDemoPasscode(passcode: string): Promise<DemoAuthResponse> {
    const res = await fetch('/api/demo/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: passcode.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid demonstration access code.');
    }
    if (data.token) {
      sessionStorage.setItem('electro_demo_token', data.token);
    }
    return data;
  },

  getDemoToken(): string | null {
    return sessionStorage.getItem('electro_demo_token');
  },

  clearDemoToken(): void {
    const token = sessionStorage.getItem('electro_demo_token');
    if (token) {
      fetch('/api/demo/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    }
    sessionStorage.removeItem('electro_demo_token');
  },

  isDemoAuthenticated(): boolean {
    return Boolean(sessionStorage.getItem('electro_demo_token') || localStorage.getItem('electrocare_admin_token'));
  },

  // Public: Submit enquiry
  async submitEnquiry(payload: CustomerEnquiryPayload): Promise<SubmissionResponse> {
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit enquiry');
    }
    return data;
  },

  // Public: Track enquiry status by reference ID
  async trackEnquiry(referenceId: string): Promise<{ success: boolean; enquiry: Partial<Enquiry> }> {
    const res = await fetch(`/api/enquiries/track/${encodeURIComponent(referenceId)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Reference code not found');
    }
    return data;
  },

  // Book Consultation (Protected with Demo or Admin Bearer Token)
  async createBooking(payload: {
    customerName: string;
    email: string;
    phone: string;
    serviceName: string;
    preferredDate: string;
    preferredTime: string;
    consultationType: 'Online' | 'In-person';
    notes?: string;
    address?: string;
    whatsappConsent?: boolean;
  }): Promise<{
    success: boolean;
    bookingId: string;
    booking: ConsultationBooking;
    message: string;
    emailNotification?: any;
    whatsappNotification?: any;
  }> {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to complete consultation booking.');
    }
    return data;
  },

  // Public: Track Booking
  async trackBooking(bookingId: string): Promise<{ success: boolean; booking: Partial<ConsultationBooking> }> {
    const res = await fetch(`/api/bookings/track/${encodeURIComponent(bookingId)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Booking ID not found');
    }
    return data;
  },

  // Public: Fetch gadgets products
  async getProducts(): Promise<{ success: boolean; products: GadgetProduct[]; currencySymbol: string }> {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to load products');
    }
    return data;
  },

  // Public: Place an order
  async createOrder(payload: {
    items: { productId: string; name: string; price: number; quantity: number; imageUrl?: string }[];
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
    paymentMethod: string;
  }): Promise<{ success: boolean; orderId: string; totalAmount: number; currencySymbol: string; order: CustomerOrder }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to place order');
    }
    return data;
  },

  // Public: Track order by Order ID
  async trackOrder(orderId: string): Promise<{ success: boolean; order: Partial<CustomerOrder> }> {
    const res = await fetch(`/api/orders/track/${encodeURIComponent(orderId)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Order ID not found');
    }
    return data;
  },

  // Public: Get Payment Gateway Configuration & UPI Details
  async getPaymentConfig(): Promise<{ success: boolean; gateway: PaymentGatewayConfig }> {
    const res = await fetch('/api/payments/config');
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch payment gateway configuration');
    }
    return data;
  },

  // Public: Create Payment Intent (generates dynamic amount UPI QR, PhonePe/GPay intents, and Razorpay Order)
  async createPaymentIntent(orderId: string): Promise<PaymentIntentResponse> {
    const res = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to initialize secure payment intent');
    }
    return data;
  },

  // Public: Server-side Razorpay HMAC Cryptographic Verification
  async verifyRazorpayPayment(payload: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<{ success: boolean; verified: boolean; message: string; order: CustomerOrder }> {
    const res = await fetch('/api/payments/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Payment signature verification failed.');
    }
    return data;
  },

  // Public: Server-side PhonePe / UPI Payment Gateway Verification
  async verifyUpiPayment(payload: {
    orderId: string;
    transactionRef: string;
    upiApp: string;
    isTestConfirmation?: boolean;
  }): Promise<{ success: boolean; verified: boolean; message: string; order: CustomerOrder }> {
    const res = await fetch('/api/payments/verify-upi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'UPI payment verification failed.');
    }
    return data;
  },

  // Public: Check live order payment status
  async getPaymentStatus(orderId: string): Promise<{
    success: boolean;
    orderId: string;
    paymentStatus: string;
    status: string;
    paymentDetails?: any;
  }> {
    const res = await fetch(`/api/payments/status/${encodeURIComponent(orderId)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to check payment status');
    }
    return data;
  },

  // Admin: Login
  async adminLogin(username: string, password: string): Promise<{ success: boolean; token: string }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed');
    }

    if (data.token) {
      localStorage.setItem('electrocare_admin_token', data.token);
    }
    return data;
  },

  getAdminToken(): string | null {
    return localStorage.getItem('electrocare_admin_token');
  },

  async adminLogout(): Promise<void> {
    const token = this.getAdminToken();
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.warn('Logout notification error:', e);
      }
      localStorage.removeItem('electrocare_admin_token');
    }
  },

  async checkAdminAuth(): Promise<boolean> {
    const token = this.getAdminToken();
    if (!token) return false;

    try {
      const res = await fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Admin: Bookings Management
  async getAdminBookings(filters?: { status?: string; search?: string }): Promise<{ success: boolean; bookings: ConsultationBooking[]; total: number }> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`/api/admin/bookings?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch bookings');
    return data;
  },

  async updateBooking(id: string, updates: { status?: string; notes?: string }): Promise<{ success: boolean; booking: ConsultationBooking }> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update booking');
    return data;
  },

  async retryBookingNotification(id: string, channel: 'email' | 'whatsapp'): Promise<{ success: boolean; status: NotificationStatus; details: string }> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch(`/api/admin/bookings/${id}/retry-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channel }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to retry notification');
    return data;
  },

  // Admin: Orders Management
  async getAdminOrders(): Promise<{ success: boolean; orders: CustomerOrder[] }> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch('/api/admin/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
    return data;
  },

  async updateOrder(id: string, updates: { status?: string; trackingNumber?: string; carrierName?: string; paymentStatus?: string }): Promise<{ success: boolean; order: CustomerOrder }> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update order');
    return data;
  },

  async retryOrderNotification(id: string, channel: 'email' | 'whatsapp'): Promise<{ success: boolean; status: NotificationStatus; details: string }> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch(`/api/admin/orders/${id}/retry-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channel }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to retry order notification');
    return data;
  },

  async retryEnquiryNotification(id: string): Promise<{ success: boolean; status: NotificationStatus; details: string; enquiry: Enquiry }> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch(`/api/admin/enquiries/${id}/retry-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channel: 'email' }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to retry enquiry notification');
    return data;
  },

  // Admin: Notification System Status & Tests
  async getNotificationStatus(): Promise<NotificationConfigStatus> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch('/api/admin/notifications/status', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch notification system status');
    return data;
  },

  async updateNotificationConfig(config: any): Promise<void> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch('/api/admin/notifications/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(config),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update notification config');
  },

  async sendTestNotification(channel: 'email' | 'whatsapp', recipient?: string): Promise<{ success: boolean; status: NotificationStatus; details: string }> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch('/api/admin/notifications/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channel, recipient }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Test notification failed');
    return data;
  },

  // Admin: Enquiries
  async getAdminEnquiries(): Promise<{ success: boolean; enquiries: Enquiry[]; total: number }> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch('/api/admin/enquiries', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch enquiries');
    return data;
  },

  async updateEnquiry(id: string, updates: { status?: string; priority?: string; note?: string }): Promise<{ success: boolean; enquiry: Enquiry }> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch(`/api/admin/enquiries/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update enquiry');
    return data;
  },

  async deleteEnquiry(id: string): Promise<void> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch(`/api/admin/enquiries/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete enquiry');
  },

  // Admin: Products
  async updateProduct(id: string, updates: Partial<GadgetProduct>): Promise<{ success: boolean; product: GadgetProduct; message: string }> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update product');
    return data;
  },

  async addProduct(product: Partial<GadgetProduct>): Promise<{ success: boolean; product: GadgetProduct; message: string }> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add product');
    return data;
  },

  // Admin Stats
  async getAdminStats(): Promise<{ success: boolean; metrics: AdminStats }> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch dashboard metrics');
    return data;
  },

  // Admin Change Password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update password');
  },

  // Admin Reset Demo Data
  async resetDemoData(): Promise<void> {
    const token = this.getAdminToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch('/api/admin/reset-demo', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset demo data');
  },
};
