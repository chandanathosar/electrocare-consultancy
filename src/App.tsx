/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageId, ServiceCategory } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EnquirySuccessModal } from './components/EnquirySuccessModal';
import { TrackEnquiryModal } from './components/TrackEnquiryModal';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { EnergySavingPage } from './pages/EnergySavingPage';
import { ProductsPage } from './pages/ProductsPage';
import { ContactPage } from './pages/ContactPage';
import { EnquiryPage } from './pages/EnquiryPage';
import { BookingPage } from './pages/BookingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { DemoAccessModal } from './components/DemoAccessModal';
import { apiService } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [bookingService, setBookingService] = useState<string>('Electricity Bill Reduction Consultation');

  // Demo authorization state for private college presentation
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);
  const [isDemoAuthorized, setIsDemoAuthorized] = useState<boolean>(() => apiService.isDemoAuthenticated());

  // Enquiry preset state when launched from services or calculator
  const [enquiryCategory, setEnquiryCategory] = useState<ServiceCategory>('electricity_bill_reduction');
  const [enquiryMonthlyBill, setEnquiryMonthlyBill] = useState<string>('$350 - $700 / month');
  const [enquiryPropertyType, setEnquiryPropertyType] = useState<string>('Residential Home / Villa');

  // Success modal state
  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
  const [successRefId, setSuccessRefId] = useState<string>('');
  const [successCustomerName, setSuccessCustomerName] = useState<string>('');
  const [successEmail, setSuccessEmail] = useState<string>('');
  const [successCategory, setSuccessCategory] = useState<string>('');

  // Track status modal
  const [trackModalOpen, setTrackModalOpen] = useState<boolean>(false);
  const [trackInitialCode, setTrackInitialCode] = useState<string>('');

  const navigateTo = (page: PageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEnquiryWithPreset = (
    category: ServiceCategory,
    monthlyBill?: string,
    propertyType?: string
  ) => {
    setEnquiryCategory(category);
    if (monthlyBill) setEnquiryMonthlyBill(monthlyBill);
    if (propertyType) setEnquiryPropertyType(propertyType);
    navigateTo('enquiry');
  };

  const handleEnquirySuccess = (
    referenceId: string,
    name: string,
    email: string,
    category: string
  ) => {
    setSuccessRefId(referenceId);
    setSuccessCustomerName(name);
    setSuccessEmail(email);
    setSuccessCategory(category);
    setSuccessModalOpen(true);
  };

  const handleOpenTrackModalWithCode = (code: string) => {
    setTrackInitialCode(code);
    setTrackModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-slate-100 font-sans selection:bg-purple-500/30 selection:text-white">
      {/* Global Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onOpenTrackModal={() => {
          setTrackInitialCode('');
          setTrackModalOpen(true);
        }}
        isDemoAuthorized={isDemoAuthorized}
        onOpenDemoModal={() => setDemoModalOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onOpenEnquiryWithPreset={handleOpenEnquiryWithPreset}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={navigateTo} />
        )}

        {currentPage === 'services' && (
          <ServicesPage
            onNavigate={navigateTo}
            onOpenEnquiryWithPreset={handleOpenEnquiryWithPreset}
          />
        )}

        {currentPage === 'energy-saving' && (
          <EnergySavingPage
            onNavigate={navigateTo}
            onOpenEnquiryWithPreset={handleOpenEnquiryWithPreset}
          />
        )}

        {currentPage === 'products' && (
          <ProductsPage onNavigateToEnquiry={() => navigateTo('enquiry')} />
        )}

        {currentPage === 'contact' && (
          <ContactPage onNavigate={navigateTo} />
        )}

        {currentPage === 'enquiry' && (
          <EnquiryPage
            initialCategory={enquiryCategory}
            initialMonthlyBill={enquiryMonthlyBill}
            initialPropertyType={enquiryPropertyType}
            onSuccess={handleEnquirySuccess}
          />
        )}

        {currentPage === 'booking' && (
          <BookingPage
            initialService={bookingService}
            onNavigateHome={() => navigateTo('home')}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={navigateTo}
        onOpenTrackModal={() => {
          setTrackInitialCode('');
          setTrackModalOpen(true);
        }}
      />

      {/* Customer Enquiry Success Modal */}
      <EnquirySuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        referenceId={successRefId}
        customerName={successCustomerName}
        email={successEmail}
        category={successCategory}
        onTrackEnquiry={handleOpenTrackModalWithCode}
        onNavigate={navigateTo}
      />

      {/* Track Enquiry & Orders Modal */}
      <TrackEnquiryModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        initialCode={trackInitialCode}
      />

      {/* College Demonstration Access Modal */}
      <DemoAccessModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onSuccess={() => setIsDemoAuthorized(true)}
      />
    </div>
  );
}
