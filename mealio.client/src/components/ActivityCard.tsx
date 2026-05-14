import { useNavigate } from "react-router-dom"

type ActivityCardProps = {
  title: string
  schedule: string
  image: string
  id: string
}

export default function ActivityCard({ title, schedule, image, id }: ActivityCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/restaurant/${id}`)}
      className="relative h-40 w-40 overflow-hidden rounded-xl cursor-pointer active:scale-95 transition-transform"
    >
      <img src={image} alt={title} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-x-2 bottom-2 text-white text-center">
        <p className="text-sm font-bold leading-none">{title}</p>
        <p className="mt-1 text-xs font-semibold leading-none">{schedule}</p>
      </div>
    </div>
  )
}