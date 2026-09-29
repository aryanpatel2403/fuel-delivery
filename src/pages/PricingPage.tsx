import React, { useState } from 'react';
import { Fuel, MapPin, Search, Star, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { store } from '../services/store';
import { FuelPumpStation } from '../types';
import { MapComponent } from '../components/MapComponent';

interface PricingPageProps {
  onSelectStationForOrder: (stationId: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onSelectStationForOrder }) => {
  const pumps = store.getPumps();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedPumpId, setSelectedPumpId] = useState<string>(pumps[0]?.id || '');

  const filteredPumps = pumps.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  const selectedPump = pumps.find(p => p.id === selectedPumpId) || pumps[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
          <span>Station Locator</span>
          <span aria-hidden="true">·</span>
          <span>Certified Daily Rates</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Partner Petrol Pumps & Fuel Pricing
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl">
          FuelUp sources exclusively from certified Oil Marketing Companies (OMCs) ensuring 100% density compliance, zero adulteration, and calibrated volumetric metering.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Brand Segmented Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto text-xs">
          {['all', 'Reliance', 'Nayara', 'HP', 'IndianOil', 'Shell', 'Bharat Petroleum'].map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              className={`px-3 py-1.5 font-semibold rounded-lg transition ${
                selectedBrand === b ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {b === 'all' ? 'All Brands' : b}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by area, landmark..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-amber-500"
          />
        </div>
      </div>

      {/* Map + Station Cards Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-800">Station Locator Map</span>
              <span className="text-slate-500">{filteredPumps.length} stations displayed</span>
            </div>
            <MapComponent
              mode="view_pumps"
              center={[selectedPump?.lat || 23.0330, selectedPump?.lng || 72.5120]}
              zoom={13}
              pumps={filteredPumps}
              selectedPumpId={selectedPumpId}
              onSelectPump={(p) => setSelectedPumpId(p.id)}
              className="h-96 w-full"
            />
          </div>
        </div>

        {/* Right Column: Station Listings */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Available Partner Pumps ({filteredPumps.length})
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredPumps.map((pump) => {
              const isSelected = pump.id === selectedPumpId;

              return (
                <div
                  key={pump.id}
                  onClick={() => setSelectedPumpId(pump.id)}
                  className={`rounded-2xl border p-4.5 transition cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/40 shadow-xs ring-1 ring-amber-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{pump.name}</span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          ★ {pump.rating}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{pump.address}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <div className="flex gap-4">
                      <div>
                        <span className="text-slate-400 text-[10px]">Petrol:</span>
                        <p className="font-extrabold text-slate-900 tabular-nums">₹{pump.petrolPrice.toFixed(2)}/L</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Diesel:</span>
                        <p className="font-extrabold text-slate-900 tabular-nums">₹{pump.dieselPrice.toFixed(2)}/L</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStationForOrder(pump.id);
                      }}
                      className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                    >
                      <span>Order Fuel</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pricing Policy Guarantee */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
          FuelUp Transparent Pricing Guarantee
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600">
          <div>
            <p className="font-bold text-slate-900 mb-1">Government Approved Rates</p>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Fuel rates are synced daily with the official Indian Oil, Reliance, and Nayara retail outlets. Zero markups on fuel price per liter.
            </p>
          </div>
          <div>
            <p className="font-bold text-slate-900 mb-1">Flat ₹49 Delivery</p>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Covers bowser mobilization, certified static grounding technician, and PESO double-walled transit insurance.
            </p>
          </div>
          <div>
            <p className="font-bold text-slate-900 mb-1">Zero Minimum Surcharge</p>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Order from as low as 5 liters for two-wheelers up to 1,000+ liters for industrial gensets with no volume penalties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
