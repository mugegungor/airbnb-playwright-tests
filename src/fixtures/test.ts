import { test as base } from '@playwright/test';
import { HomePage } from '@pages/HomePage';
import { SearchResultsPage } from '@pages/SearchResultsPage';
import { ListingPage } from '@pages/ListingPage';

/**
 * Custom fixtures: every test gets ready-made page objects injected,
 * so specs read as plain business steps instead of `new XPage(page)` noise.
 */
type Pages = {
  homePage: HomePage;
  searchResultsPage: SearchResultsPage;
  listingPage: ListingPage;
};

export const test = base.extend<Pages>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
  listingPage: async ({ page }, use) => {
    await use(new ListingPage(page));
  },
});

export { expect } from '@playwright/test';
