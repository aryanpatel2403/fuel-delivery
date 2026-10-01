import React, { useState } from 'react';
import { 
  Fuel, Siren, ShieldCheck, Clock, MapPin, ArrowRight, 
  CheckCircle, Truck, Zap, Smartphone, ChevronRight, Award,
  Building2, Star, ExternalLink
} from 'lucide-react';
import { store } from '../services/store';

// Generated image assets from batch tool call
import heroImg from '../assets/images/fuel_delivery_hero_1790655912876.jpg';
import sosImg from '../assets/images/fuel_sos_dispatch_1790655927006.jpg';
import fleetImg from '../assets/images/smart_tank_fleet_1790655939543.jpg';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
  onSelectDeliveryMode?: (mode: 'instant' | 'scheduled' | 'sos') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  setActiveTab,
  onSelectDeliveryMode
}) => {
  const pumps = store.getPumps();
  const [calcLiters, setCalcLiters] = useState<number>(35);
  const [calcFuelType, setCalcFuelType] = useState<'petrol' | 'diesel'>('petrol');

  const basePrice = calcFuelType === 'petrol' ? 96.72 : 92.48;
  const estimatedTotal = (calcLiters * basePrice + 49).toFixed(2);

  const handleOrderClick = (mode: 'instant' | 'scheduled' | 'sos') => {
    if (onSelectDeliveryMode) onSelectDeliveryMode(mode);
    setActiveTab('order');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Emergency Roadside Quick Alert Ribbon */}
      <div className="bg-red-600 text-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-white animate-ping" />
            <span className="font-bold">Stranded on the road with zero fuel?</span>
            <span className="hidden sm:inline text-red-100">Our emergency rapid response bowser reaches you in under 25 minutes.</span>
          </div>
          <button
            onClick={() => handleOrderClick('sos')}
            className="flex items-center gap-1 font-bold underline underline-offset-2 hover:text-red-100 whitespace-nowrap"
          >
            <span>Trigger SOS Dispatch</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Value Proposition */}
          <div className="space-y-6 lg:col-span-7">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="text-amber-600">PESO Certified Mobile Refueling</span>
              <span aria-hidden="true">·</span>
              <span>Available Across Gujarat</span>
              <span aria-hidden="true">·</span>
              <span>24/7 Operations</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl text-balance">
              Premium Fuel Delivered Directly to Your Vehicle.
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              Skip the pump lines and highway detours. FuelUp delivers certified, tamper-proof Petrol & Diesel straight to your parked car, residential complex, or stranded highway location via smart metered bowsers.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleOrderClick('instant')}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <span>Order Fuel Delivery</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => setActiveTab('stations')}
                className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-5 py-3.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
              >
                <Building2 className="h-4 w-4 text-amber-600" />
                <span>Partner Fuel Stations</span>
              </button>

              <button
                onClick={() => handleOrderClick('sos')}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                <Siren className="h-4 w-4 text-red-600" />
                <span>Emergency Fuel SOS</span>
              </button>
            </div>

            {/* Trust Signal Line */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Zero Spill Nozzles</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Calibrated Flow Meters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span>30-Min Instant Slots</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-xl bg-slate-900 aspect-16/10">
              <img
                src={heroImg}
                alt="FuelUp modern certified mobile fuel delivery bowser refueler"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-slate-900/85 p-3.5 backdrop-blur-md border border-slate-700/60 text-white">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold">Live Fleet Active</span>
                  </div>
                  <span className="text-slate-300">Avg Arrival: 18 mins</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live Station Fuel Pricing Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Today's Certified Fuel Rates</h2>
              <p className="text-xs text-slate-500">Direct partnership pricing with Reliance, Nayara, HP & Indian Oil</p>
            </div>
            <button
              onClick={() => setActiveTab('pricing')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>View all stations & pumps on map</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {pumps.map((pump) => (
              <div key={pump.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-xs font-bold text-slate-900 truncate">{pump.brand}</p>
                <p className="text-[11px] text-slate-500 truncate">{pump.city}</p>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Petrol:</span>
                    <span className="font-semibold text-slate-800 tabular-nums">₹{pump.petrolPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Diesel:</span>
                    <span className="font-semibold text-slate-800 tabular-nums">₹{pump.dieselPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Core Capabilities (Bento Grid Flow) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Capabilities</span>
            <span aria-hidden="true">·</span>
            <span>How It Works</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Engineered for Precision, Safety, and Speed
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1: On-Demand Ordering */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Fuel className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">01. On-Demand & Scheduled Delivery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose Instant Delivery for fueling within 30 minutes, or pre-book slots up to 7 days ahead for daily morning commutes or fleet prep.
              </p>
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <span>Automatic vehicle tank capacity lookups</span>
            </div>
          </div>

          {/* Card 2: Emergency Fuel SOS */}
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Siren className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-red-950">02. Emergency Highway SOS</h3>
              <p className="text-xs text-red-900/80 leading-relaxed">
                Stranded on the highway? One-click SOS dispatches the nearest high-speed response bowser with hazard markings, static grounding, and emergency fuel.
              </p>
            </div>
            <div className="mt-6 border-t border-red-200/60 pt-4">
              <button
                onClick={() => handleOrderClick('sos')}
                className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1"
              >
                <span>Learn about SOS Protocols</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Card 3: Real-Time GPS Tracking */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">03. Real-Time GPS Bowser Telemetry</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Watch the delivery truck move along the map in real time. Accurate ETA countdown, driver contact line, and automated status milestones.
              </p>
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <span>OpenStreetMap & live coordinates stream</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Proof of Rigor & Visual Spotlight */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 rounded-3xl bg-slate-900 p-8 sm:p-12 text-white">
          <div className="space-y-6 lg:col-span-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Award className="h-4 w-4" />
              <span>Certified Safety Standard</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-balance">
              Zero Spills. Tamper-Proof Smart Meters. PESO Certified.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every FuelUp bowser features double-walled anti-corrosive tanks, emergency shutoff valves, vapor-recovery nozzles, and cloud-synchronized flow meters that ensure 100% volume purity.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-800 text-center">
              <div>
                <p className="text-2xl font-bold text-white tabular-nums">45,000+</p>
                <p className="text-[11px] text-slate-400 mt-1">Deliveries Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400 tabular-nums">18 Mins</p>
                <p className="text-[11px] text-slate-400 mt-1">Average Response Time</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white tabular-nums">100%</p>
                <p className="text-[11px] text-slate-400 mt-1">PESO Licensed</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:col-span-6">
            <div className="overflow-hidden rounded-xl border border-slate-700 aspect-4/3">
              <img
                src={sosImg}
                alt="Emergency fuel roadside dispatch"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-700 aspect-4/3">
              <img
                src={fleetImg}
                alt="FuelUp smart tanker fleet"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Interactive Fuel Cost Calculator */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>Instant Estimate</span>
              <span aria-hidden="true">·</span>
              <span>Transparent Pricing</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Calculate Your Fuel Delivery Cost
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              No hidden surge fees. Station price + flat ₹49 doorstep delivery fee.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-12 items-center">
            <div className="space-y-6 md:col-span-7">
              {/* Fuel Type Toggle */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Fuel Type</label>
                <div className="inline-flex rounded-xl bg-slate-100 p-1">
                  <button
                    onClick={() => setCalcFuelType('petrol')}
                    className={`rounded-lg px-5 py-2 text-xs font-semibold transition ${
                      calcFuelType === 'petrol' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Petrol (₹96.72/L)
                  </button>
                  <button
                    onClick={() => setCalcFuelType('diesel')}
                    className={`rounded-lg px-5 py-2 text-xs font-semibold transition ${
                      calcFuelType === 'diesel' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Diesel (₹92.48/L)
                  </button>
                </div>
              </div>

              {/* Liters Range */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span>Fuel Volume</span>
                  <span className="text-amber-600 font-bold tabular-nums text-sm">{calcLiters} Liters</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={calcLiters}
                  onChange={(e) => setCalcLiters(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>5L (Bike / Mini)</span>
                  <span>35L (Hatchback)</span>
                  <span>50L (SUV)</span>
                  <span>100L (Commercial)</span>
                </div>
              </div>
            </div>

            {/* Price Preview Card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 md:col-span-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Cost Breakdown</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{calcLiters}L × ₹{basePrice.toFixed(2)}/L</span>
                  <span className="font-medium text-slate-800 tabular-nums">₹{(calcLiters * basePrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Doorstep Delivery Fee</span>
                  <span className="font-medium text-slate-800 tabular-nums">₹49.00</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Safety Perimeter Fee</span>
                  <span className="text-emerald-600 font-medium">FREE</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Payable</span>
                  <span className="text-amber-600 tabular-nums">₹{estimatedTotal}</span>
                </div>
              </div>

              <button
                onClick={() => handleOrderClick('instant')}
                className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Order {calcLiters}L</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6.5. Partner Fuel Station Network Module Spotlight */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1">
              <Building2 className="h-4 w-4" />
              <span>Certified Fuel Station Network</span>
              <span aria-hidden="true">·</span>
              <span>Daily Calibrated Rates</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Partner Petrol Pumps Across the City
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Compare live tariffs from Reliance, Shell, Nayara, HP, and IndianOil. Order direct doorstep refueling dispatched straight from your preferred station.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('stations')}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
          >
            <span>Explore All {pumps.length} Fuel Stations</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 3 Featured Station Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pumps.slice(0, 3).map((station) => (
            <div
              key={station.id}
              onClick={() => setActiveTab('stations')}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {station.brand}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{station.rating}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition">
                    {station.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>{station.address}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Petrol Rate</span>
                    <span className="font-extrabold text-slate-900">₹{station.petrolPrice.toFixed(2)}/L</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Diesel Rate</span>
                    <span className="font-extrabold text-slate-900">₹{station.dieselPrice.toFixed(2)}/L</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>{station.openHours}</span>
                  <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                    {station.distanceKm} km away
                  </span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:text-amber-700">
                <span>View Station Specs & Order</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Attributable Testimonials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Customer Stories</span>
            <span aria-hidden="true">·</span>
            <span>Real Outcomes</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Trusted by Commuters & Fleet Operators
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Ran out of diesel on the SG Highway outer loop at 10 PM. FuelUp's SOS bowser arrived in 21 minutes, set up safety cones, and refueled my Scorpio smoothly. Saved my night."
            </p>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs font-bold text-slate-900">Kavita Desai</p>
              <p className="text-[11px] text-slate-500">Architect, Ahmedabad</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "We manage 14 delivery vans. Scheduling early 6 AM fueling at our logistics park saved us over 2 hours of driver idle time every morning. The digital meter reports are 100% transparent."
            </p>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs font-bold text-slate-900">Rajeshwar Trivedi</p>
              <p className="text-[11px] text-slate-500">Fleet Logistics Manager, Surat</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "The vehicle tank lookup feature is brilliant. Selected my Tata Nexon, chose 'Fill Tank', and the driver filled exactly what was needed with instant Google Pay UPI receipt."
            </p>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs font-bold text-slate-900">Manish Solanki</p>
              <p className="text-[11px] text-slate-500">Software Engineer, Gandhinagar</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
