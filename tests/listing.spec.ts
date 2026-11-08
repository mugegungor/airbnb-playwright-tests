import { test, expect } from '@fixtures/test';
import { stayDates } from '@utils/dates';

test.describe('Listing details', () => {
  test('opening a result card shows the listing page with core sections @smoke', async ({ searchResultsPage }) => {
    const { checkin, checkout } = stayDates(30, 3);
    await searchResultsPage.search({ destination: 'Berlin, Germany', checkin, checkout, adults: 2 });

    const listing = await searchResultsPage.openListing(0);
    await listing.expectCoreSectionsVisible();
    expect(await listing.listingId()).toMatch(/^\d+$/);
  });

  test('listing keeps the searched dates in its URL', async ({ searchResultsPage }) => {
    const { checkin, checkout } = stayDates(40, 2);
    await searchResultsPage.search({ destination: 'Lisbon, Portugal', checkin, checkout, adults: 2 });

    const listing = await searchResultsPage.openListing(0);
    await listing.expectUrlContains(`check_in=${checkin}`);
    await listing.expectUrlContains(`check_out=${checkout}`);
  });

  test('share and save actions are available on a listing', async ({ searchResultsPage }) => {
    await searchResultsPage.search({ destination: 'Berlin, Germany' });
    const listing = await searchResultsPage.openListing(1);

    await expect(listing.shareButton).toBeVisible();
    await expect(listing.saveButton).toBeVisible();
  });
});
