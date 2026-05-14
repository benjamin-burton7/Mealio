export type DishDto = {
  category: string
  price: string
  dish: string
}

export type EdisonMenuDto = {
  week: string
  days: Record<string, DishDto[]>
}