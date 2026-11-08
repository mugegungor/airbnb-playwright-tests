import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Listing detail page ("/rooms/<id>") — title, gallery, price box, reserve CTA.
 */
export class ListingPage extends BasePage {
  readonly path = '/rooms';

  readonly title: Locator;
  readonly gallery: Locator;
  readonly reserveButton: Locator;
  readonly priceBox: Locator;
  readonly hostSection: Locator;
  readonly shareButton: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { level: 1 }).first();
    this.gallery = page.getByRole('button', { name: /show all photos/i }).or(page.getByTestId('photo-viewer-section')).first();
    this.reserveButton = page.getByRole('button', { name: /reserve|check availability/i }).first();
    this.priceBox = page.getByTestId('book-it-default').or(page.locator('[data-section-id="BOOK_IT_SIDEBAR"]')).first();
    this.hostSection = page.locator('[data-section-id="HOST_OVERVIEW_DEFAULT"]').or(page.getByText(/hosted by/i)).first();
    this.shareButton = page.getByRole('button', { name: /share/i }).first();
    this.saveButton = page.getByRole('button', { name: /^save$/i }).first();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/rooms\/\d+/);
    await expect(this.title).toBeVisible({ timeout: 30_000 });
  }

  async listingId(): Promise<string> {
    const match = this.page.url().match(/\/rooms\/(\d+)/);
    if (!match) throw new Error(`Not on a listing page: ${this.page.url()}`);
    return match[1];
  }

  async expectCoreSectionsVisible(): Promise<void> {
    await expect(this.title).not.toBeEmpty();
    await expect(this.gallery).toBeVisible();
    await expect(this.priceBox.or(this.reserveButton)).toBeVisible();
  }
}
