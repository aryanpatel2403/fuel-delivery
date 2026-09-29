import React, { useState, useEffect } from 'react';
import { 
  Fuel, Siren, Clock, MapPin, Navigation, Calendar, 
  Car, ShieldAlert, Check, ArrowRight, Info, AlertTriangle
} from 'lucide-react';
import { store } from '../services/store';
import { FuelPumpStation, FuelType, DeliveryMode, PaymentMethod, VehicleCategory } from '../types';
import { GUJARAT_DISTRICTS, VEHICLE_DATABASE } from '../data/mockData';
import { MapComponent } from '../components/MapComponent';
import { GPayModal } from '../components/GPayModal';

interface OrderFuelPageProps {
  initialMode?: DeliveryMode;
  onOrderPlaced: (orderId: string) => void;
}

export const OrderFuelPage: React.FC<OrderFuelPageProps> = ({
  initialMode = 'instant',
  onOrderPlaced
}) => {
  const currentUser = store.getCurrentUser();
  const pumps = store.getPumps();

  // Order configuration state
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(initialMode);
  const [fuelType, setFuelType] = useState<FuelType>('petrol');
  const [selectedPumpId, setSelectedPumpId] = useState<string>(pumps[0]?.id || 'pump-1');
  
  // Location & Address
  const [district, setDistrict] = useState<string>('Ahmedabad');
  const [city, setCity] = useState<string>('Bodakdev');
  const [address, setAddress] = useState<string>(currentUser?.savedAddresses?.[0]?.address || 'Near ISKCON Cross Road, Bodakdev');
  const [coordinates, setCoordinates] = useState<[number, number]>([
    currentUser?.savedAddresses?.[0]?.lat || 23.0375,
    currentUser?.savedAddresses?.[0]?.lng || 72.5182
  ]);

  // Quantity & Vehicle Lookup State
  const [quantityMode, setQuantityMode] = useState<'liters' | 'fill_tank'>('fill_tank');
  const [manualLiters, setManualLiters] = useState<number>(30);
  
  // Smart Vehicle Lookup
  const [selectedBrand, setSelectedBrand] = useState<string>('Tata');
  const [selectedModel, setSelectedModel] = useState<string>('Nexon');
  const [regNumber, setRegNumber] = useState<string>('GJ-01-ER-8842');
  const [currentLevelPercent, setCurrentLevelPercent] = useState<number>(25);

  // Scheduling
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState<string>('08:00 AM - 10:00 AM');

  // Customer Contact & Notes
  const [customerName, setCustomerName] = useState<string>(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(currentUser?.phone || '');
  const [notes, setNotes] = useState<string>(initialMode === 'sos' ? 'Stranded with empty tank on road shoulder' : '');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gpay');
  const [isGPayModalOpen, setIsGPayModalOpen] = useState(false);
  const [createdOrderRef, setCreatedOrderRef] = useState<string>('');

  // Selected Pump Data
  const selectedPump = pumps.find(p => p.id === selectedPumpId) || pumps[0];
  const pricePerLiter = fuelType === 'petrol' ? selectedPump.petrolPrice : selectedPump.dieselPrice;

  // Available brands in database
  const availableBrands = Array.from(new Set(VEHICLE_DATABASE.map(v => v.brand)));
  // Filtered models for selected brand
  const brandModels = VEHICLE_DATABASE.filter(v => v.brand === selectedBrand);
  const currentVehicleModel = brandModels.find(m => m.model === selectedModel) || brandModels[0];

  // Calculate needed fuel liters
  const calculatedLiters = quantityMode === 'liters' 
    ? manualLiters 
    : Number((currentVehicleModel.tankCapacityLiters * ((100 - currentLevelPercent) / 100)).toFixed(1));

  const fuelCost = Number((calculatedLiters * pricePerLiter).toFixed(2));
  const deliveryFee = 49.00;
  const emergencyFee = deliveryMode === 'sos' ? 149.00 : 0;
  const totalAmount = Number((fuelCost + deliveryFee + emergencyFee).toFixed(2));

  // Sync mode if prop changes
  useEffect(() => {
    if (initialMode) {
      setDeliveryMode(initialMode);
      if (initialMode === 'sos' && !notes) {
        setNotes('Emergency SOS: Stranded vehicle. Please dispatch closest bowser.');
      }
    }
  }, [initialMode]);

  // When model changes, update fuel type if model doesn't support current fuel
  useEffect(() => {
    if (currentVehicleModel && !currentVehicleModel.supportedFuels.includes(fuelType)) {
      setFuelType(currentVehicleModel.defaultFuel);
    }
  }, [selectedModel]);

  // Geolocation trigger
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoordinates([lat, lng]);
          setAddress(`GPS Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (Current Location)`);
        },
        () => {
          alert('Could not retrieve device location. Using map coordinates.');
        }
      );
    }
  };

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setCoordinates([lat, lng]);
    setAddress(`Pinned Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  const handleCreateOrder = async (isGPaySuccess = false) => {
    const order = await store.createOrder({
      customerName,
      customerPhone,
      deliveryAddress: address,
      district,
      city,
      lat: coordinates[0],
      lng: coordinates[1],
      pumpStationId: selectedPump.id,
      fuelType,
      quantityMode,
      quantityLiters: calculatedLiters,
      deliveryMode,
      scheduledDateTime: deliveryMode === 'scheduled' ? `${scheduledDate} ${scheduledTimeSlot}` : undefined,
      paymentMethod,
      vehicleDetails: {
        brand: selectedBrand,
        model: selectedModel,
        regNumber,
        currentFuelLevelPercent: quantityMode === 'fill_tank' ? currentLevelPercent : undefined
      },
      notes
    });

    if (paymentMethod === 'gpay' && !isGPaySuccess) {
      setCreatedOrderRef(order.orderNumber);
      setIsGPayModalOpen(true);
      return;
    }

    onOrderPlaced(order.id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Title & Mode Switcher */}
      <div className="mb-8 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Direct Fuel Dispenser</span>
            <span aria-hidden="true">·</span>
            <span>Doorstep Delivery</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Order Fuel Delivery
          </h1>
        </div>

        {/* Delivery Mode Tabs */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-100 p-1.5 max-w-xl">
          <button
            onClick={() => setDeliveryMode('instant')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs font-semibold transition ${
              deliveryMode === 'instant' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="h-4 w-4 text-amber-600" />
            <span>Instant Delivery (~30m)</span>
          </button>

          <button
            onClick={() => setDeliveryMode('scheduled')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs font-semibold transition ${
              deliveryMode === 'scheduled' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>Schedule Delivery</span>
          </button>

          <button
            onClick={() => setDeliveryMode('sos')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs font-bold transition ${
              deliveryMode === 'sos' ? 'bg-red-600 text-white shadow-xs' : 'text-red-700 hover:bg-red-50'
            }`}
          >
            <Siren className="h-4 w-4 animate-pulse" />
            <span>Emergency SOS</span>
          </button>
        </div>

        {/* SOS Alert Notice Banner if in SOS mode */}
        {deliveryMode === 'sos' && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-900 shadow-xs">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Emergency Roadside Fuel Protocol Active</h4>
                <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                  Your order is tagged with <b>Highest Dispatch Priority</b>. Our closest emergency bowser is alerted immediately. Please keep vehicle hazard lights ON and stand safely on the footpath or road shoulder.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Form Left, Map & Summary Right */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Configuration Forms */}
        <div className="space-y-8 lg:col-span-7">
          {/* Section 1: Fuel Selection */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              1. Select Fuel Type & Quantity
            </h3>

            {/* Fuel Type Toggle */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFuelType('petrol')}
                className={`rounded-xl border p-4 text-left transition ${
                  fuelType === 'petrol'
                    ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Petrol (MS)</span>
                  {fuelType === 'petrol' && <Check className="h-4 w-4 text-amber-600" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">Motor Spirit 91 Octane</p>
                <p className="text-base font-extrabold text-amber-700 mt-2 tabular-nums">
                  ₹{selectedPump.petrolPrice.toFixed(2)} / Liter
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFuelType('diesel')}
                className={`rounded-xl border p-4 text-left transition ${
                  fuelType === 'diesel'
                    ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Diesel (HSD)</span>
                  {fuelType === 'diesel' && <Check className="h-4 w-4 text-amber-600" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">High Speed Euro-VI Diesel</p>
                <p className="text-base font-extrabold text-amber-700 mt-2 tabular-nums">
                  ₹{selectedPump.dieselPrice.toFixed(2)} / Liter
                </p>
              </button>
            </div>

            {/* Quantity Mode Switcher: Liters vs Fill Tank */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700">Quantity Mode</span>
                <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setQuantityMode('fill_tank')}
                    className={`rounded-md px-3 py-1 font-semibold transition ${
                      quantityMode === 'fill_tank' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    🚗 Smart Fill Tank
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantityMode('liters')}
                    className={`rounded-md px-3 py-1 font-semibold transition ${
                      quantityMode === 'liters' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    ⛽ By Exact Liters
                  </button>
                </div>
              </div>

              {/* Mode A: Smart Vehicle Tank Lookup */}
              {quantityMode === 'fill_tank' ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Car className="h-4 w-4 text-amber-600" />
                    <span>Vehicle Tank Capacity Lookup</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Make / Brand</label>
                      <select
                        value={selectedBrand}
                        onChange={(e) => {
                          setSelectedBrand(e.target.value);
                          const firstModel = VEHICLE_DATABASE.find(v => v.brand === e.target.value)?.model || '';
                          setSelectedModel(firstModel);
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-amber-500"
                      >
                        {availableBrands.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Vehicle Model</label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-amber-500"
                      >
                        {brandModels.map(m => (
                          <option key={m.model} value={m.model}>
                            {m.model} ({m.tankCapacityLiters}L capacity)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Current Tank Level Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-700 mb-1">
                      <span>Current Fuel Gauge Estimate:</span>
                      <span className="font-semibold text-amber-700">
                        {currentLevelPercent === 0 ? 'Empty (~0%)' : currentLevelPercent === 25 ? 'Quarter (~25%)' : currentLevelPercent === 50 ? 'Half (~50%)' : `${currentLevelPercent}%`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="75"
                      step="25"
                      value={currentLevelPercent}
                      onChange={(e) => setCurrentLevelPercent(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>Reserve / Empty</span>
                      <span>1/4th Tank</span>
                      <span>Half Tank</span>
                      <span>3/4th Tank</span>
                    </div>
                  </div>

                  {/* Vehicle summary chip */}
                  <div className="flex items-center justify-between rounded-lg bg-amber-50/80 px-3.5 py-2 border border-amber-200/80 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{selectedBrand} {selectedModel}</span>
                      <span className="text-slate-500 ml-2">Total Tank: {currentVehicleModel.tankCapacityLiters}L</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500">Auto-calculated: </span>
                      <span className="font-extrabold text-amber-700 text-sm">{calculatedLiters} Liters</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mode B: Manual Liters Slider */
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Desired Liters</span>
                    <span className="text-amber-600 font-bold text-sm tabular-nums">{manualLiters} Liters</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="1"
                    value={manualLiters}
                    onChange={(e) => setManualLiters(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[10, 20, 35, 45, 60].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setManualLiters(val)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                          manualLiters === val ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {val}L
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Delivery Location & District */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                2. Delivery Location
              </h3>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Use GPS Location</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Gujarat District</label>
                <select
                  value={district}
                  onChange={(e) => {
                    const newDist = e.target.value;
                    setDistrict(newDist);
                    const firstCity = GUJARAT_DISTRICTS[newDist]?.[0] || 'Center';
                    setCity(firstCity);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-amber-500"
                >
                  {Object.keys(GUJARAT_DISTRICTS).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">City / Locality Area</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-amber-500"
                >
                  {(GUJARAT_DISTRICTS[district] || []).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Detailed Delivery Address / Landmark / Highway KM
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/Office No, Building Name, Street, Landmark or Highway Shoulder KM"
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:outline-amber-500"
              />
            </div>
          </div>

          {/* Section 3: Scheduling (If Scheduled Delivery chosen) */}
          {deliveryMode === 'scheduled' && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-900">
                3. Schedule Delivery Window (Up to 7 Days Ahead)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-blue-950 block mb-1">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-blue-950 block mb-1">Preferred Time Window</label>
                  <select
                    value={scheduledTimeSlot}
                    onChange={(e) => setScheduledTimeSlot(e.target.value)}
                    className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs text-slate-800"
                  >
                    <option>06:00 AM - 08:00 AM (Early Commute)</option>
                    <option>08:00 AM - 10:00 AM</option>
                    <option>12:00 PM - 02:00 PM (Midday Refuel)</option>
                    <option>04:00 PM - 06:00 PM</option>
                    <option>08:00 PM - 10:00 PM (Night Parked)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Contact & Instructions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              {deliveryMode === 'scheduled' ? '4.' : '3.'} Contact Details & Safety Notes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Mobile Number (For Bowser ETA)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Vehicle Registration No & Special Dispatch Instructions
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. GJ-01-AB-1234"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 font-mono uppercase"
                />
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Gate code, parking slot, hazard note..."
                  className="sm:col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Map Selection & Price Summary */}
        <div className="space-y-6 lg:col-span-5">
          {/* Interactive Station & Delivery Pin Map */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Select Partner Station & Pin
                </h4>
                <p className="text-[11px] text-slate-500">Click map to adjust delivery point</p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                6 Nearby Pumps
              </span>
            </div>

            <MapComponent
              mode="select_location"
              center={coordinates}
              zoom={13}
              pumps={pumps}
              selectedPumpId={selectedPumpId}
              onSelectPump={(p) => setSelectedPumpId(p.id)}
              selectedLocation={coordinates}
              onSelectLocation={handleMapLocationSelect}
              className="h-64 w-full"
            />

            {/* Selected Pump Card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{selectedPump.name}</span>
                <span className="text-emerald-700 font-semibold">★ {selectedPump.rating}</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{selectedPump.address}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                <span className="text-slate-600">Rate for {fuelType.toUpperCase()}:</span>
                <span className="font-bold text-slate-900">₹{pricePerLiter.toFixed(2)} / L</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector & Order Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Payment Method & Breakdown
            </h4>

            {/* Payment Options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('gpay')}
                className={`rounded-xl border p-3 text-left transition flex items-center gap-2.5 ${
                  paymentMethod === 'gpay'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shrink-0">
                  G
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Google Pay</p>
                  <p className="text-[10px] text-slate-500">Instant UPI QR</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`rounded-xl border p-3 text-left transition flex items-center gap-2.5 ${
                  paymentMethod === 'cod'
                    ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-white font-bold text-xs shrink-0">
                  ₹
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Pay on Delivery</p>
                  <p className="text-[10px] text-slate-500">Cash / Bowser POS</p>
                </div>
              </button>
            </div>

            {/* Bill Details */}
            <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{calculatedLiters}L {fuelType.toUpperCase()} @ ₹{pricePerLiter.toFixed(2)}/L</span>
                <span className="font-semibold text-slate-800 tabular-nums">₹{fuelCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Standard Doorstep Delivery</span>
                <span className="font-semibold text-slate-800 tabular-nums">₹{deliveryFee.toFixed(2)}</span>
              </div>
              {deliveryMode === 'sos' && (
                <div className="flex justify-between text-red-600 font-medium">
                  <span>🚨 Emergency SOS Rapid Surcharge</span>
                  <span className="font-bold tabular-nums">₹{emergencyFee.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total Amount</span>
                <span className="text-amber-600 tabular-nums">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => handleCreateOrder(false)}
              className={`w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-sm transition flex items-center justify-center gap-2 ${
                deliveryMode === 'sos'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {deliveryMode === 'sos' ? (
                <>
                  <Siren className="h-4 w-4" />
                  <span>Dispatch Emergency SOS Bowser</span>
                </>
              ) : (
                <>
                  <span>Confirm Order ({calculatedLiters}L {fuelType.toUpperCase()})</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 text-center">
              PESO Licensed Dispensing · Anti-Static Grounding Verified
            </p>
          </div>
        </div>
      </div>

      {/* Google Pay Simulation Modal */}
      <GPayModal
        isOpen={isGPayModalOpen}
        amount={totalAmount}
        orderNumber={createdOrderRef}
        onSuccess={() => {
          setIsGPayModalOpen(false);
          const lastOrder = store.getOrders()[0];
          if (lastOrder) onOrderPlaced(lastOrder.id);
        }}
        onCancel={() => setIsGPayModalOpen(false)}
      />
    </div>
  );
};
