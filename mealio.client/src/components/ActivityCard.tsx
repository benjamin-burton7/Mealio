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
      className="relative aspect-square w-full overflow-hidden rounded-xl transition-transform active:scale-95"
      aria-label={`Visa meny för ${title}`}
    >
      <img src={image} alt={title} className="h-full w-full object-cover" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="absolute inset-x-2 bottom-2 text-center text-white">
        <p className="text-sm font-bold leading-none">{title}</p>
        <p className="mt-1 text-xs font-semibold leading-none">{schedule}</p>
      </div>
    </Link>
  );
}
