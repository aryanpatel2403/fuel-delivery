import React from 'react';
import { Fuel, ShieldCheck, Phone, Mail, MapPin, Clock } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand & Regulatory Compliance */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
                <Fuel className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">FuelUp</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              India's trusted PESO-licensed mobile refueler service. Delivering zero-spill, tamper-proof fuel directly to commercial fleets, personal vehicles, and residential towers.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>PESO License #G18/FUP/99120</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Platform Services</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('order')} className="hover:text-slate-900 transition-colors">
                  On-Demand Delivery
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('order')} className="hover:text-slate-900 transition-colors">
                  Emergency Fuel SOS
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('track')} className="hover:text-slate-900 transition-colors">
                  Live GPS Order Tracker
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('stations')} className="hover:text-slate-900 transition-colors font-medium text-amber-600">
                  Fuel Stations & OMC Network
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-slate-900 transition-colors">
                  Customer Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Dedicated Portals */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Partner & Team Access</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('driver_dashboard')} className="hover:text-slate-900 transition-colors">
                  Bowser Driver Console
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('admin_dashboard')} className="hover:text-slate-900 transition-colors">
                  Logistics & Admin Portal
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('auth')} className="hover:text-slate-900 transition-colors">
                  Driver & Partner Onboarding
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('pricing')} className="hover:text-slate-900 transition-colors">
                  Fuel Station Partner Network
                </button>
              </li>
            </ul>
          </div>

          {/* 24x7 Emergency Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Emergency & Support</h4>
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="h-4 w-4 text-red-600" />
                <span className="font-semibold text-red-600">1800-FUEL-UP (Toll Free 24x7)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>support@fuelup.in</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <span>SG Highway Innovation Corridor, Ahmedabad, Gujarat 380054</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>Dispatches 24x7 · 365 Days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} FuelUp Technologies India Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Safety Guidelines</span>
            <span>·</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms of Delivery</span>
            <span>·</span>
            <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
