import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getMenuByRestaurant } from "../services/menuService"
import type { MenuDto } from "../types/menu"
import Header from "../components/Header"

const DAYS = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag"]

const restaurantInfo = {
  edison: {
    title: "Edison",
    image: "/Edison.webp",
    schedule: "Mån–Fre: kl. 11.15 – 13.30",
  },
  nordrest: {
    title: "Nordrest",
    image: "/Nordrest.webp",
    schedule: "Mån–Fre",
  },
  bricks: {
    title: "Bricks",
    image: "/Bricks.webp",
    schedule: "Mån–Fre: kl. 11.15 – 13.30",
  },
}

type RestaurantId = keyof typeof restaurantInfo

export default function RestaurantMenu() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [menu, setMenu] = useState<MenuDto | null>(null)
  const [error, setError] = useState(false)

  const currentRestaurant = id && id in restaurantInfo
    ? restaurantInfo[id as RestaurantId]
    : null

  useEffect(() => {
    if (!id || !(id in restaurantInfo)) {
      setError(true)
      return
    }

    setMenu(null)
    setError(false)

    getMenuByRestaurant(id)
      .then(setMenu)
      .catch(() => setError(true))
  }, [id])

  if (error || !currentRestaurant) return (
    <div className="min-h-screen bg-[#F1FFF5] flex flex-col items-center justify-center gap-4">
      <p className="text-[#0B5A4A] font-bold">Kunde inte ladda menyn.</p>
      <button onClick={() => navigate("/")} className="text-sm underline text-[#61B3AA]">Tillbaka</button>
    </div>
  )

  if (!menu) return (
    <div className="min-h-screen bg-[#F1FFF5] flex items-center justify-center">
      <p className="text-[#0B5A4A] font-bold animate-pulse">Laddar meny...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F1FFF5]">
      <Header />
      <main className="px-5 pt-6 pb-10">
        <button onClick={() => navigate(-1)} className="mb-5 flex items-center gap-1 text-sm font-semibold text-[#0B5A4A]">
          ← Tillbaka
        </button>

        <div className="relative h-44 w-full overflow-hidden rounded-2xl mb-2">
          <img
            src={currentRestaurant.image}
            alt={currentRestaurant.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-2xl font-extrabold italic">{currentRestaurant.title}</h2>
            <p className="text-xs font-semibold opacity-80">{currentRestaurant.schedule}</p>
          </div>
        </div>

        <p className="mb-4 text-xs text-[#61B3AA] font-semibold">{menu.week}</p>

        <h3 className="mb-4 text-xl font-extrabold uppercase italic text-[#0B5A4A]">Veckans meny:</h3>

        <div className="flex flex-col gap-6">
          {DAYS.map((day) => {
            const dishes = menu.days[day]

            if (!dishes?.length) return null

            return (
              <div key={day}>
                <h4 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[#61B3AA]">{day}</h4>
                <div className="flex flex-col gap-2">
                  {dishes.map((item, i) => (
                    <div key={i} className="flex items-start justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                      <div>
                        <p className="text-xs font-bold text-[#61B3AA]">{item.category}</p>
                        <p className="mt-0.5 text-sm font-bold text-[#0B5A4A]">{item.dish}</p>
                      </div>
                      <p className="ml-4 shrink-0 text-sm font-extrabold text-[#0B5A4A]">{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}