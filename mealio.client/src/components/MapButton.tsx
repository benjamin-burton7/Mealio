import { useState } from "react";
import RestaurantMap from "./RestaurantMap";
import type { RestaurantLocation } from "../data/restaurants";

type MapButtonProps = {
  restaurants: RestaurantLocation[];
};

export default function MapButton({ restaurants }: MapButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#0B5A4A] text-2xl text-white shadow-lg"
        aria-label="Visa karta"
      >
        🗺️
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 px-4 py-20">
          <div className="mx-auto max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between bg-[#61B3AA] px-4 py-3">
              <h2 className="text-lg font-extrabold italic text-[#0B5A4A]">
                Karta
              </h2>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-white/80 px-3 py-1 text-lg font-bold text-[#0B5A4A]"
                aria-label="Stäng karta"
              >
                ×
              </button>
            </div>

            <div className="p-4">
              <RestaurantMap restaurants={restaurants} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
