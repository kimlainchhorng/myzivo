// Ride status flow: idle → searching → assigned → arrived → in_trip → completed
export type RideStatus = 
  | 'idle'
  | 'searching'
  | 'assigned'      // Driver accepted the ride
  | 'arrived'       // Driver at pickup location
  | 'in_trip'
  | 'completed'
  | 'cancelled';

export interface DriverInfo {
  name: string;
  car: string;
  plate: string;
  rating: number;
  avatar?: string;
  trips?: number;
}

export interface RideState {
  rideId: string | null;
  tripId: string | null; // Database trip ID for realtime sync
  pickup: string;
  destination: string;
  rideType: string;
  rideName: string;
  rideImage: string;
  price: number;
  distance: number; // miles
  duration: number; // estimated minutes
  status: RideStatus;
  driver: DriverInfo | null;
  eta: number; // seconds remaining until driver arrives
  tripStartTime: number | null; // timestamp when trip started
  tripElapsed: number; // seconds elapsed during trip
  createdAt: number | null; // timestamp when ride was created
  paymentMethod: string;
  pickupCoords?: { lat: number; lng: number };
  dropoffCoords?: { lat: number; lng: number };
  routeCoordinates?: [number, number][];
}

export interface CreateRidePayload {
  pickup: string;
  destination: string;
  rideType: string;
  rideName: string;
  rideImage: string;
  price: number;
  distance: number;
  duration: number;
  paymentMethod: string;
  pickupCoords?: { lat: number; lng: number };
  dropoffCoords?: { lat: number; lng: number };
  routeCoordinates?: [number, number][];
}

export type RideAction =
  | { type: 'CREATE_RIDE'; payload: CreateRidePayload }
  | { type: 'SET_TRIP_ID'; tripId: string }
  | { type: 'SET_STATUS'; status: RideStatus }
  | { type: 'ASSIGN_DRIVER'; driver: DriverInfo }
  | { type: 'UPDATE_ETA'; eta: number }
  | { type: 'START_TRIP' }
  | { type: 'UPDATE_ELAPSED'; elapsed: number }
  | { type: 'COMPLETE_RIDE' }
  | { type: 'CANCEL_RIDE' }
  | { type: 'CLEAR_RIDE' }
  | { type: 'LOAD_FROM_STORAGE'; state: RideState };
