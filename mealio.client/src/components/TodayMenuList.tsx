import { useEffect, useMemo, useState } from "react";
import type { RestaurantLocation } from "../data/restaurants";
import type { DishDto, MenuDto } from "../types/menu";

type RestaurantTodayMenu = {
  restaurant: RestaurantLocation;
  dishes: DishDto[];
  isStatic: boolean;
};

type TodayMenuListProps = {
  restaurants: RestaurantLocation[];
};

const SWEDISH_WEEKDAYS = [
  "Söndag",
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
];

export default function TodayMenuList({ restaurants }: TodayMenuListProps) {
  const [menus, setMenus] = useState<RestaurantTodayMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const today = useMemo(() => {
    const dayIndex = new Date().getDay();
    return SWEDISH_WEEKDAYS[dayIndex];
  }, []);

  const isWeekend = today === "Lördag" || today === "Söndag";

  useEffect(() => {
    async function loadMenus() {
      if (isWeekend) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        const results = await Promise.all(
          restaurants.map(async (restaurant) => {
            const response = await fetch(restaurant.menuPath);

            if (!response.ok) {
              throw new Error(`Failed to fetch ${restaurant.name}`);
            }

            const menu: MenuDto = await response.json();

            const dishes = menu.isStatic
              ? (menu.items ?? [])
              : (menu.days?.[today] ?? []);

            return {
              restaurant,
              dishes,
              isStatic: menu.isStatic ?? false,
            };
          }),
        );

        setMenus(results.filter((result) => result.dishes.length > 0));
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadMenus();
  }, [restaurants, today, isWeekend]);

  const totalDishCount = menus.reduce(
    (total, menu) => total + menu.dishes.length,
    0,
  );

  return (
    <>
      <section className="mb-8">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full rounded-3xl bg-white/85 p-5 text-left shadow-sm transition-transform active:scale-[0.99]"
        >
          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#61B3AA]">
                Dagens menyer
              </p>

              <h2 className="mt-1 text-2xl font-extrabold uppercase italic text-[#0B5A4A]">
                {isWeekend ? "Helgstängt" : today}
              </h2>

              <p className="mt-2 text-sm font-semibold leading-snug text-[#0B5A4A]/70">
                {loading
                  ? "Laddar menyer..."
                  : error
                    ? "Kunde inte ladda menyer."
                    : isWeekend
                      ? "Lunchmenyer visas igen på måndag."
                      : `${menus.length} restauranger • ${totalDishCount} rätter`}
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#61B3AA] text-2xl font-black text-white shadow-sm">
              ☰
            </div>
          </div>
        </button>
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/45">
          <button
            type="button"
            aria-label="Stäng dagens menyer"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-[2rem] bg-[#F1FFF5] shadow-2xl">
            <div className="sticky top-0 z-10 bg-[#F1FFF5]/95 px-6 pb-5 pt-4 backdrop-blur">
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[#61B3AA]/35" />

              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#61B3AA]">
                    Dagens menyer
                  </p>

                  <h2 className="mt-1 text-3xl font-extrabold uppercase italic text-[#0B5A4A]">
                    {today}
                  </h2>

                  {!loading && !error && !isWeekend && (
                    <p className="mt-2 text-sm font-semibold text-[#0B5A4A]/65">
                      {menus.length} restauranger • {totalDishCount} rätter
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-[#0B5A4A] shadow-sm active:scale-95"
                >
                  Stäng
                </button>
              </div>
            </div>

            <div className="max-h-[calc(88vh-132px)] overflow-y-auto px-5 pb-8 pt-2">
              {isWeekend && (
                <div className="rounded-3xl bg-white/85 p-5 shadow-sm">
                  <p className="text-base font-bold leading-relaxed text-[#0B5A4A]">
                    Det är helg, så lunchmenyer visas igen på måndag.
                  </p>
                </div>
              )}

              {loading && !isWeekend && (
                <div className="rounded-3xl bg-white/85 p-5 shadow-sm">
                  <p className="text-base font-bold text-[#0B5A4A]">
                    Laddar dagens menyer...
                  </p>
                </div>
              )}

              {error && !loading && (
                <div className="rounded-3xl bg-white/85 p-5 shadow-sm">
                  <p className="text-base font-bold text-red-700">
                    Kunde inte ladda dagens menyer.
                  </p>
                </div>
              )}

              {!loading && !error && !isWeekend && menus.length === 0 && (
                <div className="rounded-3xl bg-white/85 p-5 shadow-sm">
                  <p className="text-base font-bold text-[#0B5A4A]">
                    Inga menyer hittades för idag.
                  </p>
                </div>
              )}

              {!loading && !error && !isWeekend && menus.length > 0 && (
                <div className="flex flex-col gap-6">
                  {menus.map(({ restaurant, dishes, isStatic }) => (
                    <section
                      key={restaurant.id}
                      className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm"
                    >
                      <div className="border-b border-[#61B3AA]/15 px-5 py-5">
                        <div>
                          <a
                            href={`/restaurant/${restaurant.id}`}
                            className="text-xl font-extrabold text-[#0B5A4A]"
                          >
                            {restaurant.name}
                          </a>

                          <p className="mt-1 text-sm font-semibold leading-snug text-[#61B3AA]">
                            {isStatic ? "Fast meny" : restaurant.schedule}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col divide-y divide-[#61B3AA]/10">
                        {dishes.map((dish, index) => (
                          <article
                            key={`${restaurant.id}-${index}`}
                            className="px-5 py-4"
                          >
                            <div className="mb-2 flex items-center justify-between gap-4">
                              <p className="text-xs font-extrabold uppercase tracking-wide text-[#61B3AA]">
                                {dish.category}
                              </p>

                              {dish.price && (
                                <p className="shrink-0 text-xs font-extrabold text-[#0B5A4A]">
                                  {dish.price}
                                </p>
                              )}
                            </div>

                            <p className="text-[15px] font-bold leading-relaxed text-[#0B5A4A]">
                              {dish.dish}
                            </p>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
