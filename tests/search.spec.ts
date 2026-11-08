import { test, expect } from '@fixtures/test';
import { stayDates } from '@utils/dates';
import searches from '../test-data/searches.json';

test.describe('Search', () => {
  test('searching from the home page lands on results for that destination @smoke', async ({ homePage }) => {
    await homePage.goto();
    const results = await homePage.searchFor('Berlin');
    await results.expectResultsFor('Berlin');
  });

  test('results page shows cards, a heading and a map', async ({ searchResultsPage }) => {
    const { checkin, checkout } = stayDates(30, 3);
    await searchResultsPage.search({ destination: 'Berlin, Germany', checkin, checkout, adults: 2 });

    await expect(searchResultsPage.resultsHeading).toBeVisible();
    await expect(searchResultsPage.mapRegion).toBeVisible();
    expect(await searchResultsPage.resultCount()).toBeGreaterThanOrEqual(5);
  });

  test('search URL keeps dates and guest count', async ({ searchResultsPage, page }) => {
    const { checkin, checkout } = stayDates(45, 2);
    await searchResultsPage.search({ destination: 'Lisbon, Portugal', checkin, checkout, adults: 3 });

    const url = new URL(page.url());
    expect(url.searchParams.get('checkin')).toBe(checkin);
    expect(url.searchParams.get('checkout')).toBe(checkout);
    expect(url.searchParams.get('adults')).toBe('3');
  });

  test('filters dialog opens from the results toolbar', async ({ searchResultsPage }) => {
    await searchResultsPage.search({ destination: 'Berlin, Germany' });
    await searchResultsPage.openFilters();
    await expect(searchResultsPage.filtersDialog.getByRole('heading', { name: /filters/i })).toBeVisible();
  });

  // Data-driven: one test per row in test-data/searches.json
  for (const row of searches) {
    test(`data-driven: ${row.destination} for ${row.adults} adult(s), ${row.nights} nights`, async ({ searchResultsPage }) => {
      const { checkin, checkout } = stayDates(60, row.nights);
      await searchResultsPage.search({ destination: row.destination, checkin, checkout, adults: row.adults });
      await searchResultsPage.expectResultsFor(row.destination);
    });
  }
});
