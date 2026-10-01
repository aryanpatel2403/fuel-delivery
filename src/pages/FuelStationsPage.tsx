import React, { useState, useEffect } from 'react';
import { 
  Fuel, MapPin, Search, Star, Clock, CheckCircle2, ArrowRight, 
  Phone, Plus, Edit2, ShieldCheck, Zap, SlidersHorizontal, 
  Map as MapIcon, Grid, Navigation, ExternalLink, X, Building2, 
  AlertCircle, Sparkles, Filter, Droplet, RefreshCw, Check
} from 'lucide-react';
import { store } from '../services/store';
import { FuelPumpStation, User } from '../types';
import { MapComponent } from '../components/MapComponent';

interface FuelStationsPageProps {
  onSelectStationForOrder: (stationId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const FuelStationsPage: React.FC<FuelStationsPageProps> = ({ 
  onSelectStationForOrder,
  onNavigateTab 
}) => {
  const [pumps, setPumps] = useState<FuelPumpStation[]>(store.getPumps());
  const [currentUser, setCurrentUser] = useState<User | null>(store.getCurrentUser());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'petrol' | 'diesel' | 'ev'>('all');
  const [amenityFilter, setAmenityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'cheapest_petrol' | 'cheapest_diesel' | 'distance' | 'rating'>('distance');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  // Modals state
  const [activeDetailStation, setActiveDetailStation] = useState<FuelPumpStation | null>(null);
  const [editingStation, setEditingStation] = useState<FuelPumpStation | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Selected station for map view
  const [selectedMapStationId, setSelectedMapStationId] = useState<string>(pumps[0]?.id || '');

  // Form states for Editing
  const [editPetrolPrice, setEditPetrolPrice] = useState<number>(96.70);
  const [editDieselPrice, setEditDieselPrice] = useState<number>(92.40);
  const [editAvailable, setEditAvailable] = useState<boolean>(true);
  const [editHours, setEditHours] = useState<string>('24x7 Open');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editManager, setEditManager] = useState<string>('');

  // Form states for Adding New Station
  const [newStation, setNewStation] = useState<Partial<FuelPumpStation>>({
    name: '',
    brand: 'Reliance',
    address: '',
    district: 'Ahmedabad',
    city: 'Bodakdev',
    lat: 23.0375,
    lng: 72.5182,
    petrolPrice: 96.65,
    dieselPrice: 92.40,
    rating: 4.8,
    openHours: '24x7 Open',
    available: true,
    distanceKm: 2.5,
    phone: '+91 79 2685 0000',
    managerName: '',
    totalNozzles: 12,
    hasPetrol: true,
    hasDiesel: true,
    hasEVCharging: true,
    amenities: ['Air Tower', 'Clean Restrooms', 'Nitrogen Inflation']
  });

  // Partner inquiry form state
  const [partnerForm, setPartnerForm] = useState({
    dealerName: '',
    stationName: '',
    omcBrand: 'Reliance',
    location: '',
    phone: '',
    dailyVolumeLiters: '15000'
  });
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);

  useEffect(() => {
    return store.subscribe(() => {
      setPumps(store.getPumps());
      setCurrentUser(store.getCurrentUser());
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const isAdmin = currentUser?.role === 'admin';

  // Calculations for Hero Stats
  const validPumps = pumps.filter(p => p.available);
  const lowestPetrolPrice = pumps.length > 0 ? Math.min(...pumps.map(p => p.petrolPrice)) : 96.60;
  const lowestDieselPrice = pumps.length > 0 ? Math.min(...pumps.map(p => p.dieselPrice)) : 92.35;
  const averagePetrolPrice = pumps.length > 0 ? (pumps.reduce((acc, p) => acc + p.petrolPrice, 0) / pumps.length).toFixed(2) : '96.75';
  const open24x7Count = pumps.filter(p => p.openHours.toLowerCase().includes('24')).length;

  // Filter & Sort Logic
  const filteredPumps = pumps.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;

    let matchesAvailability = true;
    if (availabilityFilter === 'petrol') matchesAvailability = p.hasPetrol !== false;
    else if (availabilityFilter === 'diesel') matchesAvailability = p.hasDiesel !== false;
    else if (availabilityFilter === 'ev') matchesAvailability = p.hasEVCharging === true;

    let matchesAmenity = true;
    if (amenityFilter !== 'all') {
      matchesAmenity = p.amenities ? p.amenities.some(a => a.toLowerCase().includes(amenityFilter.toLowerCase())) : false;
    }

    return matchesSearch && matchesBrand && matchesAvailability && matchesAmenity;
  }).sort((a, b) => {
    if (sortBy === 'cheapest_petrol') return a.petrolPrice - b.petrolPrice;
    if (sortBy === 'cheapest_diesel') return a.dieselPrice - b.dieselPrice;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (a.distanceKm || 99) - (b.distanceKm || 99);
  });

  const selectedMapStation = pumps.find(p => p.id === selectedMapStationId) || filteredPumps[0] || pumps[0];

  // Brand Badge styling helper
  const getBrandBadge = (brand: string) => {
    switch (brand) {
      case 'Shell':
        return { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-amber-500', accent: 'border-l-4 border-l-red-500' };
      case 'Reliance':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-600', accent: 'border-l-4 border-l-blue-600' };
      case 'Nayara':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-600', accent: 'border-l-4 border-l-emerald-600' };
      case 'IndianOil':
        return { bg: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-600', accent: 'border-l-4 border-l-amber-600' };
      case 'HP':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-600', accent: 'border-l-4 border-l-rose-600' };
      case 'Bharat Petroleum':
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-yellow-500', accent: 'border-l-4 border-l-indigo-600' };
      default:
        return { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500', accent: 'border-l-4 border-l-slate-500' };
    }
  };

  const handleOpenEdit = (station: FuelPumpStation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStation(station);
    setEditPetrolPrice(station.petrolPrice);
    setEditDieselPrice(station.dieselPrice);
    setEditAvailable(station.available);
    setEditHours(station.openHours);
    setEditPhone(station.phone || '');
    setEditManager(station.managerName || '');
  };

  const handleSaveEdit = async () => {
    if (!editingStation) return;
    await store.updatePump(editingStation.id, {
      petrolPrice: Number(editPetrolPrice),
      dieselPrice: Number(editDieselPrice),
      available: editAvailable,
      openHours: editHours,
      phone: editPhone,
      managerName: editManager
    });
    setEditingStation(null);
    showToast(`Updated tariffs & operational details for ${editingStation.name}`);
  };

  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStation.name || !newStation.address) return;

    const created: FuelPumpStation = {
      id: `pump-${Date.now()}`,
      name: newStation.name,
      brand: newStation.brand as any || 'Reliance',
      address: newStation.address,
      district: newStation.district || 'Ahmedabad',
      city: newStation.city || 'Bodakdev',
      lat: Number(newStation.lat) || 23.0375,
      lng: Number(newStation.lng) || 72.5182,
      petrolPrice: Number(newStation.petrolPrice) || 96.65,
      dieselPrice: Number(newStation.dieselPrice) || 92.40,
      rating: 4.8,
      openHours: newStation.openHours || '24x7 Open',
      available: true,
      distanceKm: Number(newStation.distanceKm) || 2.5,
      phone: newStation.phone || '+91 79 2685 0000',
      managerName: newStation.managerName || 'Station Lead',
      totalNozzles: Number(newStation.totalNozzles) || 12,
      hasPetrol: true,
      hasDiesel: true,
      hasEVCharging: newStation.hasEVCharging ?? true,
      amenities: newStation.amenities || ['Air Tower', 'Clean Restrooms', 'Nitrogen Inflation'],
      lastPriceUpdated: 'Just now'
    };

    await store.addPump(created);
    setIsAddModalOpen(false);
    showToast(`Successfully added ${created.name} to FuelUp partner network`);
  };

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPartnerSubmitted(true);
    setTimeout(() => {
      setPartnerSubmitted(false);
      setIsPartnerModalOpen(false);
      showToast('Thank you! Our OMC Commercial Partnerships lead will call you within 24 hours.');
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Module Header & Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-amber-950 p-6 sm:p-10 text-white shadow-lg">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30 backdrop-blur-xs">
              <Building2 className="h-3.5 w-3.5 text-amber-400" />
              <span>OMC Partner Station Network</span>
              <span className="h-1 w-1 rounded-full bg-amber-400"></span>
              <span>100% Calibrated Fuel</span>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Partner Station</span>
                </button>
              )}
              <button
                onClick={() => setIsPartnerModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 backdrop-blur-xs transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Partner Your Station</span>
              </button>
            </div>
          </div>

          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Fuel Station Network & Live Daily Rates
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore certified retail petrol pump stations across the city. Monitor real-time petrol and diesel tariffs, inspect roadside amenities, and order doorstep fuel refills dispatched straight from your preferred station.
            </p>
          </div>

          {/* Key Metrics / Highlights Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10 text-xs">
            <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10">
              <span className="text-slate-400 text-[11px] block">Network Stations</span>
              <span className="text-xl font-extrabold text-white mt-0.5 block">{pumps.length} Active Hubs</span>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3" />
                <span>{open24x7Count} Open 24/7</span>
              </span>
            </div>

            <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10">
              <span className="text-slate-400 text-[11px] block">Lowest Petrol Rate</span>
              <span className="text-xl font-extrabold text-amber-400 mt-0.5 block">₹{lowestPetrolPrice.toFixed(2)} /L</span>
              <span className="text-[10px] text-slate-300 mt-0.5 block">Avg: ₹{averagePetrolPrice} /L</span>
            </div>

            <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10">
              <span className="text-slate-400 text-[11px] block">Lowest Diesel Rate</span>
              <span className="text-xl font-extrabold text-sky-400 mt-0.5 block">₹{lowestDieselPrice.toFixed(2)} /L</span>
              <span className="text-[10px] text-slate-300 mt-0.5 block">High density low-sulfur</span>
            </div>

            <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10">
              <span className="text-slate-400 text-[11px] block">Quality Compliance</span>
              <span className="text-xl font-extrabold text-white mt-0.5 block">PESO Certified</span>
              <span className="text-[10px] text-amber-300 font-medium flex items-center gap-1 mt-0.5">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span>Zero Adulteration</span>
              </span>
            </div>
          </div>
        </div>

        {/* Ambient background ornament */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Filter, Search & View Switcher Bar */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by station name, brand, area (e.g. SG Highway, Bodakdev, Bopal)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-amber-500 focus:border-amber-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Filters & View Switcher */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Availability Filter */}
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 font-medium focus:outline-amber-500"
            >
              <option value="all">All Fuels Available</option>
              <option value="petrol">Petrol Ready</option>
              <option value="diesel">Diesel Ready</option>
              <option value="ev">EV Fast Charging</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 font-medium focus:outline-amber-500"
            >
              <option value="distance">Closest Distance</option>
              <option value="cheapest_petrol">Cheapest Petrol Rate</option>
              <option value="cheapest_diesel">Cheapest Diesel Rate</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* Dual View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" />
                <span>Map Visualizer</span>
              </button>
            </div>
          </div>
        </div>

        {/* OMC Brand Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-slate-400 font-medium text-[11px] shrink-0 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Brand:
          </span>
          {['all', 'Reliance', 'Shell', 'Nayara', 'HP', 'IndianOil', 'Bharat Petroleum'].map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition shrink-0 ${
                selectedBrand === brand
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {brand === 'all' ? 'All OMC Brands' : brand}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW MODE 1: GRID OF STATION CARDS */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Showing <strong className="text-slate-900">{filteredPumps.length}</strong> verified fuel station hubs</span>
            <span>Live tariffs updated at 06:00 AM daily IST</span>
          </div>

          {filteredPumps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
              <Fuel className="mx-auto h-10 w-10 text-slate-300" />
              <p className="font-bold text-slate-700">No fuel stations matching your filter</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try selecting &apos;All OMC Brands&apos; or clear your search term to view all regional partner hubs.
              </p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedBrand('all'); setAvailabilityFilter('all'); }}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPumps.map((station) => {
                const badge = getBrandBadge(station.brand);
                return (
                  <div
                    key={station.id}
                    onClick={() => setActiveDetailStation(station)}
                    className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition cursor-pointer ${badge.accent}`}
                  >
                    <div className="space-y-3.5">
                      {/* Brand & Status Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[11px] font-bold border ${badge.bg}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}></span>
                            {station.brand}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {station.rating.toFixed(1)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {station.available ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 border border-red-200">
                              Maintenance
                            </span>
                          )}

                          {isAdmin && (
                            <button
                              onClick={(e) => handleOpenEdit(station, e)}
                              title="Edit Station Rates & Status"
                              className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Station Name & Location */}
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition leading-snug text-sm">
                          {station.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{station.address}</span>
                        </p>
                      </div>

                      {/* Live Tariffs Dual Box */}
                      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                        <div className="rounded-lg bg-white p-2 border border-slate-200/60 shadow-2xs">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Droplet className="h-3 w-3 text-amber-500" /> Petrol
                            </span>
                            <span className="text-[9px] text-emerald-600 font-bold">Standard</span>
                          </div>
                          <p className="text-base font-extrabold text-slate-900 mt-0.5">
                            ₹{station.petrolPrice.toFixed(2)}
                            <span className="text-[10px] font-normal text-slate-500 ml-0.5">/L</span>
                          </p>
                        </div>

                        <div className="rounded-lg bg-white p-2 border border-slate-200/60 shadow-2xs">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Droplet className="h-3 w-3 text-sky-500" /> Diesel
                            </span>
                            <span className="text-[9px] text-blue-600 font-bold">Low Sulfur</span>
                          </div>
                          <p className="text-base font-extrabold text-slate-900 mt-0.5">
                            ₹{station.dieselPrice.toFixed(2)}
                            <span className="text-[10px] font-normal text-slate-500 ml-0.5">/L</span>
                          </p>
                        </div>
                      </div>

                      {/* Amenities & Open Hours */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {station.openHours}
                          </span>
                          {station.distanceKm && (
                            <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                              {station.distanceKm} km away
                            </span>
                          )}
                        </div>

                        {station.amenities && (
                          <div className="flex flex-wrap gap-1">
                            {station.amenities.slice(0, 3).map((amenity, idx) => (
                              <span 
                                key={idx}
                                className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                              >
                                {amenity.includes('EV') && <Zap className="h-2.5 w-2.5 text-emerald-600" />}
                                {amenity}
                              </span>
                            ))}
                            {station.amenities.length > 3 && (
                              <span className="text-[10px] text-slate-400 self-center">
                                +{station.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-2 pt-4 mt-3 border-t border-slate-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStationForOrder(station.id);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-2xs"
                      >
                        <Fuel className="h-3.5 w-3.5 text-amber-400" />
                        <span>Order from Station</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDetailStation(station);
                        }}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
                        title="View Station Details & Certified Density"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: INTERACTIVE MAP VISUALIZER */}
      {viewMode === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs">
          {/* Sidebar Station Selector */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Select Station Pin ({filteredPumps.length})
              </span>
              <span className="text-[11px] text-slate-400">Click to locate</span>
            </div>

            {filteredPumps.map((station) => {
              const isSelected = selectedMapStationId === station.id;
              const badge = getBrandBadge(station.brand);
              return (
                <div
                  key={station.id}
                  onClick={() => setSelectedMapStationId(station.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 ${
                    isSelected 
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg}`}>
                      {station.brand}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">{station.distanceKm} km away</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{station.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{station.address}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="font-extrabold text-slate-900">
                      ₹{station.petrolPrice.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">Petrol</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStationForOrder(station.id);
                      }}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 underline"
                    >
                      Order Refill →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Map Visualizer */}
          <div className="lg:col-span-2 space-y-3">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
              <MapComponent
                mode="view_pumps"
                center={[selectedMapStation?.lat || 23.0330, selectedMapStation?.lng || 72.5120]}
                zoom={13}
                pumps={filteredPumps}
                selectedPumpId={selectedMapStationId}
                onSelectPump={(p) => setSelectedMapStationId(p.id)}
                className="h-[460px] w-full"
              />
            </div>

            {/* Selected Station Banner under Map */}
            {selectedMapStation && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{selectedMapStation.name}</span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {selectedMapStation.openHours}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{selectedMapStation.address} · {selectedMapStation.district}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveDetailStation(selectedMapStation)}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    View Specs
                  </button>
                  <button
                    onClick={() => onSelectStationForOrder(selectedMapStation.id)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition flex items-center justify-center gap-1"
                  >
                    <Fuel className="h-3.5 w-3.5 text-amber-400" />
                    <span>Order Doorstep Fuel</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: STATION DETAILS & AMENITIES SPEC SHEET */}
      {activeDetailStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                  Partner Retail Hub
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {activeDetailStation.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {activeDetailStation.address}
                </p>
              </div>
              <button 
                onClick={() => setActiveDetailStation(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tariffs Highlights */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-amber-50/60 p-3.5 border border-amber-200/60">
              <div>
                <span className="text-[11px] text-amber-900 font-semibold block">Petrol (Motor Spirit)</span>
                <span className="text-2xl font-black text-amber-950 mt-0.5 block">
                  ₹{activeDetailStation.petrolPrice.toFixed(2)}
                  <span className="text-xs font-normal text-amber-800 ml-1">/ Liter</span>
                </span>
                <span className="text-[10px] text-amber-700">Calibrated density: 730–770 kg/m³</span>
              </div>
              <div>
                <span className="text-[11px] text-amber-900 font-semibold block">Diesel (High Speed)</span>
                <span className="text-2xl font-black text-amber-950 mt-0.5 block">
                  ₹{activeDetailStation.dieselPrice.toFixed(2)}
                  <span className="text-xs font-normal text-amber-800 ml-1">/ Liter</span>
                </span>
                <span className="text-[10px] text-amber-700">Calibrated density: 820–860 kg/m³</span>
              </div>
            </div>

            {/* Station Operational Specs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="text-[11px] text-slate-500">Operating Schedule</span>
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  {activeDetailStation.openHours}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="text-[11px] text-slate-500">Nozzle Capacity</span>
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Fuel className="h-3.5 w-3.5 text-amber-500" />
                  {activeDetailStation.totalNozzles || 12} High-Flow Nozzles
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="text-[11px] text-slate-500">Station Helpline</span>
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  {activeDetailStation.phone || '+91 79 2685 0000'}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="text-[11px] text-slate-500">Station Lead / Manager</span>
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  {activeDetailStation.managerName || 'Certified Station Manager'}
                </p>
              </div>
            </div>

            {/* Available Facilities & Amenities */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Certified On-Site Facilities
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(activeDetailStation.amenities || [
                  'Air Tower', 'Clean Restrooms', 'Nitrogen Inflation', 'Digital POS', 'Lube Center'
                ]).map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-slate-700 border border-slate-100">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality & Safety Note */}
            <div className="rounded-xl bg-slate-900 p-3.5 text-white text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <ShieldCheck className="h-4 w-4" />
                <span>FuelUp Calibrated Quality Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                All mobile bowsers dispatched from this partner station carry electronic density verification and calibrated flow meters ensuring accurate literage.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const id = activeDetailStation.id;
                  setActiveDetailStation(null);
                  onSelectStationForOrder(id);
                }}
                className="flex-1 rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Fuel className="h-4 w-4" />
                <span>Order Doorstep Refill from this Station</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADMIN EDIT STATION RATES & STATUS */}
      {editingStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase">Admin Management Console</span>
                <h3 className="font-extrabold text-slate-900 text-base">{editingStation.name}</h3>
              </div>
              <button onClick={() => setEditingStation(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Petrol Rate (₹/L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPetrolPrice}
                    onChange={(e) => setEditPetrolPrice(parseFloat(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Diesel Rate (₹/L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editDieselPrice}
                    onChange={(e) => setEditDieselPrice(parseFloat(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Operational Schedule</label>
                <input
                  type="text"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  placeholder="e.g. 24x7 Open or 06:00 AM - 11:30 PM"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:outline-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Helpline Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 79 2685 0000"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:outline-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Station Manager</label>
                  <input
                    type="text"
                    value={editManager}
                    onChange={(e) => setEditManager(e.target.value)}
                    placeholder="Manager Name"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:outline-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200">
                <span className="font-semibold text-slate-700">Station Active Status</span>
                <button
                  type="button"
                  onClick={() => setEditAvailable(!editAvailable)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    editAvailable ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {editAvailable ? 'Active & Delivering' : 'Maintenance / Offline'}
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStation(null)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 rounded-xl bg-slate-900 py-2.5 font-bold text-white hover:bg-slate-800 transition"
                >
                  Save Updates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADMIN ADD NEW PARTNER STATION */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase">Onboard Station</span>
                <h3 className="font-extrabold text-slate-900 text-lg">Add New Partner Fuel Station</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStation} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-slate-600 block mb-1 font-semibold">Station Name *</label>
                  <input
                    type="text"
                    required
                    value={newStation.name}
                    onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
                    placeholder="e.g. Nayara Energy West Hub"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:outline-amber-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-slate-600 block mb-1 font-semibold">OMC Brand *</label>
                  <select
                    value={newStation.brand}
                    onChange={(e) => setNewStation({ ...newStation, brand: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:outline-amber-500"
                  >
                    <option value="Reliance">Reliance Petroleum</option>
                    <option value="Shell">Shell Mobility</option>
                    <option value="Nayara">Nayara Energy</option>
                    <option value="HP">Hindustan Petroleum (HP)</option>
                    <option value="IndianOil">IndianOil (IOCL)</option>
                    <option value="Bharat Petroleum">Bharat Petroleum (BPCL)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Full Address *</label>
                <input
                  type="text"
                  required
                  value={newStation.address}
                  onChange={(e) => setNewStation({ ...newStation, address: e.target.value })}
                  placeholder="e.g. Near Science City Road, Sola, Ahmedabad"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:outline-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">District</label>
                  <input
                    type="text"
                    value={newStation.district}
                    onChange={(e) => setNewStation({ ...newStation, district: e.target.value })}
                    placeholder="Ahmedabad"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:outline-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Area / City</label>
                  <input
                    type="text"
                    value={newStation.city}
                    onChange={(e) => setNewStation({ ...newStation, city: e.target.value })}
                    placeholder="Science City"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:outline-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Petrol Price (₹/L) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newStation.petrolPrice}
                    onChange={(e) => setNewStation({ ...newStation, petrolPrice: parseFloat(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Diesel Price (₹/L) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newStation.dieselPrice}
                    onChange={(e) => setNewStation({ ...newStation, dieselPrice: parseFloat(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Helpline Phone</label>
                  <input
                    type="text"
                    value={newStation.phone}
                    onChange={(e) => setNewStation({ ...newStation, phone: e.target.value })}
                    placeholder="+91 79 2685 0000"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:outline-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Station Manager</label>
                  <input
                    type="text"
                    value={newStation.managerName}
                    onChange={(e) => setNewStation({ ...newStation, managerName: e.target.value })}
                    placeholder="Manager Name"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:outline-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-slate-900 py-2.5 font-bold text-white hover:bg-slate-800 transition"
                >
                  Add Station to Network
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: RETAIL FUEL STATION DEALER PARTNERSHIP INQUIRY */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase">OMC Franchisee Network</span>
                <h3 className="font-extrabold text-slate-900 text-lg">Partner Your Fuel Station with FuelUp</h3>
              </div>
              <button onClick={() => setIsPartnerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {partnerSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Partnership Request Received!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Our commercial network team is reviewing your station details. We will contact you at {partnerForm.phone} shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePartnerSubmit} className="space-y-3.5 text-xs">
                <p className="text-slate-500 leading-relaxed">
                  Are you a licensed petrol pump dealer or franchisee? Partnering with FuelUp allows your station to become a designated bowser replenishment hub, expanding your monthly volume by up to 40%.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">Dealer / Owner Name *</label>
                    <input
                      type="text"
                      required
                      value={partnerForm.dealerName}
                      onChange={(e) => setPartnerForm({ ...partnerForm, dealerName: e.target.value })}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:outline-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">Station Name *</label>
                    <input
                      type="text"
                      required
                      value={partnerForm.stationName}
                      onChange={(e) => setPartnerForm({ ...partnerForm, stationName: e.target.value })}
                      placeholder="e.g. Highway Petroleum"
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:outline-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">OMC Brand *</label>
                    <select
                      value={partnerForm.omcBrand}
                      onChange={(e) => setPartnerForm({ ...partnerForm, omcBrand: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:outline-amber-500"
                    >
                      <option value="Reliance">Reliance Petroleum</option>
                      <option value="Shell">Shell</option>
                      <option value="Nayara">Nayara Energy</option>
                      <option value="HP">HP</option>
                      <option value="IndianOil">IndianOil</option>
                      <option value="BPCL">BPCL</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">Contact Mobile *</label>
                    <input
                      type="tel"
                      required
                      value={partnerForm.phone}
                      onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:outline-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Station Address & Landmark *</label>
                  <input
                    type="text"
                    required
                    value={partnerForm.location}
                    onChange={(e) => setPartnerForm({ ...partnerForm, location: e.target.value })}
                    placeholder="e.g. Ring Road, Bodakdev, Ahmedabad"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:outline-amber-500"
                  />
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsPartnerModalOpen(false)}
                    className="flex-1 rounded-xl border border-slate-300 py-2.5 font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-slate-900 py-2.5 font-bold text-white hover:bg-slate-800 transition"
                  >
                    Submit Partnership Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
