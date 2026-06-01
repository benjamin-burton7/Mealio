export type RestaurantLocation = {
  id: string;
  name: string;
  schedule: string;
  image: string;
  address: string;
  lat: number;
  lng: number;
  menuPath: string;
};

export const restaurants: RestaurantLocation[] = [
  {
    id: "nordrest",
    name: "Nordrest",
    schedule: "Mån–Fre: kl. 11.15–13.15",
    image: "/nordrest.webp",
    address: "Gränden 1, Lund",
    lat: 55.71837,
    lng: 13.22038,
    menuPath: "/api/menu/nordrest",
  },
  {
    id: "edison",
    name: "Edison",
    schedule: "Mån–Fre: kl. 11.15–13.30",
    image: "/edison.webp",
    address: "Emdalavägen 6B, 223 69 Lund",
    lat: 55.7179,
    lng: 13.2192,
    menuPath: "/api/menu/edison",
  },
  {
    id: "bryggan",
    name: "Bryggan",
    schedule: "Mån–Fre: kl. 11.30–13.30",
    image: "/bryggan.jpg",
    address: "Lund",
    lat: 55.7047,
    lng: 13.191,
    menuPath: "/api/menu/bryggan",
  },
  {
    id: "laziza",
    name: "Laziza",
    schedule: "Mån–Fre: kl. 11.00–15.00",
    image: "/laziza.jpg",
    address: "Lund",
    lat: 55.7047,
    lng: 13.191,
    menuPath: "/api/menu/laziza",
  },
  {
    id: "smaka-pa-kina",
    name: "Smaka på Kina",
    schedule: "Mån–Fre: kl. 11.00–14.00",
    image: "/smaka-pa-kina.jpg",
    address: "Lund",
    lat: 55.7047,
    lng: 13.191,
    menuPath: "/api/menu/smaka-pa-kina",
  },
  {
    id: "inspira",
    name: "Inspira",
    schedule: "Mån–Fre: kl. 11.30–13.30",
    image: "/inspira.jpg",
    address: "Lund",
    lat: 55.7047,
    lng: 13.191,
    menuPath: "/api/menu/inspira",
  },
  {
    id: "salads-and-smoothies",
    name: "Salads & Smoothies",
    schedule: "Mån–Fre: kl. 08.00–14.00",
    image: "/salads-and-smoothies.jpg",
    address: "Lund",
    lat: 55.7047,
    lng: 13.191,
    menuPath: "/api/menu/salads-and-smoothies",
  },
  {
    id: "bricks-eatery",
    name: "Bricks Eatery",
    schedule: "Mån–Fre: kl. 11.00–13.30",
    image: "/bricks-eatery.webp",
    address: "Lund",
    lat: 55.7047,
    lng: 13.191,
    menuPath: "/api/menu/bricks-eatery",
  },
  {
    id: "sony-eatery",
    name: "Sony Eatery",
    schedule: "Mån–Fre: kl. 11.00–14.00",
    image: "/sony-eatery.jpg",
    address: "Mobilvägen 10, Lund",
    lat: 55.7189,
    lng: 13.2217,
    menuPath: "/api/menu/sony-eatery",
  },
];

export function getRestaurantById(id?: string) {
  if (!id) return undefined;

  return restaurants.find((restaurant) => restaurant.id === id);
}
