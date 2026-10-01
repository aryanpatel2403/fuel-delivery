export type UserRole = 'customer' | 'driver' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  savedVehicles?: SavedVehicle[];
  savedAddresses?: SavedAddress[];
}

export interface SavedVehicle {
  id: string;
  brand: string;
  model: string;
  category: VehicleCategory;
  fuelType: FuelType;
  tankCapacity: number;
  regNumber: string;
}

export interface SavedAddress {
  id: string;
  title: string;
  address: string;
  district: string;
  city: string;
  lat: number;
  lng: number;
}

export type FuelType = 'petrol' | 'diesel';

export type DeliveryMode = 'instant' | 'scheduled' | 'sos';

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'dispatched'
  | 'out_for_delivery'
  | 'arrived'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'gpay' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'pay_on_delivery';

export interface FuelPumpStation {
  id: string;
  name: string;
  brand: 'Reliance' | 'Nayara' | 'HP' | 'IndianOil' | 'Shell' | 'Bharat Petroleum';
  address: string;
  district: string;
  city: string;
  lat: number;
  lng: number;
  petrolPrice: number;
  dieselPrice: number;
  rating: number;
  openHours: string;
  available: boolean;
  distanceKm?: number;
  phone?: string;
  managerName?: string;
  amenities?: string[];
  hasPetrol?: boolean;
  hasDiesel?: boolean;
  hasEVCharging?: boolean;
  totalNozzles?: number;
  lastPriceUpdated?: string;
}

export type VehicleCategory = 'hatchback_sedan' | 'suv' | 'two_wheeler' | 'commercial';

export interface VehicleModelData {
  brand: string;
  model: string;
  category: VehicleCategory;
  defaultFuel: FuelType;
  tankCapacityLiters: number;
  supportedFuels: FuelType[];
}

export interface OrderTimelineItem {
  status: OrderStatus;
  label: string;
  timestamp: string;
  completed: boolean;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  district: string;
  city: string;
  lat: number;
  lng: number;
  pumpStationId: string;
  pumpStationName: string;
  fuelType: FuelType;
  quantityMode: 'liters' | 'fill_tank';
  quantityLiters: number;
  pricePerLiter: number;
  fuelAmount: number;
  deliveryFee: number;
  emergencyFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryMode: DeliveryMode;
  scheduledDateTime?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  driverVehicleNumber?: string;
  driverLat?: number;
  driverLng?: number;
  status: OrderStatus;
  timeline: OrderTimelineItem[];
  rating?: number;
  review?: string;
  vehicleDetails?: {
    brand: string;
    model: string;
    regNumber?: string;
    currentFuelLevelPercent?: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleNumber: string;
  bowserCapacityLiters: number;
  currentFuelPayload: {
    petrolLiters: number;
    dieselLiters: number;
  };
  lat: number;
  lng: number;
  status: 'idle' | 'on_duty' | 'delivering' | 'offline';
  rating: number;
  totalDeliveries: number;
}
