import React, { useState, useEffect } from 'react';
import { 
  Fuel, Truck, Clock, MapPin, Plus, FileText, 
  Car, ShieldCheck, ArrowUpRight, RotateCcw, ChevronRight
} from 'lucide-react';
import { store } from '../services/store';
import { Order, SavedVehicle, SavedAddress } from '../types';

interface UserDashboardPageProps {
  onTrackOrder: (orderId: string) => void;
  onNewOrder: () => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({
  onTrackOrder,
  onNewOrder
}) => {
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [orders, setOrders] = useState<Order[]>(store.getUserOrders());
  const [activeTab, setActiveTab] = useState<'orders' | 'vehicles' | 'addresses'>('orders');

  // Add vehicle modal state
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newBrand, setNewBrand] = useState('Hyundai');
  const [newModel, setNewModel] = useState('Creta');
  const [newReg, setNewReg] = useState('');
  const [newFuel, setNewFuel] = useState<'petrol' | 'diesel'>('petrol');

  useEffect(() => {
    return store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
      setOrders(store.getUserOrders());
    });
  }, []);

  // Metrics
  const totalLiters = orders.reduce((sum, o) => sum + (o.status === 'completed' ? o.quantityLiters : 0), 0);
  const totalSpent = orders.reduce((sum, o) => sum + (o.status === 'completed' ? o.totalAmount : 0), 0);
  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const newVeh: SavedVehicle = {
      id: `veh-${Date.now()}`,
      brand: newBrand,
      model: newModel,
      category: 'suv',
      fuelType: newFuel,
      tankCapacity: 50,
      regNumber: newReg.toUpperCase() || 'GJ-01-XX-0000'
    };
    const updatedVehicles = [...(currentUser?.savedVehicles || []), newVeh];
    store.updateProfile({ savedVehicles: updatedVehicles });
    setIsAddVehicleOpen(false);
    setNewReg('');
  };

  const handleDownloadInvoice = (order: Order) => {
    // Generate text invoice simulation
    const invoiceText = `
========================================
           FUELUP LOGISTICS
      PESO License: #G18/FUP/99120
========================================
Order Ref: ${order.orderNumber}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Customer: ${order.customerName}
Phone: ${order.customerPhone}
Delivery At: ${order.deliveryAddress}

Station: ${order.pumpStationName}
Fuel Type: ${order.fuelType.toUpperCase()}
Quantity: ${order.quantityLiters} Liters
Rate: Rs. ${order.pricePerLiter} / Liter
Fuel Amount: Rs. ${order.fuelAmount.toFixed(2)}
Delivery Fee: Rs. ${order.deliveryFee.toFixed(2)}
Emergency Fee: Rs. ${order.emergencyFee.toFixed(2)}
----------------------------------------
TOTAL PAID: Rs. ${order.totalAmount.toFixed(2)}
Payment Method: ${order.paymentMethod.toUpperCase()} (${order.paymentStatus})
Technician: ${order.assignedDriverName || 'Ramesh Patel'} (${order.driverVehicleNumber || 'GJ-01-FL-9281'})
========================================
   Thank you for choosing FuelUp!
`;
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${order.orderNumber}.txt`;
    a.click();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Customer Portal</span>
            <span aria-hidden="true">·</span>
            <span>Account ID: {currentUser?.id || 'Guest'}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Welcome, {currentUser?.name || 'Customer'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{currentUser?.email || ''} {currentUser?.phone ? `· ${currentUser.phone}` : ''}</p>
        </div>

        <button
          onClick={onNewOrder}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
        >
          <Fuel className="h-4 w-4 text-amber-400" />
          <span>Order New Refuel</span>
        </button>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Active Deliveries</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1 tabular-nums">{activeOrders.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Live tracking active</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Completed Orders</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{orders.length}</p>
          <p className="text-[11px] text-emerald-600 mt-1">100% On-time delivery</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Fuel Delivered</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{totalLiters} L</p>
          <p className="text-[11px] text-slate-400 mt-1">Certified flow meters</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Fuel Spend</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            ₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Zero pump waiting time</p>
        </div>
      </div>

      {/* Active Deliveries Banner if any */}
      {activeOrders.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                In-Progress Delivery Active
              </h3>
            </div>
            <span className="text-xs text-amber-800 font-medium">GPS Dispatching</span>
          </div>

          {activeOrders.map(ao => (
            <div
              key={ao.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white p-4 border border-amber-200 shadow-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{ao.orderNumber}</span>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    {ao.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {ao.quantityLiters}L {ao.fuelType.toUpperCase()} · Destination: {ao.deliveryAddress}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Assigned Bowser: {ao.assignedDriverName} ({ao.driverVehicleNumber})
                </p>
              </div>

              <button
                onClick={() => onTrackOrder(ao.id)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-amber-400 transition"
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Track Bowser Live</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sub Tabs: Orders, Vehicles, Addresses */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-1 transition border-b-2 ${
              activeTab === 'orders' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Order History ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`pb-3 px-1 transition border-b-2 ${
              activeTab === 'vehicles' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Saved Vehicles ({currentUser?.savedVehicles?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 px-1 transition border-b-2 ${
              activeTab === 'addresses' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Saved Delivery Locations ({currentUser?.savedAddresses?.length || 0})
          </button>
        </div>

        {/* Tab 1: Orders History Table */}
        {activeTab === 'orders' && (
          orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <Fuel className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-900">No Orders in Database</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All temporary dummy data has been removed. Connected live to Cloud Firestore. Place your first fuel delivery order!
              </p>
              <button
                onClick={onNewOrder}
                className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
              >
                Order Fuel Now
              </button>
            </div>
          ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Order Ref</th>
                    <th className="px-5 py-3.5 font-semibold">Date & Type</th>
                    <th className="px-5 py-3.5 font-semibold">Fuel & Volume</th>
                    <th className="px-5 py-3.5 font-semibold">Partner Station</th>
                    <th className="px-5 py-3.5 font-semibold">Total Paid</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5 font-bold text-slate-900 font-mono">
                        {ord.orderNumber}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        <div>{new Date(ord.createdAt).toLocaleDateString()}</div>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">
                          {ord.deliveryMode}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">
                        <span className="font-semibold">{ord.quantityLiters}L</span>
                        <span className="text-slate-400 ml-1">({ord.fuelType.toUpperCase()})</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 truncate max-w-xs">
                        {ord.pumpStationName}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 tabular-nums">
                        ₹{ord.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize ${
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
                        <button
                          onClick={() => handleDownloadInvoice(ord)}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                          title="Download Text Invoice"
                        >
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Tab 2: Saved Vehicles */}
        {activeTab === 'vehicles' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-500">Your registered vehicles with calibrated tank capacities</p>
              <button
                onClick={() => setIsAddVehicleOpen(true)}
                className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Vehicle</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(currentUser?.savedVehicles || []).map((veh) => (
                <div key={veh.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{veh.brand} {veh.model}</span>
                    <span className="text-[11px] font-mono text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                      {veh.regNumber}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fuel Type:</span>
                      <span className="font-semibold capitalize">{veh.fuelType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tank Capacity:</span>
                      <span className="font-bold text-amber-600 tabular-nums">{veh.tankCapacity} Liters</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Vehicle Modal */}
            {isAddVehicleOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Add New Vehicle</h3>
                  <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-600 block mb-1">Brand</label>
                      <input
                        type="text"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Model</label>
                      <input
                        type="text"
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Registration Plate</label>
                      <input
                        type="text"
                        value={newReg}
                        onChange={(e) => setNewReg(e.target.value)}
                        placeholder="GJ-01-AB-1234"
                        className="w-full rounded-lg border border-slate-300 p-2 font-mono uppercase"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Fuel Type</label>
                      <select
                        value={newFuel}
                        onChange={(e) => setNewFuel(e.target.value as 'petrol' | 'diesel')}
                        className="w-full rounded-lg border border-slate-300 p-2"
                      >
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddVehicleOpen(false)}
                        className="flex-1 rounded-lg border border-slate-200 py-2 text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 rounded-lg bg-slate-900 py-2 font-bold text-white"
                      >
                        Save Vehicle
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(currentUser?.savedAddresses || []).map((addr) => (
              <div key={addr.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-600" />
                  <span className="font-bold text-slate-900 text-sm">{addr.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{addr.address}</p>
                <p className="text-[11px] text-slate-400">{addr.city}, {addr.district}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
