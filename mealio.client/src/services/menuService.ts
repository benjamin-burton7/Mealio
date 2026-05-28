import type { MenuDto } from "../types/menu";

export async function getMenu(menuPath: string): Promise<MenuDto> {
  const response = await fetch(menuPath);

  if (!response.ok) {
    throw new Error(`Failed to fetch menu. Status: ${response.status}`);
  }

  return response.json();
}
