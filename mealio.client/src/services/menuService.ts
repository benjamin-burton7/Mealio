import type { MenuDto } from "../types/menu"

export async function getMenuByRestaurant(id: string): Promise<MenuDto> {
  const res = await fetch(`/api/menu/${id}`)

  if (!res.ok) {
    throw new Error(`Failed to fetch ${id} menu`)
  }

  return res.json()
}