import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { RideState, RideAction, RideStatus, DriverInfo, CreateRidePayload } from '@/types/rideTypes';

const STORAGE_KEY = 'zivo_ride_store';
const TRIP_ID_KEY = 'zivo_active_trip_id';

const initialState: RideState = {
  rideId: null,
  tripId: null,
  pickup: '',
  destination: '',
  rideType: '',
  rideName: '',
  rideImage: '',
  price: 0,
  distance: 0,
  duration: 0,
  status: 'idle',
  driver: null,
  eta: 0,
  tripStartTime: null,
  tripElapsed: 0,
  createdAt: null,
  paymentMethod: '',
  pickupCoords: undefined,
  dropoffCoords: undefined,
  routeCoordinates: undefined,
};

function rideReducer(state: RideState, action: RideAction): RideState {
  switch (action.type) {
    case 'CREATE_RIDE':
      return {
        ...initialState,
        rideId: crypto.randomUUID(),
        pickup: action.payload.pickup,
        destination: action.payload.destination,
        rideType: action.payload.rideType,
        rideName: action.payload.rideName,
        rideImage: action.payload.rideImage,
        price: action.payload.price,
        distance: action.payload.distance,
        duration: action.payload.duration,
        paymentMethod: action.payload.paymentMethod,
        pickupCoords: action.payload.pickupCoords,
        dropoffCoords: action.payload.dropoffCoords,
        routeCoordinates: action.payload.routeCoordinates,
        status: 'searching',
        createdAt: Date.now(),
      };

    case 'SET_TRIP_ID':
      return {
        ...state,
        tripId: action.tripId,
      };

    case 'SET_STATUS':
      return {
        ...state,
        status: action.status,
      };

    case 'ASSIGN_DRIVER':
      return {
        ...state,
        driver: action.driver,
        status: 'assigned',
        eta: 300, // 5 minutes in seconds
      };

    case 'UPDATE_ETA':
      return {
        ...state,
        eta: action.eta,
      };

    case 'START_TRIP':
      return {
        ...state,
        status: 'in_trip',
        tripStartTime: Date.now(),
        tripElapsed: 0,
      };

    case 'UPDATE_ELAPSED':
      return {
        ...state,
        tripElapsed: action.elapsed,
      };

    case 'COMPLETE_RIDE':
      return {
        ...state,
        status: 'completed',
      };

    case 'CANCEL_RIDE':
      return {
        ...state,
        status: 'cancelled',
      };

    case 'CLEAR_RIDE':
      return initialState;

    case 'LOAD_FROM_STORAGE':
      return action.state;

    default:
      return state;
  }
}

interface RideContextValue {
  state: RideState;
  dispatch: React.Dispatch<RideAction>;
  createRide: (payload: CreateRidePayload) => void;
  setTripId: (tripId: string) => void;
  assignDriver: (driver: DriverInfo) => void;
  updateEta: (eta: number) => void;
  startTrip: () => void;
  updateElapsed: (elapsed: number) => void;
  completeRide: () => void;
  cancelRide: () => void;
  clearRide: () => void;
  setStatus: (status: RideStatus) => void;
}

const RideContext = createContext<RideContextValue | null>(null);

export function RideStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(rideReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RideState;
        // Only restore if there's an active ride
        if (parsed.status !== 'idle' && parsed.status !== 'completed' && parsed.status !== 'cancelled') {
          dispatch({ type: 'LOAD_FROM_STORAGE', state: parsed });
        }
      }
    } catch (error) {
      console.error('Failed to load ride state from localStorage:', error);
    }
  }, []);

  // Persist to localStorage on state change
  useEffect(() => {
    try {
      if (state.status !== 'idle') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save ride state to localStorage:', error);
    }
  }, [state]);

  // Action helpers
  const createRide = (payload: CreateRidePayload) => {
    dispatch({ type: 'CREATE_RIDE', payload });
  };

  const setTripId = (tripId: string) => {
    dispatch({ type: 'SET_TRIP_ID', tripId });
    // Also save tripId separately for quick access
    try {
      localStorage.setItem(TRIP_ID_KEY, tripId);
    } catch {}
  };

  const assignDriver = (driver: DriverInfo) => {
    dispatch({ type: 'ASSIGN_DRIVER', driver });
  };

  const updateEta = (eta: number) => {
    dispatch({ type: 'UPDATE_ETA', eta });
  };

  const startTrip = () => {
    dispatch({ type: 'START_TRIP' });
  };

  const updateElapsed = (elapsed: number) => {
    dispatch({ type: 'UPDATE_ELAPSED', elapsed });
  };

  const completeRide = () => {
    dispatch({ type: 'COMPLETE_RIDE' });
  };

  const cancelRide = () => {
    dispatch({ type: 'CANCEL_RIDE' });
  };

  const clearRide = () => {
    dispatch({ type: 'CLEAR_RIDE' });
    // Also clear legacy localStorage keys
    try {
      localStorage.removeItem('zivo_active_ride');
      localStorage.removeItem(TRIP_ID_KEY);
    } catch {}
  };

  const setStatus = (status: RideStatus) => {
    dispatch({ type: 'SET_STATUS', status });
  };

  return (
    <RideContext.Provider
      value={{
        state,
        dispatch,
        createRide,
        setTripId,
        assignDriver,
        updateEta,
        startTrip,
        updateElapsed,
        completeRide,
        cancelRide,
        clearRide,
        setStatus,
      }}
    >
      {children}
    </RideContext.Provider>
  );
}

export function useRideStore() {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRideStore must be used within a RideStoreProvider');
  }
  return context;
}

// Default mock driver to use when simulating
export const DEFAULT_MOCK_DRIVER: DriverInfo = {
  name: 'Alex Johnson',
  car: 'Toyota Camry',
  plate: 'ZIVO123',
  rating: 4.9,
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  trips: 2847,
};
