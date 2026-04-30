import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ServiceCategory =
  | 'mechanic' | 'food' | 'resort' | 'restaurant' | 'medical'
  | 'hospital' | 'ambulance' | 'puncture' | 'petrol'
  | 'boys_hostel' | 'girls_hostel';

export const CATEGORY_META: Record<ServiceCategory, { label: string; icon: string; color: string }> = {
  mechanic: { label: 'Mechanic', icon: 'tool', color: '#E86B20' },
  food: { label: 'Food Stall', icon: 'coffee', color: '#10B981' },
  resort: { label: 'Resort', icon: 'home', color: '#8B5CF6' },
  restaurant: { label: 'Restaurant', icon: 'map-pin', color: '#F59E0B' },
  medical: { label: 'Medical', icon: 'plus-circle', color: '#EF4444' },
  hospital: { label: 'Hospital', icon: 'activity', color: '#DC2626' },
  ambulance: { label: 'Ambulance', icon: 'truck', color: '#B91C1C' },
  puncture: { label: 'Puncture Shop', icon: 'disc', color: '#6B7280' },
  petrol: { label: 'Petrol Pump', icon: 'droplet', color: '#3B82F6' },
  boys_hostel: { label: 'Boys Hostel', icon: 'users', color: '#2563EB' },
  girls_hostel: { label: 'Girls Hostel', icon: 'users', color: '#EC4899' },
};

export interface LocalService {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  rating: number;
  reviews: number;
  latitude: number;
  longitude: number;
  isOpen: boolean;
  openHours: string;
}

export interface HiddenGem {
  id: string;
  name: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviews: number;
  addedBy: string;
  tags: string[];
  imageColor: string;
}

export interface TravelerPost {
  id: string;
  userId: string;
  userName: string;
  content: string;
  location: string;
  timestamp: string;
  likes: number;
  replies: number;
}

export interface NearbyTraveler {
  id: string;
  name: string;
  location: string;
  bike: string;
  status: 'riding' | 'resting' | 'looking_for_group';
  distance: string;
  lastSeen: string;
  route?: string;
}

interface DataContextValue {
  services: LocalService[];
  gems: HiddenGem[];
  posts: TravelerPost[];
  travelers: NearbyTraveler[];
  addService: (service: Omit<LocalService, 'id'>) => Promise<void>;
  updateService: (id: string, updates: Partial<LocalService>) => Promise<void>;
  removeService: (id: string) => Promise<void>;
  addGem: (gem: Omit<HiddenGem, 'id'>) => Promise<void>;
  removeGem: (id: string) => Promise<void>;
  addPost: (post: Omit<TravelerPost, 'id' | 'timestamp' | 'likes' | 'replies'>) => Promise<void>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextValue | null>(null);

const SERVICES_KEY = '@rideconnect_services_v2';
const GEMS_KEY = '@rideconnect_gems_v2';
const POSTS_KEY = '@rideconnect_posts_v2';

const DEFAULT_SERVICES: LocalService[] = [
  // === MAHARASHTRA ===
  { id: 's001', name: 'Raj Bike Garage', category: 'mechanic', description: 'Expert motorcycle repairs, all brands. Quick puncture fixes and engine tuning. Specializes in Royal Enfield and Bajaj.', address: 'NH48, Near Toll Plaza', city: 'Lonavala', state: 'Maharashtra', phone: '+91 98765 43210', rating: 4.6, reviews: 128, latitude: 18.7546, longitude: 73.4062, isOpen: true, openHours: '8AM - 8PM' },
  { id: 's002', name: 'Highway Dhaba', category: 'food', description: 'Authentic North Indian food. Famous for butter chicken, dal makhani, and fresh tandoori rotis. Quick service for travelers.', address: 'Old Mumbai-Pune Highway', city: 'Khandala', state: 'Maharashtra', phone: '+91 98123 45678', rating: 4.3, reviews: 312, latitude: 18.8237, longitude: 73.3567, isOpen: true, openHours: '6AM - 11PM' },
  { id: 's003', name: 'Mountain View Resort', category: 'resort', description: 'Peaceful hillside resort with valley views. Biker-friendly with covered parking. Pool and spa available.', address: 'Mahabaleshwar Road, Km 12', city: 'Mahabaleshwar', state: 'Maharashtra', phone: '+91 97654 32100', rating: 4.8, reviews: 87, latitude: 17.9237, longitude: 73.6584, isOpen: true, openHours: '24 Hours' },
  { id: 's004', name: 'Spice Route Kitchen', category: 'restaurant', description: 'Multi-cuisine restaurant with a rooftop. Great sunset views. Serves Maharashtrian thali.', address: 'MG Road, Near Bus Stand', city: 'Panchgani', state: 'Maharashtra', phone: '+91 96543 21098', rating: 4.4, reviews: 203, latitude: 17.9262, longitude: 73.7989, isOpen: true, openHours: '11AM - 10PM' },
  { id: 's005', name: 'Sahyadri Hospital', category: 'hospital', description: '100-bed multispecialty hospital. Emergency ward, ICU, X-ray, blood bank. 24/7 emergency care available.', address: 'Station Road', city: 'Satara', state: 'Maharashtra', phone: '+91 2162 234567', rating: 4.2, reviews: 156, latitude: 17.6805, longitude: 74.0183, isOpen: true, openHours: '24 Hours' },
  { id: 's006', name: 'Indian Oil Fuel Station', category: 'petrol', description: 'Full service fuel station with air filling, restrooms, and mini mart. Digital payment accepted.', address: 'NH48, Km 95', city: 'Khopoli', state: 'Maharashtra', phone: '+91 94321 09876', rating: 3.9, reviews: 89, latitude: 18.7871, longitude: 73.3444, isOpen: true, openHours: '6AM - 10PM' },
  { id: 's007', name: 'Quick Fix Puncture Shop', category: 'puncture', description: 'Tubeless and tube tire puncture repair. Carries common tire sizes. Quick 10-minute service.', address: 'Wai-Panchgani Road, Km 3', city: 'Wai', state: 'Maharashtra', phone: '+91 93210 98765', rating: 4.5, reviews: 167, latitude: 17.9534, longitude: 73.8912, isOpen: true, openHours: '7AM - 9PM' },
  { id: 's008', name: 'Chai Point Highway', category: 'food', description: 'Quick chai and snacks. Famous for vada pav, samosa, misal pav, and cutting chai.', address: 'Expressway Exit 12', city: 'Pune', state: 'Maharashtra', phone: '+91 92109 87654', rating: 4.7, reviews: 445, latitude: 18.6543, longitude: 73.2345, isOpen: true, openHours: '5AM - 12AM' },
  { id: 's009', name: '108 Ambulance Service', category: 'ambulance', description: 'Government emergency ambulance. Basic and advanced life support. GPS tracked.', address: 'All Maharashtra Highways', city: 'Pune', state: 'Maharashtra', phone: '108', rating: 4.0, reviews: 234, latitude: 18.5204, longitude: 73.8567, isOpen: true, openHours: '24 Hours' },
  { id: 's010', name: 'Dr. Patil Clinic', category: 'medical', description: 'General physician and first aid. X-ray facility. Travel medicine and vaccinations available.', address: 'Main Market, Opp Post Office', city: 'Lonavala', state: 'Maharashtra', phone: '+91 91234 56780', rating: 4.1, reviews: 78, latitude: 18.7557, longitude: 73.4091, isOpen: true, openHours: '9AM - 9PM' },
  { id: 's011', name: 'Riders Rest Boys Hostel', category: 'boys_hostel', description: 'Budget hostel for bikers. Dormitory and private rooms. Secure bike parking. Common room with TV.', address: 'Near Bus Stand', city: 'Mahabaleshwar', state: 'Maharashtra', phone: '+91 90123 45678', rating: 4.0, reviews: 56, latitude: 17.9244, longitude: 73.6567, isOpen: true, openHours: '24 Hours' },
  { id: 's012', name: 'Sakhi Girls Hostel', category: 'girls_hostel', description: 'Safe and clean hostel for women travelers. CCTV monitored. Home-cooked meals available.', address: 'College Road', city: 'Panchgani', state: 'Maharashtra', phone: '+91 89012 34567', rating: 4.3, reviews: 42, latitude: 17.9278, longitude: 73.8001, isOpen: true, openHours: '24 Hours' },
  { id: 's013', name: 'HP Petrol Pump', category: 'petrol', description: 'Hindustan Petroleum station. All fuel types including premium. Air and water facility.', address: 'Mumbai-Goa Highway, Km 180', city: 'Chiplun', state: 'Maharashtra', phone: '+91 2355 252123', rating: 4.1, reviews: 134, latitude: 17.5339, longitude: 73.5089, isOpen: true, openHours: '6AM - 11PM' },
  { id: 's014', name: 'Konkan Kitchen', category: 'restaurant', description: 'Authentic Konkan seafood. Fresh fish thali, sol kadhi, prawns masala. Riverside seating.', address: 'Bank Road', city: 'Ratnagiri', state: 'Maharashtra', phone: '+91 88901 23456', rating: 4.6, reviews: 289, latitude: 16.9944, longitude: 73.3002, isOpen: true, openHours: '11AM - 10:30PM' },
  { id: 's015', name: 'Royal Enfield Service Center', category: 'mechanic', description: 'Authorized Royal Enfield service. Genuine parts. Engine overhaul, electrical repair, full servicing.', address: 'MIDC Road', city: 'Nashik', state: 'Maharashtra', phone: '+91 87890 12345', rating: 4.4, reviews: 198, latitude: 19.9975, longitude: 73.7898, isOpen: true, openHours: '9AM - 7PM' },

  // === RAJASTHAN ===
  { id: 's016', name: 'Desert Mechanic Workshop', category: 'mechanic', description: 'Experienced with desert riding conditions. Radiator repair, dust filter cleaning, chain service.', address: 'Jodhpur-Jaisalmer Highway, Km 45', city: 'Barmer', state: 'Rajasthan', phone: '+91 86789 01234', rating: 4.3, reviews: 145, latitude: 25.7521, longitude: 71.3967, isOpen: true, openHours: '7AM - 8PM' },
  { id: 's017', name: 'Rajasthani Bhojnalaya', category: 'food', description: 'Traditional Rajasthani thali with dal bati churma, gatte ki sabzi, ker sangri. Unlimited thali.', address: 'Station Road', city: 'Udaipur', state: 'Rajasthan', phone: '+91 85678 90123', rating: 4.5, reviews: 567, latitude: 24.5854, longitude: 73.7125, isOpen: true, openHours: '8AM - 10PM' },
  { id: 's018', name: 'Lake View Resort', category: 'resort', description: 'Heritage haveli resort overlooking Lake Pichola. Pool, spa, cultural evenings.', address: 'Lal Ghat', city: 'Udaipur', state: 'Rajasthan', phone: '+91 84567 89012', rating: 4.9, reviews: 423, latitude: 24.5764, longitude: 73.6833, isOpen: true, openHours: '24 Hours' },
  { id: 's019', name: 'Jaisalmer Fort Hospital', category: 'hospital', description: 'District hospital with emergency services. Dehydration treatment, snake bite antivenom available.', address: 'Fort Road', city: 'Jaisalmer', state: 'Rajasthan', phone: '+91 2992 252100', rating: 3.8, reviews: 89, latitude: 26.9157, longitude: 70.9083, isOpen: true, openHours: '24 Hours' },
  { id: 's020', name: 'BPCL Highway Station', category: 'petrol', description: 'Bharat Petroleum pump. Premium fuel, digital payment, clean restrooms. Last pump before desert stretch.', address: 'NH-15, Before Tanot', city: 'Jaisalmer', state: 'Rajasthan', phone: '+91 83456 78901', rating: 4.0, reviews: 178, latitude: 26.9124, longitude: 70.9067, isOpen: true, openHours: '5AM - 11PM' },
  { id: 's021', name: 'Desert Boys Hostel', category: 'boys_hostel', description: 'Budget backpacker hostel. Camel safari bookings, desert camp arrangements. Rooftop fort view.', address: 'Gandhi Chowk', city: 'Jaisalmer', state: 'Rajasthan', phone: '+91 82345 67890', rating: 4.2, reviews: 312, latitude: 26.9135, longitude: 70.9123, isOpen: true, openHours: '24 Hours' },
  { id: 's022', name: 'Rajputana Girls Hostel', category: 'girls_hostel', description: 'Women-only hostel in heritage building. Safe, clean, with courtyard dining. Walking distance to city center.', address: 'Near Hawa Mahal', city: 'Jaipur', state: 'Rajasthan', phone: '+91 81234 56789', rating: 4.4, reviews: 189, latitude: 26.9239, longitude: 75.8267, isOpen: true, openHours: '24 Hours' },
  { id: 's023', name: 'Highway Puncture Works', category: 'puncture', description: 'Quick puncture repair on NH-8. Tubeless repair specialist. Carries motorcycle tires.', address: 'NH-8, Near Beawar', city: 'Ajmer', state: 'Rajasthan', phone: '+91 80123 45678', rating: 4.1, reviews: 234, latitude: 26.4499, longitude: 74.6399, isOpen: true, openHours: '6AM - 10PM' },

  // === GOA ===
  { id: 's024', name: 'Beach Shack Kitchen', category: 'food', description: 'Fresh seafood, Goan curry rice, feni cocktails. Beachfront dining with live music.', address: 'Baga Beach Road', city: 'Baga', state: 'Goa', phone: '+91 79012 34567', rating: 4.5, reviews: 678, latitude: 15.5562, longitude: 73.7544, isOpen: true, openHours: '8AM - 12AM' },
  { id: 's025', name: 'Goa Medical College', category: 'hospital', description: 'Government hospital. Emergency, trauma center, all specialties. Largest hospital in Goa.', address: 'Bambolim', city: 'Panaji', state: 'Goa', phone: '+91 832 2458700', rating: 3.9, reviews: 456, latitude: 15.4569, longitude: 73.8756, isOpen: true, openHours: '24 Hours' },
  { id: 's026', name: 'Susegad Resort', category: 'resort', description: 'Boutique beach resort. Pool villa, yoga classes, surfing lessons. Motorcycle parking.', address: 'Morjim Beach Road', city: 'Morjim', state: 'Goa', phone: '+91 78901 23456', rating: 4.7, reviews: 234, latitude: 15.6307, longitude: 73.7357, isOpen: true, openHours: '24 Hours' },
  { id: 's027', name: 'Goa Riders Mechanic', category: 'mechanic', description: 'Scooter and motorcycle repair. Rental bike servicing. All makes and models.', address: 'Tito Road', city: 'Calangute', state: 'Goa', phone: '+91 77890 12345', rating: 4.2, reviews: 345, latitude: 15.5439, longitude: 73.7553, isOpen: true, openHours: '8AM - 9PM' },

  // === KARNATAKA ===
  { id: 's028', name: 'Vidyarthi Bhavan', category: 'restaurant', description: 'Iconic South Indian restaurant since 1943. Famous for crispy masala dosa and filter coffee.', address: 'Gandhi Bazaar', city: 'Bengaluru', state: 'Karnataka', phone: '+91 80 2667 7588', rating: 4.8, reviews: 2345, latitude: 12.9516, longitude: 77.5713, isOpen: true, openHours: '6:30AM - 11:30AM, 2PM - 8PM' },
  { id: 's029', name: 'Coorg Mountain Stay', category: 'resort', description: 'Coffee plantation resort. Trekking, river crossing, bonfire. Biker groups welcome.', address: 'Madikeri Road, Km 8', city: 'Coorg', state: 'Karnataka', phone: '+91 76789 01234', rating: 4.6, reviews: 189, latitude: 12.4244, longitude: 75.7382, isOpen: true, openHours: '24 Hours' },
  { id: 's030', name: 'Manipal Hospital', category: 'hospital', description: 'Multispecialty hospital. 24/7 emergency, trauma care, ambulance service, pharmacy.', address: 'HAL Airport Road', city: 'Bengaluru', state: 'Karnataka', phone: '+91 80 2502 4444', rating: 4.5, reviews: 1234, latitude: 12.9592, longitude: 77.6475, isOpen: true, openHours: '24 Hours' },
  { id: 's031', name: 'IOCL Fuel Station', category: 'petrol', description: 'Indian Oil station on highway. Premium petrol, diesel, EV charging point. Clean restrooms.', address: 'Bengaluru-Mysuru Expressway, Km 40', city: 'Ramanagara', state: 'Karnataka', phone: '+91 75678 90123', rating: 4.0, reviews: 167, latitude: 12.7269, longitude: 77.2806, isOpen: true, openHours: '24 Hours' },
  { id: 's032', name: 'Tyre Point Puncture Service', category: 'puncture', description: 'MRF and CEAT tire specialist. Tubeless repair, wheel balancing. Bike tire replacement.', address: 'Mysuru Road, Near Toll', city: 'Mandya', state: 'Karnataka', phone: '+91 74567 89012', rating: 4.3, reviews: 123, latitude: 12.5218, longitude: 76.8951, isOpen: true, openHours: '7AM - 9PM' },

  // === KERALA ===
  { id: 's033', name: 'Malabar Kitchen', category: 'restaurant', description: 'Kerala cuisine at its best. Appam with stew, fish molee, prawn curry. Banana leaf meals.', address: 'MG Road', city: 'Kochi', state: 'Kerala', phone: '+91 73456 78901', rating: 4.6, reviews: 567, latitude: 9.9816, longitude: 76.2999, isOpen: true, openHours: '7AM - 10PM' },
  { id: 's034', name: 'Munnar Hills Resort', category: 'resort', description: 'Tea garden resort with misty mountain views. Trekking, tea tasting tours. Bike-friendly roads.', address: 'Top Station Road', city: 'Munnar', state: 'Kerala', phone: '+91 72345 67890', rating: 4.7, reviews: 456, latitude: 10.0889, longitude: 77.0595, isOpen: true, openHours: '24 Hours' },
  { id: 's035', name: 'EMRI 108 Kerala', category: 'ambulance', description: 'State emergency ambulance. Advanced life support, GPS tracked, free service.', address: 'All Kerala Highways', city: 'Kochi', state: 'Kerala', phone: '108', rating: 4.1, reviews: 345, latitude: 9.9312, longitude: 76.2673, isOpen: true, openHours: '24 Hours' },
  { id: 's036', name: 'Wayanad Medical Center', category: 'medical', description: 'General practice and emergency first aid. Leech bite treatment, altitude sickness care.', address: 'Main Road', city: 'Wayanad', state: 'Kerala', phone: '+91 71234 56789', rating: 4.0, reviews: 89, latitude: 11.6854, longitude: 76.1320, isOpen: true, openHours: '8AM - 10PM' },

  // === TAMIL NADU ===
  { id: 's037', name: 'Annapoorna Restaurant', category: 'restaurant', description: 'Pure vegetarian meals. Famous for sambar, rasam, variety rice. Clean and hygienic.', address: 'Sathyamangalam Road', city: 'Coimbatore', state: 'Tamil Nadu', phone: '+91 70123 45678', rating: 4.5, reviews: 890, latitude: 11.0168, longitude: 76.9558, isOpen: true, openHours: '6AM - 10PM' },
  { id: 's038', name: 'Ooty Lake Resort', category: 'resort', description: 'Colonial-style resort near Ooty Lake. Bonfire, horse riding, botanical garden tours.', address: 'Lake Road', city: 'Ooty', state: 'Tamil Nadu', phone: '+91 69012 34567', rating: 4.4, reviews: 345, latitude: 11.4102, longitude: 76.6950, isOpen: true, openHours: '24 Hours' },
  { id: 's039', name: 'Apollo Hospital', category: 'hospital', description: 'Chain hospital with full emergency services. Trauma care, blood bank, 24/7 pharmacy.', address: 'Greams Road', city: 'Chennai', state: 'Tamil Nadu', phone: '+91 44 2829 0200', rating: 4.6, reviews: 2100, latitude: 13.0614, longitude: 80.2548, isOpen: true, openHours: '24 Hours' },
  { id: 's040', name: 'TVS Motorcycle Service', category: 'mechanic', description: 'Authorized TVS and Apache service. Oil change, brake service, full inspection. Genuine parts.', address: 'Anna Nagar', city: 'Madurai', state: 'Tamil Nadu', phone: '+91 68901 23456', rating: 4.3, reviews: 234, latitude: 9.9252, longitude: 78.1198, isOpen: true, openHours: '9AM - 6PM' },

  // === HIMACHAL PRADESH ===
  { id: 's041', name: 'Mountain Mechanic', category: 'mechanic', description: 'Specialist in high-altitude bike issues. Carburetor adjustment, brake bleeding, chain tensioning.', address: 'Mall Road', city: 'Manali', state: 'Himachal Pradesh', phone: '+91 67890 12345', rating: 4.7, reviews: 567, latitude: 32.2396, longitude: 77.1887, isOpen: true, openHours: '7AM - 8PM' },
  { id: 's042', name: 'Tibetan Kitchen', category: 'food', description: 'Authentic Tibetan momos, thukpa, and butter tea. Cozy mountain cafe with valley views.', address: 'Old Manali Road', city: 'Manali', state: 'Himachal Pradesh', phone: '+91 66789 01234', rating: 4.6, reviews: 789, latitude: 32.2432, longitude: 77.1892, isOpen: true, openHours: '8AM - 10PM' },
  { id: 's043', name: 'IGMC Hospital', category: 'hospital', description: 'Govt. medical college hospital. Altitude sickness treatment, emergency ward, blood bank.', address: 'The Ridge', city: 'Shimla', state: 'Himachal Pradesh', phone: '+91 177 265 6002', rating: 4.0, reviews: 345, latitude: 31.1048, longitude: 77.1734, isOpen: true, openHours: '24 Hours' },
  { id: 's044', name: 'Spiti Valley Hostel', category: 'boys_hostel', description: 'Backpacker hostel with mountain views. Bike wash area, tool kit, maps provided. Common kitchen.', address: 'Main Bazaar', city: 'Kaza', state: 'Himachal Pradesh', phone: '+91 65678 90123', rating: 4.5, reviews: 234, latitude: 32.2276, longitude: 78.0716, isOpen: true, openHours: '24 Hours' },
  { id: 's045', name: 'Himalayan Girls Hostel', category: 'girls_hostel', description: 'Safe hostel for women travelers. Hot water, warm blankets, home food. Tour arrangements.', address: 'Near Bus Stand', city: 'Manali', state: 'Himachal Pradesh', phone: '+91 64567 89012', rating: 4.4, reviews: 156, latitude: 32.2403, longitude: 77.1875, isOpen: true, openHours: '24 Hours' },
  { id: 's046', name: 'Rohtang Pass Puncture', category: 'puncture', description: 'Only puncture shop before Rohtang. Tubeless and tube repair. Carries snow chains.', address: 'Rohtang Road, Km 35', city: 'Manali', state: 'Himachal Pradesh', phone: '+91 63456 78901', rating: 4.8, reviews: 456, latitude: 32.3700, longitude: 77.2487, isOpen: true, openHours: '6AM - 5PM (Summer)' },

  // === UTTARAKHAND ===
  { id: 's047', name: 'Rishikesh Bike Works', category: 'mechanic', description: 'Char Dham yatra bike prep. High-altitude tuning, brake check, tire replacement.', address: 'Haridwar Road', city: 'Rishikesh', state: 'Uttarakhand', phone: '+91 62345 67890', rating: 4.5, reviews: 345, latitude: 30.0869, longitude: 78.2676, isOpen: true, openHours: '7AM - 8PM' },
  { id: 's048', name: 'Ganga View Restaurant', category: 'restaurant', description: 'Vegetarian restaurant overlooking River Ganga. Fresh juices, Israeli food, Indian thali.', address: 'Laxman Jhula Road', city: 'Rishikesh', state: 'Uttarakhand', phone: '+91 61234 56789', rating: 4.4, reviews: 567, latitude: 30.1253, longitude: 78.3219, isOpen: true, openHours: '7AM - 10PM' },
  { id: 's049', name: 'AIIMS Rishikesh', category: 'hospital', description: 'Premier government hospital. All emergency services, helipad for evacuation.', address: 'Virbhadra Road', city: 'Rishikesh', state: 'Uttarakhand', phone: '+91 135 246 2946', rating: 4.3, reviews: 890, latitude: 30.0734, longitude: 78.2857, isOpen: true, openHours: '24 Hours' },
  { id: 's050', name: 'Kedarnath Base Camp Hostel', category: 'boys_hostel', description: 'Basic accommodation for trekkers and bikers. Hot food, blankets, medical kit available.', address: 'Near Helipad', city: 'Gaurikund', state: 'Uttarakhand', phone: '+91 60123 45678', rating: 3.8, reviews: 123, latitude: 30.6556, longitude: 79.0871, isOpen: true, openHours: '24 Hours' },

  // === LADAKH ===
  { id: 's051', name: 'Leh Bike Point', category: 'mechanic', description: 'Best mechanic in Leh for high-altitude issues. Oxygen sensor repair, ABS service, tire chains.', address: 'Fort Road', city: 'Leh', state: 'Ladakh', phone: '+91 59012 34567', rating: 4.8, reviews: 890, latitude: 34.1526, longitude: 77.5771, isOpen: true, openHours: '7AM - 7PM' },
  { id: 's052', name: 'Ladakhi Kitchen', category: 'food', description: 'Traditional Ladakhi food. Thukpa, skyu, butter tea, apricot jam. Warm and cozy.', address: 'Main Bazaar', city: 'Leh', state: 'Ladakh', phone: '+91 58901 23456', rating: 4.5, reviews: 456, latitude: 34.1536, longitude: 77.5786, isOpen: true, openHours: '7AM - 9PM' },
  { id: 's053', name: 'SNM Hospital Leh', category: 'hospital', description: 'District hospital with altitude sickness ward. Oxygen therapy, emergency services.', address: 'Hospital Road', city: 'Leh', state: 'Ladakh', phone: '+91 1982 252014', rating: 3.9, reviews: 234, latitude: 34.1620, longitude: 77.5850, isOpen: true, openHours: '24 Hours' },
  { id: 's054', name: 'Pangong Puncture Fix', category: 'puncture', description: 'Remote puncture shop on Pangong route. Only service for 100km. Carries basic spares.', address: 'Chang La Road, Km 60', city: 'Leh', state: 'Ladakh', phone: '+91 57890 12345', rating: 4.6, reviews: 678, latitude: 34.0833, longitude: 77.6167, isOpen: true, openHours: '6AM - 6PM (Summer)' },
  { id: 's055', name: 'Leh Riders Hostel', category: 'boys_hostel', description: 'Popular biker hostel. Heated rooms, bike garage, daily briefings on road conditions.', address: 'Changspa Road', city: 'Leh', state: 'Ladakh', phone: '+91 56789 01234', rating: 4.7, reviews: 567, latitude: 34.1680, longitude: 77.5700, isOpen: true, openHours: '24 Hours' },

  // === MADHYA PRADESH ===
  { id: 's056', name: 'Tiger Trail Resort', category: 'resort', description: 'Jungle resort near Kanha National Park. Safari bookings, bonfire, wildlife photography.', address: 'Kanha Gate Road', city: 'Mandla', state: 'Madhya Pradesh', phone: '+91 55678 90123', rating: 4.5, reviews: 234, latitude: 22.3351, longitude: 80.3718, isOpen: true, openHours: '24 Hours' },
  { id: 's057', name: 'Bhopal Medanta Hospital', category: 'hospital', description: 'Multispecialty hospital. Emergency, ortho, neuro. Ambulance fleet available.', address: 'Hoshangabad Road', city: 'Bhopal', state: 'Madhya Pradesh', phone: '+91 755 430 0000', rating: 4.4, reviews: 567, latitude: 23.2599, longitude: 77.4126, isOpen: true, openHours: '24 Hours' },

  // === WEST BENGAL ===
  { id: 's058', name: 'Darjeeling Motor Works', category: 'mechanic', description: 'Hill station bike specialist. Brake service for downhill, clutch adjustment, engine heating fix.', address: 'Cart Road', city: 'Darjeeling', state: 'West Bengal', phone: '+91 54567 89012', rating: 4.3, reviews: 189, latitude: 27.0410, longitude: 88.2663, isOpen: true, openHours: '8AM - 7PM' },
  { id: 's059', name: 'Glenary Bakery', category: 'food', description: 'Heritage bakery since 1916. Pastries, pies, hot chocolate. Mountain view balcony seating.', address: 'The Mall', city: 'Darjeeling', state: 'West Bengal', phone: '+91 354 225 4149', rating: 4.7, reviews: 1234, latitude: 27.0431, longitude: 88.2636, isOpen: true, openHours: '7AM - 8PM' },

  // === GUJARAT ===
  { id: 's060', name: 'Kutch Desert Camp', category: 'resort', description: 'Rann of Kutch tent resort. Cultural shows, camel rides, white desert tours. Biker packages.', address: 'Dhordo Village', city: 'Kutch', state: 'Gujarat', phone: '+91 53456 78901', rating: 4.6, reviews: 345, latitude: 23.7337, longitude: 69.8597, isOpen: true, openHours: '24 Hours (Season)' },
  { id: 's061', name: 'Manek Chowk Food Street', category: 'food', description: 'Iconic night food market. Dosa, sandwich, kulfi, pav bhaji, Chinese. Must-visit for riders.', address: 'Manek Chowk', city: 'Ahmedabad', state: 'Gujarat', phone: 'N/A', rating: 4.8, reviews: 2345, latitude: 23.0258, longitude: 72.5873, isOpen: true, openHours: '8PM - 2AM' },
  { id: 's062', name: 'Sterling Hospital', category: 'hospital', description: 'Private hospital chain. 24/7 emergency, ambulance, all specialties. Quick response time.', address: 'Gurukul Road', city: 'Ahmedabad', state: 'Gujarat', phone: '+91 79 4000 1200', rating: 4.4, reviews: 890, latitude: 23.0395, longitude: 72.5471, isOpen: true, openHours: '24 Hours' },

  // === SIKKIM & NORTHEAST ===
  { id: 's063', name: 'Gangtok Bike Garage', category: 'mechanic', description: 'Northeast riding specialist. Hill climb tuning, moisture protection, battery service.', address: 'NH10, Near Taxi Stand', city: 'Gangtok', state: 'Sikkim', phone: '+91 52345 67890', rating: 4.4, reviews: 234, latitude: 27.3389, longitude: 88.6065, isOpen: true, openHours: '8AM - 7PM' },
  { id: 's064', name: 'STNM Hospital', category: 'hospital', description: 'State hospital. Altitude sickness treatment, emergency care, pharmacy.', address: 'NH10', city: 'Gangtok', state: 'Sikkim', phone: '+91 3592 222 059', rating: 3.8, reviews: 167, latitude: 27.3290, longitude: 88.6128, isOpen: true, openHours: '24 Hours' },
  { id: 's065', name: 'Cherrapunji Rest House', category: 'boys_hostel', description: 'Budget stay in wettest place on Earth. Rain gear available. Trek to living root bridges.', address: 'Main Road', city: 'Cherrapunji', state: 'Meghalaya', phone: '+91 51234 56789', rating: 4.1, reviews: 123, latitude: 25.2802, longitude: 91.7314, isOpen: true, openHours: '24 Hours' },

  // === PUNJAB & HARYANA ===
  { id: 's066', name: 'Amritsari Dhaba', category: 'food', description: 'Famous Amritsari kulcha, chole, lassi, and butter chicken. Highway landmark since 1975.', address: 'GT Road, NH1', city: 'Amritsar', state: 'Punjab', phone: '+91 50123 45678', rating: 4.7, reviews: 1567, latitude: 31.6340, longitude: 74.8723, isOpen: true, openHours: '6AM - 12AM' },
  { id: 's067', name: 'Fortis Hospital', category: 'hospital', description: 'Corporate hospital. Emergency, cardiac care, ortho, neuro surgery. Helipad available.', address: 'Sector 62', city: 'Mohali', state: 'Punjab', phone: '+91 172 469 2222', rating: 4.5, reviews: 890, latitude: 30.6942, longitude: 76.6892, isOpen: true, openHours: '24 Hours' },

  // === ANDHRA & TELANGANA ===
  { id: 's068', name: 'Hyderabadi Biryani House', category: 'restaurant', description: 'Authentic Hyderabadi dum biryani. Mutton, chicken, and veg options. Since 1960.', address: 'Charminar Area', city: 'Hyderabad', state: 'Telangana', phone: '+91 49012 34567', rating: 4.8, reviews: 3456, latitude: 17.3616, longitude: 78.4747, isOpen: true, openHours: '11AM - 11PM' },
  { id: 's069', name: 'Yashoda Hospital', category: 'hospital', description: 'Multispecialty hospital. Trauma center, ICU, emergency. All insurances accepted.', address: 'Somajiguda', city: 'Hyderabad', state: 'Telangana', phone: '+91 40 4567 8901', rating: 4.3, reviews: 1234, latitude: 17.4326, longitude: 78.4071, isOpen: true, openHours: '24 Hours' },

  // === ADDITIONAL ACROSS INDIA ===
  { id: 's070', name: 'Shell Fuel Station', category: 'petrol', description: 'Premium fuel quality. V-Power petrol, clean restrooms, café inside. Digital payment.', address: 'Outer Ring Road', city: 'Bengaluru', state: 'Karnataka', phone: '+91 48901 23456', rating: 4.4, reviews: 567, latitude: 12.9352, longitude: 77.6245, isOpen: true, openHours: '24 Hours' },
  { id: 's071', name: 'KTM Service Center', category: 'mechanic', description: 'Authorized KTM service. Duke, RC, Adventure specialist. Genuine parts and accessories.', address: 'MG Road', city: 'Pune', state: 'Maharashtra', phone: '+91 47890 12345', rating: 4.5, reviews: 345, latitude: 18.5204, longitude: 73.8567, isOpen: true, openHours: '9:30AM - 7PM' },
  { id: 's072', name: 'Bajaj Authorized Workshop', category: 'mechanic', description: 'Pulsar, Dominar, Avenger service. Free checkup camps. Warranty repairs.', address: 'Industrial Area', city: 'Jaipur', state: 'Rajasthan', phone: '+91 46789 01234', rating: 4.2, reviews: 234, latitude: 26.9124, longitude: 75.7873, isOpen: true, openHours: '9AM - 6PM' },
  { id: 's073', name: 'Yamaha Blue Square', category: 'mechanic', description: 'Yamaha authorized service. R15, MT-15, FZ specialist. Premium service experience.', address: 'Anna Salai', city: 'Chennai', state: 'Tamil Nadu', phone: '+91 45678 90123', rating: 4.4, reviews: 189, latitude: 13.0827, longitude: 80.2707, isOpen: true, openHours: '9AM - 7PM' },
  { id: 's074', name: 'EMRI 108 National', category: 'ambulance', description: 'National emergency number for ambulance. Basic and advanced life support across India.', address: 'Pan India', city: 'All Cities', state: 'All States', phone: '108', rating: 4.0, reviews: 5678, latitude: 20.5937, longitude: 78.9629, isOpen: true, openHours: '24 Hours' },
  { id: 's075', name: 'Police Emergency', category: 'ambulance', description: 'National police emergency helpline. Traffic accidents, theft, emergencies.', address: 'Pan India', city: 'All Cities', state: 'All States', phone: '100', rating: 3.8, reviews: 3456, latitude: 20.5937, longitude: 78.9629, isOpen: true, openHours: '24 Hours' },
];

const DEFAULT_GEMS: HiddenGem[] = [
  { id: 'g1', name: 'Tamhini Ghat Waterfall', description: 'A spectacular seasonal waterfall hidden in the Western Ghats. Best visited during monsoon. The road itself is an amazing ride with hairpin turns and lush greenery.', location: 'Tamhini, Maharashtra', latitude: 18.4594, longitude: 73.4267, rating: 4.9, reviews: 234, addedBy: 'RiderAjay', tags: ['waterfall', 'monsoon', 'scenic'], imageColor: '#1A9B8F' },
  { id: 'g2', name: 'Abandoned Fort Viewpoint', description: 'A crumbling hilltop fort with panoramic views of three valleys. Almost no tourists. Perfect for sunrise photography and peaceful meditation.', location: 'Near Wai, Maharashtra', latitude: 17.9534, longitude: 73.8912, rating: 4.7, reviews: 89, addedBy: 'MotoSanjay', tags: ['fort', 'sunrise', 'photography'], imageColor: '#E86B20' },
  { id: 'g3', name: 'Hidden Lake Trail', description: 'A serene lake accessible only by a 2km dirt trail. Crystal clear water surrounded by dense forest. Great camping spot under the stars.', location: 'Bhimashankar, Maharashtra', latitude: 19.0719, longitude: 73.5358, rating: 4.6, reviews: 156, addedBy: 'TravelRitu', tags: ['lake', 'camping', 'offroad'], imageColor: '#3B82F6' },
  { id: 'g4', name: 'Sunset Point Cliff', description: 'An unmarked cliff edge with the most breathtaking sunset views. Local shepherds showed us this gem. Carry headlights for the ride back.', location: 'Malshej Ghat, Maharashtra', latitude: 19.3312, longitude: 73.7846, rating: 4.8, reviews: 67, addedBy: 'BikerPreeti', tags: ['sunset', 'cliff', 'scenic'], imageColor: '#F59E0B' },
  { id: 'g5', name: 'Ancient Cave Temple', description: 'Rock-cut caves with intricate carvings from the 8th century. Peaceful meditation spot. Only accessible by a winding mountain road.', location: 'Junnar, Maharashtra', latitude: 19.2095, longitude: 73.8742, rating: 4.5, reviews: 112, addedBy: 'ExploreVikram', tags: ['temple', 'history', 'caves'], imageColor: '#8B5CF6' },
  { id: 'g6', name: 'Magnetic Hill', description: 'A gravity-defying hill where vehicles appear to roll uphill. A must-stop for every Ladakh rider. Best experienced on a bike.', location: 'Leh, Ladakh', latitude: 34.1677, longitude: 77.3619, rating: 4.7, reviews: 890, addedBy: 'LadakhRider', tags: ['ladakh', 'mystery', 'highway'], imageColor: '#DC2626' },
  { id: 'g7', name: 'Dudhsagar Falls Base', description: 'One of India\'s tallest waterfalls. The train bridge view is iconic. Accessible by 4x4 or adventure bikes through jungle track.', location: 'Goa-Karnataka Border', latitude: 15.3144, longitude: 74.3143, rating: 4.8, reviews: 1234, addedBy: 'GoanRider', tags: ['waterfall', 'adventure', 'offroad'], imageColor: '#10B981' },
  { id: 'g8', name: 'Sandhan Valley Canyon', description: 'Known as Valley of Shadows. A narrow canyon trek with rappelling and rock climbing. The ride to the base is thrilling.', location: 'Bhandardara, Maharashtra', latitude: 19.5166, longitude: 73.7577, rating: 4.9, reviews: 567, addedBy: 'TrekBiker', tags: ['canyon', 'trek', 'adventure'], imageColor: '#6B7280' },
  { id: 'g9', name: 'Zuluk Zigzag Road', description: 'A former silk route with 32 hairpin turns. Breathtaking views of Kanchenjunga on clear days. Permit required.', location: 'East Sikkim', latitude: 27.1186, longitude: 88.8367, rating: 4.9, reviews: 345, addedBy: 'NERider', tags: ['zigzag', 'mountain', 'permit'], imageColor: '#2563EB' },
  { id: 'g10', name: 'Spiti Fossil Village', description: 'A remote village with 500-million-year-old marine fossils embedded in rocks. Mind-blowing geological history at 14,000 ft.', location: 'Langza, Spiti Valley', latitude: 32.2756, longitude: 78.0887, rating: 4.8, reviews: 234, addedBy: 'SpitiExplorer', tags: ['fossils', 'village', 'highaltitude'], imageColor: '#F97316' },
];

const DEFAULT_POSTS: TravelerPost[] = [
  { id: 'p1', userId: 'u1', userName: 'RiderAjay', content: 'Just completed the Lonavala-Mahabaleshwar loop! Road conditions are excellent after recent repairs. Watch out for fog after 5PM though.', location: 'Mahabaleshwar', timestamp: new Date(Date.now() - 3600000).toISOString(), likes: 24, replies: 8 },
  { id: 'p2', userId: 'u2', userName: 'MotoSanjay', content: 'Anyone riding from Pune to Goa this weekend? Looking for a group ride. Planning to take the coastal route via Ratnagiri.', location: 'Pune', timestamp: new Date(Date.now() - 7200000).toISOString(), likes: 15, replies: 12 },
  { id: 'p3', userId: 'u3', userName: 'BikerPreeti', content: 'Found an amazing mechanic near Satara who fixed my chain alignment in 20 minutes flat. Highly recommend Quick Fix Motors!', location: 'Satara', timestamp: new Date(Date.now() - 14400000).toISOString(), likes: 31, replies: 5 },
  { id: 'p4', userId: 'u4', userName: 'TravelRitu', content: 'The monsoon rides through Tamhini Ghat are absolutely magical. Waterfalls everywhere! Make sure you have good rain gear.', location: 'Tamhini Ghat', timestamp: new Date(Date.now() - 28800000).toISOString(), likes: 42, replies: 16 },
  { id: 'p5', userId: 'u5', userName: 'LadakhRider', content: 'Completed Manali to Leh in 3 days! The views at Tanglang La and Khardung La are out of this world. Must-do for every biker.', location: 'Leh, Ladakh', timestamp: new Date(Date.now() - 43200000).toISOString(), likes: 89, replies: 34 },
  { id: 'p6', userId: 'u6', userName: 'SpitiExplorer', content: 'Spiti Valley in September is heaven! No crowds, clear skies, and the road through Kunzum Pass was perfectly rideable.', location: 'Kaza, Spiti', timestamp: new Date(Date.now() - 57600000).toISOString(), likes: 67, replies: 21 },
];

const DEFAULT_TRAVELERS: NearbyTraveler[] = [
  { id: 't1', name: 'RiderAjay', location: 'Lonavala, Maharashtra', bike: 'Royal Enfield Classic 350', status: 'riding', distance: '12 km', lastSeen: '5 min ago', route: 'Mumbai → Pune' },
  { id: 't2', name: 'MotoSanjay', location: 'Pune, Maharashtra', bike: 'KTM Duke 390', status: 'looking_for_group', distance: '8 km', lastSeen: '2 min ago', route: 'Pune → Goa' },
  { id: 't3', name: 'BikerPreeti', location: 'Satara, Maharashtra', bike: 'Honda CB350', status: 'resting', distance: '25 km', lastSeen: '15 min ago' },
  { id: 't4', name: 'TravelRitu', location: 'Mahabaleshwar', bike: 'Bajaj Dominar 400', status: 'riding', distance: '18 km', lastSeen: '8 min ago', route: 'Mahabaleshwar Loop' },
  { id: 't5', name: 'LadakhRider', location: 'Manali, HP', bike: 'Royal Enfield Himalayan', status: 'looking_for_group', distance: '5 km', lastSeen: '1 min ago', route: 'Manali → Leh' },
  { id: 't6', name: 'SpitiExplorer', location: 'Kaza, Spiti', bike: 'BMW GS 310', status: 'resting', distance: '30 km', lastSeen: '20 min ago' },
  { id: 't7', name: 'GoanRider', location: 'Panaji, Goa', bike: 'Yamaha MT-15', status: 'riding', distance: '15 km', lastSeen: '3 min ago', route: 'Coastal Goa' },
  { id: 't8', name: 'NERider', location: 'Gangtok, Sikkim', bike: 'RE Interceptor 650', status: 'looking_for_group', distance: '22 km', lastSeen: '10 min ago', route: 'Gangtok → Nathula' },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<LocalService[]>([]);
  const [gems, setGems] = useState<HiddenGem[]>([]);
  const [posts, setPosts] = useState<TravelerPost[]>([]);
  const [travelers] = useState<NearbyTraveler[]>(DEFAULT_TRAVELERS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [sData, gData, pData] = await Promise.all([
        AsyncStorage.getItem(SERVICES_KEY),
        AsyncStorage.getItem(GEMS_KEY),
        AsyncStorage.getItem(POSTS_KEY),
      ]);
      setServices(sData ? JSON.parse(sData) : DEFAULT_SERVICES);
      setGems(gData ? JSON.parse(gData) : DEFAULT_GEMS);
      setPosts(pData ? JSON.parse(pData) : DEFAULT_POSTS);
      if (!sData) await AsyncStorage.setItem(SERVICES_KEY, JSON.stringify(DEFAULT_SERVICES));
      if (!gData) await AsyncStorage.setItem(GEMS_KEY, JSON.stringify(DEFAULT_GEMS));
      if (!pData) await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(DEFAULT_POSTS));
    } catch (e) {
      console.error('Failed to load data:', e);
      setServices(DEFAULT_SERVICES);
      setGems(DEFAULT_GEMS);
      setPosts(DEFAULT_POSTS);
    } finally {
      setIsLoading(false);
    }
  }

  async function addService(service: Omit<LocalService, 'id'>) {
    const newService = { ...service, id: 's' + Date.now().toString() };
    const updated = [...services, newService];
    setServices(updated);
    await AsyncStorage.setItem(SERVICES_KEY, JSON.stringify(updated));
  }

  async function updateService(id: string, updates: Partial<LocalService>) {
    const updated = services.map(s => s.id === id ? { ...s, ...updates } : s);
    setServices(updated);
    await AsyncStorage.setItem(SERVICES_KEY, JSON.stringify(updated));
  }

  async function removeService(id: string) {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    await AsyncStorage.setItem(SERVICES_KEY, JSON.stringify(updated));
  }

  async function addGem(gem: Omit<HiddenGem, 'id'>) {
    const newGem = { ...gem, id: 'g' + Date.now().toString() };
    const updated = [...gems, newGem];
    setGems(updated);
    await AsyncStorage.setItem(GEMS_KEY, JSON.stringify(updated));
  }

  async function removeGem(id: string) {
    const updated = gems.filter(g => g.id !== id);
    setGems(updated);
    await AsyncStorage.setItem(GEMS_KEY, JSON.stringify(updated));
  }

  async function addPost(post: Omit<TravelerPost, 'id' | 'timestamp' | 'likes' | 'replies'>) {
    const newPost: TravelerPost = {
      ...post,
      id: 'p' + Date.now().toString(),
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: 0,
    };
    const updated = [newPost, ...posts];
    setPosts(updated);
    await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(updated));
  }

  const value = useMemo(() => ({
    services, gems, posts, travelers,
    addService, updateService, removeService,
    addGem, removeGem,
    addPost, isLoading,
  }), [services, gems, posts, travelers, isLoading]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
