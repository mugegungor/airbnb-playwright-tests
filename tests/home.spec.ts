import { test, expect } from '@fixtures/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('loads with logo and search bar @smoke', async ({ homePage }) => {
    await homePage.expectLoaded();
    await expect(homePage.searchBar).toBeVisible();
  });

  test('shows at least one listing card on the landing feed', async ({ homePage }) => {
    await expect(homePage.listingCards.first()).toBeVisible();
    expect(await homePage.listingCards.count()).toBeGreaterThan(0);
  });

  test('destination field shows suggestions while typing', async ({ homePage, page }) => {
    await homePage.openWhereField();
    await homePage.whereInput.fill('Berl');
    await expect(page.getByRole('option').first()).toBeVisible();
    await expect(page.getByRole('option', { name: /berlin/i }).first()).toBeVisible();
  });

  test('has no obviously broken links in the footer', async ({ page }) => {
    const footerLinks = page.locator('footer a[href]');
    await expect(footerLinks.first()).toBeVisible();
    const hrefs = await footerLinks.evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));
    const broken = hrefs.filter((h) => !h || h === '#' || h.endsWith('/#'));
    expect(broken, `broken hrefs: ${broken.join(', ')}`).toHaveLength(0);
  });
});
