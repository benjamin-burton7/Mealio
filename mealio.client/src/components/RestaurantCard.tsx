import { Link } from "react-router-dom";
import type { RestaurantLocation } from "../data/restaurants";

type RestaurantCardProps = {
  restaurant: RestaurantLocation;
};

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-sm transition-transform active:scale-95 sm:aspect-square"
      aria-label={`Visa meny för ${restaurant.name}`}
    >
      <img
        src={restaurant.image}
        alt={restaurant.name}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      <div className="absolute inset-x-3 bottom-3 text-center text-white">
        <p className="text-sm font-extrabold leading-none sm:text-base">
          {restaurant.name}
        </p>
        <p className="mt-1 text-[11px] font-semibold leading-none opacity-90 sm:text-xs">
          {restaurant.schedule}
        </p>
      </div>
    </Link>
  );
}
