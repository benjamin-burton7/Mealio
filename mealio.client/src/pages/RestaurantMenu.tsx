import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMenu } from "../services/menuService";
import Header from "../components/Header";
import { getRestaurantById } from "../data/restaurants";
import type { RestaurantLocation } from "../data/restaurants";
import type { DishDto, MenuDto } from "../types/menu";

const DAYS = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag"];

type ViewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; menu: MenuDto; restaurant: RestaurantLocation };

function MenuItemCard({ item }: { item: DishDto }) {
  return (
    <article className="flex w-full items-start justify-between gap-4 rounded-xl bg-white px-4 py-3 shadow-sm">
      <div className="min-w-0">
        {item.category && (
          <p className="text-xs font-bold uppercase tracking-wide text-[#61B3AA]">
            {item.category}
          </p>
        )}

        <p className="mt-1 text-sm font-bold leading-snug text-[#0B5A4A]">
          {item.dish}
        </p>
      </div>

      {item.price && (
        <p className="shrink-0 text-sm font-extrabold text-[#0B5A4A]">
          {item.price}
        </p>
      )}
    </article>
  );
}

function StatusScreen({
  message,
  buttonText,
  onClick,
  loading = false,
}: {
  message: string;
  buttonText?: string;
  onClick?: () => void;
  loading?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#F1FFF5]">
      <Header />
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-5 text-center">
        <p
          className={`font-bold text-[#0B5A4A] ${loading ? "animate-pulse" : ""}`}
        >
          {message}
        </p>
        {buttonText && onClick && (
          <button
            type="button"
            onClick={onClick}
            className="text-sm font-bold text-[#61B3AA] underline"
          >
            {buttonText}
          </button>
        )}
      </main>
    </div>
  );
}

export default function RestaurantMenu() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const selectedRestaurant = useMemo(() => getRestaurantById(id), [id]);

  const [viewState, setViewState] = useState<ViewState>({ status: "loading" });

  useEffect(() => {
    async function loadMenu() {
      if (!id || !selectedRestaurant) {
        setViewState({
          status: "error",
          message: "Restaurangen hittades inte.",
        });
        return;
      }

      try {
        setViewState({ status: "loading" });
        const menu = await getMenu(id);
        setViewState({
          status: "success",
          menu,
          restaurant: selectedRestaurant,
        });
      } catch (error) {
        console.error(error);
        setViewState({ status: "error", message: "Kunde inte ladda menyn." });
      }
    }

    loadMenu();
  }, [id, selectedRestaurant]);

  if (viewState.status === "loading") {
    return <StatusScreen message="Laddar meny..." loading />;
  }

  if (viewState.status === "error") {
    return (
      <StatusScreen
        message={viewState.message}
        buttonText="Tillbaka"
        onClick={() => navigate("/")}
      />
    );
  }

  const { menu, restaurant } = viewState;
  const hasStaticItems = Boolean(menu.isStatic && menu.items?.length);

  return (
    <div className="min-h-screen bg-[#F1FFF5]">
      <Header />
      <main className="w-full px-4 pb-8 pt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-1 text-sm font-semibold text-[#0B5A4A]"
        >
          ← Tillbaka
        </button>

        <section className="relative mb-3 h-44 w-full overflow-hidden rounded-2xl">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-2xl font-extrabold italic">
              {restaurant.name}
            </h1>
            <p className="text-xs font-semibold opacity-80">
              {restaurant.schedule}
            </p>
          </div>
        </section>

        <p className="mb-4 text-xs font-semibold text-[#61B3AA]">
          {menu.isStatic ? "Fast meny" : menu.week}
        </p>

        <h2 className="mb-4 text-xl font-extrabold uppercase italic text-[#0B5A4A]">
          {menu.isStatic ? "Meny:" : "Veckans meny:"}
        </h2>

        {hasStaticItems ? (
          <div className="flex flex-col gap-2">
            {menu.items?.map((item, index) => (
              <MenuItemCard key={`static-${index}`} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {DAYS.map((day) => {
              const dishes = menu.days?.[day];
              if (!dishes?.length) return null;
              return (
                <section key={day}>
                  <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#61B3AA]">
                    {day}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {dishes.map((item, index) => (
                      <MenuItemCard key={`${day}-${index}`} item={item} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
