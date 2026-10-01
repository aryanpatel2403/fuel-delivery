import { FuelPumpStation, VehicleModelData, Driver, Order, User } from '../types';

export const GUJARAT_DISTRICTS: Record<string, string[]> = {
  Ahmedabad: ['Bodakdev', 'Satellite', 'SG Highway', 'Navrangpura', 'Prahladnagar', 'Maninagar', 'Vastrapur', 'Chandkheda', 'Bopal'],
  Gandhinagar: ['Sector 7', 'Sector 11', 'Sector 21', 'Kudasan', 'Infocity', 'Sargasan', 'Randesan', 'GIFT City'],
  Surat: ['Adajan', 'Athwa', 'Vesu', 'Piplod', 'Varachha', 'Katargam', 'Althan'],
  Vadodara: ['Alkapuri', 'Gotri', 'Manjalpur', 'Sayajigunj', 'Karelibaug', 'Fatehgunj', 'Vasna'],
  Rajkot: ['Kalawad Road', '150 Feet Ring Road', 'Yagnik Road', 'University Road', 'Madhapar'],
  Bhavnagar: ['Waghawadi Road', 'Kaliabid', 'Ghogha Road', 'Chitra', 'Nari'],
  Mehsana: ['Radhanpur Road', 'Modhera Cross Road', 'Wide Angle Area', 'Panchot'],
  Anand: ['Vallabh Vidyanagar', 'Mota Bazaar', 'Amul Dairy Road', 'Gamdi'],
  Bharuch: ['Zadeshwar Road', 'Station Road', 'Bholav', 'GNFC Township']
};

export const INITIAL_FUEL_PUMPS: FuelPumpStation[] = [
  {
    id: 'pump-1',
    name: 'Nayara Energy Auto Fuel Hub',
    brand: 'Nayara',
    address: 'Near ISKCON Cross Road, SG Highway, Ahmedabad',
    district: 'Ahmedabad',
    city: 'Bodakdev',
    lat: 23.0298,
    lng: 72.5074,
    petrolPrice: 96.72,
    dieselPrice: 92.48,
    rating: 4.8,
    openHours: '24x7 Open',
    available: true,
    distanceKm: 1.8,
    phone: '+91 79 2685 4101',
    managerName: 'Kiritbhai Desai',
    totalNozzles: 12,
    hasPetrol: true,
    hasDiesel: true,
    hasEVCharging: true,
    amenities: ['Air Tower', 'EV Fast Charging (60kW)', 'Clean Restrooms', 'Cafe / Snacks', 'Nitrogen Inflation', 'PUC Testing'],
    lastPriceUpdated: 'Today, 06:00 AM'
  },
  {
    id: 'pump-2',
    name: 'Reliance Petroleum Smart Plaza',
    brand: 'Reliance',
    address: 'Sindhu Bhavan Road, Bodakdev, Ahmedabad',
    district: 'Ahmedabad',
    city: 'Bodakdev',
    lat: 23.0416,
    lng: 72.5112,
    petrolPrice: 96.65,
    dieselPrice: 92.40,
    rating: 4.9,
    openHours: '24x7 Open',
    available: true,
    distanceKm: 2.4,
    phone: '+91 79 2970 8822',
    managerName: 'Sunil Shah',
    totalNozzles: 16,
    hasPetrol: true,
    hasDiesel: true,
    hasEVCharging: true,
    amenities: ['Air Tower', 'EV Fast Charging (120kW)', 'Restrooms', 'Convenience Store', 'Lube Center', 'ATM'],
    lastPriceUpdated: 'Today, 06:00 AM'
  },
  {
    id: 'pump-3',
    name: 'Indian Oil Swarna Jyoti Fuel Care',
    brand: 'IndianOil',
    address: 'Drive-In Road, Opp. Himalaya Mall, Memnagar, Ahmedabad',
    district: 'Ahmedabad',
    city: 'Vastrapur',
    lat: 23.0518,
    lng: 72.5298,
    petrolPrice: 96.80,
    dieselPrice: 92.54,
    rating: 4.6,
    openHours: '06:00 AM - 11:30 PM',
    available: true,
    distanceKm: 3.1,
    phone: '+91 79 2749 1920',
    managerName: 'Jatin Trivedi',
    totalNozzles: 10,
    hasPetrol: true,
    hasDiesel: true,
    hasEVCharging: false,
    amenities: ['Free Air Check', 'Clean Restrooms', 'XP95 Octane Petrol', 'Servo Lubes Store', 'Drinking Water'],
    lastPriceUpdated: 'Today, 06:00 AM'
  },
  {
    id: 'pump-4',
    name: 'HP Fuel Oasis - Club 07 Link',
    brand: 'HP',
    address: 'SP Ring Road, South Bopal, Ahmedabad',
    district: 'Ahmedabad',
    city: 'Bopal',
    lat: 23.0112,
    lng: 72.4789,
    petrolPrice: 96.75,
    dieselPrice: 92.50,
    rating: 4.7,
    openHours: '24x7 Open',
    available: true,
    distanceKm: 4.2,
    phone: '+91 79 2981 7733',
    managerName: 'Mahesh Solanki',
    totalNozzles: 14,
    hasPetrol: true,
    hasDiesel: true,
    hasEVCharging: true,
    amenities: ['Digital Air Gauge', 'EV Fast Charging (50kW)', 'Restrooms', 'Power 95 Petrol', 'Quick Lube Service'],
    lastPriceUpdated: 'Today, 06:00 AM'
  },
  {
    id: 'pump-5',
    name: 'Shell Express Premium Mobility',
    brand: 'Shell',
    address: '100 Ft Anandnagar Road, Prahladnagar, Ahmedabad',
    district: 'Ahmedabad',
    city: 'Prahladnagar',
    lat: 23.0089,
    lng: 72.5165,
    petrolPrice: 99.40, // Premium V-Power
    dieselPrice: 95.10,
    rating: 4.9,
    openHours: '24x7 Open',
    available: true,
    distanceKm: 2.9,
    phone: '+91 79 2693 4500',
    managerName: 'Alok Mukherjee',
    totalNozzles: 12,
    hasPetrol: true,
    hasDiesel: true,
    hasEVCharging: true,
    amenities: ['Shell Select Café', 'Shell V-Power 99', 'Shell Recharge 60kW', 'Air & Water Service', 'Helix Oil Change', 'Premium Restrooms'],
    lastPriceUpdated: 'Today, 06:00 AM'
  },
  {
    id: 'pump-6',
    name: 'Bharat Petroleum Highway Haven',
    brand: 'Bharat Petroleum',
    address: 'Koba Circle, Gandhinagar Highway, GIFT City Corridor',
    district: 'Gandhinagar',
    city: 'GIFT City',
    lat: 23.1654,
    lng: 72.6369,
    petrolPrice: 96.60,
    dieselPrice: 92.35,
    rating: 4.7,
    openHours: '24x7 Open',
    available: true,
    distanceKm: 8.5,
    phone: '+91 79 2328 9012',
    managerName: 'Pravin Vaghela',
    totalNozzles: 16,
    hasPetrol: true,
    hasDiesel: true,
    hasEVCharging: true,
    amenities: ['Speed 97 Petrol', 'EV Charging Corridor', 'Pure For Sure Certified', 'Rest Stop Café', 'Nitrogen Station', 'Commercial Truck Bay'],
    lastPriceUpdated: 'Today, 06:00 AM'
  }
];

export const VEHICLE_DATABASE: VehicleModelData[] = [
  // Maruti Suzuki
  { brand: 'Maruti Suzuki', model: 'Swift', category: 'hatchback_sedan', defaultFuel: 'petrol', tankCapacityLiters: 37, supportedFuels: ['petrol'] },
  { brand: 'Maruti Suzuki', model: 'Baleno', category: 'hatchback_sedan', defaultFuel: 'petrol', tankCapacityLiters: 37, supportedFuels: ['petrol'] },
  { brand: 'Maruti Suzuki', model: 'Brezza', category: 'suv', defaultFuel: 'petrol', tankCapacityLiters: 48, supportedFuels: ['petrol'] },
  { brand: 'Maruti Suzuki', model: 'Grand Vitara', category: 'suv', defaultFuel: 'petrol', tankCapacityLiters: 45, supportedFuels: ['petrol'] },
  { brand: 'Maruti Suzuki', model: 'Dzire', category: 'hatchback_sedan', defaultFuel: 'petrol', tankCapacityLiters: 37, supportedFuels: ['petrol'] },
  { brand: 'Maruti Suzuki', model: 'Ertiga', category: 'suv', defaultFuel: 'petrol', tankCapacityLiters: 45, supportedFuels: ['petrol'] },
  { brand: 'Maruti Suzuki', model: 'Fronx', category: 'suv', defaultFuel: 'petrol', tankCapacityLiters: 37, supportedFuels: ['petrol'] },

  // Hyundai
  { brand: 'Hyundai', model: 'Creta', category: 'suv', defaultFuel: 'petrol', tankCapacityLiters: 50, supportedFuels: ['petrol', 'diesel'] },
  { brand: 'Hyundai', model: 'i20', category: 'hatchback_sedan', defaultFuel: 'petrol', tankCapacityLiters: 37, supportedFuels: ['petrol'] },
  { brand: 'Hyundai', model: 'Venue', category: 'suv', defaultFuel: 'petrol', tankCapacityLiters: 45, supportedFuels: ['petrol', 'diesel'] },
  { brand: 'Hyundai', model: 'Verna', category: 'hatchback_sedan', defaultFuel: 'petrol', tankCapacityLiters: 45, supportedFuels: ['petrol'] },
  { brand: 'Hyundai', model: 'Alcazar', category: 'suv', defaultFuel: 'diesel', tankCapacityLiters: 50, supportedFuels: ['petrol', 'diesel'] },
  { brand: 'Hyundai', model: 'Exter', category: 'suv', defaultFuel: 'petrol', tankCapacityLiters: 37, supportedFuels: ['petrol'] },

  // Tata Motors
  { brand: 'Tata', model: 'Nexon', category: 'suv', defaultFuel: 'petrol', tankCapacityLiters: 44, supportedFuels: ['petrol', 'diesel'] },
  { brand: 'Tata', model: 'Punch', category: 'suv', defaultFuel: 'petrol', tankCapacityLiters: 37, supportedFuels: ['petrol'] },
  { brand: 'Tata', model: 'Harrier', category: 'suv', defaultFuel: 'diesel', tankCapacityLiters: 50, supportedFuels: ['diesel'] },
  { brand: 'Tata', model: 'Safari', category: 'suv', defaultFuel: 'diesel', tankCapacityLiters: 50, supportedFuels: ['diesel'] },
  { brand: 'Tata', model: 'Altroz', category: 'hatchback_sedan', defaultFuel: 'petrol', tankCapacityLiters: 37, supportedFuels: ['petrol', 'diesel'] },
  { brand: 'Tata', model: 'Tiago', category: 'hatchback_sedan', defaultFuel: 'petrol', tankCapacityLiters: 35, supportedFuels: ['petrol'] },

  // Mahindra
  { brand: 'Mahindra', model: 'Thar / Thar Roxx', category: 'suv', defaultFuel: 'diesel', tankCapacityLiters: 57, supportedFuels: ['petrol', 'diesel'] },
  { brand: 'Mahindra', model: 'Scorpio-N / Classic', category: 'suv', defaultFuel: 'diesel', tankCapacityLiters: 57, supportedFuels: ['petrol', 'diesel'] },
  { brand: 'Mahindra', model: 'XUV700', category: 'suv', defaultFuel: 'diesel', tankCapacityLiters: 60, supportedFuels: ['petrol', 'diesel'] },
  { brand: 'Mahindra', model: 'XUV 3XO', category: 'suv', defaultFuel: 'petrol', tankCapacityLiters: 42, supportedFuels: ['petrol', 'diesel'] },
  { brand: 'Mahindra', model: 'Bolero Neo', category: 'suv', defaultFuel: 'diesel', tankCapacityLiters: 60, supportedFuels: ['diesel'] },

  // Honda
  { brand: 'Honda', model: 'City', category: 'hatchback_sedan', defaultFuel: 'petrol', tankCapacityLiters: 40, supportedFuels: ['petrol'] },
  { brand: 'Honda', model: 'Amaze', category: 'hatchback_sedan', defaultFuel: 'petrol', tankCapacityLiters: 35, supportedFuels: ['petrol'] },
  { brand: 'Honda', model: 'Elevate', category: 'suv', defaultFuel: 'petrol', tankCapacityLiters: 40, supportedFuels: ['petrol'] },

  // Toyota
  { brand: 'Toyota', model: 'Fortuner', category: 'suv', defaultFuel: 'diesel', tankCapacityLiters: 80, supportedFuels: ['petrol', 'diesel'] },
  { brand: 'Toyota', model: 'Innova Crysta / Hycross', category: 'suv', defaultFuel: 'diesel', tankCapacityLiters: 65, supportedFuels: ['petrol', 'diesel'] },
  { brand: 'Toyota', model: 'Urban Cruiser Hyryder', category: 'suv', defaultFuel: 'petrol', tankCapacityLiters: 45, supportedFuels: ['petrol'] },
  { brand: 'Toyota', model: 'Glanza', category: 'hatchback_sedan', defaultFuel: 'petrol', tankCapacityLiters: 37, supportedFuels: ['petrol'] },

  // Two-Wheelers
  { brand: 'Two-Wheeler', model: 'Honda Activa 6G / 125', category: 'two_wheeler', defaultFuel: 'petrol', tankCapacityLiters: 5.3, supportedFuels: ['petrol'] },
  { brand: 'Two-Wheeler', model: 'Royal Enfield Classic 350', category: 'two_wheeler', defaultFuel: 'petrol', tankCapacityLiters: 13, supportedFuels: ['petrol'] },
  { brand: 'Two-Wheeler', model: 'Hero Splendor Plus', category: 'two_wheeler', defaultFuel: 'petrol', tankCapacityLiters: 9.8, supportedFuels: ['petrol'] },
  { brand: 'Two-Wheeler', model: 'Bajaj Pulsar NS200 / 150', category: 'two_wheeler', defaultFuel: 'petrol', tankCapacityLiters: 12, supportedFuels: ['petrol'] },
  { brand: 'Two-Wheeler', model: 'TVS Jupiter 125', category: 'two_wheeler', defaultFuel: 'petrol', tankCapacityLiters: 5.1, supportedFuels: ['petrol'] },
  { brand: 'Two-Wheeler', model: 'Yamaha MT-15 / R15', category: 'two_wheeler', defaultFuel: 'petrol', tankCapacityLiters: 11, supportedFuels: ['petrol'] },

  // Commercial Vehicles
  { brand: 'Commercial', model: 'Tata Ace Gold (Chhota Hathi)', category: 'commercial', defaultFuel: 'diesel', tankCapacityLiters: 30, supportedFuels: ['diesel', 'petrol'] },
  { brand: 'Commercial', model: 'Mahindra Bolero Maxi Truck Plus', category: 'commercial', defaultFuel: 'diesel', tankCapacityLiters: 45, supportedFuels: ['diesel'] },
  { brand: 'Commercial', model: 'Ashok Leyland Dost+', category: 'commercial', defaultFuel: 'diesel', tankCapacityLiters: 40, supportedFuels: ['diesel'] },
  { brand: 'Commercial', model: 'Eicher Pro 2049 Light Truck', category: 'commercial', defaultFuel: 'diesel', tankCapacityLiters: 60, supportedFuels: ['diesel'] },
  { brand: 'Commercial', model: 'Diesel Generator (GenSet 15-50kVA)', category: 'commercial', defaultFuel: 'diesel', tankCapacityLiters: 75, supportedFuels: ['diesel'] }
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'Ramesh Patel',
    phone: '+91 98250 44128',
    email: 'driver@fuelup.in',
    vehicleNumber: 'GJ-01-FL-9281',
    bowserCapacityLiters: 1200,
    currentFuelPayload: { petrolLiters: 600, dieselLiters: 520 },
    lat: 23.0335,
    lng: 72.5098,
    status: 'delivering',
    rating: 4.9,
    totalDeliveries: 428
  },
  {
    id: 'drv-2',
    name: 'Vikram Rajput',
    phone: '+91 97123 88410',
    email: 'vikram.driver@fuelup.in',
    vehicleNumber: 'GJ-01-FL-7433',
    bowserCapacityLiters: 1500,
    currentFuelPayload: { petrolLiters: 750, dieselLiters: 650 },
    lat: 23.0450,
    lng: 72.5200,
    status: 'on_duty',
    rating: 4.8,
    totalDeliveries: 312
  },
  {
    id: 'drv-3',
    name: 'Harish Solanki',
    phone: '+91 99042 19283',
    email: 'harish.driver@fuelup.in',
    vehicleNumber: 'GJ-18-FL-3309',
    bowserCapacityLiters: 1000,
    currentFuelPayload: { petrolLiters: 450, dieselLiters: 480 },
    lat: 23.1610,
    lng: 72.6320,
    status: 'idle',
    rating: 4.95,
    totalDeliveries: 560
  }
];

export const DEMO_USERS: Record<string, User> = {
  customer: {
    id: 'usr-aryan-01',
    name: 'Aryan Varma',
    email: '24172022025@gnu.ac.in',
    phone: '+91 98791 23456',
    role: 'customer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    savedVehicles: [
      {
        id: 'veh-1',
        brand: 'Tata',
        model: 'Nexon',
        category: 'suv',
        fuelType: 'petrol',
        tankCapacity: 44,
        regNumber: 'GJ-01-ER-8842'
      },
      {
        id: 'veh-2',
        brand: 'Two-Wheeler',
        model: 'Royal Enfield Classic 350',
        category: 'two_wheeler',
        fuelType: 'petrol',
        tankCapacity: 13,
        regNumber: 'GJ-01-MY-2024'
      }
    ],
    savedAddresses: [
      {
        id: 'addr-1',
        title: 'Home (Bodakdev)',
        address: 'B-402 Shivalik Shilp, Near ISKCON Cross Road, Bodakdev',
        district: 'Ahmedabad',
        city: 'Bodakdev',
        lat: 23.0289,
        lng: 72.5065
      },
      {
        id: 'addr-2',
        title: 'Office (Prahladnagar)',
        address: '6th Floor, Pinnacle Business Park, Prahladnagar',
        district: 'Ahmedabad',
        city: 'Prahladnagar',
        lat: 23.0095,
        lng: 72.5142
      }
    ]
  },
  driver: {
    id: 'drv-1',
    name: 'Ramesh Patel',
    email: 'driver@fuelup.in',
    phone: '+91 98250 44128',
    role: 'driver'
  },
  admin: {
    id: 'adm-1',
    name: 'System Operations Lead',
    email: 'admin@fuelup.in',
    phone: '+91 98240 00100',
    role: 'admin'
  }
};

// Initial orders are empty - orders will now come directly from Firestore
export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_CUSTOMERS: User[] = [
  DEMO_USERS.customer,
  {
    id: 'usr-priya-02',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 99281 77332',
    role: 'customer',
    savedVehicles: [
      {
        id: 'veh-p1',
        brand: 'Hyundai',
        model: 'Creta',
        category: 'suv',
        fuelType: 'petrol',
        tankCapacity: 50,
        regNumber: 'GJ-27-AK-9921'
      }
    ],
    savedAddresses: [
      {
        id: 'addr-p1',
        title: 'Highway Residence',
        address: 'Near Vaishnodevi Circle, SG Highway',
        district: 'Ahmedabad',
        city: 'Chandkheda',
        lat: 23.1298,
        lng: 72.5450
      }
    ]
  },
  {
    id: 'usr-karan-03',
    name: 'Karan Mehra',
    email: 'karan.m@gmail.com',
    phone: '+91 98251 11204',
    role: 'customer',
    savedVehicles: [
      {
        id: 'veh-k1',
        brand: 'Mahindra',
        model: 'Scorpio-N / Classic',
        category: 'suv',
        fuelType: 'diesel',
        tankCapacity: 57,
        regNumber: 'GJ-01-SK-1100'
      }
    ],
    savedAddresses: [
      {
        id: 'addr-k1',
        title: 'Sindhu Bhavan Office',
        address: 'B-Block, Time Square Grand, Sindhu Bhavan Marg',
        district: 'Ahmedabad',
        city: 'Bodakdev',
        lat: 23.0450,
        lng: 72.5020
      }
    ]
  }
];

