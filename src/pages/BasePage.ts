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
   * so we close whatever shows up and move on. The modal may appear a moment after
   * load, so this is also called right before any click that it could intercept.
   */
  async dismissPopups(): Promise<void> {
    const modal = this.page.getByTestId('modal-container');

    for (let attempt = 0; attempt < 3; attempt++) {
      const candidates: Locator[] = [
        modal.getByRole('button', { name: /got it|^ok$|accept( all)?|dismiss|not now|continue/i }),
        modal.getByRole('button', { name: /close/i }),
        this.page.getByRole('button', { name: /^ok$|accept( all)?|got it/i }),
      ];

      let clicked = false;
      for (const candidate of candidates) {
        const btn = candidate.first();
        if (await btn.isVisible({ timeout: 1_000 }).catch(() => false)) {
          await btn.click({ timeout: 3_000 }).catch(() => undefined);
          clicked = true;
          break;
        }
      }

      if (await modal.first().isVisible({ timeout: 500 }).catch(() => false)) {
        if (!clicked) await this.page.keyboard.press('Escape');
        await modal.first().waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => undefined);
      }

      if (!(await modal.first().isVisible({ timeout: 300 }).catch(() => false))) return;
    }
  }

  /** Clicks a locator after making sure no interstitial is covering it. */
  protected async safeClick(locator: Locator): Promise<void> {
    await this.dismissPopups();
    await locator.click();
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
