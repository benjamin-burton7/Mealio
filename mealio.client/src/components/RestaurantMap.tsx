import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { RestaurantLocation } from "../data/restaurants";

type RestaurantMapProps = {
  restaurants: RestaurantLocation[];
};

function getGoogleMapsWalkingUrl(restaurant: RestaurantLocation) {
  return `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}&travelmode=walking`;
}

function createRestaurantIcon(restaurant: RestaurantLocation) {
  const iconUrl = restaurant.mapIcon ?? restaurant.image;

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 44px;
        height: 44px;
        border-radius: 9999px;
        overflow: hidden;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        background: white;
      ">
        <img 
          src="${iconUrl}" 
          alt="${restaurant.name}" 
          style="
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          "
        />
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44],
  });
}

function FitMapToRestaurants({
  restaurants,
}: {
  restaurants: RestaurantLocation[];
}) {
  const map = useMap();

  useEffect(() => {
    if (restaurants.length === 0) return;

    const bounds = L.latLngBounds(
      restaurants.map((restaurant) => [restaurant.lat, restaurant.lng]),
    );

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 15,
    });
  }, [map, restaurants]);

  return null;
}

export default function RestaurantMap({ restaurants }: RestaurantMapProps) {
  const fallbackCenter: [number, number] = [55.7181, 13.2198];

  return (
    <div className="h-72 w-full overflow-hidden rounded-2xl shadow">
      <MapContainer
        center={fallbackCenter}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <FitMapToRestaurants restaurants={restaurants} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.lat, restaurant.lng]}
            icon={createRestaurantIcon(restaurant)}
          >
            <Popup>
              <div className="min-w-40">
                <p className="font-bold">{restaurant.name}</p>
                <p className="text-sm">{restaurant.schedule}</p>
                <p className="mt-1 text-xs text-gray-600">
                  {restaurant.address}
                </p>

                <a
                  href={getGoogleMapsWalkingUrl(restaurant)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block rounded-full bg-[#0B5A4A] px-3 py-1.5 text-xs font-bold text-white"
                >
                  Vägbeskrivning
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
