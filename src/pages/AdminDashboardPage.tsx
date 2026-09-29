import React, { useState, useEffect } from 'react';
import { 
  Shield, Truck, Fuel, DollarSign, Siren, Users, 
  MapPin, CheckCircle, AlertTriangle, Edit3, Save, X, RotateCcw
} from 'lucide-react';
import { store } from '../services/store';
import { Order, FuelPumpStation, Driver, OrderStatus } from '../types';

interface AdminDashboardPageProps {
  onTrackOrder: (orderId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onTrackOrder, onNavigateTab }) => {
  const [orders, setOrders] = useState<Order[]>(store.getOrders());
  const [pumps, setPumps] = useState<FuelPumpStation[]>(store.getPumps());
  const [drivers, setDrivers] = useState<Driver[]>(store.getDrivers());

  // Editing pump price state
  const [editingPumpId, setEditingPumpId] = useState<string | null>(null);
  const [editPetrolPrice, setEditPetrolPrice] = useState<number>(0);
  const [editDieselPrice, setEditDieselPrice] = useState<number>(0);

  // Driver re-assignment modal state
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => {
      setOrders(store.getOrders());
      setPumps(store.getPumps());
      setDrivers(store.getDrivers());
    });
  }, []);

  // Compute Platform Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalLiters = orders.reduce((sum, o) => sum + o.quantityLiters, 0);
  const sosOrdersCount = orders.filter(o => o.deliveryMode === 'sos').length;
  const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;

  const handleStartEditPump = (pump: FuelPumpStation) => {
    setEditingPumpId(pump.id);
    setEditPetrolPrice(pump.petrolPrice);
    setEditDieselPrice(pump.dieselPrice);
  };

  const handleSavePumpPrice = (pumpId: string) => {
    store.updatePumpPrice(pumpId, editPetrolPrice, editDieselPrice);
    setEditingPumpId(null);
  };

  const handleTogglePump = (pumpId: string) => {
    store.togglePumpAvailability(pumpId);
  };

  const handleAssignDriver = (orderId: string, driverId: string) => {
    store.assignDriverToOrder(orderId, driverId);
    setAssigningOrderId(null);
  };

  const handlePurgeAllOrders = async () => {
    if (confirm('Permanently purge all orders from Cloud Firestore?')) {
      await store.deleteAllTemporaryData();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Admin Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Executive Operations Hub</span>
            <span aria-hidden="true">·</span>
            <span>Connected to Cloud Firestore</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Admin Management Portal
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateTab && (
            <>
              <button
                onClick={() => onNavigateTab('admin_customers')}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
              >
                <Users className="h-3.5 w-3.5 text-blue-600" />
                <span>Manage Customers</span>
              </button>
              <button
                onClick={() => onNavigateTab('admin_drivers')}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
              >
                <Truck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Manage Drivers</span>
              </button>
            </>
          )}

          <button
            onClick={handlePurgeAllOrders}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Purge All Cloud Orders</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Gross Platform Revenue</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] text-emerald-600 mt-1">₹49 per delivery fee included</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Volume Dispensed</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {totalLiters.toLocaleString()} L
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Zero spill calibration</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Active Live Dispatches</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1 tabular-nums">
            {activeOrdersCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Real-time GPS stream</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Emergency SOS Requests</p>
          <p className="text-2xl font-extrabold text-red-600 mt-1 tabular-nums">
            {sosOrdersCount}
          </p>
          <p className="text-[11px] text-red-600 mt-1">Average 18 min dispatch</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Bowser Drivers</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {drivers.length}
          </p>
          <p className="text-[11px] text-emerald-600 mt-1">All PESO certified</p>
        </div>
      </div>

      {/* Dispatch Board: Live Orders Queue */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Live Orders Dispatch Queue</h3>
            <p className="text-xs text-slate-500">Track, re-assign, and monitor deliveries across stations</p>
          </div>
          <span className="text-xs font-semibold bg-slate-100 px-3 py-1 rounded-full text-slate-700">
            {orders.length} Total Orders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Address & City</th>
                <th className="px-5 py-3 font-semibold">Fuel & Station</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Assigned Driver</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 font-bold text-slate-900 font-mono">
                    <div>{ord.orderNumber}</div>
                    {ord.deliveryMode === 'sos' && (
                      <span className="text-[10px] text-red-600 font-bold uppercase">SOS Priority</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-800">
                    <p className="font-semibold">{ord.customerName}</p>
                    <p className="text-[11px] text-slate-400">{ord.customerPhone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                    <p className="truncate">{ord.deliveryAddress}</p>
                    <p className="text-[11px] text-slate-400">{ord.city}, {ord.district}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">
                    <span className="font-bold">{ord.quantityLiters}L</span> {ord.fuelType.toUpperCase()}
                    <p className="text-[11px] text-slate-400 truncate">{ord.pumpStationName}</p>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-900 tabular-nums">
                    ₹{ord.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">
                    <p className="font-semibold">{ord.assignedDriverName || 'Unassigned'}</p>
                    <p className="text-[11px] font-mono text-slate-400">{ord.driverVehicleNumber || ''}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold capitalize ${
                      ord.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : ord.deliveryMode === 'sos'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {ord.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => onTrackOrder(ord.id)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Track
                    </button>
                    {ord.status !== 'completed' && (
                      <button
                        onClick={() => setAssigningOrderId(ord.id)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Re-assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partner Fuel Pumps & Price Override Management */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Partner Station Rates & Status</h3>
            <p className="text-xs text-slate-500">Direct integration with pump dispensing meters</p>
          </div>
          <span className="text-xs text-slate-400">Live API Synchronized</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pumps.map((pump) => {
            const isEditing = editingPumpId === pump.id;

            return (
              <div key={pump.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs truncate">{pump.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{pump.address}</p>
                  </div>
                  <button
                    onClick={() => handleTogglePump(pump.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pump.available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {pump.available ? 'ONLINE' : 'OFFLINE'}
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-2 pt-1 border-t border-slate-200 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">Petrol (₹/L):</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editPetrolPrice}
                        onChange={(e) => setEditPetrolPrice(Number(e.target.value))}
                        className="w-24 rounded border border-slate-300 bg-white p-1 text-right font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">Diesel (₹/L):</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editDieselPrice}
                        onChange={(e) => setEditDieselPrice(Number(e.target.value))}
                        className="w-24 rounded border border-slate-300 bg-white p-1 text-right font-mono"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingPumpId(null)}
                        className="rounded p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleSavePumpPrice(pump.id)}
                        className="flex items-center gap-1 rounded bg-slate-900 px-2 py-1 text-white text-[11px] font-semibold"
                      >
                        <Save className="h-3 w-3" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex gap-2">
                        <span className="text-slate-400">Petrol:</span>
                        <span className="font-bold text-slate-800 tabular-nums">₹{pump.petrolPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-slate-400">Diesel:</span>
                        <span className="font-bold text-slate-800 tabular-nums">₹{pump.dieselPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartEditPump(pump)}
                      className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit Price</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Assignment Modal */}
      {assigningOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Assign Bowser Driver</h3>
            <p className="text-xs text-slate-500">Select an active technician for this dispatch:</p>
            <div className="space-y-2">
              {drivers.map(d => (
                <button
                  key={d.id}
                  onClick={() => handleAssignDriver(assigningOrderId, d.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50 transition"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{d.name}</p>
                    <p className="text-[11px] font-mono text-slate-400">{d.vehicleNumber}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                    d.status === 'delivering' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {d.status}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setAssigningOrderId(null)}
              className="w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
