export type RestaurantLocation = {
  id: string;
  name: string;
  schedule: string;
  image: string;
  mapIcon?: string;
  address: string;
  lat: number;
  lng: number;
};

export const restaurants: RestaurantLocation[] = [
  {
    id: "nordrest",
    name: "Nordrest",
    schedule: "Mån–Fre: kl. 11.15–13.15",
    image: "/nordrest.webp",
    mapIcon: "/map-icons/nordrest-icon.webp",
    address: "Gränden 1, Lund",
    lat: 55.71837,
    lng: 13.22038,
  },
  {
    id: "edison",
    name: "Edison",
    schedule: "Mån–Fre: kl. 11.15–13.30",
    image: "/edison.webp",
    mapIcon: "/map-icons/edison-icon.png",
    address: "Emdalavägen 6B, 223 69 Lund",
    lat: 55.717581383429156,
    lng: 13.218044103639794,
  },
  {
    id: "bryggan",
    name: "Bryggan",
    schedule: "Mån–Fre: kl. 11.30–13.30",
    image: "/bryggan.jpg",
    mapIcon: "/map-icons/bryggan-icon.png",
    address: "Lund",
    lat: 55.71523994775372,
    lng: 13.212575381821518,
  },
  {
    id: "laziza",
    name: "Laziza",
    schedule: "Mån–Fre: kl. 11.00–15.00",
    image: "/laziza.jpg",
    mapIcon: "/map-icons/laziza-icon.png",
    address: "Lund",
    lat: 55.712859214920094,
    lng: 13.21437442195504,
  },
  {
    id: "smaka-pa-kina",
    name: "Smaka på Kina",
    schedule: "Mån–Fre: kl. 11.00–14.00",
    image: "/smaka-pa-kina.jpg",
    mapIcon: "/map-icons/smaka-pa-kina-icon.png",
    address: "Lund",
    lat: 55.71495637598995,
    lng: 13.21636900746364,
  },
  {
    id: "inspira",
    name: "Inspira",
    schedule: "Mån–Fre: kl. 11.30–13.30",
    image: "/inspira.jpg",
    mapIcon: "/map-icons/inspira-icon.jpg",
    address: "Lund",
    lat: 55.71104358420009,
    lng: 13.21918989975964,
  },
  {
    id: "salads-and-smoothies",
    name: "Salads & Smoothies",
    schedule: "Mån–Fre: kl. 08.00–14.00",
    image: "/salads-and-smoothies.jpg",
    mapIcon: "/map-icons/salads-and-smoothies-icon.png",
    address: "Lund",
    lat: 55.714961983188765,
    lng: 13.215150554944834,
  },
  {
    id: "bricks-eatery",
    name: "Bricks Eatery",
    schedule: "Mån–Fre: kl. 11.00–13.30",
    image: "/bricks-eatery.webp",
    mapIcon: "/map-icons/bricks-eatery-icon.png",
    address: "Lund",
    lat: 55.71649857010047,
    lng: 13.227733780855804,
  },
  {
    id: "eatery",
    name: "Eatery",
    schedule: "Mån–Fre: kl. 11.00–14.00",
    image: "/eatery.jpg",
    mapIcon: "/map-icons/eatery-icon.png",
    address: "Mobilvägen 10, Lund",
    lat: 55.71828514845217,
    lng: 13.22698303658439,
  },
];

export function getRestaurantById(id?: string) {
  if (!id) return undefined;
  return restaurants.find((restaurant) => restaurant.id === id);
}
