import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import type { RestaurantLocation } from "../data/restaurants";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type RestaurantMapProps = {
  restaurants: RestaurantLocation[];
};

const defaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

function getGoogleMapsWalkingUrl(restaurant: RestaurantLocation) {
  return `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}&travelmode=walking`;
}

export default function RestaurantMap({ restaurants }: RestaurantMapProps) {
  const center: [number, number] = [55.7181, 13.2198];

  return (
    <div className="h-72 w-full overflow-hidden rounded-2xl shadow">
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.lat, restaurant.lng]}
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
