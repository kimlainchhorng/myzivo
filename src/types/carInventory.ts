/**
 * Types for Car Inventory Search
 */

export interface CarMake {
  id: string;
  name: string;
  slug: string;
}

export interface CarModel {
  id: string;
  make_id: string;
  name: string;
  slug: string;
}

export interface CarInventoryItem {
  id: string;
  make_id: string;
  model_id: string;
  year: number;
  trim: string | null;
  price: number;
  mileage: number;
  fuel: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'plug-in hybrid';
  transmission: 'automatic' | 'manual' | 'cvt';
  location_city: string;
  location_state: string;
  image_url: string | null;
  created_at: string;
  // Joined fields
  make?: CarMake;
  model?: CarModel;
}

export interface CarSearchFilters {
  makeId: string | null;
  modelId: string | null;
  year: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  minMileage: number | null;
  maxMileage: number | null;
  fuel: string | null;
  transmission: string | null;
  location: string | null;
}

export const initialCarSearchFilters: CarSearchFilters = {
  makeId: null,
  modelId: null,
  year: null,
  minPrice: null,
  maxPrice: null,
  minMileage: null,
  maxMileage: null,
  fuel: null,
  transmission: null,
  location: null,
};

export const fuelTypeOptions = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'plug-in hybrid', label: 'Plug-in Hybrid' },
];

export const transmissionOptions = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
  { value: 'cvt', label: 'CVT' },
];
