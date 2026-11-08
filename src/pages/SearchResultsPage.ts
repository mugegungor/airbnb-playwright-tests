import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ListingPage } from './ListingPage';

export interface SearchQuery {
  destination: string;
  checkin?: string; // YYYY-MM-DD
  checkout?: string; // YYYY-MM-DD
  adults?: number;
  children?: number;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Search results ("/s/<place>/homes") — listing grid, filters, map.
 */
export class SearchResultsPage extends BasePage {
  readonly path = '/s/homes';

  readonly listingCards: Locator;
  readonly listingTitles: Locator;
  readonly resultsHeading: Locator;
  readonly filtersButton: Locator;
  readonly filtersDialog: Locator;
  readonly mapRegion: Locator;
  readonly nextPageButton: Locator;

  constructor(page: Page) {
    super(page);
    this.listingCards = page.getByTestId('card-container');
    this.listingTitles = page.getByTestId('listing-card-title');
    this.resultsHeading = page.getByRole('heading', { level: 1 }).or(page.getByTestId('stays-page-heading')).first();
    this.filtersButton = page.getByRole('button', { name: /filters/i }).first();
    this.filtersDialog = page.getByRole('dialog', { name: /filters/i });
    this.mapRegion = page.getByTestId('map/GoogleMap').or(page.getByRole('region', { name: /map/i })).first();
    this.nextPageButton = page.getByRole('link', { name: /^next$/i }).or(page.getByLabel(/next/i)).first();
  }

  /** Builds the canonical Airbnb search URL and navigates straight to it. */
  async search(q: SearchQuery): Promise<this> {
    const place = encodeURIComponent(q.destination.trim().replace(/\s*,\s*/g, '--').replace(/\s+/g, '-'));
    const params: Record<string, string | number> = { refinement_paths: '/homes' };
    if (q.checkin) params.checkin = q.checkin;
    if (q.checkout) params.checkout = q.checkout;
    if (q.adults) params.adults = q.adults;
    if (q.children) params.children = q.children;
    if (q.minPrice) params.price_min = q.minPrice;
    if (q.maxPrice) params.price_max = q.maxPrice;

    const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
    await this.page.goto(`/s/${place}/homes?${qs}`, { waitUntil: 'domcontentloaded' });
    await this.dismissPopups();
    await this.expectLoaded();
    return this;
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/s\/.+\/homes/);
    await expect(this.listingCards.first()).toBeVisible({ timeout: 30_000 });
  }

  async resultCount(): Promise<number> {
    await this.listingCards.first().waitFor();
    return this.listingCards.count();
  }

  async expectResultsFor(destination: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(destination.split(/[\s,]+/)[0], 'i'));
    await expect(this.page).toHaveTitle(new RegExp(destination.split(/[\s,]+/)[0], 'i'));
    expect(await this.resultCount()).toBeGreaterThan(0);
  }

  /** Opens the n-th listing card. Airbnb opens listings in a new tab, so we return that tab's page object. */
  async openListing(index = 0): Promise<ListingPage> {
    const card = this.listingCards.nth(index);
    await card.scrollIntoViewIfNeeded();

    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page', { timeout: 20_000 }).catch(() => null),
      card.click(),
    ]);

    const target = newPage ?? this.page;
    await target.waitForLoadState('domcontentloaded');
    const listing = new ListingPage(target);
    await listing.dismissPopups();
    await listing.expectLoaded();
    return listing;
  }

  async openFilters(): Promise<void> {
    await this.filtersButton.click();
    await expect(this.filtersDialog).toBeVisible();
  }
}
