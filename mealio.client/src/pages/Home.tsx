import Header from "../components/Header";
import ActivityCard from "../components/ActivityCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F1FFF5]">
      <Header />

      <main className="w-full px-4 pt-6 pb-8">
        <h2 className="mb-5 text-xl font-extrabold uppercase italic text-[#0B5A4A]">
          I NÄRHETEN:
        </h2>

        <div className="grid grid-cols-2 gap-4">
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

          <ActivityCard
            title="Laziza"
            schedule="Mån–Fre: 11.00 – 15.00"
            image="/Laziza.jpg"
            id="laziza"
          />

          <ActivityCard
            title="Smaka på Kina"
            schedule="Mån–Fre: 11.00 – 14.00"
            image="/smaka-pa-kina.jpg"
            id="smaka-pa-kina"
          />

          <ActivityCard
            title="Inspira"
            schedule="Mån–Fre: 11.30 – 13.30"
            image="/inspira.jpg"
            id="inspira"
          />

          <ActivityCard
            title="Salads & Smoothies"
            schedule="Mån–Fre: kl. 08.00 – 14.00"
            image="/salads-and-smoothies.jpg"
            id="salads-and-smoothies"
          />

          <ActivityCard
            title="Bricks Eatery"
            schedule="Mån–Fre: lunch"
            image="/bricks-eatery.webp"
            id="bricks-eatery"
          />
        </div>
      </main>
    </div>
  );
}
