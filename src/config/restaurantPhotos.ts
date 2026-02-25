/** Restaurant photos config stub */
export type RestaurantCuisine = "burger" | "sushi" | "pizza" | "taco" | "noodles" | "salad";

export const restaurantPhotos: Record<RestaurantCuisine, { src: string; alt: string }> = {
  burger: { src: "/placeholder.svg", alt: "Burgers" },
  sushi: { src: "/placeholder.svg", alt: "Sushi" },
  pizza: { src: "/placeholder.svg", alt: "Pizza" },
  taco: { src: "/placeholder.svg", alt: "Tacos" },
  noodles: { src: "/placeholder.svg", alt: "Noodles" },
  salad: { src: "/placeholder.svg", alt: "Salad" },
};

export function getRestaurantPhoto(cuisine: RestaurantCuisine) {
  return restaurantPhotos[cuisine] || restaurantPhotos.burger;
}
