import { Link } from "react-router-dom";

type ActivityCardProps = {
  title: string;
  schedule: string;
  image: string;
  id: string;
};

export default function ActivityCard({
  title,
  schedule,
  image,
  id,
}: ActivityCardProps) {
  return (
    <Link
      to={`/restaurant/${id}`}
      className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-sm transition-transform active:scale-95 sm:aspect-square"
      aria-label={`Visa meny för ${title}`}
    >
      <img
        src={image}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      <div className="absolute inset-x-3 bottom-3 text-center text-white">
        <p className="text-sm font-extrabold leading-none sm:text-base">
          {title}
        </p>
        <p className="mt-1 text-[11px] font-semibold leading-none opacity-90 sm:text-xs">
          {schedule}
        </p>
      </div>
    </Link>
  );
}
