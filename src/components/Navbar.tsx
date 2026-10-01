import React, { useState, useEffect } from 'react';
import { 
  Fuel, Siren, LogIn, UserPlus, LogOut, User, 
  ChevronDown, Truck, Shield, UserCheck, Building2 
} from 'lucide-react';
import { store } from '../services/store';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onTriggerSOS?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onTriggerSOS
}) => {
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    return store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
    });
  }, []);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await store.logout();
    setActiveTab('home');
  };

  const handleGoToPortal = () => {
    setIsUserMenuOpen(false);
    if (!currentUser) return;
    if (currentUser.role === 'driver') {
      setActiveTab('driver_dashboard');
    } else if (currentUser.role === 'admin') {
      setActiveTab('admin_dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 text-left focus:outline-hidden"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
            <Fuel className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            FuelUp
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('home')}
            className={`transition-colors hover:text-slate-900 ${activeTab === 'home' ? 'text-amber-600 font-semibold' : ''}`}
          >
            Home
          </button>

          {/* Main Module: Fuel Stations & Partner Network */}
          <button
            onClick={() => setActiveTab('stations')}
            className={`flex items-center gap-1.5 transition-colors hover:text-slate-900 ${
              activeTab === 'stations' || activeTab === 'pricing' ? 'text-amber-600 font-bold' : ''
            }`}
          >
            <Building2 className="h-4 w-4 text-amber-500" />
            <span>Fuel Stations</span>
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">Hubs</span>
          </button>

          {/* Customer Specific Links */}
          {currentUser && currentUser.role === 'customer' && (
            <>
              <button
                onClick={() => setActiveTab('order')}
                className={`transition-colors hover:text-slate-900 ${activeTab === 'order' ? 'text-amber-600 font-semibold' : ''}`}
              >
                Order Fuel
              </button>
              <button
                onClick={() => setActiveTab('track')}
                className={`transition-colors hover:text-slate-900 ${activeTab === 'track' ? 'text-amber-600 font-semibold' : ''}`}
              >
                Track Order
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`transition-colors hover:text-slate-900 ${activeTab === 'dashboard' ? 'text-amber-600 font-semibold' : ''}`}
              >
                My Orders
              </button>
            </>
          )}

          {/* Driver Specific Links (NO Order Fuel, NO Track Order) */}
          {currentUser && currentUser.role === 'driver' && (
            <button
              onClick={() => setActiveTab('driver_dashboard')}
              className={`transition-colors hover:text-slate-900 ${activeTab === 'driver_dashboard' ? 'text-amber-600 font-semibold' : ''}`}
            >
              Driver Console
            </button>
          )}

          {/* Admin Specific Links (NO Order Fuel, NO Track Order; Added Manage Customers & Drivers) */}
          {currentUser && currentUser.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('admin_dashboard')}
                className={`transition-colors hover:text-slate-900 ${activeTab === 'admin_dashboard' ? 'text-amber-600 font-semibold' : ''}`}
              >
                Admin Portal
              </button>
              <button
                onClick={() => setActiveTab('admin_customers')}
                className={`transition-colors hover:text-slate-900 ${activeTab === 'admin_customers' ? 'text-amber-600 font-semibold' : ''}`}
              >
                Manage Customers
              </button>
              <button
                onClick={() => setActiveTab('admin_drivers')}
                className={`transition-colors hover:text-slate-900 ${activeTab === 'admin_drivers' ? 'text-amber-600 font-semibold' : ''}`}
              >
                Manage Drivers
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions & Auth Controls */}
        <div className="flex items-center gap-3">
          {/* Emergency SOS Quick Trigger - Only for Customers or Guests */}
          {(!currentUser || currentUser.role === 'customer') && (
            <button
              onClick={() => {
                if (onTriggerSOS) onTriggerSOS();
                setActiveTab('order');
              }}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-red-700 whitespace-nowrap active:scale-95"
              title="Immediate Highway & Roadside Emergency Dispatch"
            >
              <Siren className="h-3.5 w-3.5 animate-pulse" />
              <span className="hidden sm:inline">Emergency SOS</span>
              <span className="sm:hidden">SOS</span>
            </button>
          )}

          {/* Conditional Auth: If NOT logged in -> Sign In & Sign Up */}
          {!currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition ${
                  activeTab === 'signin' ? 'border-amber-500 text-amber-700' : ''
                }`}
              >
                <LogIn className="h-3.5 w-3.5 text-slate-500" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => setActiveTab('signup')}
                className={`flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition ${
                  activeTab === 'signup' ? 'bg-amber-600' : ''
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Up</span>
              </button>
            </div>
          ) : (
            /* If LOGGED IN -> User Menu with Profile & Direct Logout */
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-2 pr-3 text-xs font-medium text-slate-800 shadow-2xs hover:bg-slate-50 transition"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800 font-bold text-xs uppercase">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="text-left hidden sm:block max-w-[120px] truncate">
                  <p className="font-semibold text-slate-900 truncate leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize leading-tight">{currentUser.role}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-800">
                      {currentUser.role}
                    </span>
                  </div>

                  <div className="py-1">
                    {currentUser.role === 'admin' ? (
                      <>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); setActiveTab('admin_dashboard'); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Shield className="h-4 w-4 text-purple-600" />
                          <span>Admin Portal</span>
                        </button>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); setActiveTab('admin_customers'); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                          <UserCheck className="h-4 w-4 text-blue-600" />
                          <span>Manage Customers</span>
                        </button>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); setActiveTab('admin_drivers'); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Truck className="h-4 w-4 text-emerald-600" />
                          <span>Manage Drivers</span>
                        </button>
                      </>
                    ) : currentUser.role === 'driver' ? (
                      <button
                        onClick={() => { setIsUserMenuOpen(false); setActiveTab('driver_dashboard'); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Truck className="h-4 w-4 text-emerald-600" />
                        <span>Driver Console</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => { setIsUserMenuOpen(false); setActiveTab('dashboard'); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <UserCheck className="h-4 w-4 text-blue-600" />
                        <span>My Orders & Vehicles</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="h-3.5 w-3.5 text-red-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
