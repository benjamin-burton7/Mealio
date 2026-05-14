import type { EdisonMenuDto } from "../types/menu"

export async function getEdisonMenu(): Promise<EdisonMenuDto> {
  const res = await fetch("/api/menu/edison")
  if (!res.ok) throw new Error("Failed to fetch Edison menu")
  return res.json()
}