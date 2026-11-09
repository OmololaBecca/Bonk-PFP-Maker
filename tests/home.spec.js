import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';

test.describe('Home page', () => {
  let home;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.goto();
  });

  test('loads with the correct title and hero heading', async ({ page }) => {
    await expect(page).toHaveTitle(/BONK PFP Maker/i);
    await expect(home.heroHeading).toBeVisible();
  });

  test('"Try BONK PFP Maker" opens the editor', async ({ page }) => {
    await home.tryPfpMakerLink.click();
    await expect(page).toHaveURL(/\/pfp$/);
    await expect(page.getByRole('heading', { name: 'Create Your PFP' })).toBeVisible();
  });

  test('lists all four communities', async () => {
    for (const name of ['BONK', 'SSX', 'Unstable', 'Useless']) {
      await expect(home.communityHeading(name)).toBeVisible();
    }
  });
});
