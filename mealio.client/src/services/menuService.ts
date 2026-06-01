import type { MenuDto } from "../types/menu";

export async function getMenu(restaurantId: string): Promise<MenuDto> {
  const response = await fetch(`/api/menu/${restaurantId}`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch menu for '${restaurantId}'. Status: ${response.status}`,
    );
  }

  return response.json();
}
