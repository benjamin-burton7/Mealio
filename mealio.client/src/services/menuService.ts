import type { MenuDto } from "../types/menu"

export async function getEdisonMenu(): Promise<MenuDto> {
  const res = await fetch("/api/menu/edison")
  if (!res.ok) throw new Error("Failed to fetch Edison menu")
  return res.json()
}

export async function getBricksMenu(): Promise<MenuDto> {
  const res = await fetch("/api/menu/bricks")
  if (!res.ok) throw new Error("Failed to fetch Bricks menu")
  return res.json()
}