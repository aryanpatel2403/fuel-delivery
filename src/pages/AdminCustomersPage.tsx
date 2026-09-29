import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Phone, Mail, Car, MapPin, 
  Trash2, Edit3, X, Check, Shield, AlertCircle, Fuel 
} from 'lucide-react';
import { store } from '../services/store';
import { User } from '../types';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>(store.getCustomers());
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  // New Customer Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('Ahmedabad');
  const [newVehicleBrand, setNewVehicleBrand] = useState('Tata');
  const [newVehicleModel, setNewVehicleModel] = useState('Nexon');
  const [newVehicleReg, setNewVehicleReg] = useState('GJ-01-XX-9900');
  const [newVehicleFuel, setNewVehicleFuel] = useState<'petrol' | 'diesel'>('petrol');

  useEffect(() => {
    return store.subscribe(() => {
      setCustomers(store.getCustomers());
    });
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newCust: User = {
      id: `usr-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || '+91 98791 23456',
      role: 'customer',
      savedVehicles: [
        {
          id: `veh-${Date.now()}`,
          brand: newVehicleBrand,
          model: newVehicleModel,
          category: 'suv',
          fuelType: newVehicleFuel,
          tankCapacity: 45,
          regNumber: newVehicleReg.toUpperCase()
        }
      ],
      savedAddresses: [
        {
          id: `addr-${Date.now()}`,
          title: 'Primary Location',
          address: `Main Ring Road, ${newCity}`,
          district: 'Ahmedabad',
          city: newCity,
          lat: 23.0375,
          lng: 72.5182
        }
      ]
    };

    await store.addCustomer(newCust);
    setIsAddModalOpen(false);
    // Reset Form
    setNewName('');
    setNewEmail('');
    setNewPhone('');
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove customer "${name}" from Cloud Firestore?`)) {
      await store.deleteCustomer(id);
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Administration Console</span>
            <span aria-hidden="true">·</span>
            <span>Cloud Firestore Directory</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Customer Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor registered vehicle owners, doorstep delivery addresses, and fleet accounts.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Customers</span>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{customers.length}</div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold">Live in Cloud Database</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Registered Vehicles</span>
            <Car className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {customers.reduce((acc, c) => acc + (c.savedVehicles?.length || 0), 0)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Cars, SUVs & commercial fleets</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Saved Geo-Pins</span>
            <MapPin className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {customers.reduce((acc, c) => acc + (c.savedAddresses?.length || 0), 0)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Doorstep delivery points</div>
        </div>
      </div>

      {/* Search & Directory Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full rounded-xl border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-xs focus:outline-amber-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredCustomers.length} of {customers.length} registered customers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Customer Name</th>
                <th className="px-5 py-3.5 font-semibold">Contact Info</th>
                <th className="px-5 py-3.5 font-semibold">Vehicles</th>
                <th className="px-5 py-3.5 font-semibold">Default Address</th>
                <th className="px-5 py-3.5 font-semibold">Account Role</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800 font-bold uppercase text-[11px]">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <div>{cust.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{cust.id}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-slate-600">
                    <div>{cust.email}</div>
                    <div className="text-slate-400 text-[11px]">{cust.phone}</div>
                  </td>

                  <td className="px-5 py-3.5 text-slate-700">
                    {cust.savedVehicles && cust.savedVehicles.length > 0 ? (
                      <div>
                        <span className="font-semibold text-slate-900">
                          {cust.savedVehicles[0].brand} {cust.savedVehicles[0].model}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {cust.savedVehicles[0].regNumber}
                        </div>
                        {cust.savedVehicles.length > 1 && (
                          <span className="text-[10px] text-amber-600 font-bold">
                            +{cust.savedVehicles.length - 1} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No vehicles</span>
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                    {cust.savedAddresses?.[0]?.address || cust.savedAddresses?.[0]?.city || 'Ahmedabad Metro'}
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
                      {cust.role}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      View Fleet
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(cust.id, cust.name)}
                      className="text-xs font-semibold text-red-600 hover:text-red-800"
                      title="Delete Customer Account"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Fleet Details Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-500">{selectedCustomer.email} · {selectedCustomer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Registered Vehicles ({selectedCustomer.savedVehicles?.length || 0})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedCustomer.savedVehicles?.map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{v.brand} {v.model}</div>
                      <div className="text-[11px] text-slate-500">Reg: {v.regNumber} · Fuel: {v.fuelType.toUpperCase()}</div>
                    </div>
                    <span className="rounded-md bg-white px-2 py-1 font-mono font-bold text-slate-700 border border-slate-200">
                      {v.tankCapacity}L Tank
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Saved Delivery Addresses ({selectedCustomer.savedAddresses?.length || 0})
              </h4>
              <div className="space-y-2">
                {selectedCustomer.savedAddresses?.map((a) => (
                  <div key={a.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                    <div className="font-bold text-slate-900">{a.title}</div>
                    <div className="text-slate-600 mt-0.5">{a.address}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Geo: {a.lat}, {a.lng}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Customer</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs focus:outline-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs focus:outline-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Mobile Number</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs focus:outline-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">City</label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="Ahmedabad"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs focus:outline-amber-500"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">Primary Vehicle Information</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500">Brand</label>
                    <input
                      type="text"
                      value={newVehicleBrand}
                      onChange={(e) => setNewVehicleBrand(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Model</label>
                    <input
                      type="text"
                      value={newVehicleModel}
                      onChange={(e) => setNewVehicleModel(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500">Registration Number</label>
                    <input
                      type="text"
                      value={newVehicleReg}
                      onChange={(e) => setNewVehicleReg(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Fuel</label>
                    <select
                      value={newVehicleFuel}
                      onChange={(e) => setNewVehicleFuel(e.target.value as 'petrol' | 'diesel')}
                      className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs"
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                    </select>
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
