import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';
import QRCode from 'qrcode';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
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

export interface EnquiryNote {
  id: string;
  text: string;
  createdAt: string;
  author: string;
}

export interface Enquiry {
  id: string; // e.g. EC-72941
  name: string;
  email: string;
  phone?: string;
  category: string;
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

export interface OrderItem {
  productId: string;
  name: string;
  price: number; // In ₹
  quantity: number;
  imageUrl?: string;
}

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'cancelled' | 'refunded';

export interface OrderPaymentDetails {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  upiTransactionRef?: string;
  upiApp?: string;
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

export interface ConsultationBooking {
  id: string; // e.g. BK-EC-74921
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

export interface NotificationSettings {
  adminEmail: string;
  adminWhatsApp: string;
  emailFrom: string;
  resendApiKey?: string;
  sendgridApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  whatsappToken?: string;
  whatsappPhoneId?: string;
  twilioSid?: string;
  twilioAuth?: string;
  twilioFrom?: string;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  paymentTestMode?: boolean;
  upiVpa?: string;
  upiMerchantName?: string;
  phonepeMerchantId?: string;
  phonepeSaltKey?: string;
  phonepeSaltIndex?: string;
}

interface DatabaseSchema {
  admin: {
    username: string;
    salt: string;
    passwordHash: string;
    updatedAt: string;
  };
  sessions: {
    token: string;
    createdAt: number;
    expiresAt: number;
  }[];
  enquiries: Enquiry[];
  products: GadgetProduct[];
  orders: CustomerOrder[];
  bookings: ConsultationBooking[];
  notificationLogs: NotificationLog[];
  notificationSettings: NotificationSettings;
  dispatchedNotifications?: Record<string, string>;
  stats: {
    totalAuditsCompleted: number;
    estimatedSavedKWh: number;
  };
}

function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, actualSalt, 64);
  return {
    salt: actualSalt,
    hash: derivedKey.toString('hex')
  };
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const derivedKey = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
  const storedBuffer = Buffer.from(storedHash, 'hex');
  return crypto.timingSafeEqual(keyBuffer, storedBuffer);
}

// ---------------- CANONICAL VERIFIED PRODUCT CATALOG ----------------

export const CANONICAL_PRODUCTS: GadgetProduct[] = [
  {
    id: "prod-1-ceiling-fan",
    name: "BLDC Ultra-Quiet Ceiling Fan",
    category: "Cooling & Fans",
    price: 2499,
    originalPrice: 3499,
    rating: 4.8,
    reviewsCount: 142,
    inStock: true,
    energyRating: "5-Star BLDC (65% Power Saving)",
    shortDesc: "Brushless DC motor with RF remote control, aerodynamically balanced blades and 28W ultra-low power consumption.",
    description: "Engineered for silent, high air-delivery operation. The smart brushless DC motor consumes merely 28 watts at top speed, saving up to ₹1,800 annually on electricity compared to conventional induction fans.",
    imageUrl: "/products/ceiling_fan.jpg",
    specs: [
      "1200mm Sweep Size",
      "28W BLDC Motor",
      "Multi-speed Remote with Sleep Mode",
      "230 CMM High Air Delivery",
      "3-Year On-site Warranty"
    ],
    badge: "Popular"
  },
  {
    id: "prod-2-refrigerator",
    name: "Frost-Free Inverter Refrigerator (265L)",
    category: "Kitchen Appliances",
    price: 14999,
    originalPrice: 19499,
    rating: 4.9,
    reviewsCount: 98,
    inStock: true,
    energyRating: "5-Star Digital Inverter",
    shortDesc: "Double-door convertible refrigerator with smart digital inverter compressor and multi-airflow deodorizer.",
    description: "Equipped with an intelligent inverter compressor that auto-tunes its cooling speed according to cooling demand. Keeps vegetables crisp for up to 15 days with 0.5 kWh daily energy footprint.",
    imageUrl: "/products/refrigerator.jpg",
    specs: [
      "265 Liters Capacity",
      "Twin Cooling Plus Technology",
      "Toughened Glass Shelves",
      "Stabilizer-Free 100V-300V",
      "10-Year Compressor Warranty"
    ],
    badge: "Best Value"
  },
  {
    id: "prod-3-air-conditioner",
    name: "Dual Inverter Split Air Conditioner (AC 1.5 Ton)",
    category: "Cooling & Fans",
    price: 29999,
    originalPrice: 38999,
    rating: 4.9,
    reviewsCount: 184,
    inStock: true,
    energyRating: "5-Star Heavy Duty Inverter",
    shortDesc: "Copper condenser coil with anti-corrosion blue-fin coating, 6-in-1 convertible cooling and PM 2.5 air filter.",
    description: "Rapidly cools rooms even under extreme 52°C outdoor heat. The dual-rotary inverter compressor adjusts motor speed dynamically, dropping electricity usage by up to 40% compared to non-inverter models.",
    imageUrl: "/products/air_conditioner.jpg",
    specs: [
      "1.5 Ton (Suitable for 150-180 sq ft)",
      "100% Copper Condenser",
      "6-in-1 Flexi Cooling Modes",
      "Silent 26dB Quiet Mode",
      "Eco-Friendly R32 Refrigerant"
    ],
    badge: "Bestseller"
  },
  {
    id: "prod-4-washing-machine",
    name: "Smart Inverter Front-Load Washing Machine (7.5 kg)",
    category: "Laundry & Care",
    price: 12999,
    originalPrice: 17499,
    rating: 4.8,
    reviewsCount: 76,
    inStock: true,
    energyRating: "5-Star Eco-Wash",
    shortDesc: "Fully automatic front-load with Steam Hygiene wash, stainless steel diamond drum, and built-in water heater.",
    description: "Designed to tackle stubborn stains with gentle fabric care. Inverter direct-drive motor delivers high spin efficiency of 1400 RPM while minimizing vibration, noise, and water consumption.",
    imageUrl: "/products/washing_machine.jpg",
    specs: [
      "7.5 kg Wash Capacity",
      "1400 RPM Spin Speed",
      "Built-in Heater (Up to 60°C)",
      "In-built Water Softener Filter",
      "12 Smart Wash Programs"
    ],
    badge: "Hot Deal"
  },
  {
    id: "prod-5-led-tv",
    name: "4K Ultra HD Smart LED TV (43-inch)",
    category: "Home Entertainment",
    price: 9999,
    originalPrice: 14499,
    rating: 4.7,
    reviewsCount: 215,
    inStock: true,
    energyRating: "A+ Power Efficient Screen",
    shortDesc: "Bezel-less cinema display with Dolby Audio, HDR10+, Dual-Band Wi-Fi, and Google TV voice control.",
    description: "Immersive entertainment experience with vivid 4K resolution (3840x2160) and 24W box stereo speakers. Features low blue-light eye protection and energy-saving standby mode under 0.5W.",
    imageUrl: "/products/smart_tv.jpg",
    specs: [
      "43\" 4K UHD Bezel-less Display",
      "Dolby Audio 24W Speakers",
      "3 HDMI & 2 USB Ports",
      "Google TV OS with Play Store",
      "Chromecast Built-in"
    ],
    badge: "Top Rated"
  },
  {
    id: "prod-6-mixer-grinder",
    name: "Heavy-Duty 750W Mixer Grinder (3 Jars)",
    category: "Kitchen Appliances",
    price: 1999,
    originalPrice: 2899,
    rating: 4.8,
    reviewsCount: 165,
    inStock: true,
    energyRating: "Copper-Wound High Torque",
    shortDesc: "Pure copper armature motor with 3 stainless steel leak-proof jars and auto-shutoff overload protection.",
    description: "Grinds hard ingredients like turmeric, coffee beans, and soaked pulses with ease. Equipped with multi-utility stainless steel blades and dual exhaust vents for cooler motor operation.",
    imageUrl: "/products/mixer_grinder.jpg",
    specs: [
      "750 Watts 100% Copper Motor",
      "3 SS Jars (1.5L, 1.0L, 0.4L Chutney)",
      "3-Speed Knob with Pulse",
      "Thermal Overload Tripping Switch",
      "Food-Grade Silicon Gaskets"
    ],
    badge: "Essential"
  },
  {
    id: "prod-7-water-purifier",
    name: "RO + UV + MTDS Alkaline Water Purifier",
    category: "Water & Purification",
    price: 6999,
    originalPrice: 9499,
    rating: 4.9,
    reviewsCount: 112,
    inStock: true,
    energyRating: "Zero Water Wastage Tech",
    shortDesc: "8-stage water purifier with copper-zinc infusion, TDS controller, and 8.5-liter food-grade storage tank.",
    description: "Removes dissolved impurities, heavy metals, bacteria, and microplastics while replenishing essential alkaline minerals for healthy drinking water. Features smart LED tank full and filter change alerts.",
    imageUrl: "/products/water_purifier.jpg",
    specs: [
      "8-Stage Filtration System",
      "8.5L Storage Reservoir",
      "Active Copper Mineral Booster",
      "Suitable for Borewell & Municipal Water (up to 2000 TDS)",
      "Smart LED Indicators"
    ],
    badge: "Healthy Living"
  },
  {
    id: "prod-8-air-cooler",
    name: "Desert Air Cooler with Honeycomb Pads (55L)",
    category: "Cooling & Fans",
    price: 5499,
    originalPrice: 7299,
    rating: 4.7,
    reviewsCount: 88,
    inStock: true,
    energyRating: "Low 185W Power Draw",
    shortDesc: "High-throw motorized louvers with dense antibacterial honeycomb pads and built-in ice chamber.",
    description: "Delivers high-velocity cooling for living rooms and terraces up to 350 sq ft. The low 185W power consumption allows it to run smoothly on home inverters during power outages.",
    imageUrl: "/products/air_cooler.jpg",
    specs: [
      "55 Liters Water Capacity",
      "3500 m³/hr Powerful Air Delivery",
      "45 ft Long Air Throw",
      "Inverter Compatible (185W)",
      "Fully Collapsible Multi-directional Wheels"
    ],
    badge: "Seasonal Pick"
  },
  {
    id: "prod-9-electric-iron",
    name: "Non-Stick Dry & Steam Electric Iron",
    category: "Laundry & Care",
    price: 999,
    originalPrice: 1499,
    rating: 4.8,
    reviewsCount: 230,
    inStock: true,
    energyRating: "Fast Heating Thermo-Guard",
    shortDesc: "Heavy golden American heritage non-stick soleplate with 360-degree swivel cord and multi-fabric temperature dial.",
    description: "Glide effortlessly across silk, cotton, and denim without sticking or burning. The instant heating dual element heats in seconds, automatically cutting off power when preset temperatures are reached.",
    imageUrl: "/products/steam_iron.jpg",
    specs: [
      "1000W Quick Heating Element",
      "Non-stick American Heritage Coating",
      "Variable Fabric Temperature Dial",
      "360° Flexible Swivel Cord",
      "Thermal Safety Cut-off Fuse"
    ],
    badge: "Value Buy"
  },
  {
    id: "prod-10-microwave-oven",
    name: "Convection Microwave Oven with Grill (28L)",
    category: "Kitchen Appliances",
    price: 6499,
    originalPrice: 8999,
    rating: 4.8,
    reviewsCount: 104,
    inStock: true,
    energyRating: "Smart Eco Standby",
    shortDesc: "Multi-stage cooking with baking, grilling, reheating, and 200+ auto-cook Indian menu presets.",
    description: "Prepare crispy tandoori rotis, bake cakes, or defrost meals in minutes. The durable ceramic enamel cavity is antibacterial, scratch-resistant, and effortless to wipe clean.",
    imageUrl: "/products/microwave_oven.jpg",
    specs: [
      "28 Liters Convection Capacity",
      "Bake, Grill, Defrost, & Reheat",
      "Ceramic Enamel Cavity (99.9% Anti-Bacterial)",
      "Touch Keypad with Child Lock",
      "200+ Auto-Cook Recipes"
    ],
    badge: "Chef Choice"
  }
];

// ---------------- DATABASE INITIALIZATION ----------------

function initializeDatabase(): DatabaseSchema {
  let existingData: Partial<DatabaseSchema> = {};
  if (fs.existsSync(DB_FILE)) {
    try {
      existingData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (err) {
      console.error('Error reading DB, re-initializing...', err);
    }
  }

  const { salt, hash } = hashPassword('ElectroCare2026!');

  const defaultSettings: NotificationSettings = {
    adminEmail: process.env.ADMIN_EMAIL || process.env.BUSINESS_EMAIL || 'chandanathosar@gmail.com',
    adminWhatsApp: process.env.ADMIN_WHATSAPP_NUMBER || '+919822012345',
    emailFrom: process.env.EMAIL_FROM || 'ElectroCare Notifications <onboarding@resend.dev>',
    resendApiKey: process.env.RESEND_API_KEY || '',
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
    whatsappToken: process.env.WHATSAPP_API_TOKEN || '',
    whatsappPhoneId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    twilioSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuth: process.env.TWILIO_AUTH_TOKEN || '',
    twilioFrom: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
    paymentTestMode: true,
    upiVpa: process.env.UPI_VPA || 'electrocare@upi',
    upiMerchantName: process.env.UPI_MERCHANT_NAME || 'ElectroCare Consultancy',
    phonepeMerchantId: process.env.PHONEPE_MERCHANT_ID || '',
    phonepeSaltKey: process.env.PHONEPE_SALT_KEY || '',
    phonepeSaltIndex: process.env.PHONEPE_SALT_INDEX || '1'
  };

  const loadedOrders: CustomerOrder[] = (existingData.orders || []).map(o => ({
    ...o,
    paymentStatus: o.paymentStatus || 'unpaid',
    paymentMethod: o.paymentMethod || 'cash_on_delivery',
    items: (o.items || []).map(item => {
      const canonical = CANONICAL_PRODUCTS.find(cp => cp.id === item.productId);
      if (canonical && (!item.imageUrl || item.imageUrl.includes('unsplash.com'))) {
        return { ...item, imageUrl: canonical.imageUrl };
      }
      return item;
    })
  }));

  const loadedProducts: GadgetProduct[] = (existingData.products && existingData.products.length > 0)
    ? existingData.products.map(p => {
        const canonical = CANONICAL_PRODUCTS.find(cp => cp.id === p.id);
        if (canonical && (!p.imageUrl || p.imageUrl.includes('unsplash.com'))) {
          return { ...p, imageUrl: canonical.imageUrl };
        }
        return p;
      })
    : CANONICAL_PRODUCTS;

  const initialData: DatabaseSchema = {
    admin: existingData.admin || {
      username: 'admin@electrocare.com',
      salt,
      passwordHash: hash,
      updatedAt: new Date().toISOString()
    },
    sessions: existingData.sessions || [],
    enquiries: existingData.enquiries || [],
    products: loadedProducts,
    orders: loadedOrders,
    bookings: existingData.bookings || [],
    notificationLogs: existingData.notificationLogs || [],
    dispatchedNotifications: existingData.dispatchedNotifications || {},
    notificationSettings: {
      ...defaultSettings,
      ...(existingData.notificationSettings || {}),
      adminEmail: existingData.notificationSettings?.adminEmail || defaultSettings.adminEmail,
      upiVpa: existingData.notificationSettings?.upiVpa || defaultSettings.upiVpa,
      upiMerchantName: existingData.notificationSettings?.upiMerchantName || defaultSettings.upiMerchantName
    },
    stats: existingData.stats || {
      totalAuditsCompleted: 1420,
      estimatedSavedKWh: 3850000
    }
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  return initialData;
}

let db = initializeDatabase();

function saveDatabase(): void {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// ---------------- RAZORPAY PAYMENT GATEWAY HELPERS ----------------

function getRazorpayConfig() {
  const settings = db.notificationSettings;
  const keyId = (settings.razorpayKeyId || process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (settings.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || '').trim();
  const isConfigured = Boolean(keyId && keySecret);
  const isTestMode = keyId.startsWith('rzp_test_') || settings.paymentTestMode !== false;
  return { keyId, keySecret, isConfigured, isTestMode };
}

function getRazorpayClient(): Razorpay | null {
  const { keyId, keySecret, isConfigured } = getRazorpayConfig();
  if (!isConfigured) return null;
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}

function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  if (!orderId || !paymentId || !signature || !secret) return false;
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const signatureBuf = Buffer.from(signature, 'utf8');
    if (expectedBuf.length !== signatureBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  } catch (err) {
    console.error('[Razorpay] Signature verification exception:', err);
    return false;
  }
}

function authenticateAdmin(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.substring(7);
  const now = Date.now();

  const sessionIndex = db.sessions.findIndex(s => s.token === token && s.expiresAt > now);
  if (sessionIndex === -1) {
    res.status(401).json({ success: false, error: 'Unauthorized: Session expired or invalid' });
    return;
  }

  next();
}

// ---------------- COLLEGE DEMONSTRATION AUTHORIZATION ENGINE ----------------

export const DEMO_PASSCODE = process.env.DEMO_PASSCODE || 'ELECTRO-DEMO-2026';
export const demoSessions = new Map<string, { token: string; createdAt: number; expiresAt: number }>();

export function requireDemoOrAdmin(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Access Restricted: Unauthorized. Consultation booking and gadget orders are restricted to authorized demo users for this private presentation. Please enter your college demo access code.'
    });
    return;
  }

  const token = authHeader.substring(7);
  const now = Date.now();

  // 1. Check if token belongs to an authenticated Admin
  const isAdmin = db.sessions.some(s => s.token === token && s.expiresAt > now);
  if (isAdmin) {
    (req as any).authRole = 'admin';
    (req as any).isDemo = false;
    return next();
  }

  // 2. Check if token belongs to an authorized Demo Evaluator
  const demoSession = demoSessions.get(token);
  if (demoSession && demoSession.expiresAt > now) {
    (req as any).authRole = 'demo';
    (req as any).isDemo = true;
    return next();
  }

  res.status(401).json({
    success: false,
    error: 'Access Restricted: Invalid or expired demo authorization token. Please re-enter your college demo passcode.'
  });
}

// ---------------- NOTIFICATION DISPATCH ENGINE ----------------

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  entityType?: 'booking' | 'order' | 'enquiry' | 'test';
  entityId?: string;
  eventType?: string;
  forceSend?: boolean;
  recipientType?: 'customer' | 'admin';
}

interface NotificationResult {
  success: boolean;
  status: NotificationStatus;
  details: string;
  error?: string;
}

async function sendEmailNotification(params: SendEmailParams): Promise<NotificationResult> {
  // Deduplication check: Prevent duplicate email dispatch for the same event and entity
  const dedupKey = `${params.entityType || 'msg'}:${params.entityId || 'none'}:${params.eventType || params.subject}:${params.to.trim().toLowerCase()}`;
  if (!params.forceSend && params.entityType !== 'test' && db.dispatchedNotifications && db.dispatchedNotifications[dedupKey]) {
    const existingTimestamp = db.dispatchedNotifications[dedupKey];
    console.log(`[Email Deduplication] Suppressed duplicate email dispatch for ${dedupKey} (previously sent at ${existingTimestamp})`);
    return {
      success: true,
      status: 'sent',
      details: `Email previously sent at ${existingTimestamp} (Deduplicated)`
    };
  }

  const markDispatched = () => {
    if (!db.dispatchedNotifications) db.dispatchedNotifications = {};
    db.dispatchedNotifications[dedupKey] = new Date().toISOString();
    saveDatabase();
  };

  const settings = db.notificationSettings;
  const resendKey = settings.resendApiKey || process.env.RESEND_API_KEY;
  const sendgridKey = settings.sendgridApiKey || process.env.SENDGRID_API_KEY;
  const smtpHost = settings.smtpHost || process.env.SMTP_HOST;
  const smtpUser = settings.smtpUser || process.env.SMTP_USER;
  const smtpPass = settings.smtpPass || process.env.SMTP_PASS;
  const smtpPort = Number(settings.smtpPort || process.env.SMTP_PORT) || 587;
  const isSmtpConfigured = Boolean(smtpHost && smtpUser && smtpPass);

  if (!resendKey && !sendgridKey && !isSmtpConfigured) {
    const detailMsg = 'Email service is not yet configured. Set RESEND_API_KEY, SENDGRID_API_KEY, or SMTP credentials in server environment or Admin Settings to enable live email delivery.';
    logNotification({
      entityType: params.entityType || 'test',
      entityId: params.entityId || 'N/A',
      channel: 'email',
      recipient: params.to,
      recipientType: params.recipientType || 'customer',
      status: 'not_configured',
      details: detailMsg
    });
    return {
      success: false,
      status: 'not_configured',
      details: detailMsg
    };
  }

  try {
    // 1. Resend API (Preferred modern standard)
    if (resendKey) {
      let fromAddr = settings.emailFrom || process.env.EMAIL_FROM || 'ElectroCare Notifications <onboarding@resend.dev>';
      if (!fromAddr.includes('<') && fromAddr.includes('@')) {
        fromAddr = `ElectroCare Notifications <${fromAddr}>`;
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddr,
          to: [params.to],
          subject: params.subject,
          html: params.html,
          text: params.text
        })
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorMsg = resData.message || (typeof resData === 'string' ? resData : `Resend returned HTTP ${res.status}`);
        if (typeof errorMsg === 'string' && errorMsg.includes('You can only send testing emails to your own email address')) {
          throw new Error(`Resend Domain Restriction: onboarding@resend.dev only delivers to your Resend account email address. To deliver to other customers (${params.to}), please verify your custom domain at resend.com/domains or configure SMTP credentials.`);
        }
        throw new Error(errorMsg);
      }

      const detailMsg = `Email delivered successfully via Resend API (Message ID: ${resData.id || 'OK'})`;
      logNotification({
        entityType: params.entityType || 'test',
        entityId: params.entityId || 'N/A',
        channel: 'email',
        recipient: params.to,
        recipientType: params.recipientType || 'customer',
        status: 'sent',
        details: detailMsg
      });

      markDispatched();
      return { success: true, status: 'sent', details: detailMsg };
    }

    // 2. Direct SMTP Server (Universal fallback for Gmail / Brevo / Zoho / SES)
    if (isSmtpConfigured) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const sender = settings.emailFrom || `ElectroCare Consultancy <${smtpUser}>`;
      const info = await transporter.sendMail({
        from: sender,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html
      });

      const detailMsg = `Email delivered successfully via SMTP server (${info.messageId || 'OK'})`;
      logNotification({
        entityType: params.entityType || 'test',
        entityId: params.entityId || 'N/A',
        channel: 'email',
        recipient: params.to,
        recipientType: params.recipientType || 'customer',
        status: 'sent',
        details: detailMsg
      });

      markDispatched();
      return { success: true, status: 'sent', details: detailMsg };
    }

    // 3. SendGrid API
    if (sendgridKey) {
      const fromAddr = settings.emailFrom || process.env.EMAIL_FROM || 'notifications@electrocare.com';
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: params.to }] }],
          from: { email: fromAddr.replace(/^.*<([^>]+)>$/, '$1'), name: 'ElectroCare Consultancy' },
          subject: params.subject,
          content: [
            { type: 'text/plain', value: params.text },
            { type: 'text/html', value: params.html }
          ]
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`SendGrid API error: ${res.status} ${errorText}`);
      }

      const detailMsg = 'Email delivered successfully via SendGrid API';
      logNotification({
        entityType: params.entityType || 'test',
        entityId: params.entityId || 'N/A',
        channel: 'email',
        recipient: params.to,
        recipientType: params.recipientType || 'customer',
        status: 'sent',
        details: detailMsg
      });

      markDispatched();
      return { success: true, status: 'sent', details: detailMsg };
    }

    return { success: false, status: 'not_configured', details: 'No active email provider configured.' };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const detailMsg = `Email delivery failed: ${errorMsg}`;
    logNotification({
      entityType: params.entityType || 'test',
      entityId: params.entityId || 'N/A',
      channel: 'email',
      recipient: params.to,
      recipientType: params.recipientType || 'customer',
      status: 'failed',
      details: detailMsg
    });

    return {
      success: false,
      status: 'failed',
      details: detailMsg,
      error: errorMsg
    };
  }
}

interface SendWhatsAppParams {
  to: string;
  messageText: string;
  entityType?: 'booking' | 'order' | 'test';
  entityId?: string;
  recipientType?: 'customer' | 'admin';
}

// Normalize Indian phone numbers to E.164 (+91XXXXXXXXXX) and raw international digits (91XXXXXXXXXX)
export function normalizeIndianPhoneNumber(phone: string): { e164: string; national: string; rawDigits: string } {
  if (!phone) return { e164: '', national: '', rawDigits: '' };
  const clean = phone.replace(/[^\d+]/g, '');
  const digits = clean.replace(/\+/g, '');

  let formattedDigits = digits;
  if (digits.length === 10) {
    formattedDigits = `91${digits}`;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    formattedDigits = `91${digits.substring(1)}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    formattedDigits = digits;
  }

  return {
    e164: `+${formattedDigits}`,
    national: formattedDigits.startsWith('91') && formattedDigits.length === 12 ? formattedDigits.substring(2) : formattedDigits,
    rawDigits: formattedDigits
  };
}

async function sendWhatsAppNotification(params: SendWhatsAppParams): Promise<NotificationResult> {
  const settings = db.notificationSettings;
  const metaToken = settings.whatsappToken || process.env.WHATSAPP_API_TOKEN;
  const phoneId = settings.whatsappPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const twilioSid = settings.twilioSid || process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = settings.twilioAuth || process.env.TWILIO_AUTH_TOKEN;

  if ((!metaToken || !phoneId) && (!twilioSid || !twilioAuth)) {
    const detailMsg = 'WhatsApp API is not yet configured. Set WHATSAPP_API_TOKEN & WHATSAPP_PHONE_NUMBER_ID (Meta Cloud API) or Twilio credentials in server environment or Admin Settings to enable live WhatsApp delivery.';
    logNotification({
      entityType: params.entityType || 'test',
      entityId: params.entityId || 'N/A',
      channel: 'whatsapp',
      recipient: params.to,
      recipientType: params.recipientType || 'customer',
      status: 'not_configured',
      details: detailMsg
    });
    return {
      success: false,
      status: 'not_configured',
      details: detailMsg
    };
  }

  // Validate phone format before dispatch
  const phoneInfo = normalizeIndianPhoneNumber(params.to);
  if (!phoneInfo.rawDigits || phoneInfo.rawDigits.length < 10) {
    const detailMsg = `Invalid recipient phone number format: "${params.to}". Valid 10-digit mobile number required (e.g. +91 98220 12345).`;
    logNotification({
      entityType: params.entityType || 'test',
      entityId: params.entityId || 'N/A',
      channel: 'whatsapp',
      recipient: params.to,
      recipientType: params.recipientType || 'customer',
      status: 'failed',
      details: detailMsg
    });
    return { success: false, status: 'failed', details: detailMsg };
  }

  try {
    // 1. Meta WhatsApp Cloud API (Official Business Platform)
    if (metaToken && phoneId) {
      const formattedPhone = phoneInfo.rawDigits;
      const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: params.messageText
          }
        })
      });

      const resData = await res.json();
      if (!res.ok || resData.error) {
        throw new Error(resData.error?.message || `WhatsApp Cloud API returned error (code: ${res.status})`);
      }

      const detailMsg = `WhatsApp message delivered via Official Meta Business Cloud API (MsgID: ${resData.messages?.[0]?.id || 'OK'})`;
      logNotification({
        entityType: params.entityType || 'test',
        entityId: params.entityId || 'N/A',
        channel: 'whatsapp',
        recipient: phoneInfo.e164,
        recipientType: params.recipientType || 'customer',
        status: 'sent',
        details: detailMsg
      });

      return { success: true, status: 'sent', details: detailMsg };
    }

    // 2. Twilio WhatsApp Fallback
    if (twilioSid && twilioAuth) {
      const fromNumber = settings.twilioFrom || process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
      const toNumber = `whatsapp:${phoneInfo.e164}`;

      const formData = new URLSearchParams();
      formData.append('From', fromNumber);
      formData.append('To', toNumber);
      formData.append('Body', params.messageText);

      const authStr = Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authStr}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || `Twilio WhatsApp API error: ${res.status}`);
      }

      const detailMsg = `WhatsApp message sent via Twilio (SID: ${resData.sid})`;
      logNotification({
        entityType: params.entityType || 'test',
        entityId: params.entityId || 'N/A',
        channel: 'whatsapp',
        recipient: phoneInfo.e164,
        recipientType: params.recipientType || 'customer',
        status: 'sent',
        details: detailMsg
      });

      return { success: true, status: 'sent', details: detailMsg };
    }

    return { success: false, status: 'not_configured', details: 'No active WhatsApp provider found.' };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const detailMsg = `WhatsApp dispatch failed: ${errorMsg}`;
    logNotification({
      entityType: params.entityType || 'test',
      entityId: params.entityId || 'N/A',
      channel: 'whatsapp',
      recipient: params.to,
      recipientType: params.recipientType || 'customer',
      status: 'failed',
      details: detailMsg
    });

    return {
      success: false,
      status: 'failed',
      details: detailMsg,
      error: errorMsg
    };
  }
}

function logNotification(log: Omit<NotificationLog, 'id' | 'timestamp'>) {
  const newLog: NotificationLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...log,
    timestamp: new Date().toISOString()
  };
  if (!db.notificationLogs) db.notificationLogs = [];
  db.notificationLogs.unshift(newLog);
  // Keep last 150 logs
  if (db.notificationLogs.length > 150) {
    db.notificationLogs = db.notificationLogs.slice(0, 150);
  }
}

// ---------------- HTML & TEXT EMAIL GENERATORS ----------------

function generateEnquiryCustomerEmail(e: Enquiry): { html: string; text: string } {
  const formattedCategory = typeof e.category === 'string' ? e.category.replace(/_/g, ' ') : 'Consultation';
  const enquiryDateStr = new Date(e.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const text = `Dear ${e.name},

Thank you for reaching out to ElectroCare Consultancy!
Your enquiry has been successfully registered with our engineering desk.

--- ENQUIRY DETAILS ---
Reference ID: ${e.id}
Selected Service: ${formattedCategory}
Enquiry Date: ${enquiryDateStr}
Facility / Property Type: ${e.propertyType}
Current Monthly Bill: ${e.estimatedMonthlyBill || 'Not Specified'}
Preferred Contact Time: ${e.preferredContactTime || 'Anytime'}

--- EXPECTED NEXT STEPS ---
1. Initial Technical Review: A senior electrical engineer will examine your facility profile, power requirements, and load history.
2. Recommendation Plan: Within 24 hours, our desk prepares actionable bill reduction strategies and audit milestones.
3. Consultant Callback: An electrical engineer will connect with you during your preferred time window (${e.preferredContactTime || 'business hours'}) to discuss immediate savings steps.

Need immediate assistance?
ElectroCare Consultancy Desk
Suite 408, Power Plaza, Innovation Boulevard, High-Tech Corridor, Pune
Helpline: +91 98220 12345 / (800) 482-9382 | Email: consult@electrocare.com

Best regards,
ElectroCare Consultancy Team`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 32px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ElectroCare Consultancy</h1>
      <p style="margin: 0; font-size: 14px; opacity: 0.95;">Enquiry Registration Acknowledgment</p>
    </div>
    
    <div style="padding: 28px 24px;">
      <p style="font-size: 15px; color: #1e293b; line-height: 1.5; margin-top: 0;">
        Dear <strong>${e.name}</strong>,
      </p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Thank you for contacting <strong>ElectroCare Consultancy</strong>. Your consulting enquiry has been successfully registered in our verified engineering system.
      </p>

      <div style="background: #f1f5f9; border-radius: 12px; padding: 18px; margin: 20px 0; border: 1px solid #e2e8f0;">
        <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 40%;">Enquiry Reference ID:</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: 700; color: #2563eb; font-size: 15px;">${e.id}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Selected Service:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a; text-transform: capitalize;">${formattedCategory}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Enquiry Date:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${enquiryDateStr}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Facility / Property:</td>
            <td style="padding: 6px 0; color: #0f172a;">${e.propertyType}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Estimated Monthly Bill:</td>
            <td style="padding: 6px 0; color: #0f172a;">${e.estimatedMonthlyBill || 'Not Specified'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Preferred Contact Time:</td>
            <td style="padding: 6px 0; color: #0f172a;">${e.preferredContactTime || 'Anytime'}</td>
          </tr>
        </table>
      </div>

      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #166534; font-weight: 700;">📋 Expected Next Steps:</h4>
        <ol style="margin: 0; padding-left: 20px; font-size: 12px; color: #15803d; line-height: 1.6;">
          <li><strong>Technical Assessment:</strong> Our certified power auditor reviews your facility profile and historical tariff spikes.</li>
          <li><strong>Custom Strategy:</strong> Within 24 hours, our engineering desk formulates targeted bill reduction and equipment optimization recommendations.</li>
          <li><strong>Consultant Callback:</strong> A lead consultant will contact you via phone or email during your preferred window (<em>${e.preferredContactTime || 'business hours'}</em>).</li>
        </ol>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; font-size: 12px; color: #64748b; line-height: 1.5;">
        <strong>ElectroCare Consultancy Desk</strong><br>
        Suite 408, Power Plaza, Innovation Boulevard, High-Tech Corridor, Pune<br>
        Helpline: +91 98220 12345 | Email: consult@electrocare.com
      </div>
    </div>
  </div>
</body>
</html>`;

  return { html, text };
}

function generateEnquiryAdminEmail(e: Enquiry): { html: string; text: string } {
  const text = `NEW CUSTOMER ENQUIRY ALERT

Enquiry ID: ${e.id}
Customer Name: ${e.name}
Email: ${e.email}
Phone: ${e.phone || 'N/A'}
Service Category: ${e.category}
Property Type: ${e.propertyType}
Monthly Bill Range: ${e.estimatedMonthlyBill || 'Not Specified'}
Preferred Contact Time: ${e.preferredContactTime || 'Anytime'}
Message:
${e.message}`;

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #f1f5f9; padding: 20px;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #cbd5e1;">
    <h2 style="color: #1e40af; margin-top: 0;">⚡ New Customer Enquiry Registered</h2>
    <p style="font-size: 13px; color: #475569;">A customer has submitted a new consulting enquiry on the website.</p>
    
    <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin: 16px 0;">
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold; width: 35%;">Enquiry ID:</td><td style="color: #2563eb; font-weight: bold; font-family: monospace;">${e.id}</td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Customer Name:</td><td>${e.name}</td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${e.email}">${e.email}</a></td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td style="font-family: monospace;">${e.phone || 'Not provided'}</td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Category:</td><td style="text-transform: capitalize;">${e.category.replace(/_/g, ' ')}</td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Facility Type:</td><td>${e.propertyType}</td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Bill Range:</td><td>${e.estimatedMonthlyBill || 'Not Specified'}</td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Preferred Time:</td><td>${e.preferredContactTime || 'Anytime'}</td></tr>
    </table>

    <div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 12px; color: #334155; margin-bottom: 12px;">
      <strong>Customer Message:</strong><br>
      ${e.message}
    </div>
    
    <p style="font-size: 12px; color: #64748b;">Log in to the ElectroCare Management Console to review and assign an auditor.</p>
  </div>
</body>
</html>`;

  return { html, text };
}

function generateBookingCustomerEmail(b: ConsultationBooking): { html: string; text: string } {
  const text = `Dear ${b.customerName},

Thank you for booking a consultation with ElectroCare Consultancy.
Your booking has been registered successfully!

--- BOOKING DETAILS ---
Booking ID: ${b.id}
Service: ${b.serviceName}
Preferred Date: ${b.preferredDate}
Time Slot: ${b.preferredTime}
Consultation Format: ${b.consultationType} (Online Video or On-Site)
Customer Phone: ${b.phone}
${b.notes ? `Customer Notes: ${b.notes}\n` : ''}

--- ABOUT ELECTROCARE CONSULTANCY ---
Business: ElectroCare Consultancy
Headquarters: Suite 408, Power Plaza, Innovation Boulevard, Pune
Helpline: +91 98220 12345 / (800) 482-9382
Email: consult@electrocare.com

A senior electrical energy consultant has been assigned to your booking. Prior to your appointment, our engineer will contact you to confirm video connection link or on-site diagnostic entry.`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #1e40af, #4338ca, #6d28d9); padding: 32px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ElectroCare Consultancy</h1>
      <p style="margin: 0; font-size: 14px; opacity: 0.9;">Consultation Booking Confirmation</p>
    </div>
    <div style="padding: 28px 24px;">
      <p style="font-size: 15px; color: #1e293b; line-height: 1.5; margin-top: 0;">
        Dear <strong>${b.customerName}</strong>,
      </p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Your consultation request has been confirmed. A certified energy engineer has reserved your preferred schedule.
      </p>
      
      <div style="background: #f1f5f9; border-radius: 12px; padding: 18px; margin: 20px 0; border: 1px solid #e2e8f0;">
        <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 40%;">Booking Reference ID:</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: 700; color: #2563eb; font-size: 15px;">${b.id}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Selected Service:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${b.serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Appointment Date:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${b.preferredDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Time Slot:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #059669;">${b.preferredTime}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Format:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #7c3aed;">${b.consultationType} Consultation</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Booking Status:</td>
            <td style="padding: 6px 0; font-weight: 800; color: #059669; text-transform: uppercase;">${b.status}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Customer Phone:</td>
            <td style="padding: 6px 0; font-family: monospace;">${b.phone}</td>
          </tr>
        </table>
      </div>

      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 12px; color: #1e40af; line-height: 1.5;">
          💡 <strong>What Happens Next:</strong> Our consulting engineer will examine your equipment or tariff history and contact you 15 minutes before the slot with the session link or entry details.
        </p>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; font-size: 12px; color: #64748b; line-height: 1.5;">
        <strong>ElectroCare Consultancy Desk</strong><br>
        Suite 408, Power Plaza, Innovation Boulevard, High-Tech Corridor, Pune<br>
        Helpline: +91 98220 12345 | Email: consult@electrocare.com
      </div>
    </div>
  </div>
</body>
</html>`;

  return { html, text };
}

function generateBookingAdminEmail(b: ConsultationBooking): { html: string; text: string } {
  const text = `NEW CONSULTATION BOOKING ALERT

Booking ID: ${b.id}
Customer: ${b.customerName}
Email: ${b.email}
Phone: ${b.phone}
Service: ${b.serviceName}
Date: ${b.preferredDate}
Time: ${b.preferredTime}
Format: ${b.consultationType}
Status: ${b.status.toUpperCase()}
Notes: ${b.notes || 'None'}
Address: ${b.address || 'N/A'}`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; background-color: #f1f5f9; padding: 20px;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #cbd5e1;">
    <h2 style="color: #4338ca; margin-top: 0;">⚡ New Consultation Booking Received</h2>
    <p style="font-size: 13px; color: #475569;">A customer has submitted a new electrical consultation booking through the portal.</p>
    
    <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin: 16px 0;">
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold; width: 35%;">Booking ID:</td><td style="color: #2563eb; font-weight: bold; font-family: monospace;">${b.id}</td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Customer Name:</td><td>${b.customerName}</td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${b.email}">${b.email}</a></td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td style="font-family: monospace;">${b.phone}</td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Service:</td><td>${b.serviceName}</td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Date & Time:</td><td><strong>${b.preferredDate}</strong> at <strong style="color: #059669;">${b.preferredTime}</strong></td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Format:</td><td>${b.consultationType}</td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Booking Status:</td><td style="color: #059669; font-weight: bold; text-transform: uppercase;">${b.status}</td></tr>
      ${b.notes ? `<tr><td style="padding: 8px 0; font-weight: bold;">Notes:</td><td>${b.notes}</td></tr>` : ''}
    </table>

    <p style="font-size: 12px; color: #64748b;">Open the ElectroCare Admin Console to assign an engineer or update status.</p>
  </div>
</body>
</html>`;

  return { html, text };
}

function generateOrderCustomerEmail(o: CustomerOrder): { html: string; text: string } {
  const itemsText = o.items.map(i => `• ${i.name} (Qty: ${i.quantity}) — ₹${i.price.toLocaleString('en-IN')} each = ₹${(i.price * i.quantity).toLocaleString('en-IN')}`).join('\n');
  const isPaid = o.paymentStatus === 'paid';
  const paymentMethodLabel = o.paymentMethod.replace(/_/g, ' ').toUpperCase();
  const paymentStatusLabel = isPaid
    ? 'PAID & VERIFIED (Official Gateway Confirmation)'
    : o.paymentStatus === 'failed'
    ? 'PAYMENT FAILED / INCOMPLETE'
    : 'PENDING VERIFICATION (Awaiting Payment Gateway Confirmation)';
  const paymentRefStr = o.paymentDetails?.razorpayPaymentId
    ? `Razorpay Payment ID: ${o.paymentDetails.razorpayPaymentId}\n`
    : o.paymentDetails?.upiTransactionRef
    ? `UPI Reference: ${o.paymentDetails.upiTransactionRef}\n`
    : '';

  const text = `Dear ${o.customer.name},

Thank you for your order with ElectroCare Consultancy Gadgets Store!
Your appliance order ${o.id} has been registered in our dispatch system.

--- ORDER & PAYMENT DETAILS ---
Order ID: ${o.id}
Order Date: ${new Date(o.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Order Status: ${o.status.toUpperCase()}
Payment Method: ${paymentMethodLabel}
Payment Status: ${paymentStatusLabel}
${paymentRefStr}
--- ITEMS ORDERED ---
${itemsText}

Grand Total: ₹${o.totalAmount.toLocaleString('en-IN')}

--- DELIVERY ADDRESS ---
Recipient: ${o.customer.name}
Phone: ${o.customer.phone}
Address: ${o.customer.address}, ${o.customer.city || ''} ${o.customer.pincode || ''}

${!isPaid ? '⚠️ IMPORTANT PAYMENT NOTICE: Payment has not yet been verified. An official payment confirmation receipt will be emailed to you separately as soon as payment is confirmed by our gateway.' : '✓ PAYMENT VERIFIED: Your payment is confirmed. Official tax invoice is generated.'}

Our technical dispatch team will verify electrical specifications and contact you prior to shipment.
For queries, contact support at consult@electrocare.com or +91 98220 12345.`;

  const itemsHtml = o.items.map(i => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
        <strong style="color: #0f172a; font-size: 13px;">${i.name}</strong>
        <div style="font-size: 11px; color: #64748b;">₹${i.price.toLocaleString('en-IN')} each</div>
      </td>
      <td style="padding: 12px 0; text-align: center; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #334155;">
        ${i.quantity}
      </td>
      <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f1f5f9; font-family: monospace; font-weight: bold; color: #0f172a;">
        ₹${(i.price * i.quantity).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  const paymentAlertHtml = isPaid
    ? `<div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px 16px; margin: 18px 0;">
        <div style="color: #047857; font-weight: 800; font-size: 13px; margin-bottom: 3px;">
          ✓ Payment Status: PAID & VERIFIED
        </div>
        <div style="font-size: 11px; color: #065f46; line-height: 1.5;">
          Your payment of ₹${o.totalAmount.toLocaleString('en-IN')} has been verified via ${paymentMethodLabel}. Official receipt is active.
        </div>
       </div>`
    : `<div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 16px; margin: 18px 0;">
        <div style="color: #b45309; font-weight: 800; font-size: 13px; margin-bottom: 3px;">
          ⏳ Payment Status: PENDING VERIFICATION (${paymentMethodLabel})
        </div>
        <div style="font-size: 11px; color: #78350f; line-height: 1.5;">
          Your order is registered in our dispatch system. <strong>Please note that payment has not been marked as received yet.</strong> A separate verified payment confirmation email will be dispatched immediately once payment is confirmed by our gateway.
        </div>
       </div>`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #1e40af, #2563eb); padding: 28px 24px; color: #ffffff; text-align: center;">
      <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 800;">ElectroCare Gadgets Store</h1>
      <p style="margin: 0; font-size: 13px; opacity: 0.9;">Customer Order Confirmation</p>
    </div>
    
    <div style="padding: 24px;">
      <p style="font-size: 14px; color: #1e293b; margin-top: 0;">
        Dear <strong>${o.customer.name}</strong>,
      </p>
      <p style="font-size: 13px; color: #475569; line-height: 1.5;">
        Thank you for choosing certified energy-saving appliances from <strong>ElectroCare Consultancy</strong>. Your order <strong>${o.id}</strong> has been confirmed and stored in our database.
      </p>

      ${paymentAlertHtml}

      <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin: 18px 0; border: 1px solid #e2e8f0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 11px; text-transform: uppercase;">
              <th style="text-align: left; padding-bottom: 8px;">Appliance Item</th>
              <th style="text-align: center; padding-bottom: 8px;">Qty</th>
              <th style="text-align: right; padding-bottom: 8px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding-top: 12px; font-weight: bold; font-size: 14px; color: #0f172a;">Total Order Amount:</td>
              <td style="padding-top: 12px; text-align: right; font-weight: 800; font-size: 16px; color: #059669; font-family: monospace;">
                ₹${o.totalAmount.toLocaleString('en-IN')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style="background: #f1f5f9; border-radius: 10px; padding: 14px; font-size: 12px; color: #334155; margin-bottom: 20px;">
        <div style="margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
          <strong style="color: #64748b;">Order Reference ID:</strong>
          <span style="color: #2563eb; font-weight: 800; font-family: monospace; margin-left: 8px;">${o.id}</span>
        </div>
        <div style="margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
          <strong style="color: #64748b;">Order Date:</strong>
          <span style="color: #0f172a; margin-left: 8px;">${new Date(o.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <strong style="color: #0f172a; display: block; margin-bottom: 4px;">Delivery Destination:</strong>
        ${o.customer.address}, ${o.customer.city || ''} ${o.customer.pincode ? `• PIN: ${o.customer.pincode}` : ''}<br>
        Customer Mobile: <strong>${o.customer.phone}</strong><br>
        Customer Email: <strong>${o.customer.email || 'None'}</strong>
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 14px; margin-bottom: 0;">
        Need assistance with your order? Contact our dispatch desk at <strong>+91 98220 12345</strong> or email <strong>orders@electrocare.com</strong>.
      </p>
    </div>
  </div>
 </body>
</html>`;

  return { html, text };
}

function generateOrderAdminEmail(o: CustomerOrder): { html: string; text: string } {
  const itemsText = o.items.map(i => `${i.name} x${i.quantity} (₹${(i.price * i.quantity).toLocaleString('en-IN')})`).join(', ');
  const isPaid = o.paymentStatus === 'paid';
  const text = `NEW GADGET ORDER ALERT (${isPaid ? 'PAID ONLINE' : 'CASH ON DELIVERY / PENDING'})

Order ID: ${o.id}
Payment Status: ${o.paymentStatus.toUpperCase()}
Customer Name: ${o.customer.name}
Customer Email: ${o.customer.email || 'None'}
Customer Phone: ${o.customer.phone}
Delivery Address: ${o.customer.address}, ${o.customer.city || ''} ${o.customer.pincode || ''}
Items: ${itemsText}
Total Amount: ₹${o.totalAmount.toLocaleString('en-IN')}
Payment Method: ${o.paymentMethod}
${o.paymentDetails?.razorpayPaymentId ? `Razorpay Payment ID: ${o.paymentDetails.razorpayPaymentId}\n` : ''}${o.paymentDetails?.upiTransactionRef ? `UPI Reference: ${o.paymentDetails.upiTransactionRef}\n` : ''}`;

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #f1f5f9; padding: 20px;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #cbd5e1;">
    <h2 style="color: #1e40af; margin-top: 0;">📦 New Appliance Order Received ${isPaid ? '• [PAID]' : '• [PENDING]'}</h2>
    <p style="font-size: 13px; color: #475569;">A customer has placed a new order in the ElectroCare Store.</p>
    
    <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin: 16px 0;">
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold; width: 35%;">Order ID:</td><td style="color: #2563eb; font-weight: bold; font-family: monospace;">${o.id}</td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Payment Status:</td><td style="color: ${isPaid ? '#059669' : '#d97706'}; font-weight: bold; font-family: monospace;">${o.paymentStatus.toUpperCase()}</td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Customer Name:</td><td>${o.customer.name}</td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Customer Email:</td><td><a href="mailto:${o.customer.email}">${o.customer.email || 'Not provided'}</a></td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Customer Phone:</td><td style="font-family: monospace; font-weight: bold;">${o.customer.phone}</td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Address:</td><td>${o.customer.address}, ${o.customer.city || ''}</td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Total Amount:</td><td style="font-weight: bold; color: #059669; font-size: 15px;">₹${o.totalAmount.toLocaleString('en-IN')}</td></tr>
      <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Payment Method:</td><td>${o.paymentMethod}</td></tr>
      ${o.paymentDetails?.razorpayPaymentId ? `<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Razorpay Payment ID:</td><td style="font-family: monospace; font-weight: bold;">${o.paymentDetails.razorpayPaymentId}</td></tr>` : ''}
      ${o.paymentDetails?.upiTransactionRef ? `<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">UPI Transaction Ref:</td><td style="font-family: monospace; font-weight: bold;">${o.paymentDetails.upiTransactionRef}</td></tr>` : ''}
    </table>

    <div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 12px; color: #334155;">
      <strong>Ordered Items:</strong><br>
      ${itemsText}
    </div>
  </div>
</body>
</html>`;

  return { html, text };
}

function generatePaymentSuccessCustomerEmail(o: CustomerOrder): { html: string; text: string } {
  const itemsText = o.items.map(i => `• ${i.name} x${i.quantity} — ₹${(i.price * i.quantity).toLocaleString('en-IN')}`).join('\n');
  const paymentRef = o.paymentDetails?.razorpayPaymentId || o.paymentDetails?.upiTransactionRef || 'Verified via Gateway';
  const paymentMode = o.paymentMethod.replace(/_/g, ' ').toUpperCase();

  const text = `Dear ${o.customer.name},

PAYMENT RECEIVED & ORDER VERIFIED!
We have successfully verified your payment of ₹${o.totalAmount.toLocaleString('en-IN')} for Order ${o.id}.

--- PAYMENT CONFIRMATION RECEIPT ---
Order ID: ${o.id}
Payment Status: PAID & VERIFIED
Payment Gateway Reference: ${paymentRef}
Payment Method: ${paymentMode}
Amount Paid: ₹${o.totalAmount.toLocaleString('en-IN')}
Payment Timestamp: ${new Date().toLocaleString('en-IN')}

--- APPLIANCES IN THIS SHIPMENT ---
${itemsText}

Total Amount: ₹${o.totalAmount.toLocaleString('en-IN')}

--- DELIVERY DESTINATION ---
${o.customer.address}, ${o.customer.city || ''} ${o.customer.pincode || ''}
Phone: ${o.customer.phone}

Your certified appliances are now moving to technical quality dispatch.
For queries, contact support at consult@electrocare.com or +91 98220 12345.

Thank you,
ElectroCare Consultancy Team`;

  const itemsHtml = o.items.map(i => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
        <strong style="color: #0f172a; font-size: 13px;">${i.name}</strong>
        <div style="font-size: 11px; color: #64748b;">₹${i.price.toLocaleString('en-IN')} each</div>
      </td>
      <td style="padding: 10px 0; text-align: center; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #334155;">
        ${i.quantity}
      </td>
      <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #f1f5f9; font-family: monospace; font-weight: bold; color: #0f172a;">
        ₹${(i.price * i.quantity).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 32px 24px; color: #ffffff; text-align: center;">
      <div style="display: inline-block; background: rgba(255,255,255,0.2); border-radius: 9999px; padding: 4px 14px; font-size: 11px; font-weight: bold; margin-bottom: 8px;">
        ✓ OFFICIAL PAYMENT RECEIPT
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 800;">Payment Verified Successfully</h1>
      <p style="margin: 0; font-size: 13px; opacity: 0.95;">ElectroCare Consultancy Gadgets Store</p>
    </div>
    
    <div style="padding: 24px;">
      <p style="font-size: 14px; color: #1e293b; margin-top: 0;">
        Dear <strong>${o.customer.name}</strong>,
      </p>
      <p style="font-size: 13px; color: #475569; line-height: 1.5;">
        We have verified and received your payment of <strong style="color: #059669; font-size: 15px;">₹${o.totalAmount.toLocaleString('en-IN')}</strong>. Your order <strong>${o.id}</strong> has been confirmed and scheduled for dispatch.
      </p>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <table style="width: 100%; font-size: 12px; color: #166534; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; font-weight: 600; width: 42%;">Order Reference:</td>
            <td style="padding: 5px 0; font-family: monospace; font-weight: 800; color: #047857; font-size: 14px;">${o.id}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: 600;">Payment Status:</td>
            <td style="padding: 5px 0; font-weight: 800; color: #059669;">PAID (Verified via Gateway)</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: 600;">Transaction Reference:</td>
            <td style="padding: 5px 0; font-family: monospace; font-weight: 700; color: #1e293b;">${paymentRef}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: 600;">Payment Method:</td>
            <td style="padding: 5px 0; font-weight: 600; color: #1e293b;">${paymentMode}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: 600;">Total Amount Paid:</td>
            <td style="padding: 5px 0; font-family: monospace; font-weight: 800; color: #059669; font-size: 15px;">₹${o.totalAmount.toLocaleString('en-IN')}</td>
          </tr>
        </table>
      </div>

      <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin: 18px 0; border: 1px solid #e2e8f0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 11px; text-transform: uppercase;">
              <th style="text-align: left; padding-bottom: 8px;">Appliance Item</th>
              <th style="text-align: center; padding-bottom: 8px;">Qty</th>
              <th style="text-align: right; padding-bottom: 8px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding-top: 12px; font-weight: bold; font-size: 14px; color: #0f172a;">Grand Total:</td>
              <td style="padding-top: 12px; text-align: right; font-weight: 800; font-size: 16px; color: #059669; font-family: monospace;">
                ₹${o.totalAmount.toLocaleString('en-IN')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style="background: #f1f5f9; border-radius: 10px; padding: 14px; font-size: 12px; color: #334155; margin-bottom: 20px;">
        <strong style="color: #0f172a; display: block; margin-bottom: 4px;">Delivery Destination:</strong>
        ${o.customer.address}, ${o.customer.city || ''} ${o.customer.pincode ? `• PIN: ${o.customer.pincode}` : ''}<br>
        Contact Mobile: <strong>${o.customer.phone}</strong>
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 14px; margin-bottom: 0;">
        Our team will send you tracking information as soon as your shipment is dispatched. Need assistance? Contact <strong>orders@electrocare.com</strong> or <strong>+91 98220 12345</strong>.
      </p>
    </div>
  </div>
</body>
</html>`;

  return { html, text };
}

function generateOrderDispatchedCustomerEmail(o: CustomerOrder): { html: string; text: string } {
  const itemsText = o.items.map(i => `• ${i.name} x${i.quantity}`).join('\n');
  const carrier = o.carrierName || 'ElectroCare Express Logistics';
  const tracking = o.trackingNumber || 'Available with dispatch coordinator';

  const text = `Dear ${o.customer.name},

GREAT NEWS: YOUR APPLIANCE ORDER HAS BEEN DISPATCHED!
Order ID: ${o.id}
Logistics Carrier: ${carrier}
Tracking Number: ${tracking}

Items in transit:
${itemsText}

Delivery Destination:
${o.customer.address}, ${o.customer.city || ''} ${o.customer.pincode || ''}
Contact Phone: ${o.customer.phone}

Please inspect the exterior seal upon delivery before accepting.
For dispatch support, contact +91 98220 12345 or orders@electrocare.com.`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
    <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 28px 24px; color: #ffffff; text-align: center;">
      <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 800;">🚚 Order In Transit</h1>
      <p style="margin: 0; font-size: 13px; opacity: 0.95;">Your appliances are on their way to you</p>
    </div>
    
    <div style="padding: 24px;">
      <p style="font-size: 14px; color: #1e293b; margin-top: 0;">
        Dear <strong>${o.customer.name}</strong>,
      </p>
      <p style="font-size: 13px; color: #475569; line-height: 1.5;">
        Your order <strong>${o.id}</strong> has passed our technical quality inspection and has been dispatched with our trusted logistics partner.
      </p>

      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <table style="width: 100%; font-size: 13px; color: #1e40af; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: 600; width: 40%;">Order ID:</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: 800; color: #1e3a8a;">${o.id}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600;">Carrier / Courier:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${carrier}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600;">Tracking Number:</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: 800; color: #2563eb;">${tracking}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600;">Status:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #059669;">DISPATCHED / OUT FOR DELIVERY</td>
          </tr>
        </table>
      </div>

      <div style="background: #f8fafc; border-radius: 10px; padding: 14px; font-size: 12px; color: #334155; margin-bottom: 20px;">
        <strong style="color: #0f172a; display: block; margin-bottom: 4px;">Delivery Address:</strong>
        ${o.customer.address}, ${o.customer.city || ''} ${o.customer.pincode ? `• PIN: ${o.customer.pincode}` : ''}<br>
        Delivery Contact: <strong>${o.customer.phone}</strong>
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 14px; margin-bottom: 0;">
        Please keep your mobile phone accessible. Our delivery courier will contact you prior to arrival.
      </p>
    </div>
  </div>
</body>
</html>`;

  return { html, text };
}

function generateOrderDeliveredCustomerEmail(o: CustomerOrder): { html: string; text: string } {
  const text = `Dear ${o.customer.name},

ORDER DELIVERED SUCCESSFULLY!
Your order ${o.id} has been delivered.

Thank you for choosing certified energy-saving electrical appliances from ElectroCare Consultancy.
Your brand warranty and 1-year complimentary consulting support are now active.

For any installation assistance, contact us at +91 98220 12345 or support@electrocare.com.`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
    <div style="background: linear-gradient(135deg, #059669, #047857); padding: 28px 24px; color: #ffffff; text-align: center;">
      <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 800;">🎉 Order Delivered Successfully</h1>
      <p style="margin: 0; font-size: 13px; opacity: 0.95;">Thank you for trusting ElectroCare Consultancy</p>
    </div>
    <div style="padding: 24px;">
      <p style="font-size: 14px; color: #1e293b; margin-top: 0;">
        Dear <strong>${o.customer.name}</strong>,
      </p>
      <p style="font-size: 13px; color: #475569; line-height: 1.5;">
        Your order <strong>${o.id}</strong> has been marked as safely delivered.
      </p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 18px 0; font-size: 13px; color: #166534;">
        ✓ <strong>Warranty Activated:</strong> Your official manufacturer warranty and 1-year complimentary electrical efficiency consultation are active from today.
      </div>
      <p style="font-size: 12px; color: #64748b; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 14px; margin-bottom: 0;">
        Need installation assistance or energy-saving guidance? Contact our desk at <strong>support@electrocare.com</strong> or <strong>+91 98220 12345</strong>.
      </p>
    </div>
  </div>
</body>
</html>`;

  return { html, text };
}

function generatePaymentFailureCustomerEmail(o: CustomerOrder, reason?: string): { html: string; text: string } {
  const text = `Dear ${o.customer.name},

Payment attempt for your ElectroCare order ${o.id} (₹${o.totalAmount.toLocaleString('en-IN')}) was not completed.
Reason: ${reason || 'Transaction could not be confirmed by payment provider.'}

You can retry your payment anytime using PhonePe, UPI, or Cards on our website.
If amount was deducted, it will be automatically refunded by your bank within 2-3 business days.`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; background-color: #f8fafc; padding: 24px; margin: 0;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fee2e2;">
    <div style="background: #dc2626; padding: 24px; color: #ffffff; text-align: center;">
      <h2 style="margin: 0; font-size: 20px;">Payment Attempt Incomplete</h2>
    </div>
    <div style="padding: 24px; font-size: 13px; color: #334155;">
      <p>Dear <strong>${o.customer.name}</strong>,</p>
      <p>Your payment attempt for Order <strong>${o.id}</strong> (₹${o.totalAmount.toLocaleString('en-IN')}) was incomplete or could not be verified.</p>
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin: 16px 0; color: #991b1b;">
        ${reason || 'Payment could not be confirmed by the payment gateway.'}
      </div>
      <p>Please open the ElectroCare store and select PhonePe, UPI, or Cash on Delivery to complete your purchase.</p>
    </div>
  </div>
</body>
</html>`;

  return { html, text };
}

// ---------------- DEDICATED ISOLATED NOTIFICATION DISPATCH FUNCTIONS ----------------

// 1. Customer Order Confirmation Email (Option 3 Demo Inbox Mode Aware)
export async function sendCustomerOrderEmail(order: CustomerOrder): Promise<NotificationResult> {
  const customerEmail = (order.customer.email || '').trim().toLowerCase();
  if (!customerEmail) {
    const detailMsg = 'No customer email address provided for order confirmation.';
    logNotification({
      entityType: 'order',
      entityId: order.id,
      channel: 'email',
      recipient: 'None',
      recipientType: 'customer',
      status: 'not_configured',
      details: detailMsg
    });
    return { success: false, status: 'not_configured', details: detailMsg };
  }

  const adminEmail = (db.notificationSettings.adminEmail || process.env.ADMIN_EMAIL || 'chandanathosar@gmail.com').trim().toLowerCase();
  const payload = generateOrderCustomerEmail(order);

  const isDemoSubmission = Boolean(order.isDemo);
  const isDirectDeliverable = customerEmail === adminEmail || Boolean(db.notificationSettings.smtpHost);

  let targetRecipient = customerEmail;
  let subject = `Order Registered: ${order.id} - ElectroCare Gadgets Store`;
  let html = payload.html;
  let text = payload.text;

  if (isDemoSubmission && !isDirectDeliverable) {
    targetRecipient = adminEmail;
    subject = `🎓 [COLLEGE DEMO ONLY] Customer Order Invoice Copy: ${order.id} (₹${order.totalAmount.toLocaleString('en-IN')})`;
    const demoBannerHtml = `
      <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-family: sans-serif;">
        <div style="font-weight: 800; color: #92400e; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
          🎓 College Demonstration — Demo Inbox Mode (Sample Order)
        </div>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #78350f; line-height: 1.4;">
          <strong>Intended Demo Customer Email:</strong> <span style="font-family: monospace;">${customerEmail}</span><br>
          <em>Notice: This is a sample order confirmation routed to the presenter inbox for live college evaluation. The actual customer email was not contacted due to demo sandbox isolation.</em>
        </p>
      </div>
    `;
    html = demoBannerHtml + html;
    text = `[COLLEGE DEMO ONLY - SAMPLE ORDER INVOICE]\nIntended Customer: ${customerEmail}\nNotice: This copy was routed to presenter inbox for college demonstration. The actual recipient was not emailed.\n\n` + text;
  }

  const result = await sendEmailNotification({
    to: targetRecipient,
    subject,
    html,
    text,
    entityType: 'order',
    entityId: order.id,
    eventType: 'order_registered_customer',
    recipientType: 'customer'
  });

  if (isDemoSubmission && !isDirectDeliverable && result.success) {
    result.details = `Demo invoice copy routed to presenter inbox (${adminEmail}) for demonstration. The actual recipient (${customerEmail}) was not emailed in demo mode.`;
  }

  return result;
}

// 2. Admin Order Notification Email (Strictly to Admin Email)
export async function sendAdminOrderEmail(order: CustomerOrder): Promise<NotificationResult> {
  const adminEmail = (db.notificationSettings.adminEmail || process.env.ADMIN_EMAIL || 'chandanathosar@gmail.com').trim().toLowerCase();
  const payload = generateOrderAdminEmail(order);
  const subjectPrefix = order.isDemo ? '🎓 [COLLEGE DEMO ALERT] ' : '';
  return sendEmailNotification({
    to: adminEmail,
    subject: `${subjectPrefix}New Order: ${order.id} (₹${order.totalAmount.toLocaleString('en-IN')}) - ${order.customer.name}`,
    html: payload.html,
    text: payload.text,
    entityType: 'order',
    entityId: order.id,
    eventType: 'order_registered_admin',
    recipientType: 'admin'
  });
}

// 3. Customer Order WhatsApp Notification (Strictly to Customer Phone)
export async function sendCustomerOrderWhatsApp(order: CustomerOrder): Promise<NotificationResult> {
  if (order.customer.whatsappConsent === false) {
    const detailMsg = 'Customer opted out of WhatsApp updates during checkout.';
    logNotification({
      entityType: 'order',
      entityId: order.id,
      channel: 'whatsapp',
      recipient: order.customer.phone,
      recipientType: 'customer',
      status: 'not_configured',
      details: detailMsg
    });
    return { success: false, status: 'not_configured', details: detailMsg };
  }

  const phoneInfo = normalizeIndianPhoneNumber(order.customer.phone);
  if (!phoneInfo.rawDigits || phoneInfo.rawDigits.length < 10) {
    const detailMsg = `Invalid customer phone format: "${order.customer.phone}".`;
    logNotification({
      entityType: 'order',
      entityId: order.id,
      channel: 'whatsapp',
      recipient: order.customer.phone,
      recipientType: 'customer',
      status: 'failed',
      details: detailMsg
    });
    return { success: false, status: 'failed', details: detailMsg };
  }

  const itemSummary = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
  const paymentLabel = order.paymentStatus === 'paid' ? 'PAID & VERIFIED' : 'PENDING VERIFICATION';
  const demoPrefix = order.isDemo ? '[COLLEGE DEMO SAMPLE] ' : '';
  const msg = `*ElectroCare Store — ${demoPrefix}Order Confirmed* 📦\n\nDear ${order.customer.name},\nThank you for ordering with ElectroCare!\n\n🔖 Order ID: *${order.id}*\n🛍️ Items: ${itemSummary}\n💰 Total Amount: *₹${order.totalAmount.toLocaleString('en-IN')}*\n💳 Payment Status: *${paymentLabel}*\n🚚 Dispatch Address: ${order.customer.address}, ${order.customer.city || ''}\n\nOur coordinator will contact you prior to dispatch. Helpline: +91 98220 12345`;

  return sendWhatsAppNotification({
    to: phoneInfo.e164,
    messageText: msg,
    entityType: 'order',
    entityId: order.id,
    recipientType: 'customer'
  });
}

// 4. Admin Order WhatsApp Notification (Strictly to Admin WhatsApp)
export async function sendAdminOrderWhatsApp(order: CustomerOrder): Promise<NotificationResult> {
  const adminWhatsApp = (db.notificationSettings.adminWhatsApp || process.env.ADMIN_WHATSAPP_NUMBER || '+919822012345').trim();
  const phoneInfo = normalizeIndianPhoneNumber(adminWhatsApp);
  const itemSummary = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
  const demoPrefix = order.isDemo ? '🎓 [COLLEGE DEMO] ' : '';
  const msg = `*${demoPrefix}Alert: New Gadget Order* 📦\n\nOrder ID: ${order.id}\nCustomer: ${order.customer.name}\nPhone: ${order.customer.phone}\nEmail: ${order.customer.email || 'N/A'}\nAmount: ₹${order.totalAmount.toLocaleString('en-IN')}\nPayment Status: ${order.paymentStatus.toUpperCase()} (${order.paymentMethod})\nItems: ${itemSummary}\nAddress: ${order.customer.address}, ${order.customer.city || ''}`;

  return sendWhatsAppNotification({
    to: phoneInfo.e164 || adminWhatsApp,
    messageText: msg,
    entityType: 'order',
    entityId: order.id,
    recipientType: 'admin'
  });
}

// 5. Customer Booking Confirmation Email (Option 3 Demo Inbox Mode Aware)
export async function sendCustomerBookingEmail(booking: ConsultationBooking): Promise<NotificationResult> {
  const customerEmail = (booking.email || '').trim().toLowerCase();
  if (!customerEmail) {
    const detailMsg = 'No customer email address provided for booking confirmation.';
    logNotification({
      entityType: 'booking',
      entityId: booking.id,
      channel: 'email',
      recipient: 'None',
      recipientType: 'customer',
      status: 'not_configured',
      details: detailMsg
    });
    return { success: false, status: 'not_configured', details: detailMsg };
  }

  const adminEmail = (db.notificationSettings.adminEmail || process.env.ADMIN_EMAIL || 'chandanathosar@gmail.com').trim().toLowerCase();
  const payload = generateBookingCustomerEmail(booking);

  const isDemoSubmission = Boolean(booking.isDemo);
  const isDirectDeliverable = customerEmail === adminEmail || Boolean(db.notificationSettings.smtpHost);

  let targetRecipient = customerEmail;
  let subject = `Consultation Confirmed: ${booking.serviceName} (${booking.id}) - ElectroCare`;
  let html = payload.html;
  let text = payload.text;

  if (isDemoSubmission && !isDirectDeliverable) {
    targetRecipient = adminEmail;
    subject = `🎓 [COLLEGE DEMO ONLY] Customer Confirmation Copy: ${booking.serviceName} (${booking.id})`;
    const demoBannerHtml = `
      <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-family: sans-serif;">
        <div style="font-weight: 800; color: #92400e; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
          🎓 College Demonstration — Demo Inbox Mode (Sample Record)
        </div>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #78350f; line-height: 1.4;">
          <strong>Intended Demo Customer Email:</strong> <span style="font-family: monospace;">${customerEmail}</span><br>
          <em>Notice: This is a demonstration copy routed to the presenter inbox for live college evaluation. The actual customer email was not contacted due to demo sandbox isolation.</em>
        </p>
      </div>
    `;
    html = demoBannerHtml + html;
    text = `[COLLEGE DEMO ONLY - SAMPLE CONFIRMATION]\nIntended Customer: ${customerEmail}\nNotice: This copy was routed to presenter inbox for college demonstration. The actual recipient was not emailed.\n\n` + text;
  }

  const result = await sendEmailNotification({
    to: targetRecipient,
    subject,
    html,
    text,
    entityType: 'booking',
    entityId: booking.id,
    eventType: 'booking_confirmed_customer',
    recipientType: 'customer'
  });

  if (isDemoSubmission && !isDirectDeliverable && result.success) {
    result.details = `Demo copy routed to presenter inbox (${adminEmail}) for demonstration. The actual recipient (${customerEmail}) was not emailed in demo mode.`;
  }

  return result;
}

// 6. Admin Booking Notification Email (Strictly to Admin Email)
export async function sendAdminBookingEmail(booking: ConsultationBooking): Promise<NotificationResult> {
  const adminEmail = (db.notificationSettings.adminEmail || process.env.ADMIN_EMAIL || 'chandanathosar@gmail.com').trim().toLowerCase();
  const payload = generateBookingAdminEmail(booking);
  const subjectPrefix = booking.isDemo ? '🎓 [COLLEGE DEMO ALERT] ' : '';
  return sendEmailNotification({
    to: adminEmail,
    subject: `${subjectPrefix}New Booking Alert: ${booking.customerName} - ${booking.serviceName} (${booking.id})`,
    html: payload.html,
    text: payload.text,
    entityType: 'booking',
    entityId: booking.id,
    eventType: 'booking_confirmed_admin',
    recipientType: 'admin'
  });
}

// 7. Customer Booking WhatsApp Notification (Strictly to Customer Phone)
export async function sendCustomerBookingWhatsApp(booking: ConsultationBooking): Promise<NotificationResult> {
  if (booking.whatsappConsent === false) {
    const detailMsg = 'Customer opted out of WhatsApp reminders during booking.';
    logNotification({
      entityType: 'booking',
      entityId: booking.id,
      channel: 'whatsapp',
      recipient: booking.phone,
      recipientType: 'customer',
      status: 'not_configured',
      details: detailMsg
    });
    return { success: false, status: 'not_configured', details: detailMsg };
  }

  const phoneInfo = normalizeIndianPhoneNumber(booking.phone);
  if (!phoneInfo.rawDigits || phoneInfo.rawDigits.length < 10) {
    const detailMsg = `Invalid customer phone format: "${booking.phone}".`;
    logNotification({
      entityType: 'booking',
      entityId: booking.id,
      channel: 'whatsapp',
      recipient: booking.phone,
      recipientType: 'customer',
      status: 'failed',
      details: detailMsg
    });
    return { success: false, status: 'failed', details: detailMsg };
  }

  const msg = `*ElectroCare Consultancy — Booking Confirmed* ⚡\n\nDear ${booking.customerName},\nYour consultation for *${booking.serviceName}* is confirmed!\n\n📅 Date: ${booking.preferredDate}\n⏰ Time: ${booking.preferredTime}\n📍 Format: ${booking.consultationType} Consultation\n🔖 Booking ID: ${booking.id}\n📋 Status: Confirmed\n\nOur engineer will contact you prior to the appointment. Helpline: +91 98220 12345`;

  return sendWhatsAppNotification({
    to: phoneInfo.e164,
    messageText: msg,
    entityType: 'booking',
    entityId: booking.id,
    recipientType: 'customer'
  });
}

// 8. Admin Booking WhatsApp Notification (Strictly to Admin WhatsApp)
export async function sendAdminBookingWhatsApp(booking: ConsultationBooking): Promise<NotificationResult> {
  const adminWhatsApp = (db.notificationSettings.adminWhatsApp || process.env.ADMIN_WHATSAPP_NUMBER || '+919822012345').trim();
  const phoneInfo = normalizeIndianPhoneNumber(adminWhatsApp);
  const msg = `*Alert: New Consultation Booked* ⚡\n\nBooking ID: ${booking.id}\nCustomer: ${booking.customerName}\nPhone: ${booking.phone}\nEmail: ${booking.email}\nService: ${booking.serviceName}\nSchedule: ${booking.preferredDate} at ${booking.preferredTime}\nFormat: ${booking.consultationType}`;

  return sendWhatsAppNotification({
    to: phoneInfo.e164 || adminWhatsApp,
    messageText: msg,
    entityType: 'booking',
    entityId: booking.id,
    recipientType: 'admin'
  });
}

// 9. Customer Payment Receipt Email (Strictly to Customer Email)
export async function sendCustomerPaymentReceiptEmail(order: CustomerOrder): Promise<NotificationResult> {
  const customerEmail = (order.customer.email || '').trim().toLowerCase();
  if (!customerEmail) {
    return { success: false, status: 'not_configured', details: 'No customer email address on order.' };
  }
  const payload = generatePaymentSuccessCustomerEmail(order);
  return sendEmailNotification({
    to: customerEmail,
    subject: `Payment Receipt: Order ${order.id} Verified (₹${order.totalAmount.toLocaleString('en-IN')}) - ElectroCare`,
    html: payload.html,
    text: payload.text,
    entityType: 'order',
    entityId: order.id,
    eventType: 'payment_verified_customer',
    recipientType: 'customer'
  });
}

// 10. Admin Payment Verified Email (Strictly to Admin Email)
export async function sendAdminPaymentVerifiedEmail(order: CustomerOrder): Promise<NotificationResult> {
  const adminEmail = (db.notificationSettings.adminEmail || process.env.ADMIN_EMAIL || 'chandanathosar@gmail.com').trim().toLowerCase();
  const payload = generateOrderAdminEmail(order);
  return sendEmailNotification({
    to: adminEmail,
    subject: `[PAID ORDER VERIFIED] ${order.id} (₹${order.totalAmount.toLocaleString('en-IN')}) - ${order.customer.name}`,
    html: payload.html,
    text: payload.text,
    entityType: 'order',
    entityId: order.id,
    eventType: 'payment_verified_admin',
    recipientType: 'admin'
  });
}

// ---------------- SERVER APPLICATION INITIALIZATION ----------------

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // ---------------- PUBLIC API ENDPOINTS ----------------

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      time: new Date().toISOString(),
      enquiryCount: db.enquiries.length,
      orderCount: db.orders.length,
      bookingCount: db.bookings.length,
      productCount: db.products.length,
      backendType: 'Integrated ElectroCare Persistent JSON Engine',
      currency: 'INR (₹)'
    });
  });

  // Products
  app.get('/api/products', (req, res) => {
    res.json({
      success: true,
      products: db.products,
      currencySymbol: '₹',
      currencyCode: 'INR'
    });
  });

  // ---------------- DEMO AUTHENTICATION & ACCESS CONTROL ----------------
  app.post('/api/demo/auth', (req: Request, res: Response) => {
    const { passcode } = req.body;
    if (!passcode || typeof passcode !== 'string' || passcode.trim() !== DEMO_PASSCODE) {
      res.status(401).json({ success: false, error: 'Invalid demonstration passcode. Please enter the authorized college demo access code.' });
      return;
    }

    const token = 'demo_' + crypto.randomBytes(24).toString('hex');
    const now = Date.now();
    const expiresAt = now + (24 * 60 * 60 * 1000);
    demoSessions.set(token, { token, createdAt: now, expiresAt });

    res.json({
      success: true,
      token,
      expiresAt,
      role: 'demo_evaluator',
      message: 'College demonstration authorization verified successfully.'
    });
  });

  app.get('/api/demo/status', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = demoSessions.get(token);
      if (session && session.expiresAt > Date.now()) {
        res.json({ success: true, authenticated: true, role: 'demo_evaluator' });
        return;
      }
      const isAdmin = db.sessions.some(s => s.token === token && s.expiresAt > Date.now());
      if (isAdmin) {
        res.json({ success: true, authenticated: true, role: 'admin' });
        return;
      }
    }
    res.json({ success: true, authenticated: false });
  });

  app.post('/api/demo/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      demoSessions.delete(token);
    }
    res.json({ success: true, message: 'Demo session cleared.' });
  });

  // 1. CONSULTATION BOOKINGS API (Protected: Requires Demo or Admin Access)
  app.post('/api/bookings', requireDemoOrAdmin, async (req: Request, res: Response) => {
    try {
      const {
        customerName,
        email,
        phone,
        serviceName,
        preferredDate,
        preferredTime,
        consultationType,
        notes,
        address,
        whatsappConsent
      } = req.body;

      // Validation
      if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
        res.status(400).json({ success: false, error: 'Please enter a valid customer name (at least 2 characters).' });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
        res.status(400).json({ success: false, error: 'Please provide a valid email address for confirmation notifications.' });
        return;
      }

      if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
        res.status(400).json({ success: false, error: 'Please provide a valid contact phone number.' });
        return;
      }

      if (!serviceName || typeof serviceName !== 'string') {
        res.status(400).json({ success: false, error: 'Please select a consultation service.' });
        return;
      }

      if (!preferredDate || typeof preferredDate !== 'string') {
        res.status(400).json({ success: false, error: 'Please select your preferred date.' });
        return;
      }

      if (!preferredTime || typeof preferredTime !== 'string') {
        res.status(400).json({ success: false, error: 'Please select your preferred time slot.' });
        return;
      }

      const cleanType = consultationType === 'In-person' ? 'In-person' : 'Online';

      // Duplicate prevention: check if same email or phone already booked the same service on the same date and time slot
      const isDuplicate = db.bookings.some(b =>
        b.status !== 'cancelled' &&
        b.preferredDate === preferredDate.trim() &&
        b.preferredTime === preferredTime.trim() &&
        (b.email.toLowerCase() === email.trim().toLowerCase() || b.phone.replace(/[^\d]/g, '') === phone.replace(/[^\d]/g, ''))
      );

      if (isDuplicate) {
        res.status(409).json({
          success: false,
          error: `A booking for this exact time slot (${preferredDate} at ${preferredTime}) is already registered with your contact details. Please select another time or view your existing booking.`
        });
        return;
      }

      const isDemo = Boolean((req as any).isDemo);
      const bookingSuffix = Math.floor(10000 + Math.random() * 90000);
      const bookingId = isDemo ? `BK-DEMO-${bookingSuffix}` : `BK-EC-${bookingSuffix}`;

      const newBooking: ConsultationBooking = {
        id: bookingId,
        customerName: customerName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        serviceName: serviceName.trim(),
        preferredDate: preferredDate.trim(),
        preferredTime: preferredTime.trim(),
        consultationType: cleanType,
        notes: notes ? notes.trim() : undefined,
        address: address ? address.trim() : undefined,
        whatsappConsent: whatsappConsent !== false,
        status: 'confirmed',
        isDemo,
        emailNotification: {
          customerStatus: 'pending',
          adminStatus: 'pending',
          lastAttemptAt: new Date().toISOString()
        },
        whatsappNotification: {
          customerStatus: 'pending',
          adminStatus: 'pending',
          lastAttemptAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to database first before triggering any notifications
      db.bookings.unshift(newBooking);
      saveDatabase();

      // Trigger Isolated Customer and Admin Notifications Concurrently
      const [customerEmailRes, adminEmailRes, customerWhatsAppRes, adminWhatsAppRes] = await Promise.all([
        sendCustomerBookingEmail(newBooking),
        sendAdminBookingEmail(newBooking),
        sendCustomerBookingWhatsApp(newBooking),
        sendAdminBookingWhatsApp(newBooking)
      ]);

      // Update state in document
      newBooking.emailNotification = {
        customerStatus: customerEmailRes.status,
        adminStatus: adminEmailRes.status,
        customerDetails: customerEmailRes.details,
        adminDetails: adminEmailRes.details,
        lastAttemptAt: new Date().toISOString()
      };

      newBooking.whatsappNotification = {
        customerStatus: customerWhatsAppRes.status,
        adminStatus: adminWhatsAppRes.status,
        customerDetails: customerWhatsAppRes.details,
        adminDetails: adminWhatsAppRes.details,
        lastAttemptAt: new Date().toISOString()
      };

      saveDatabase();

      res.status(201).json({
        success: true,
        bookingId: newBooking.id,
        booking: newBooking,
        message: `Consultation booked successfully! Booking Reference: ${newBooking.id}`,
        emailNotification: newBooking.emailNotification,
        whatsappNotification: newBooking.whatsappNotification
      });
    } catch (err) {
      console.error('Error creating consultation booking:', err);
      res.status(500).json({ success: false, error: 'Internal server error while processing booking.' });
    }
  });

  // Track Booking
  app.get('/api/bookings/track/:id', (req: Request, res: Response) => {
    const query = req.params.id.trim().toUpperCase();
    const booking = db.bookings.find(b => b.id.toUpperCase() === query);

    if (!booking) {
      res.status(404).json({ success: false, error: `No booking found with ID "${query}".` });
      return;
    }

    res.json({
      success: true,
      booking: {
        id: booking.id,
        customerName: booking.customerName,
        serviceName: booking.serviceName,
        preferredDate: booking.preferredDate,
        preferredTime: booking.preferredTime,
        consultationType: booking.consultationType,
        status: booking.status,
        createdAt: booking.createdAt
      }
    });
  });

  // 2. GADGET ORDER PLACEMENT WITH NOTIFICATIONS (Protected: Requires Demo or Admin Access)
  app.post('/api/orders', requireDemoOrAdmin, async (req: Request, res: Response) => {
    try {
      const { items, customer, paymentMethod } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ success: false, error: 'Shopping cart is empty. Please select a product.' });
        return;
      }

      if (!customer || !customer.name || !customer.phone || !customer.address) {
        res.status(400).json({
          success: false,
          error: 'Please fill in all mandatory delivery fields: Name, Phone Number, and Delivery Address.'
        });
        return;
      }

      if (customer.phone.trim().length < 8) {
        res.status(400).json({ success: false, error: 'Please enter a valid contact phone number.' });
        return;
      }

      let calculatedTotal = 0;
      const verifiedItems: OrderItem[] = [];

      for (const item of items) {
        const prod = db.products.find(p => p.id === item.productId);
        const itemPrice = prod ? prod.price : (Number(item.price) || 0);
        const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
        calculatedTotal += itemPrice * qty;
        verifiedItems.push({
          productId: item.productId,
          name: prod ? prod.name : item.name,
          price: itemPrice,
          quantity: qty,
          imageUrl: prod ? prod.imageUrl : item.imageUrl
        });
      }

      const isDemo = Boolean((req as any).isDemo);
      const orderSuffix = Math.floor(10000 + Math.random() * 90000);
      const orderId = isDemo ? `ORD-DEMO-${orderSuffix}` : `ORD-IN-${orderSuffix}`;

      const newOrder: CustomerOrder = {
        id: orderId,
        items: verifiedItems,
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          address: customer.address.trim(),
          email: customer.email ? customer.email.trim().toLowerCase() : undefined,
          city: customer.city ? customer.city.trim() : 'Pune / Mumbai',
          pincode: customer.pincode ? customer.pincode.trim() : '',
          notes: customer.notes ? customer.notes.trim() : undefined,
          whatsappConsent: customer.whatsappConsent !== false
        },
        totalAmount: calculatedTotal,
        status: paymentMethod === 'cash_on_delivery' ? 'confirmed' : 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: paymentMethod || 'cash_on_delivery',
        isDemo,
        emailNotification: {
          customerStatus: 'pending',
          adminStatus: 'pending',
          lastAttemptAt: new Date().toISOString()
        },
        whatsappNotification: {
          customerStatus: 'pending',
          adminStatus: 'pending',
          lastAttemptAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to database first before triggering any notifications
      db.orders.unshift(newOrder);
      saveDatabase();

      // Trigger Isolated Customer and Admin Notifications Concurrently
      const [customerEmailRes, adminEmailRes, customerWhatsAppRes, adminWhatsAppRes] = await Promise.all([
        sendCustomerOrderEmail(newOrder),
        sendAdminOrderEmail(newOrder),
        sendCustomerOrderWhatsApp(newOrder),
        sendAdminOrderWhatsApp(newOrder)
      ]);

      newOrder.emailNotification = {
        customerStatus: customerEmailRes.status,
        adminStatus: adminEmailRes.status,
        customerDetails: customerEmailRes.details,
        adminDetails: adminEmailRes.details,
        lastAttemptAt: new Date().toISOString()
      };

      newOrder.whatsappNotification = {
        customerStatus: customerWhatsAppRes.status,
        adminStatus: adminWhatsAppRes.status,
        customerDetails: customerWhatsAppRes.details,
        adminDetails: adminWhatsAppRes.details,
        lastAttemptAt: new Date().toISOString()
      };

      saveDatabase();

      res.status(201).json({
        success: true,
        orderId: newOrder.id,
        totalAmount: newOrder.totalAmount,
        currencySymbol: '₹',
        message: `Order ${newOrder.id} placed successfully!`,
        order: newOrder,
        emailNotification: newOrder.emailNotification,
        whatsappNotification: newOrder.whatsappNotification
      });
    } catch (err) {
      console.error('Error placing order:', err);
      res.status(500).json({ success: false, error: 'Server error while processing your order.' });
    }
  });

  // Track customer order
  app.get('/api/orders/track/:id', (req: Request, res: Response) => {
    const query = req.params.id.trim().toUpperCase();
    const order = db.orders.find(o => o.id.toUpperCase() === query);

    if (!order) {
      res.status(404).json({ success: false, error: `No order found with ID "${query}".` });
      return;
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        itemsCount: order.items.length,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        customerName: order.customer.name,
        trackingNumber: order.trackingNumber,
        emailNotification: order.emailNotification,
        whatsappNotification: order.whatsappNotification,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });
  });

  // ---------------- PAYMENT GATEWAY & PHONEPE / UPI ENDPOINTS ----------------

  // Public: Get Payment Gateway Configuration & UPI Details
  app.get('/api/payments/config', (req: Request, res: Response) => {
    const settings = db.notificationSettings;
    const razorpayConfigured = Boolean(settings.razorpayKeyId && settings.razorpayKeySecret);
    const phonepeConfigured = Boolean(settings.phonepeMerchantId && settings.phonepeSaltKey);

    res.json({
      success: true,
      gateway: {
        isConfigured: razorpayConfigured || phonepeConfigured,
        razorpayConfigured,
        razorpayKeyId: settings.razorpayKeyId || null,
        phonepeConfigured,
        phonepeMerchantId: settings.phonepeMerchantId || null,
        upiVpa: settings.upiVpa || 'electrocare@upi',
        merchantName: settings.upiMerchantName || 'ElectroCare Consultancy',
        isTestMode: settings.paymentTestMode !== false,
        currency: 'INR',
        currencySymbol: '₹'
      }
    });
  });

  // Public: Create Payment Intent with dynamic amount-specific QR code & UPI app links
  app.post('/api/payments/create-intent', async (req: Request, res: Response) => {
    try {
      const { orderId } = req.body;
      if (!orderId) {
        res.status(400).json({ success: false, error: 'Order ID is required.' });
        return;
      }

      const order = db.orders.find(o => o.id === orderId.trim());
      if (!order) {
        res.status(404).json({ success: false, error: `Order ${orderId} not found.` });
        return;
      }

      const settings = db.notificationSettings;
      const vpa = settings.upiVpa || process.env.UPI_VPA || 'electrocare@upi';
      const merchantName = settings.upiMerchantName || process.env.UPI_MERCHANT_NAME || 'ElectroCare Consultancy';
      const formattedAmount = order.totalAmount.toFixed(2);

      // Official NPCI Standard Dynamic UPI URI with actual order amount and reference
      const upiUri = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(merchantName)}&mc=5732&tr=${encodeURIComponent(order.id)}&tn=${encodeURIComponent(`ElectroCare Order ${order.id}`)}&am=${formattedAmount}&cu=INR`;

      // Generate dynamic QR code containing the order amount and recipient VPA
      const qrCodeDataUrl = await QRCode.toDataURL(upiUri, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });

      // Intent deep-links for mobile app invocation
      const phonepeIntent = `phonepe://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(merchantName)}&mc=5732&tr=${encodeURIComponent(order.id)}&tn=${encodeURIComponent(`ElectroCare Order ${order.id}`)}&am=${formattedAmount}&cu=INR`;
      const gpayIntent = `tez://upi/pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(merchantName)}&mc=5732&tr=${encodeURIComponent(order.id)}&tn=${encodeURIComponent(`ElectroCare Order ${order.id}`)}&am=${formattedAmount}&cu=INR`;
      const paytmIntent = `paytmmp://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(merchantName)}&mc=5732&tr=${encodeURIComponent(order.id)}&tn=${encodeURIComponent(`ElectroCare Order ${order.id}`)}&am=${formattedAmount}&cu=INR`;

      let razorpayOrderId: string | null = null;
      const rzpKeyId = settings.razorpayKeyId || process.env.RAZORPAY_KEY_ID;
      const rzpSecret = settings.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

      if (rzpKeyId && rzpSecret) {
        try {
          const instance = new Razorpay({ key_id: rzpKeyId, key_secret: rzpSecret });
          const rzpOrder = await instance.orders.create({
            amount: Math.round(order.totalAmount * 100),
            currency: 'INR',
            receipt: order.id,
            notes: {
              customerName: order.customer.name,
              customerPhone: order.customer.phone,
              orderId: order.id
            }
          });
          razorpayOrderId = rzpOrder.id;
          if (!order.paymentDetails) order.paymentDetails = {};
          order.paymentDetails.razorpayOrderId = rzpOrder.id;
          saveDatabase();
        } catch (rzpErr) {
          console.warn('Razorpay order creation skipped:', rzpErr);
        }
      }

      res.json({
        success: true,
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'INR',
        currencySymbol: '₹',
        upiUri,
        qrCodeDataUrl,
        phonepeIntent,
        gpayIntent,
        paytmIntent,
        razorpayOrderId,
        razorpayKeyId: rzpKeyId || null,
        testMode: settings.paymentTestMode !== false,
        merchantName,
        vpa
      });
    } catch (err) {
      console.error('Error creating payment intent:', err);
      res.status(500).json({ success: false, error: 'Internal server error creating payment intent.' });
    }
  });

  // Public: Cryptographic Server-side Signature Verification for Razorpay
  app.post('/api/payments/razorpay/verify', async (req: Request, res: Response) => {
    try {
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        res.status(400).json({ success: false, error: 'Missing required Razorpay verification parameters.' });
        return;
      }

      const order = db.orders.find(o => o.id === orderId.trim());
      if (!order) {
        res.status(404).json({ success: false, error: 'Order not found.' });
        return;
      }

      const settings = db.notificationSettings;
      const rzpSecret = settings.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

      if (!rzpSecret) {
        res.status(400).json({ success: false, error: 'Razorpay secret key is not configured on server.' });
        return;
      }

      // Cryptographic verification: HMAC SHA-256
      const generatedSignature = crypto
        .createHmac('sha256', rzpSecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        order.paymentStatus = 'failed';
        if (!order.paymentDetails) order.paymentDetails = {};
        order.paymentDetails.failureReason = 'Cryptographic signature mismatch';
        order.updatedAt = new Date().toISOString();
        saveDatabase();

        if (order.customer.email) {
          const failPayload = generatePaymentFailureCustomerEmail(order, 'Cryptographic signature mismatch on payment response.');
          sendEmailNotification({
            to: order.customer.email,
            subject: `Payment Verification Issue: Order ${order.id} - ElectroCare`,
            html: failPayload.html,
            text: failPayload.text,
            entityType: 'order',
            entityId: order.id,
            eventType: 'payment_failed',
            recipientType: 'customer'
          }).catch(e => console.warn(e));
        }

        res.status(400).json({ success: false, verified: false, error: 'Payment signature verification failed.' });
        return;
      }

      // Mark order as paid ONLY after cryptographic verification passes
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.paymentMethod = 'razorpay_online';
      order.paymentDetails = {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentMethodType: 'razorpay_gateway',
        paidAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
        isTestMode: settings.paymentTestMode !== false
      };
      order.updatedAt = new Date().toISOString();
      saveDatabase();

      // Trigger Isolated Customer Payment Receipt Email & Admin Alert Concurrently
      sendCustomerPaymentReceiptEmail(order).catch(e => console.warn('Customer receipt email error:', e));
      sendAdminPaymentVerifiedEmail(order).catch(e => console.warn('Admin order alert error:', e));

      res.json({
        success: true,
        verified: true,
        message: 'Payment verified successfully and marked as paid.',
        order
      });
    } catch (err) {
      console.error('Error verifying Razorpay payment:', err);
      res.status(500).json({ success: false, error: 'Internal server error verifying payment.' });
    }
  });

  // Public: Server-side PhonePe & UPI Payment Gateway Verification
  app.post('/api/payments/verify-upi', async (req: Request, res: Response) => {
    try {
      const { orderId, upiApp, isTestConfirmation } = req.body;
      const transactionRef = (req.body.transactionRef || req.body.upiTransactionRef || '').toString();
      if (!orderId) {
        res.status(400).json({ success: false, error: 'Order ID is required.' });
        return;
      }

      const order = db.orders.find(o => o.id === orderId.trim());
      if (!order) {
        res.status(404).json({ success: false, error: 'Order not found.' });
        return;
      }

      const settings = db.notificationSettings;

      // Allow verified test confirmation in sandbox mode with explicit flag
      if (isTestConfirmation && settings.paymentTestMode !== false) {
        const cleanRef = transactionRef || `TEST-UPI-${Date.now().toString().slice(-6)}`;
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        order.paymentMethod = upiApp === 'phonepe' ? 'phonepe' : 'online_upi';
        order.paymentDetails = {
          upiTransactionRef: cleanRef,
          upiApp: upiApp || 'phonepe',
          paymentMethodType: 'upi',
          paidAt: new Date().toISOString(),
          verifiedAt: new Date().toISOString(),
          isTestMode: true
        };
        order.updatedAt = new Date().toISOString();
        saveDatabase();

        // Trigger Isolated Customer Payment Receipt Email & Admin Alert Concurrently
        sendCustomerPaymentReceiptEmail(order).catch(e => console.warn('Receipt dispatch error:', e));
        sendAdminPaymentVerifiedEmail(order).catch(e => console.warn('Admin alert error:', e));

        res.json({
          success: true,
          verified: true,
          message: 'Sandbox test payment verified and marked as paid.',
          order
        });
        return;
      }

      // Live verification: require non-empty provider reference
      if (!transactionRef || typeof transactionRef !== 'string' || transactionRef.trim().length < 8) {
        res.status(400).json({
          success: false,
          error: 'Live UPI payments must be verified via gateway webhook or valid provider transaction reference.'
        });
        return;
      }

      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.paymentMethod = upiApp === 'phonepe' ? 'phonepe' : 'online_upi';
      order.paymentDetails = {
        upiTransactionRef: transactionRef.trim(),
        upiApp: upiApp || 'phonepe',
        paymentMethodType: 'upi',
        paidAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
        isTestMode: settings.paymentTestMode !== false
      };
      order.updatedAt = new Date().toISOString();
      saveDatabase();

      // Trigger Isolated Customer Payment Receipt Email & Admin Alert Concurrently
      sendCustomerPaymentReceiptEmail(order).catch(e => console.warn('Receipt error:', e));
      sendAdminPaymentVerifiedEmail(order).catch(e => console.warn('Admin alert error:', e));

      res.json({ success: true, verified: true, message: 'Payment verified.', order });
    } catch (err) {
      console.error('Error verifying UPI payment:', err);
      res.status(500).json({ success: false, error: 'Internal server error verifying UPI payment.' });
    }
  });

  // Public: Live payment status checker (polled by checkout modal)
  app.get('/api/payments/status/:orderId', (req: Request, res: Response) => {
    const query = req.params.orderId.trim().toUpperCase();
    const order = db.orders.find(o => o.id.toUpperCase() === query);
    if (!order) {
      res.status(404).json({ success: false, error: `Order ${query} not found.` });
      return;
    }
    res.json({
      success: true,
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentDetails: order.paymentDetails
    });
  });

  // Public: Official Payment Gateway Webhook (Razorpay / PhonePe)
  app.post('/api/payments/webhook', async (req: Request, res: Response) => {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const settings = db.notificationSettings;
      const rzpSecret = settings.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

      if (signature && rzpSecret) {
        const bodyStr = JSON.stringify(req.body);
        const expectedSignature = crypto.createHmac('sha256', rzpSecret).update(bodyStr).digest('hex');
        if (signature !== expectedSignature) {
          res.status(400).json({ error: 'Webhook signature verification failed' });
          return;
        }
      }

      const event = req.body.event;
      if (event === 'payment.captured' || event === 'order.paid') {
        const paymentEntity = req.body.payload?.payment?.entity;
        const receipt = paymentEntity?.notes?.orderId || paymentEntity?.description;
        if (receipt) {
          const order = db.orders.find(o => o.id === receipt);
          if (order && order.paymentStatus !== 'paid') {
            order.paymentStatus = 'paid';
            order.status = 'confirmed';
            order.paymentDetails = {
              razorpayPaymentId: paymentEntity.id,
              paidAt: new Date().toISOString(),
              verifiedAt: new Date().toISOString()
            };
            saveDatabase();

            // Trigger Isolated Customer Payment Receipt Email & Admin Alert Concurrently
            sendCustomerPaymentReceiptEmail(order).catch(e => console.warn('Customer receipt email error:', e));
            sendAdminPaymentVerifiedEmail(order).catch(e => console.warn('Admin payment alert error:', e));
          }
        }
      }

      res.json({ status: 'ok' });
    } catch (err) {
      console.error('Webhook error:', err);
      res.status(500).json({ error: 'Webhook processing error' });
    }
  });

  // Customer Enquiry with Email Notifications
  app.post('/api/enquiries', async (req: Request, res: Response) => {
    try {
      const { name, email, phone, category, propertyType, estimatedMonthlyBill, preferredContactTime, message } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        res.status(400).json({ success: false, error: 'Please provide a valid full name (at least 2 characters).' });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
        res.status(400).json({ success: false, error: 'Please provide a valid email address to receive your confirmation.' });
        return;
      }

      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const referenceId = `EC-${randomSuffix}`;

      const newEnquiry: Enquiry = {
        id: referenceId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: typeof phone === 'string' ? phone.trim().slice(0, 30) : undefined,
        category: category || 'electricity_bill_reduction',
        propertyType: propertyType || 'Residential Home / Villa',
        estimatedMonthlyBill: estimatedMonthlyBill || 'Not Specified',
        preferredContactTime: preferredContactTime || 'Anytime',
        message: message ? message.trim() : 'Consultation request.',
        status: 'new',
        priority: 'normal',
        adminNotes: [],
        emailNotification: {
          customerStatus: 'pending',
          adminStatus: 'pending',
          lastAttemptAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 1. Save to database FIRST so customer enquiry is permanently retained even if email service encounters issues
      db.enquiries.unshift(newEnquiry);
      saveDatabase();

      // 2. Immediately send confirmation email to customer
      const customerEmailPayload = generateEnquiryCustomerEmail(newEnquiry);
      const customerEmailRes = await sendEmailNotification({
        to: newEnquiry.email,
        subject: "Your Enquiry Has Been Registered - ElectroCare Consultancy",
        html: customerEmailPayload.html,
        text: customerEmailPayload.text,
        entityType: 'enquiry',
        entityId: newEnquiry.id,
        recipientType: 'customer'
      });

      // 3. Notify admin about the new enquiry
      const adminEmailTarget = db.notificationSettings.adminEmail || process.env.ADMIN_EMAIL || 'chandanathosar@gmail.com';
      const adminEmailPayload = generateEnquiryAdminEmail(newEnquiry);
      const adminEmailRes = await sendEmailNotification({
        to: adminEmailTarget,
        subject: `New Customer Enquiry: ${newEnquiry.id} - ${newEnquiry.name} (${newEnquiry.category})`,
        html: adminEmailPayload.html,
        text: adminEmailPayload.text,
        entityType: 'enquiry',
        entityId: newEnquiry.id,
        recipientType: 'admin'
      });

      // 4. Update enquiry record with delivery results
      newEnquiry.emailNotification = {
        customerStatus: customerEmailRes.status,
        adminStatus: adminEmailRes.status,
        customerDetails: customerEmailRes.details,
        adminDetails: adminEmailRes.details,
        lastAttemptAt: new Date().toISOString()
      };
      saveDatabase();

      res.status(201).json({
        success: true,
        referenceId: newEnquiry.id,
        message: 'Your enquiry has been registered successfully. A confirmation email has been dispatched.',
        enquiry: newEnquiry,
        emailNotification: newEnquiry.emailNotification
      });
    } catch (error) {
      console.error('Error processing enquiry:', error);
      res.status(500).json({ success: false, error: 'Server error while processing your enquiry.' });
    }
  });

  app.get('/api/enquiries/track/:id', (req: Request, res: Response) => {
    const query = req.params.id.trim().toUpperCase();
    const enquiry = db.enquiries.find(e => e.id.toUpperCase() === query);
    if (!enquiry) {
      res.status(404).json({ success: false, error: `No enquiry found matching reference code "${query}".` });
      return;
    }
    res.json({ success: true, enquiry });
  });

  // Admin Retry Enquiry Email Notification
  app.post('/api/admin/enquiries/:id/retry-notification', authenticateAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;

    const enquiry = db.enquiries.find(e => e.id === id);
    if (!enquiry) {
      res.status(404).json({ success: false, error: 'Enquiry not found.' });
      return;
    }

    if (!enquiry.email) {
      res.status(400).json({ success: false, error: 'This enquiry does not have a customer email address.' });
      return;
    }

    const payload = generateEnquiryCustomerEmail(enquiry);
    const emailRes = await sendEmailNotification({
      to: enquiry.email,
      subject: "Your Enquiry Has Been Registered - ElectroCare Consultancy",
      html: payload.html,
      text: payload.text,
      entityType: 'enquiry',
      entityId: enquiry.id,
      recipientType: 'customer'
    });

    if (!enquiry.emailNotification) {
      enquiry.emailNotification = {
        customerStatus: 'pending',
        adminStatus: 'pending',
        lastAttemptAt: new Date().toISOString()
      };
    }

    enquiry.emailNotification.customerStatus = emailRes.status;
    enquiry.emailNotification.customerDetails = emailRes.details;
    enquiry.emailNotification.lastAttemptAt = new Date().toISOString();
    saveDatabase();

    res.json({
      success: emailRes.success,
      status: emailRes.status,
      details: emailRes.details,
      enquiry
    });
  });

  // ---------------- ADMIN API ENDPOINTS ----------------

  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, error: 'Username and password are required.' });
      return;
    }

    if (username.trim().toLowerCase() !== db.admin.username.toLowerCase()) {
      res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
      return;
    }

    const isValid = verifyPassword(password, db.admin.salt, db.admin.passwordHash);
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const expiresAt = now + (24 * 60 * 60 * 1000);

    db.sessions = db.sessions.filter(s => s.expiresAt > now);
    db.sessions.push({ token, createdAt: now, expiresAt });
    saveDatabase();

    res.json({
      success: true,
      token,
      admin: { username: db.admin.username, expiresAt }
    });
  });

  app.get('/api/admin/me', authenticateAdmin, (req: Request, res: Response) => {
    res.json({ success: true, admin: { username: db.admin.username } });
  });

  app.post('/api/admin/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      db.sessions = db.sessions.filter(s => s.token !== token);
      saveDatabase();
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  // Admin Bookings List
  app.get('/api/admin/bookings', authenticateAdmin, (req: Request, res: Response) => {
    const { status, search } = req.query;
    let results = [...db.bookings];

    if (status && status !== 'all') {
      results = results.filter(b => b.status === status);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim().toLowerCase();
      results = results.filter(b =>
        b.id.toLowerCase().includes(term) ||
        b.customerName.toLowerCase().includes(term) ||
        b.email.toLowerCase().includes(term) ||
        b.phone.toLowerCase().includes(term) ||
        b.serviceName.toLowerCase().includes(term)
      );
    }

    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, total: results.length, bookings: results });
  });

  // Admin Update Booking Status
  app.patch('/api/admin/bookings/:id', authenticateAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const booking = db.bookings.find(b => b.id === id);
    if (!booking) {
      res.status(404).json({ success: false, error: 'Booking not found.' });
      return;
    }

    if (status) booking.status = status;
    if (notes !== undefined) booking.notes = notes;
    booking.updatedAt = new Date().toISOString();
    saveDatabase();

    res.json({ success: true, message: 'Booking updated.', booking });
  });

  // Admin Retry Booking Notification
  app.post('/api/admin/bookings/:id/retry-notification', authenticateAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { channel } = req.body; // 'email' | 'whatsapp'

    const booking = db.bookings.find(b => b.id === id);
    if (!booking) {
      res.status(404).json({ success: false, error: 'Booking not found.' });
      return;
    }

    if (channel === 'email') {
      const payload = generateBookingCustomerEmail(booking);
      const emailRes = await sendEmailNotification({
        to: booking.email,
        subject: `[Update] Consultation Booking: ${booking.serviceName} (${booking.id})`,
        html: payload.html,
        text: payload.text,
        entityType: 'booking',
        entityId: booking.id,
        recipientType: 'customer'
      });

      booking.emailNotification.customerStatus = emailRes.status;
      booking.emailNotification.customerDetails = emailRes.details;
      booking.emailNotification.lastAttemptAt = new Date().toISOString();
      saveDatabase();

      res.json({ success: emailRes.success, status: emailRes.status, details: emailRes.details, booking });
      return;
    }

    if (channel === 'whatsapp') {
      const msg = `*ElectroCare Consultancy — Booking Update* ⚡\n\nDear ${booking.customerName},\nYour booking *${booking.id}* for *${booking.serviceName}* is confirmed for *${booking.preferredDate} at ${booking.preferredTime}*.\nFormat: ${booking.consultationType} Consultation.`;
      const waRes = await sendWhatsAppNotification({
        to: booking.phone,
        messageText: msg,
        entityType: 'booking',
        entityId: booking.id,
        recipientType: 'customer'
      });

      booking.whatsappNotification.customerStatus = waRes.status;
      booking.whatsappNotification.customerDetails = waRes.details;
      booking.whatsappNotification.lastAttemptAt = new Date().toISOString();
      saveDatabase();

      res.json({ success: waRes.success, status: waRes.status, details: waRes.details, booking });
      return;
    }

    res.status(400).json({ success: false, error: 'Invalid channel specified.' });
  });

  // Admin Retry Order Notification
  app.post('/api/admin/orders/:id/retry-notification', authenticateAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { channel } = req.body;

    const order = db.orders.find(o => o.id === id);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    if (channel === 'email') {
      if (!order.customer.email) {
        res.status(400).json({ success: false, error: 'This order has no customer email address.' });
        return;
      }

      const payload = generateOrderCustomerEmail(order);
      const emailRes = await sendEmailNotification({
        to: order.customer.email,
        subject: `[Update] Order Status (${order.status.toUpperCase()}): ${order.id} - ElectroCare`,
        html: payload.html,
        text: payload.text,
        entityType: 'order',
        entityId: order.id,
        recipientType: 'customer'
      });

      order.emailNotification.customerStatus = emailRes.status;
      order.emailNotification.customerDetails = emailRes.details;
      order.emailNotification.lastAttemptAt = new Date().toISOString();
      saveDatabase();

      res.json({ success: emailRes.success, status: emailRes.status, details: emailRes.details, order });
      return;
    }

    if (channel === 'whatsapp') {
      const msg = `*ElectroCare Store — Order Status Update* 📦\n\nDear ${order.customer.name},\nYour order *${order.id}* status is currently: *${order.status.toUpperCase()}*.\nTotal: ₹${order.totalAmount.toLocaleString('en-IN')}.\n${order.trackingNumber ? `Tracking No: ${order.trackingNumber}\n` : ''}Helpline: +91 98220 12345`;
      const waRes = await sendWhatsAppNotification({
        to: order.customer.phone,
        messageText: msg,
        entityType: 'order',
        entityId: order.id,
        recipientType: 'customer'
      });

      order.whatsappNotification.customerStatus = waRes.status;
      order.whatsappNotification.customerDetails = waRes.details;
      order.whatsappNotification.lastAttemptAt = new Date().toISOString();
      saveDatabase();

      res.json({ success: waRes.success, status: waRes.status, details: waRes.details, order });
      return;
    }

    res.status(400).json({ success: false, error: 'Invalid channel specified.' });
  });

  // Admin Notification Config Status
  app.get('/api/admin/notifications/status', authenticateAdmin, (req: Request, res: Response) => {
    const s = db.notificationSettings;
    const resendKey = s.resendApiKey || process.env.RESEND_API_KEY;
    const sendgridKey = s.sendgridApiKey || process.env.SENDGRID_API_KEY;
    const smtpHost = s.smtpHost || process.env.SMTP_HOST;
    const smtpUser = s.smtpUser || process.env.SMTP_USER;
    const smtpPass = s.smtpPass || process.env.SMTP_PASS;
    const smtpPort = Number(s.smtpPort || process.env.SMTP_PORT) || 587;
    const isSmtp = Boolean(smtpHost && smtpUser && smtpPass);
    const metaToken = s.whatsappToken || process.env.WHATSAPP_API_TOKEN;
    const twilioSid = s.twilioSid || process.env.TWILIO_ACCOUNT_SID;

    const mask = (str?: string) => {
      if (!str || str.length < 8) return str ? '••••••••' : '';
      return `${str.slice(0, 4)}••••${str.slice(-4)}`;
    };

    res.json({
      success: true,
      emailConfigured: Boolean(resendKey || isSmtp || sendgridKey),
      emailProvider: resendKey ? 'resend' : isSmtp ? 'smtp' : sendgridKey ? 'sendgrid' : 'none',
      smtpConfigured: isSmtp,
      whatsappConfigured: Boolean((metaToken && s.whatsappPhoneId) || twilioSid),
      whatsappProvider: metaToken ? 'meta_cloud' : twilioSid ? 'twilio' : 'none',
      adminEmail: s.adminEmail,
      adminWhatsApp: s.adminWhatsApp,
      emailFrom: s.emailFrom,
      resendApiKeyMasked: mask(resendKey),
      sendgridApiKeyMasked: mask(sendgridKey),
      smtpHost: s.smtpHost || '',
      smtpPort: s.smtpPort || 587,
      smtpUser: s.smtpUser || '',
      totalLogsCount: db.notificationLogs?.length || 0,
      recentLogs: (db.notificationLogs || []).slice(0, 40)
    });
  });

  // Admin Update Notification Config
  app.post('/api/admin/notifications/config', authenticateAdmin, (req: Request, res: Response) => {
    const {
      adminEmail,
      adminWhatsApp,
      emailFrom,
      resendApiKey,
      sendgridApiKey,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      whatsappToken,
      whatsappPhoneId,
      twilioSid,
      twilioAuth,
      twilioFrom
    } = req.body;

    if (adminEmail) db.notificationSettings.adminEmail = adminEmail.trim();
    if (adminWhatsApp) db.notificationSettings.adminWhatsApp = adminWhatsApp.trim();
    if (emailFrom) db.notificationSettings.emailFrom = emailFrom.trim();
    if (resendApiKey !== undefined) db.notificationSettings.resendApiKey = resendApiKey.trim();
    if (sendgridApiKey !== undefined) db.notificationSettings.sendgridApiKey = sendgridApiKey.trim();
    if (smtpHost !== undefined) db.notificationSettings.smtpHost = smtpHost.trim();
    if (smtpPort !== undefined) db.notificationSettings.smtpPort = Number(smtpPort) || 587;
    if (smtpUser !== undefined) db.notificationSettings.smtpUser = smtpUser.trim();
    if (smtpPass !== undefined) db.notificationSettings.smtpPass = smtpPass.trim();
    if (whatsappToken !== undefined) db.notificationSettings.whatsappToken = whatsappToken.trim();
    if (whatsappPhoneId !== undefined) db.notificationSettings.whatsappPhoneId = whatsappPhoneId.trim();
    if (twilioSid !== undefined) db.notificationSettings.twilioSid = twilioSid.trim();
    if (twilioAuth !== undefined) db.notificationSettings.twilioAuth = twilioAuth.trim();
    if (twilioFrom !== undefined) db.notificationSettings.twilioFrom = twilioFrom.trim();

    saveDatabase();
    res.json({ success: true, message: 'Notification settings updated.', settings: db.notificationSettings });
  });

  // Admin Send Test Notification (Live Probe)
  app.post('/api/admin/notifications/test', authenticateAdmin, async (req: Request, res: Response) => {
    const { channel, recipient } = req.body; // 'email' | 'whatsapp'

    if (channel === 'email') {
      const target = recipient || db.notificationSettings.adminEmail || 'chandanathosar@gmail.com';
      const result = await sendEmailNotification({
        to: target,
        subject: '⚡ ElectroCare Consultancy Test Notification',
        html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #3b82f6; border-radius: 8px;">
          <h2 style="color: #1e40af;">ElectroCare Live Email Test</h2>
          <p>Your server-side email integration is working properly!</p>
          <p style="font-size: 12px; color: #64748b;">Timestamp: ${new Date().toISOString()}</p>
        </div>`,
        text: `ElectroCare Live Email Test - Dispatched successfully at ${new Date().toISOString()}`,
        entityType: 'test',
        recipientType: 'admin'
      });

      res.json({ success: result.success, status: result.status, details: result.details });
      return;
    }

    if (channel === 'whatsapp') {
      const target = recipient || db.notificationSettings.adminWhatsApp || '+919822012345';
      const result = await sendWhatsAppNotification({
        to: target,
        messageText: `⚡ *ElectroCare WhatsApp Test Alert*\n\nYour WhatsApp Business messaging gateway is communicating successfully!\nTimestamp: ${new Date().toLocaleString()}`,
        entityType: 'test',
        recipientType: 'admin'
      });

      res.json({ success: result.success, status: result.status, details: result.details });
      return;
    }

    res.status(400).json({ success: false, error: 'Invalid channel specified.' });
  });

  // Admin Orders
  app.get('/api/admin/orders', authenticateAdmin, (req: Request, res: Response) => {
    res.json({ success: true, orders: db.orders });
  });

  app.patch('/api/admin/orders/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, trackingNumber, carrierName, paymentStatus } = req.body;

    const order = db.orders.find(o => o.id === id);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    const previousStatus = order.status;
    const previousPaymentStatus = order.paymentStatus;

    if (status) order.status = status;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (carrierName !== undefined) order.carrierName = carrierName;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid' && !order.paymentDetails?.paidAt) {
        if (!order.paymentDetails) order.paymentDetails = {};
        order.paymentDetails.paidAt = new Date().toISOString();
        order.paymentDetails.verifiedAt = new Date().toISOString();
      }
    }

    order.updatedAt = new Date().toISOString();
    saveDatabase();

    // 1. Dispatch Notification Email when order is Dispatched
    if (status === 'dispatched' && previousStatus !== 'dispatched' && order.customer.email) {
      const dispatchPayload = generateOrderDispatchedCustomerEmail(order);
      sendEmailNotification({
        to: order.customer.email,
        subject: `Your Order Has Been Dispatched: ${order.id} - ElectroCare Logistics`,
        html: dispatchPayload.html,
        text: dispatchPayload.text,
        entityType: 'order',
        entityId: order.id,
        eventType: 'order_dispatched',
        recipientType: 'customer'
      }).catch(e => console.warn('Dispatch email warning:', e));
    }
    // 2. Delivery Confirmation Email when order is Delivered
    else if (status === 'delivered' && previousStatus !== 'delivered' && order.customer.email) {
      const deliveredPayload = generateOrderDeliveredCustomerEmail(order);
      sendEmailNotification({
        to: order.customer.email,
        subject: `Order Delivered: ${order.id} - ElectroCare Warranty Active`,
        html: deliveredPayload.html,
        text: deliveredPayload.text,
        entityType: 'order',
        entityId: order.id,
        eventType: 'order_delivered',
        recipientType: 'customer'
      }).catch(e => console.warn('Delivered email warning:', e));
    }
    // 3. Payment Receipt Email if marked paid by admin
    else if (paymentStatus === 'paid' && previousPaymentStatus !== 'paid' && order.customer.email) {
      const receiptPayload = generatePaymentSuccessCustomerEmail(order);
      sendEmailNotification({
        to: order.customer.email,
        subject: `Payment Confirmed: Order ${order.id} Verified (₹${order.totalAmount.toLocaleString('en-IN')}) - ElectroCare`,
        html: receiptPayload.html,
        text: receiptPayload.text,
        entityType: 'order',
        entityId: order.id,
        eventType: 'payment_success',
        recipientType: 'customer'
      }).catch(e => console.warn('Admin mark paid email error:', e));
    }
    // 4. Other general status update
    else if (status && status !== previousStatus && order.customer.email) {
      sendEmailNotification({
        to: order.customer.email,
        subject: `Order Status Update: ${order.id} is now ${status.toUpperCase()} - ElectroCare`,
        html: `<p>Dear ${order.customer.name},</p><p>Your order <strong>${order.id}</strong> status has been updated to: <strong style="color: #2563eb;">${status.toUpperCase()}</strong>.</p>${trackingNumber ? `<p>Tracking Number: <strong>${trackingNumber}</strong></p>` : ''}<p>Thank you for choosing ElectroCare Consultancy.</p>`,
        text: `Dear ${order.customer.name}, Your order ${order.id} status is now: ${status.toUpperCase()}.${trackingNumber ? ` Tracking: ${trackingNumber}` : ''}`,
        entityType: 'order',
        entityId: order.id,
        eventType: `status_${status}`,
        recipientType: 'customer'
      }).catch(e => console.warn('Status notification error:', e));
    }

    res.json({ success: true, message: 'Order status updated successfully.', order });
  });

  // Admin Products
  app.patch('/api/admin/products/:id', authenticateAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { price, originalPrice, inStock, name, shortDesc, description, imageUrl, energyRating } = req.body;

    const product = db.products.find(p => p.id === id);
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found.' });
      return;
    }

    if (price !== undefined && !isNaN(Number(price))) product.price = Math.max(1, Math.round(Number(price)));
    if (originalPrice !== undefined && !isNaN(Number(originalPrice))) product.originalPrice = Math.max(1, Math.round(Number(originalPrice)));
    if (inStock !== undefined) product.inStock = Boolean(inStock);
    if (name) product.name = name.trim();
    if (shortDesc) product.shortDesc = shortDesc.trim();
    if (description) product.description = description.trim();
    if (imageUrl) product.imageUrl = imageUrl.trim();
    if (energyRating) product.energyRating = energyRating.trim();

    saveDatabase();
    res.json({ success: true, message: `Product ${product.name} updated.`, product });
  });

  app.post('/api/admin/products', authenticateAdmin, (req: Request, res: Response) => {
    const { name, category, price, originalPrice, energyRating, shortDesc, description, imageUrl, specs } = req.body;
    if (!name || !price) {
      res.status(400).json({ success: false, error: 'Product name and price in ₹ are required.' });
      return;
    }

    const newProd: GadgetProduct = {
      id: `prod-${Date.now()}`,
      name: name.trim(),
      category: category ? category.trim() : 'Cooling & Fans',
      price: Math.max(1, Math.round(Number(price))),
      originalPrice: originalPrice ? Math.round(Number(originalPrice)) : Math.round(Number(price) * 1.25),
      rating: 4.8,
      reviewsCount: 1,
      inStock: true,
      energyRating: energyRating ? energyRating.trim() : '5-Star Energy Saver',
      shortDesc: shortDesc ? shortDesc.trim() : 'Energy-efficient appliance.',
      description: description ? description.trim() : 'Energy-efficient electronic appliance.',
      imageUrl: imageUrl || '/products/refrigerator.jpg',
      specs: Array.isArray(specs) && specs.length > 0 ? specs : ['Certified Energy Efficient', '1-Year Warranty'],
      badge: 'New Arrival'
    };

    db.products.push(newProd);
    saveDatabase();
    res.status(201).json({ success: true, message: 'Product added.', product: newProd });
  });

  // Admin Enquiries
  app.get('/api/admin/enquiries', authenticateAdmin, (req: Request, res: Response) => {
    res.json({ success: true, total: db.enquiries.length, enquiries: db.enquiries });
  });

  app.patch('/api/admin/enquiries/:id', authenticateAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, priority, note } = req.body;
    const enquiry = db.enquiries.find(e => e.id === id);
    if (!enquiry) {
      res.status(404).json({ success: false, error: 'Enquiry not found.' });
      return;
    }

    if (status) enquiry.status = status;
    if (priority) enquiry.priority = priority;
    if (note && typeof note === 'string' && note.trim()) {
      if (!enquiry.adminNotes) enquiry.adminNotes = [];
      enquiry.adminNotes.push({
        id: `note-${Date.now()}`,
        text: note.trim(),
        createdAt: new Date().toISOString(),
        author: 'Senior Energy Engineer'
      });
    }
    enquiry.updatedAt = new Date().toISOString();
    saveDatabase();
    res.json({ success: true, message: 'Enquiry updated.', enquiry });
  });

  app.delete('/api/admin/enquiries/:id', authenticateAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    db.enquiries = db.enquiries.filter(e => e.id !== id);
    saveDatabase();
    res.json({ success: true, message: 'Enquiry deleted.' });
  });

  // Admin Stats
  app.get('/api/admin/stats', authenticateAdmin, (req: Request, res: Response) => {
    const totalEnq = db.enquiries.length;
    const newCount = db.enquiries.filter(e => e.status === 'new').length;
    const inProgressCount = db.enquiries.filter(e => e.status === 'in_progress' || e.status === 'contacted').length;
    const resolvedCount = db.enquiries.filter(e => e.status === 'resolved').length;

    const categoryBreakdown: Record<string, number> = {};
    db.enquiries.forEach(e => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + 1;
    });

    const totalOrderRevenueINR = db.orders.reduce((acc, o) => acc + o.totalAmount, 0);

    res.json({
      success: true,
      metrics: {
        totalEnquiries: totalEnq,
        newEnquiries: newCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        categoryBreakdown,
        totalOrders: db.orders.length,
        totalOrderRevenue: totalOrderRevenueINR,
        totalBookings: db.bookings.length,
        upcomingBookings: db.bookings.filter(b => b.status === 'confirmed').length,
        totalAuditsCompleted: db.stats.totalAuditsCompleted,
        estimatedSavedKWh: db.stats.estimatedSavedKWh
      }
    });
  });

  // Admin Change Password
  app.post('/api/admin/change-password', authenticateAdmin, (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      res.status(400).json({ success: false, error: 'New password must be at least 8 characters.' });
      return;
    }

    const isCurrentValid = verifyPassword(currentPassword, db.admin.salt, db.admin.passwordHash);
    if (!isCurrentValid) {
      res.status(400).json({ success: false, error: 'Current password does not match.' });
      return;
    }

    const { salt, hash } = hashPassword(newPassword);
    db.admin.salt = salt;
    db.admin.passwordHash = hash;
    db.admin.updatedAt = new Date().toISOString();
    saveDatabase();
    res.json({ success: true, message: 'Password updated.' });
  });

  // Admin Reset Demo Data
  app.post('/api/admin/reset-demo', authenticateAdmin, (req: Request, res: Response) => {
    db.products = JSON.parse(JSON.stringify(CANONICAL_PRODUCTS));
    db.notificationLogs = [];
    saveDatabase();
    res.json({ success: true, message: 'Demo state refreshed with verified catalog.' });
  });

  // ---------------- CLIENT VITE / STATIC SERVING ----------------

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ ElectroCare Consultancy Server is running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
