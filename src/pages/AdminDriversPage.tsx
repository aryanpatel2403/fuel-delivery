import React, { useState, useEffect } from 'react';
import { 
  Truck, Plus, Search, Phone, Shield, Fuel, Gauge, 
  Trash2, Edit3, X, Check, Activity, BatteryCharging, AlertCircle 
} from 'lucide-react';
import { store } from '../services/store';
import { Driver } from '../types';

export const AdminDriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>(store.getDrivers());
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // New Driver Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('GJ-01-FL-');
  const [bowserCapacity, setBowserCapacity] = useState<number>(3000);
  const [initialPetrol, setInitialPetrol] = useState<number>(1500);
  const [initialDiesel, setInitialDiesel] = useState<number>(1500);

  useEffect(() => {
    return store.subscribe(() => {
      setDrivers(store.getDrivers());
    });
  }, []);

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone.includes(searchTerm) ||
    d.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !vehicleNumber.trim()) return;

    const newDriver: Driver = {
      id: `drv-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: `${name.trim().toLowerCase().replace(/\s+/g, '.')}@fuelup.in`,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      bowserCapacityLiters: Number(bowserCapacity) || 3000,
      currentFuelPayload: {
        petrolLiters: Number(initialPetrol) || 1500,
        dieselLiters: Number(initialDiesel) || 1500
      },
      lat: 23.0375,
      lng: 72.5182,
      status: 'idle',
      rating: 5.0,
      totalDeliveries: 0
    };

    await store.addDriver(newDriver);
    setIsAddModalOpen(false);
    // Reset Form
    setName('');
    setPhone('');
    setVehicleNumber('GJ-01-FL-');
  };

  const handleUpdateStatus = async (driverId: string, newStatus: Driver['status']) => {
    await store.updateDriver(driverId, { status: newStatus });
  };

  const handleDeleteDriver = async (driverId: string, driverName: string) => {
    if (confirm(`Remove bowser driver "${driverName}" from active fleet?`)) {
      await store.deleteDriver(driverId);
    }
  };

  const onDutyCount = drivers.filter(d => d.status === 'on_duty' || d.status === 'delivering').length;
  const totalFleetCapacity = drivers.reduce((acc, d) => acc + (d.bowserCapacityLiters || 3000), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Fleet Logistics Management</span>
            <span aria-hidden="true">·</span>
            <span>Bowser Mobile Dispenser Units</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Driver & Bowser Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track certified bowser pilots, fuel payload capacities, and real-time duty dispatch.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Bowser Driver</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Fleet Units</span>
            <Truck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{drivers.length}</div>
          <div className="mt-1 text-[11px] text-slate-400">Certified mobile bowsers</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active on Duty</span>
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{onDutyCount}</div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold">Ready for instant dispatch</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Fleet Payload Capacity</span>
            <Fuel className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalFleetCapacity.toLocaleString()} L</div>
          <div className="mt-1 text-[11px] text-slate-400">PESO & ATEX Certified</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Average Pilot Rating</span>
            <span className="text-amber-500 font-bold text-xs">★ 4.9</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">4.92 / 5.0</div>
          <div className="mt-1 text-[11px] text-slate-400">Over 380+ deliveries</div>
        </div>
      </div>

      {/* Driver Cards / Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search driver by name, phone, plate..."
              className="w-full rounded-xl border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-xs focus:outline-amber-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {filteredDrivers.length} Bowser Units in Service
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDrivers.map((driver) => {
            const totalPayload = (driver.currentFuelPayload?.petrolLiters || 0) + (driver.currentFuelPayload?.dieselLiters || 0);
            const percentFilled = Math.min(100, Math.round((totalPayload / (driver.bowserCapacityLiters || 3000)) * 100));

            return (
              <div 
                key={driver.id} 
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 transition space-y-4"
              >
                {/* Driver Top Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold">
                      <Truck className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{driver.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{driver.phone}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    driver.status === 'delivering'
                      ? 'bg-amber-100 text-amber-800'
                      : driver.status === 'on_duty'
                      ? 'bg-emerald-100 text-emerald-800'
                      : driver.status === 'idle'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {driver.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Bowser Vehicle Details */}
                <div className="rounded-xl bg-slate-50 p-3.5 space-y-2.5 text-xs border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Bowser Plate</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {driver.vehicleNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tank Capacity</span>
                    <span className="font-semibold text-slate-800">
                      {driver.bowserCapacityLiters || 3000} Liters
                    </span>
                  </div>

                  {/* Fuel Gauges */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Current Payload</span>
                      <span className="font-bold text-slate-900">{totalPayload} L ({percentFilled}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden flex">
                      <div 
                        className="bg-amber-500 h-full transition-all"
                        style={{ width: `${Math.min(100, Math.round(((driver.currentFuelPayload?.petrolLiters || 0) / (driver.bowserCapacityLiters || 3000)) * 100))}%` }}
                        title={`Petrol: ${driver.currentFuelPayload?.petrolLiters || 0}L`}
                      />
                      <div 
                        className="bg-blue-600 h-full transition-all"
                        style={{ width: `${Math.min(100, Math.round(((driver.currentFuelPayload?.dieselLiters || 0) / (driver.bowserCapacityLiters || 3000)) * 100))}%` }}
                        title={`Diesel: ${driver.currentFuelPayload?.dieselLiters || 0}L`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                        Petrol: {driver.currentFuelPayload?.petrolLiters || 0}L
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 inline-block" />
                        Diesel: {driver.currentFuelPayload?.dieselLiters || 0}L
                      </span>
                    </div>
                  </div>
                </div>

                {/* Duty Status Quick Toggles */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Update Duty Status
                  </label>
                  <div className="grid grid-cols-4 gap-1 text-[11px] font-semibold text-center">
                    {(['idle', 'on_duty', 'delivering', 'offline'] as Driver['status'][]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(driver.id, st)}
                        className={`rounded-lg py-1.5 transition ${
                          driver.status === st
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st === 'on_duty' ? 'Duty' : st === 'delivering' ? 'En-route' : st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delete / Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Rating: ★ {driver.rating?.toFixed(1) || '5.0'}</span>
                  <button
                    onClick={() => handleDeleteDriver(driver.id, driver.name)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Bowser Driver Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Register Bowser Driver</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Driver Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Rajput"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs focus:outline-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Mobile Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 97123 88410"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs focus:outline-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Bowser Vehicle Plate Number</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="GJ-01-FL-7433"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs uppercase focus:outline-amber-500"
                  required
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">Bowser Payload Specifications</span>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Total Tank Capacity (Liters)</label>
                  <input
                    type="number"
                    value={bowserCapacity}
                    onChange={(e) => setBowserCapacity(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs"
                    min="500"
                    max="10000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Initial Petrol (L)</label>
                    <input
                      type="number"
                      value={initialPetrol}
                      onChange={(e) => setInitialPetrol(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Initial Diesel (L)</label>
                    <input
                      type="number"
                      value={initialDiesel}
                      onChange={(e) => setInitialDiesel(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Register Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
