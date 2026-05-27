import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import type { MenuDto, DishDto } from "../types/menu";

const DAYS = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag"];

const RESTAURANTS: Record<
  string,
  {
    name: string;
    image: string;
    schedule: string;
  }
> = {
  edison: {
    name: "Edison",
    image: "/edison.webp",
    schedule: "Mån–Fre: kl. 11.15 – 13.30",
  },
  nordrest: {
    name: "Nordrest",
    image: "/nordrest.webp",
    schedule: "Mån–Fre: kl. 11.15 – 13.15",
  },
  bryggan: {
    name: "Bryggan Kök & Cafe",
    image: "/bryggan.jpg",
    schedule: "Mån–Fre: kl. 11.30 – 13.30",
  },
  laziza: {
    name: "Laziza",
    image: "/laziza.jpg",
    schedule: "Mån–Fre: lunchbuffé",
  },
  "smaka-pa-kina": {
    name: "Smaka på Kina",
    image: "/smaka-pa-kina.jpg",
    schedule: "Mån–Fre: lunch",
  },
  inspira: {
    name: "Inspira",
    image: "/inspira.jpg",
    schedule: "Mån–Fre: lunch",
  },
  "salads-and-smoothies": {
    name: "Salads and Smoothies",
    image: "/salads-and-smoothies.jpg",
    schedule: "Mån–Fre: sallader, wraps & poké bowls",
  },
  "bricks-eatery": {
    name: "Bricks Eatery",
    image: "/bricks-eatery.webp",
    schedule: "Mån–Fre: 11.00 – 13.30",
  },
};

function MenuItemCard({ item }: { item: DishDto }) {
  return (
    <div className="flex items-start justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="text-xs font-bold text-[#61B3AA]">{item.category}</p>

        <p className="mt-0.5 text-sm font-bold text-[#0B5A4A]">{item.dish}</p>
      </div>

      {item.price && (
        <p className="ml-4 shrink-0 text-sm font-extrabold text-[#0B5A4A]">
          {item.price}
        </p>
      )}
    </div>
  );
}

export default function RestaurantMenu() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [menu, setMenu] = useState<MenuDto | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const restaurant = id ? RESTAURANTS[id] : undefined;

  useEffect(() => {
    async function loadMenu() {
      if (!id) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        const response = await fetch(`/api/menu/${id}`);

        if (!response.ok) {
          throw new Error(`Failed to load menu. Status: ${response.status}`);
        }

        const data: MenuDto = await response.json();
        setMenu(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#F1FFF5] flex flex-col items-center justify-center gap-4">
        <p className="text-[#0B5A4A] font-bold">Kunde inte ladda menyn.</p>
        <button
          onClick={() => navigate("/")}
          className="text-sm underline text-[#61B3AA]"
        >
          Tillbaka
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1FFF5] flex items-center justify-center">
        <p className="text-[#0B5A4A] font-bold animate-pulse">Laddar meny...</p>
      </div>
    );
  }

  if (!menu || !restaurant) {
    return (
      <div className="min-h-screen bg-[#F1FFF5] flex flex-col items-center justify-center gap-4">
        <p className="text-[#0B5A4A] font-bold">Ingen meny hittades.</p>
        <button
          onClick={() => navigate("/")}
          className="text-sm underline text-[#61B3AA]"
        >
          Tillbaka
        </button>
      </div>
    );
  }

  const hasStaticItems = Boolean(menu.isStatic && menu.items?.length);

  return (
    <div className="min-h-screen bg-[#F1FFF5]">
      <Header />

      <main className="px-5 pt-6 pb-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-1 text-sm font-semibold text-[#0B5A4A]"
        >
          ← Tillbaka
        </button>

        <div className="relative h-44 w-full overflow-hidden rounded-2xl mb-2">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-2xl font-extrabold italic">
              {restaurant.name}
            </h2>
            <p className="text-xs font-semibold opacity-80">
              {restaurant.schedule}
            </p>
          </div>
        </div>

        <p className="mb-4 text-xs text-[#61B3AA] font-semibold">
          {menu.isStatic ? "Fast meny" : menu.week}
        </p>

        <h3 className="mb-4 text-xl font-extrabold uppercase italic text-[#0B5A4A]">
          {menu.isStatic ? "Meny:" : "Veckans meny:"}
        </h3>

        {hasStaticItems ? (
          <div className="flex flex-col gap-2">
            {menu.items?.map((item, i) => (
              <MenuItemCard key={`static-${i}`} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {DAYS.map((day) => {
              const dishes = menu.days?.[day];

              if (!dishes?.length) return null;

              return (
                <div key={day}>
                  <h4 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#61B3AA]">
                    {day}
                  </h4>

                  <div className="flex flex-col gap-2">
                    {dishes.map((item, i) => (
                      <MenuItemCard key={`${day}-${i}`} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
