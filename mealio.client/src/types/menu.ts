export type DishDto = {
  category: string;
  price: string;
  dish: string;
};

export type MenuDto = {
  week: string;
  days: Record<string, DishDto[]>;
};
