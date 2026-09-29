/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { OrderFuelPage } from './pages/OrderFuelPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { DriverDashboardPage } from './pages/DriverDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminCustomersPage } from './pages/AdminCustomersPage';
import { AdminDriversPage } from './pages/AdminDriversPage';
import { PricingPage } from './pages/PricingPage';
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DeliveryMode, UserRole } from './types';
import { store } from './services/store';
import { LogIn, UserPlus, ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [targetDeliveryMode, setTargetDeliveryMode] = useState<DeliveryMode>('instant');
  const [activeOrderId, setActiveOrderId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());

  useEffect(() => {
    return store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
    });
  }, []);

  const handleTriggerSOS = () => {
    setTargetDeliveryMode('sos');
    setActiveTab('order');
  };

  const handleOrderPlaced = (orderId: string) => {
    setActiveOrderId(orderId);
    setActiveTab('track');
  };

  const handleTrackSpecificOrder = (orderId: string) => {
    setActiveOrderId(orderId);
    setActiveTab('track');
  };

  const handleSelectStationForOrder = (stationId: string) => {
    setActiveTab('order');
  };

  const renderProtectedView = (roleRequired: UserRole, content: React.ReactNode) => {
    if (!currentUser) {
      return (
        <div className="mx-auto max-w-md px-4 py-20 text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <LogIn className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">Sign In Required</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please sign in to your FuelUp account to order fuel, track active deliveries, or view your orders.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('signin')}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <UserPlus className="h-3.5 w-3.5 text-slate-400" />
              <span>Create Account</span>
            </button>
          </div>
        </div>
      );
    }

    if (roleRequired === 'customer') {
      if (currentUser.role === 'driver') {
        return (
          <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
            <ShieldAlert className="mx-auto h-12 w-12 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Driver Console Active</h2>
            <p className="text-xs text-slate-500">
              Fuel ordering and tracking pages are removed in the Driver module. Please use your Driver Console to fulfill bowser dispatches.
            </p>
            <button
              onClick={() => setActiveTab('driver_dashboard')}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
            >
              Go to Driver Console
            </button>
          </div>
        );
      }
      if (currentUser.role === 'admin') {
        return (
          <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
            <ShieldAlert className="mx-auto h-12 w-12 text-purple-600" />
            <h2 className="text-lg font-bold text-slate-900">Admin Mode Active</h2>
            <p className="text-xs text-slate-500">
              Customer fuel ordering and tracking pages are removed in the Admin module. Please use your Admin management tools.
            </p>
            <div className="flex justify-center gap-2 pt-1">
              <button
                onClick={() => setActiveTab('admin_dashboard')}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Admin Portal
              </button>
              <button
                onClick={() => setActiveTab('admin_customers')}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Manage Customers
              </button>
            </div>
          </div>
        );
      }
    }

    if (roleRequired === 'driver' && currentUser.role !== 'driver' && currentUser.role !== 'admin') {
      return (
        <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
          <ShieldAlert className="mx-auto h-12 w-12 text-amber-600" />
          <h2 className="text-lg font-bold text-slate-900">Driver Console Access Restricted</h2>
          <p className="text-xs text-slate-500">
            You are logged in as a Customer ({currentUser.email}). Please sign in with driver credentials (`driver@fuelup.in`) to access the bowser console.
          </p>
          <button
            onClick={() => setActiveTab('signin')}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white"
          >
            Switch to Driver Account
          </button>
        </div>
      );
    }

    if (roleRequired === 'admin' && currentUser.role !== 'admin') {
      return (
        <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
          <ShieldAlert className="mx-auto h-12 w-12 text-purple-600" />
          <h2 className="text-lg font-bold text-slate-900">Administrator Portal Restricted</h2>
          <p className="text-xs text-slate-500">
            Administrative access is reserved for authorized system leads (`admin@fuelup.in` / `24172022025@gnu.ac.in`).
          </p>
          <button
            onClick={() => setActiveTab('signin')}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white"
          >
            Sign in as Administrator
          </button>
        </div>
      );
    }

    return content;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTriggerSOS={handleTriggerSOS}
      />

      {/* Main Content Viewport */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <LandingPage
            setActiveTab={setActiveTab}
            onSelectDeliveryMode={(mode) => setTargetDeliveryMode(mode)}
          />
        )}

        {activeTab === 'order' && renderProtectedView('customer', (
          <OrderFuelPage
            initialMode={targetDeliveryMode}
            onOrderPlaced={handleOrderPlaced}
          />
        ))}

        {activeTab === 'track' && renderProtectedView('customer', (
          <TrackOrderPage
            initialOrderId={activeOrderId}
            onNavigateHome={() => setActiveTab('home')}
          />
        ))}

        {activeTab === 'dashboard' && renderProtectedView('customer', (
          <UserDashboardPage
            onTrackOrder={handleTrackSpecificOrder}
            onNewOrder={() => {
              setTargetDeliveryMode('instant');
              setActiveTab('order');
            }}
          />
        ))}

        {activeTab === 'pricing' && (
          <PricingPage
            onSelectStationForOrder={handleSelectStationForOrder}
          />
        )}

        {activeTab === 'driver_dashboard' && renderProtectedView('driver', (
          <DriverDashboardPage
            onTrackOrder={handleTrackSpecificOrder}
          />
        ))}

        {activeTab === 'admin_dashboard' && renderProtectedView('admin', (
          <AdminDashboardPage
            onTrackOrder={handleTrackSpecificOrder}
            onNavigateTab={setActiveTab}
          />
        ))}

        {activeTab === 'admin_customers' && renderProtectedView('admin', (
          <AdminCustomersPage />
        ))}

        {activeTab === 'admin_drivers' && renderProtectedView('admin', (
          <AdminDriversPage />
        ))}

        {(activeTab === 'signin' || activeTab === 'signup' || activeTab === 'auth') && (
          <AuthPage
            initialMode={activeTab === 'signup' ? 'signup' : 'signin'}
            initialRole={activeTab === 'signup' ? 'customer' : (currentUser?.role || 'customer')}
            onSuccess={(role: UserRole) => {
              if (role === 'driver') setActiveTab('driver_dashboard');
              else if (role === 'admin') setActiveTab('admin_dashboard');
              else setActiveTab('dashboard');
            }}
            onForgotPassword={() => setActiveTab('forgot_password')}
            onSwitchMode={(mode) => setActiveTab(mode)}
          />
        )}

        {activeTab === 'forgot_password' && (
          <ForgotPasswordPage
            onBackToSignIn={() => setActiveTab('signin')}
          />
        )}

        {activeTab === 'not_found' && (
          <NotFoundPage
            onGoHome={() => setActiveTab('home')}
            onOrderFuel={() => {
              setTargetDeliveryMode('instant');
              setActiveTab('order');
            }}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
