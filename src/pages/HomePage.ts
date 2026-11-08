import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { SearchResultsPage } from './SearchResultsPage';

/**
 * airbnb.com landing page — the big "Where / Check in / Check out / Who" search bar.
 */
export class HomePage extends BasePage {
  readonly path = '/';

  readonly logo: Locator;
  readonly searchBar: Locator;
  readonly whereInput: Locator;
  readonly searchButton: Locator;
  readonly suggestionList: Locator;
  readonly listingCards: Locator;

  constructor(page: Page) {
    super(page);
    this.logo = page.getByRole('link', { name: /airbnb homepage/i });
    this.searchBar = page.getByTestId('little-search').or(page.getByRole('search')).first();
    this.whereInput = page.getByTestId('structured-search-input-field-query');
    this.searchButton = page.getByTestId('structured-search-input-search-button');
    this.suggestionList = page.getByRole('listbox').or(page.getByTestId('structured-search-input-field-query-panel'));
    this.listingCards = page.getByTestId('card-container');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.logo).toBeVisible();
    await expect(this.page).toHaveTitle(/airbnb/i);
  }

  /** Opens the "Where" field (the compact bar expands into the full search form). */
  async openWhereField(): Promise<void> {
    if (!(await this.whereInput.isVisible().catch(() => false))) {
      await this.safeClick(this.page.getByTestId('little-search-location').or(this.searchBar).first());
    }
    await expect(this.whereInput).toBeVisible();
  }

  /** Types a destination and picks the first suggestion that matches it. */
  async chooseDestination(destination: string): Promise<void> {
    await this.openWhereField();
    await this.whereInput.fill(destination);

    const suggestion = this.page
      .getByRole('option', { name: new RegExp(destination, 'i') })
      .first();

    if (await suggestion.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await suggestion.click();
    } else {
      await this.whereInput.press('Enter');
    }
  }

  /** Runs a search with only a destination (dates / guests flexible). */
  async searchFor(destination: string): Promise<SearchResultsPage> {
    await this.chooseDestination(destination);
    await this.safeClick(this.searchButton);
    const results = new SearchResultsPage(this.page);
    await results.expectLoaded();
    return results;
  }
}
