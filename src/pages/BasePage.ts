import { Page, Locator, expect } from '@playwright/test';

/**
 * Shared behaviour for every page object: navigation, popups, common assertions.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Path relative to baseURL, e.g. "/" or "/s/Berlin/homes". */
  abstract readonly path: string;

  async goto(query: Record<string, string | number> = {}): Promise<this> {
    const qs = new URLSearchParams(
      Object.entries(query).map(([k, v]) => [k, String(v)]),
    ).toString();
    await this.page.goto(qs ? `${this.path}?${qs}` : this.path, { waitUntil: 'domcontentloaded' });
    await this.dismissPopups();
    return this;
  }

  /**
   * Airbnb shows a handful of interstitials (cookie consent, translation prompt,
   * "Get the app" sheet, promo modals). None of them are the subject of our tests,
   * so we close whatever shows up and move on.
   */
  async dismissPopups(): Promise<void> {
    const candidates: Locator[] = [
      this.page.getByRole('button', { name: /^ok$/i }),
      this.page.getByRole('button', { name: /accept( all)?/i }),
      this.page.getByRole('button', { name: /got it/i }),
      this.page.getByRole('dialog').getByRole('button', { name: /close/i }),
    ];

    for (const candidate of candidates) {
      const btn = candidate.first();
      if (await btn.isVisible({ timeout: 1_500 }).catch(() => false)) {
        await btn.click({ timeout: 3_000 }).catch(() => undefined);
      }
    }
  }

  async expectUrlContains(fragment: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(
      typeof fragment === 'string' ? new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) : fragment,
    );
  }

  pageTitle(): Promise<string> {
    return this.page.title();
  }
}
