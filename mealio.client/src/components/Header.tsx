import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="flex h-16 w-full items-center justify-center bg-[#61B3AA]">
      <Link
        to="/"
        className="text-2xl font-extrabold italic tracking-tight text-[#0B5A4A]"
      >
        MEALIO
      </Link>
    </header>
  );
}
