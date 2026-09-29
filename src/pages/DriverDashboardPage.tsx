import React, { useState, useEffect } from 'react';
import { 
  Truck, Navigation, CheckCircle, Phone, MapPin, 
  Fuel, ShieldCheck, AlertCircle, Play, Check, ChevronRight, Zap
} from 'lucide-react';
import { store } from '../services/store';
import { Order, OrderStatus } from '../types';
import { MapComponent } from '../components/MapComponent';

interface DriverDashboardPageProps {
  onTrackOrder: (orderId: string) => void;
}

export const DriverDashboardPage: React.FC<DriverDashboardPageProps> = ({ onTrackOrder }) => {
  const driver = store.getDrivers()[0]; // Default demo driver Ramesh Patel
  const [orders, setOrders] = useState<Order[]>(store.getOrders());
  const [isDriveSimulating, setIsDriveSimulating] = useState(false);

  useEffect(() => {
    return store.subscribe(() => {
      setOrders(store.getOrders());
    });
  }, []);

  const activeDriverOrders = orders.filter(
    o => o.assignedDriverId === driver.id && o.status !== 'completed' && o.status !== 'cancelled'
  );
  const completedDriverOrders = orders.filter(
    o => o.assignedDriverId === driver.id && o.status === 'completed'
  );

  const currentTask = activeDriverOrders[0];

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    store.updateOrderStatus(orderId, nextStatus, `Updated by driver ${driver.name}`);
  };

  const handleSimulateGPSMove = () => {
    if (!currentTask) return;
    setIsDriveSimulating(true);

    // Simulate 3 rapid position steps towards destination
    let stepCount = 0;
    const interval = setInterval(() => {
      stepCount++;
      const currentOrders = store.getOrders();
      const targetOrder = currentOrders.find(o => o.id === currentTask.id);
      if (!targetOrder || stepCount > 4) {
        clearInterval(interval);
        setIsDriveSimulating(false);
        return;
      }

      const dLat = targetOrder.lat - (targetOrder.driverLat || targetOrder.lat - 0.01);
      const dLng = targetOrder.lng - (targetOrder.driverLng || targetOrder.lng - 0.01);

      const nextLat = (targetOrder.driverLat || targetOrder.lat - 0.01) + dLat * 0.25;
      const nextLng = (targetOrder.driverLng || targetOrder.lng - 0.01) + dLng * 0.25;

      store.updateOrderStatus(targetOrder.id, 'out_for_delivery', 'Live GPS broadcasting');
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Driver Header & Duty Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold text-lg">
            <Truck className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-0.5">
              <span>Driver Console</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-700">{driver.vehicleNumber}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-600 font-bold">ON DUTY</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {driver.name}
            </h1>
          </div>
        </div>

        {/* Bowser Fuel Tank Gauges */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
          <div className="text-xs">
            <p className="text-slate-400 font-medium">Bowser Payload</p>
            <div className="flex items-center gap-3 mt-1 font-semibold">
              <span className="text-amber-700">Petrol: {driver.currentFuelPayload.petrolLiters}L</span>
              <span className="text-slate-300">|</span>
              <span className="text-blue-700">Diesel: {driver.currentFuelPayload.dieselLiters}L</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Task or Waiting Screen */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Active Delivery Task Operations */}
        <div className="space-y-6 lg:col-span-7">
          {currentTask ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Active Task #{currentTask.orderNumber}</span>
                    {currentTask.deliveryMode === 'sos' && (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-700 animate-pulse">
                        EMERGENCY SOS
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Assigned from {currentTask.pumpStationName}</p>
                </div>

                <span className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 uppercase">
                  {currentTask.status.replace('_', ' ')}
                </span>
              </div>

              {/* Delivery Address & Customer */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Destination Address</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{currentTask.deliveryAddress}</p>
                  <p className="text-slate-500">{currentTask.city}, {currentTask.district}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Customer Contact</span>
                    <p className="font-bold text-slate-900 mt-0.5">{currentTask.customerName}</p>
                    <a
                      href={`tel:${currentTask.customerPhone}`}
                      className="text-emerald-600 font-semibold hover:underline mt-0.5 inline-block"
                    >
                      {currentTask.customerPhone}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Fuel & Volume</span>
                    <p className="font-extrabold text-amber-600 mt-0.5">
                      {currentTask.quantityLiters}L {currentTask.fuelType.toUpperCase()}
                    </p>
                    <p className="text-slate-500">Collect: ₹{currentTask.totalAmount.toFixed(2)} ({currentTask.paymentMethod.toUpperCase()})</p>
                  </div>
                </div>

                {currentTask.notes && (
                  <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                    <span className="font-semibold">Note from Customer: </span>
                    <span>{currentTask.notes}</span>
                  </div>
                )}
              </div>

              {/* Operational Action Workflow Buttons */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Update Delivery Progression
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {currentTask.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(currentTask.id, 'dispatched')}
                      className="col-span-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition"
                    >
                      1. Mark Bowser Dispatched from Station
                    </button>
                  )}

                  {currentTask.status === 'dispatched' && (
                    <button
                      onClick={() => handleUpdateStatus(currentTask.id, 'out_for_delivery')}
                      className="col-span-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
                    >
                      2. Start Navigation & Broadcast Live GPS
                    </button>
                  )}

                  {currentTask.status === 'out_for_delivery' && (
                    <>
                      <button
                        onClick={handleSimulateGPSMove}
                        disabled={isDriveSimulating}
                        className="rounded-xl border border-amber-300 bg-amber-50 py-3 text-xs font-bold text-amber-900 hover:bg-amber-100 transition flex items-center justify-center gap-1.5"
                      >
                        <Zap className="h-4 w-4 text-amber-600" />
                        <span>{isDriveSimulating ? 'Driving on Map...' : 'Simulate GPS Driving'}</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(currentTask.id, 'arrived')}
                        className="rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 transition"
                      >
                        3. Arrived & Safety Cones Placed
                      </button>
                    </>
                  )}

                  {currentTask.status === 'arrived' && (
                    <button
                      onClick={() => handleUpdateStatus(currentTask.id, 'completed')}
                      className="col-span-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition"
                    >
                      4. Fuel Dispensed Safely & Complete Task
                    </button>
                  )}

                  {currentTask.status === 'completed' && (
                    <div className="col-span-2 rounded-xl bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-800">
                      Task Completed Successfully!
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 text-xs">
                  <button
                    onClick={() => onTrackOrder(currentTask.id)}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    View Customer Real-time Map
                  </button>
                  <span className="text-slate-400">PESO Standard Compliance</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
              <h3 className="mt-3 text-lg font-bold text-slate-900">All Assigned Deliveries Complete</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Bowser {driver.vehicleNumber} is standing by at station hub. You will be alerted when a new order is dispatched.
              </p>
            </div>
          )}

          {/* Safety Checklist Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-800">
              Mandatory On-Site Safety Checklist
            </h4>
            <div className="space-y-2 text-slate-600">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>2 x 10kg Dry Chemical Powder (DCP) fire extinguishers unlatched</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Copper static earthing bonding clamp attached to vehicle frame</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Zero mobile phone usage within 3-meter hazardous zone</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Driver Live GPS Map & Completed Log */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Driver Route & Navigation
            </h4>
            {currentTask ? (
              <MapComponent
                mode="track_order"
                center={[currentTask.lat, currentTask.lng]}
                zoom={14}
                driverLocation={[currentTask.driverLat || currentTask.lat - 0.015, currentTask.driverLng || currentTask.lng - 0.015]}
                destinationLocation={[currentTask.lat, currentTask.lng]}
                driverName={driver.name}
                driverVehicleNumber={driver.vehicleNumber}
                className="h-72 w-full"
              />
            ) : (
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl text-xs text-slate-400">
                Map standby mode
              </div>
            )}
          </div>

          {/* Completed Deliveries History */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Completed Tasks Today ({completedDriverOrders.length})
            </h4>
            <div className="space-y-2 text-xs">
              {completedDriverOrders.slice(0, 4).map(co => (
                <div key={co.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-900">{co.orderNumber}</p>
                    <p className="text-[11px] text-slate-500">{co.deliveryAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-700">{co.quantityLiters}L {co.fuelType.toUpperCase()}</p>
                    <p className="text-[10px] text-slate-400">₹{co.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
