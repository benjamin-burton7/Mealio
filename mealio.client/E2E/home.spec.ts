import { test, expect } from '@playwright/test';

test('home page happy path', async ({ page }) => {
  await page.goto('/');

  const header = page.locator('header');
  await expect(header).toBeVisible();

  // Rendered cards
  const restaurantCards = page.locator('a[aria-label*="Visa meny för"]');
  const cardCount = await restaurantCards.count();
  expect(cardCount).toBeGreaterThan(0);

  const restaurantImage = page.locator('img[alt]').first();
  await expect(restaurantImage).toBeVisible();
});
