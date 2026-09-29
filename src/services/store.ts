import { 
  collection, doc, setDoc, updateDoc, onSnapshot, getDocs, deleteDoc 
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { 
  Order, FuelPumpStation, Driver, User, FuelType, DeliveryMode, 
  PaymentMethod, OrderStatus 
} from '../types';
import { INITIAL_FUEL_PUMPS, INITIAL_DRIVERS, DEMO_USERS, VEHICLE_DATABASE, INITIAL_CUSTOMERS } from '../data/mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'fuelup_current_user',
  PUMPS: 'fuelup_pumps',
  DRIVERS: 'fuelup_drivers'
};

class FuelUpStore {
  private currentUser: User | null = null;
  private orders: Order[] = [];
  private pumps: FuelPumpStation[] = INITIAL_FUEL_PUMPS;
  private drivers: Driver[] = INITIAL_DRIVERS;
  private customers: User[] = INITIAL_CUSTOMERS;
  private listeners: Set<() => void> = new Set();
  private isFirestoreInitialized = false;

  constructor() {
    // Clear out any old temporary dummy mock orders from localStorage
    try {
      localStorage.removeItem('fuelup_orders');
    } catch {
      // ignore
    }

    // Load logged in user if stored
    this.currentUser = this.loadFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    this.initFirestoreSync();
    this.initFirebaseAuthSync();
  }

  private initFirebaseAuthSync() {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // If logged in via Firebase Auth, sync profile
        const existing = this.currentUser;
        if (!existing || existing.id !== firebaseUser.uid) {
          const userRole = firebaseUser.email === 'driver@fuelup.in' ? 'driver'
            : firebaseUser.email === 'admin@fuelup.in' || firebaseUser.email === '24172022025@gnu.ac.in' ? 'admin'
            : 'customer';

          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'FuelUp Member',
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '+91 98791 23456',
            role: userRole,
            avatarUrl: firebaseUser.photoURL || undefined
          };
          this.currentUser = newUser;
          this.saveToStorage(STORAGE_KEYS.CURRENT_USER, newUser);
          this.notify();
        }
      }
    });
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private saveToStorage(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // --- Real-time Firestore Synchronizer ---
  private async initFirestoreSync() {
    if (this.isFirestoreInitialized) return;
    this.isFirestoreInitialized = true;

    try {
      // 1. Synchronize Pumps with Firestore
      const pumpsCol = collection(db, 'pumps');
      onSnapshot(pumpsCol, (snapshot) => {
        if (!snapshot.empty) {
          const loadedPumps: FuelPumpStation[] = [];
          snapshot.forEach(docSnap => {
            loadedPumps.push(docSnap.data() as FuelPumpStation);
          });
          this.pumps = loadedPumps;
          this.notify();
        } else {
          // Seed pumps once into Firestore
          this.seedInitialPumps();
        }
      }, (error) => {
        console.warn('Firestore pumps listener notice:', error);
      });

      // 2. Synchronize Drivers with Firestore
      const driversCol = collection(db, 'drivers');
      onSnapshot(driversCol, (snapshot) => {
        if (!snapshot.empty) {
          const loadedDrivers: Driver[] = [];
          snapshot.forEach(docSnap => {
            loadedDrivers.push(docSnap.data() as Driver);
          });
          this.drivers = loadedDrivers;
          this.notify();
        } else {
          // Seed drivers once into Firestore
          this.seedInitialDrivers();
        }
      }, (error) => {
        console.warn('Firestore drivers listener notice:', error);
      });

      // 3. Synchronize Orders Real-Time with Firestore
      const ordersCol = collection(db, 'orders');
      onSnapshot(ordersCol, (snapshot) => {
        const loadedOrders: Order[] = [];
        snapshot.forEach(docSnap => {
          loadedOrders.push(docSnap.data() as Order);
        });
        // Sort newest first
        loadedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.orders = loadedOrders;
        this.notify();
      }, (error) => {
        console.warn('Firestore orders listener notice:', error);
      });

      // 4. Synchronize Registered Customers with Firestore
      const usersCol = collection(db, 'users');
      onSnapshot(usersCol, (snapshot) => {
        if (!snapshot.empty) {
          const loadedCustomers: User[] = [];
          snapshot.forEach(docSnap => {
            loadedCustomers.push(docSnap.data() as User);
          });
          this.customers = loadedCustomers;
          this.notify();
        } else {
          this.seedInitialCustomers();
        }
      }, (error) => {
        console.warn('Firestore users listener notice:', error);
      });

    } catch (e) {
      console.error('Error during Firestore setup sync:', e);
    }
  }

  private async seedInitialCustomers() {
    try {
      for (const customer of INITIAL_CUSTOMERS) {
        await setDoc(doc(db, 'users', customer.id), customer);
      }
    } catch (e) {
      console.warn('Customers seed deferred:', e);
    }
  }

  private async seedInitialPumps() {
    try {
      for (const pump of INITIAL_FUEL_PUMPS) {
        await setDoc(doc(db, 'pumps', pump.id), pump);
      }
    } catch (e) {
      console.warn('Pumps seed deferred:', e);
    }
  }

  private async seedInitialDrivers() {
    try {
      for (const driver of INITIAL_DRIVERS) {
        await setDoc(doc(db, 'drivers', driver.id), driver);
      }
    } catch (e) {
      console.warn('Drivers seed deferred:', e);
    }
  }

  // --- Auth / User ---
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      this.saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      } catch {
        // ignore
      }
    }
    this.notify();
  }

  public async login(user: User) {
    this.setCurrentUser(user);
  }

  public async signUp(user: User) {
    this.setCurrentUser(user);
    try {
      await setDoc(doc(db, 'users', user.id), user);
    } catch (e) {
      console.warn('User profile sync notice:', e);
    }
  }

  public async logout() {
    this.setCurrentUser(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
  }

  public switchDemoRole(role: 'customer' | 'driver' | 'admin') {
    const targetUser = DEMO_USERS[role];
    if (targetUser) {
      this.setCurrentUser(targetUser);
    }
  }

  public updateProfile(updated: Partial<User>) {
    if (!this.currentUser) return;
    this.currentUser = { ...this.currentUser, ...updated };
    this.saveToStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.notify();
  }

  // --- Fuel Pumps ---
  public getPumps(): FuelPumpStation[] {
    return this.pumps;
  }

  public getPumpById(id: string): FuelPumpStation | undefined {
    return this.pumps.find(p => p.id === id);
  }

  public async updatePumpPrice(pumpId: string, petrolPrice: number, dieselPrice: number) {
    this.pumps = this.pumps.map(p => {
      if (p.id === pumpId) {
        return { ...p, petrolPrice, dieselPrice };
      }
      return p;
    });
    this.notify();

    try {
      await updateDoc(doc(db, 'pumps', pumpId), {
        petrolPrice,
        dieselPrice,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pumps/${pumpId}`);
    }
  }

  public async togglePumpAvailability(pumpId: string) {
    const pump = this.getPumpById(pumpId);
    if (!pump) return;

    const nextAvailable = !pump.available;
    this.pumps = this.pumps.map(p => {
      if (p.id === pumpId) {
        return { ...p, available: nextAvailable };
      }
      return p;
    });
    this.notify();

    try {
      await updateDoc(doc(db, 'pumps', pumpId), {
        available: nextAvailable,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pumps/${pumpId}`);
    }
  }

  // --- Customers Management ---
  public getCustomers(): User[] {
    return this.customers;
  }

  public getCustomerById(id: string): User | undefined {
    return this.customers.find(c => c.id === id);
  }

  public async addCustomer(customer: User) {
    this.customers.unshift(customer);
    this.notify();
    try {
      await setDoc(doc(db, 'users', customer.id), customer);
    } catch (e) {
      console.warn('Error saving customer to Firestore:', e);
    }
  }

  public async updateCustomer(userId: string, data: Partial<User>) {
    this.customers = this.customers.map(c => c.id === userId ? { ...c, ...data } : c);
    this.notify();
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Error updating customer in Firestore:', e);
    }
  }

  public async deleteCustomer(userId: string) {
    this.customers = this.customers.filter(c => c.id !== userId);
    this.notify();
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (e) {
      console.warn('Error deleting customer from Firestore:', e);
    }
  }

  // --- Drivers Management ---
  public getDrivers(): Driver[] {
    return this.drivers;
  }

  public getDriverById(id: string): Driver | undefined {
    return this.drivers.find(d => d.id === id);
  }

  public async addDriver(driver: Driver) {
    this.drivers.unshift(driver);
    this.notify();
    try {
      await setDoc(doc(db, 'drivers', driver.id), driver);
    } catch (e) {
      console.warn('Error saving driver to Firestore:', e);
    }
  }

  public async updateDriver(driverId: string, data: Partial<Driver>) {
    this.drivers = this.drivers.map(d => d.id === driverId ? { ...d, ...data } : d);
    this.notify();
    try {
      await updateDoc(doc(db, 'drivers', driverId), {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Error updating driver in Firestore:', e);
    }
  }

  public async deleteDriver(driverId: string) {
    this.drivers = this.drivers.filter(d => d.id !== driverId);
    this.notify();
    try {
      await deleteDoc(doc(db, 'drivers', driverId));
    } catch (e) {
      console.warn('Error deleting driver from Firestore:', e);
    }
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return this.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find(o => o.id === id || o.orderNumber === id);
  }

  public getUserOrders(userId?: string): Order[] {
    const id = userId || this.currentUser?.id || 'usr-guest';
    return this.orders.filter(o => o.customerId === id);
  }

  public getDriverOrders(driverId?: string): Order[] {
    const id = driverId || (this.currentUser?.role === 'driver' ? this.currentUser.id : 'drv-1');
    return this.orders.filter(o => o.assignedDriverId === id);
  }

  public async createOrder(params: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    district: string;
    city: string;
    lat: number;
    lng: number;
    pumpStationId: string;
    fuelType: FuelType;
    quantityMode: 'liters' | 'fill_tank';
    quantityLiters: number;
    deliveryMode: DeliveryMode;
    scheduledDateTime?: string;
    paymentMethod: PaymentMethod;
    vehicleDetails?: {
      brand: string;
      model: string;
      regNumber?: string;
      currentFuelLevelPercent?: number;
    };
    notes?: string;
  }): Promise<Order> {
    const pump = this.getPumpById(params.pumpStationId) || this.pumps[0];
    const pricePerLiter = params.fuelType === 'petrol' ? pump.petrolPrice : pump.dieselPrice;
    const fuelAmount = Number((pricePerLiter * params.quantityLiters).toFixed(2));
    const deliveryFee = 49.00;
    const emergencyFee = params.deliveryMode === 'sos' ? 149.00 : 0;
    const totalAmount = Number((fuelAmount + deliveryFee + emergencyFee).toFixed(2));

    const driver = this.drivers.find(d => d.status === 'idle') || this.drivers[0];
    const orderNumber = `FUP-${params.deliveryMode === 'sos' ? 'SOS-' : ''}${Math.floor(10000 + Math.random() * 90000)}`;

    const customerId = this.currentUser?.id || `guest-${Date.now()}`;
    const customerName = params.customerName || this.currentUser?.name || 'Customer';
    const customerPhone = params.customerPhone || this.currentUser?.phone || '+91 98791 23456';

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId,
      customerName,
      customerPhone,
      deliveryAddress: params.deliveryAddress,
      district: params.district,
      city: params.city,
      lat: params.lat,
      lng: params.lng,
      pumpStationId: pump.id,
      pumpStationName: pump.name,
      fuelType: params.fuelType,
      quantityMode: params.quantityMode,
      quantityLiters: params.quantityLiters,
      pricePerLiter,
      fuelAmount,
      deliveryFee,
      emergencyFee,
      totalAmount,
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentMethod === 'gpay' ? 'paid' : 'pay_on_delivery',
      deliveryMode: params.deliveryMode,
      scheduledDateTime: params.scheduledDateTime,
      assignedDriverId: driver?.id || 'drv-1',
      assignedDriverName: driver?.name || 'Ramesh Patel',
      assignedDriverPhone: driver?.phone || '+91 98250 44128',
      driverVehicleNumber: driver?.vehicleNumber || 'GJ-01-FL-9281',
      driverLat: pump.lat,
      driverLng: pump.lng,
      status: 'confirmed',
      timeline: [
        {
          status: 'placed',
          label: params.deliveryMode === 'sos' ? '🚨 Emergency Fuel SOS Dispatched' : 'Order Placed & Confirmed',
          timestamp: new Date().toISOString(),
          completed: true,
          note: params.paymentMethod === 'gpay' ? 'Paid instantly via Google Pay' : 'Cash/Card on Delivery selected'
        },
        {
          status: 'confirmed',
          label: 'Pump Partner Dispenser Connected',
          timestamp: new Date(Date.now() + 1000 * 30).toISOString(),
          completed: true,
          note: `${pump.name} allocated Bowser ${driver?.vehicleNumber || 'GJ-01-FL-9281'}`
        },
        {
          status: 'dispatched',
          label: 'Bowser Vehicle En-route',
          timestamp: '',
          completed: false
        },
        {
          status: 'out_for_delivery',
          label: 'Live GPS Navigation Active',
          timestamp: '',
          completed: false
        },
        {
          status: 'arrived',
          label: 'Technician Arrived at Location',
          timestamp: '',
          completed: false
        },
        {
          status: 'completed',
          label: `${params.quantityLiters}L Safely Dispensed`,
          timestamp: '',
          completed: false
        }
      ],
      vehicleDetails: params.vehicleDetails,
      notes: params.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update in-memory state
    this.orders.unshift(newOrder);
    this.notify();

    // Persist to Cloud Firestore
    try {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
    } catch (error) {
      console.warn('Persisting order to Firestore error handled:', error);
    }

    return newOrder;
  }

  public async updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
    let updatedOrder: Order | null = null;

    this.orders = this.orders.map(order => {
      if (order.id !== orderId) return order;

      const updatedTimeline = order.timeline.map(item => {
        if (item.status === status) {
          return {
            ...item,
            completed: true,
            timestamp: new Date().toISOString(),
            note: note || item.note
          };
        }
        return item;
      });

      const updated: Order = {
        ...order,
        status,
        timeline: updatedTimeline,
        updatedAt: new Date().toISOString()
      };
      updatedOrder = updated;
      return updated;
    });

    this.notify();

    if (updatedOrder) {
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          status,
          timeline: (updatedOrder as Order).timeline,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.warn('Firestore updateOrderStatus error handled:', error);
      }
    }
  }

  public async assignDriverToOrder(orderId: string, driverId: string) {
    const driver = this.getDriverById(driverId);
    if (!driver) return;

    this.orders = this.orders.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        assignedDriverId: driver.id,
        assignedDriverName: driver.name,
        assignedDriverPhone: driver.phone,
        driverVehicleNumber: driver.vehicleNumber,
        driverLat: driver.lat,
        driverLng: driver.lng,
        updatedAt: new Date().toISOString()
      };
    });

    this.notify();

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        assignedDriverId: driver.id,
        assignedDriverName: driver.name,
        assignedDriverPhone: driver.phone,
        driverVehicleNumber: driver.vehicleNumber,
        driverLat: driver.lat,
        driverLng: driver.lng,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Firestore assignDriver error handled:', error);
    }
  }

  public async submitOrderRating(orderId: string, rating: number, review: string) {
    this.orders = this.orders.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        rating,
        review,
        updatedAt: new Date().toISOString()
      };
    });

    this.notify();

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        rating,
        review,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Firestore rating update error handled:', error);
    }
  }

  public async deleteAllTemporaryData() {
    this.orders = [];
    this.notify();

    try {
      const ordersCol = collection(db, 'orders');
      const snap = await getDocs(ordersCol);
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
    } catch (e) {
      console.warn('Error deleting cloud orders:', e);
    }
  }
}

export const store = new FuelUpStore();
