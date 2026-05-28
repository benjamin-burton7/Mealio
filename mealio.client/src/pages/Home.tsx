import Header from "../components/Header";
import ActivityCard from "../components/ActivityCard";
import MapButton from "../components/MapButton";
import TodayMenuList from "../components/TodayMenuList";
import { restaurants } from "../data/restaurants";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F1FFF5]">
      <Header />

      <MapButton restaurants={restaurants} />

      <main className="px-5 pt-6">
        <TodayMenuList restaurants={restaurants} />

        <h2 className="mb-6 text-xl font-extrabold uppercase italic text-[#0B5A4A]">
          I NÄRHETEN:
        </h2>

        <div className="grid grid-cols-2 gap-5">
          {restaurants.map((restaurant) => (
            <ActivityCard
              key={restaurant.id}
              id={restaurant.id}
              title={restaurant.name}
              schedule={restaurant.schedule}
              image={restaurant.image}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
