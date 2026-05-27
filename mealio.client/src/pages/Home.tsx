import Header from "../components/Header";
import ActivityCard from "../components/ActivityCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F1FFF5]">
      <Header />

      <main className="px-5 pt-6">
        <h2 className="mb-6 text-xl font-extrabold uppercase italic text-[#0B5A4A]">
          I NÄRHETEN:
        </h2>

        <div className="grid grid-cols-2 gap-5">
          <ActivityCard
            title="Nordrest"
            schedule="Mån–Fre: kl. 11.15 – 13.15"
            image="/Nordrest.webp"
            id="nordrest"
          />

          <ActivityCard
            title="Edison"
            schedule="Mån–Fre: kl. 11.15 – 13.30"
            image="/Edison.webp"
            id="edison"
          />

          <ActivityCard
            title="Bryggan"
            schedule="Mån–Fre: kl. 11.30 – 13.30"
            image="/Bryggan.jpg"
            id="bryggan"
          />
        </div>
      </main>
    </div>
  );
}
