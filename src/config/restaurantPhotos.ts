/**
 * RESTAURANT PHOTO CONFIGURATION
 * Consistent 1:1 food photography for Eats section
 * All images use cool/neutral styling with professional food photography
 */

export type RestaurantCuisine = 
  | "burger" 
  | "sushi" 
  | "pizza" 
  | "taco" 
  | "noodles" 
  | "salad";

export interface RestaurantPhoto {
  src: string;
  alt: string;
}

// Using optimized Unsplash URLs with high-quality 800x600 aspect ratio
export const restaurantPhotos: Record<RestaurantCuisine, RestaurantPhoto> = {
  burger: {
    src: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop&q=85",
    alt: "Gourmet burger with fresh ingredients - American cuisine",
  },
  sushi: {
    src: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop&q=85",
    alt: "Fresh sushi platter - Japanese cuisine",
  },
  pizza: {
    src: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop&q=85",
    alt: "Artisan pizza with fresh toppings - Italian cuisine",
  },
  taco: {
    src: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop&q=85",
    alt: "Fresh tacos with colorful toppings - Mexican cuisine",
  },
  noodles: {
    src: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop&q=85",
    alt: "Thai noodles in bowl - Asian cuisine",
  },
  salad: {
    src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop&q=85",
    alt: "Fresh healthy salad bowl - Healthy cuisine",
  },
};

// Mapping from restaurant ID to cuisine type
export const restaurantToCuisine: Record<string, RestaurantCuisine> = {
  "1": "burger",
  "2": "sushi",
  "3": "pizza",
  "4": "taco",
  "5": "noodles",
  "6": "salad",
};

// Get photo for a restaurant by ID
export const getRestaurantPhoto = (restaurantId: string): RestaurantPhoto => {
  const cuisine = restaurantToCuisine[restaurantId] || "burger";
  return restaurantPhotos[cuisine];
};
