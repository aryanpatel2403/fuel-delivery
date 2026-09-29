import React, { useState, useEffect } from 'react';
import { 
  Truck, MapPin, Phone, MessageSquare, ShieldCheck, Clock, 
  CheckCircle2, AlertCircle, Star, Fuel, Share2, ArrowRight, RefreshCw, Zap
} from 'lucide-react';
import { store } from '../services/store';
import { Order, OrderStatus } from '../types';
import { MapComponent } from '../components/MapComponent';

interface TrackOrderPageProps {
  initialOrderId?: string;
  onNavigateHome: () => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({
  initialOrderId,
  onNavigateHome
}) => {
  const [orders, setOrders] = useState<Order[]>(store.getOrders());
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    initialOrderId || orders.find(o => o.status !== 'completed' && o.status !== 'cancelled')?.id || orders[0]?.id || ''
  );
  
  // Rating modal state
  const [userRating, setUserRating] = useState<number>(5);
  const [userReview, setUserReview] = useState<string>('');
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  // Subscribe to store updates
  useEffect(() => {
    return store.subscribe(() => {
      const updatedOrders = store.getOrders();
      setOrders(updatedOrders);
    });
  }, []);

  // Update selected if initial prop changes
  useEffect(() => {
    if (initialOrderId) {
      setSelectedOrderId(initialOrderId);
    }
  }, [initialOrderId]);

  const currentOrder = orders.find(o => o.id === selectedOrderId || o.orderNumber === selectedOrderId) || orders[0];

  if (!currentOrder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-3">
          <Fuel className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Active Fuel Orders Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          All temporary sample data has been deleted and the application is connected directly to Cloud Firestore. Place a new order to track live delivery.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            onClick={onNavigateHome}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Go to Home
          </button>
          <button
            onClick={() => {
              window.location.hash = '#order';
              onNavigateHome();
            }}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
          >
            Order Fuel Delivery
          </button>
        </div>
      </div>
    );
  }

  // Calculate simulated distance and ETA
  const driverLat = currentOrder.driverLat || currentOrder.lat - 0.015;
  const driverLng = currentOrder.driverLng || currentOrder.lng - 0.015;

  const latDiff = Math.abs(currentOrder.lat - driverLat);
  const lngDiff = Math.abs(currentOrder.lng - driverLng);
  const distanceKm = Math.max(0.2, Number((Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111).toFixed(1)));
  const estimatedMins = currentOrder.status === 'completed' ? 0 : Math.max(2, Math.round(distanceKm * 2.5));

  const handleAdvanceStatus = () => {
    const sequence: OrderStatus[] = ['placed', 'confirmed', 'dispatched', 'out_for_delivery', 'arrived', 'completed'];
    const currentIndex = sequence.indexOf(currentOrder.status);
    if (currentIndex < sequence.length - 1) {
      const nextStatus = sequence[currentIndex + 1];
      store.updateOrderStatus(currentOrder.id, nextStatus, `Updated via live dispatcher`);
    }
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.submitOrderRating(currentOrder.id, userRating, userReview);
    setRatingSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Bar: Selector & Order ID Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Live Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>Real-Time GPS Tracking</span>
            {currentOrder.deliveryMode === 'sos' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-red-600 font-bold">EMERGENCY SOS DISPATCH</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Order #{currentOrder.orderNumber}
          </h1>
        </div>

        {/* Order Selector Dropdown & Quick Advance Demo Trigger */}
        <div className="flex items-center gap-3">
          <select
            value={currentOrder.id}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xs focus:outline-amber-500"
          >
            {orders.map(o => (
              <option key={o.id} value={o.id}>
                {o.orderNumber} - {o.quantityLiters}L {o.fuelType.toUpperCase()} ({o.status.replace('_', ' ')})
              </option>
            ))}
          </select>

          {/* Tester Helper Button to advance status quickly */}
          {currentOrder.status !== 'completed' && (
            <button
              onClick={handleAdvanceStatus}
              title="Fast forward delivery progression"
              className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
            >
              <Zap className="h-3.5 w-3.5 text-amber-600" />
              <span className="hidden md:inline">Advance Step</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Map & Driver, Right Timeline & Specs */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Live OpenStreetMap + Driver Details */}
        <div className="space-y-6 lg:col-span-7">
          {/* Map Container */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">
                  {currentOrder.status === 'completed'
                    ? 'Delivery Completed'
                    : currentOrder.status === 'arrived'
                    ? 'Technician on Site - Dispensing'
                    : `Bowser in Transit · ETA ${estimatedMins} Mins`}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {distanceKm > 0.3 ? `~${distanceKm} km away` : 'Reached destination'}
              </span>
            </div>

            <MapComponent
              mode="track_order"
              center={[currentOrder.lat, currentOrder.lng]}
              zoom={14}
              driverLocation={[driverLat, driverLng]}
              destinationLocation={[currentOrder.lat, currentOrder.lng]}
              driverName={currentOrder.assignedDriverName}
              driverVehicleNumber={currentOrder.driverVehicleNumber}
              className="h-80 w-full"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
              <span>Origin: {currentOrder.pumpStationName}</span>
              <span>GPS Refresh: Every 4s</span>
            </div>
          </div>

          {/* Assigned Driver Profile Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Assigned Refueling Specialist
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold text-lg">
                  {currentOrder.assignedDriverName ? currentOrder.assignedDriverName.charAt(0) : 'R'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {currentOrder.assignedDriverName || 'Ramesh Patel'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Certified Bowser Specialist · PESO Operator #{currentOrder.driverVehicleNumber || 'GJ-01-FL-9281'}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold mt-0.5">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span>4.9 (428 Deliveries)</span>
                  </div>
                </div>
              </div>

              {/* Call & Message Actions */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${currentOrder.assignedDriverPhone || '+919825044128'}`}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition"
                >
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Call Driver</span>
                </a>
                <button
                  onClick={() => alert(`Messaging ${currentOrder.assignedDriverName}: 'ETA received. Vehicle is parked near gate with hazard lights.'`)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                  <span>Message</span>
                </button>
              </div>
            </div>

            {/* Safety Protocol Note */}
            <div className="mt-5 rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>On-Site Dispensing Safety Protocol</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                1. Technician establishes a 3-meter safety cone perimeter. <br />
                2. Static earthing cable is attached to your chassis prior to nozzle insertion. <br />
                3. High-precision digital flow meter displays exact volume to the second decimal.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Order Summary & Review */}
        <div className="space-y-6 lg:col-span-5">
          {/* Order Details & Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-slate-400">Delivery Destination</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{currentOrder.deliveryAddress}</p>
                <p className="text-[11px] text-slate-500">{currentOrder.city}, {currentOrder.district}</p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase ${
                currentOrder.status === 'completed'
                  ? 'bg-emerald-50 text-emerald-700'
                  : currentOrder.deliveryMode === 'sos'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                {currentOrder.status.replace('_', ' ')}
              </span>
            </div>

            {/* Fuel & Vehicle Specs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-slate-400">Fuel & Quantity</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {currentOrder.quantityLiters}L {currentOrder.fuelType.toUpperCase()}
                </p>
                <p className="text-[11px] text-slate-500">₹{currentOrder.pricePerLiter}/L</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-slate-400">Vehicle Target</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {currentOrder.vehicleDetails?.brand || 'Car'} {currentOrder.vehicleDetails?.model || ''}
                </p>
                <p className="text-[11px] font-mono text-slate-500 uppercase">
                  {currentOrder.vehicleDetails?.regNumber || 'GJ-01-ER-8842'}
                </p>
              </div>
            </div>

            {/* Payment & Amount */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-500">Payment: </span>
                <span className="font-bold text-slate-800 uppercase">{currentOrder.paymentMethod}</span>
                <span className="text-emerald-600 font-semibold ml-1.5">({currentOrder.paymentStatus})</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Total: </span>
                <span className="text-base font-extrabold text-amber-600 tabular-nums">
                  ₹{currentOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Real-Time Status Timeline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Delivery Milestones
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {currentOrder.timeline.map((item, idx) => {
                const isCurrent = currentOrder.status === item.status;
                const isDone = item.completed;

                return (
                  <div key={idx} className="relative group">
                    {/* Circle icon */}
                    <div className={`absolute -left-6 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white transition ${
                      isDone
                        ? 'border-emerald-500 text-emerald-600'
                        : isCurrent
                        ? 'border-amber-500 bg-amber-500 text-white animate-pulse'
                        : 'border-slate-300 text-transparent'
                    }`}>
                      {isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold ${isDone || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                          {item.label}
                        </p>
                        {item.timestamp && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      {item.note && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.note}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rating Submission Card (Visible when Completed or to rate active) */}
          {(currentOrder.status === 'completed' || currentOrder.rating) && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {currentOrder.rating || ratingSubmitted ? 'Your Delivery Rating' : 'Rate Your Delivery Experience'}
                </h4>
              </div>

              {currentOrder.rating || ratingSubmitted ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= (currentOrder.rating || userRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-2">
                      {currentOrder.rating || userRating} / 5 Stars
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    "{currentOrder.review || userReview || 'Great zero-spill delivery service.'}"
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRatingSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setUserRating(star)}
                        className="focus:outline-hidden"
                      >
                        <Star
                          className={`h-6 w-6 transition ${
                            star <= userRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    placeholder="How was the driver, meter accuracy, and safety perimeter?"
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800"
                  />

                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Submit Verified Review
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
