# airbnb-playwright-tests

![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)
![Node](https://img.shields.io/badge/Node-22-339933?style=flat-square&logo=nodedotjs&logoColor=white)

End-to-end UI test automation for [airbnb.com](https://www.airbnb.com), written in **TypeScript** on top of **Playwright Test**. Built as a compact, production-style example: Page Object Model, custom fixtures, data-driven specs, cross-browser projects and a GitHub Actions pipeline with HTML reports and traces.

## What is covered

| Spec | Scenarios |
|------|-----------|
| `tests/home.spec.ts` | Landing page loads · listing feed renders · destination autocomplete · footer links sanity |
| `tests/search.spec.ts` | UI search from home · results grid + map · dates/guests preserved in URL · filters dialog · **data-driven** searches from `test-data/searches.json` |
| `tests/listing.spec.ts` | Open a listing from results (new tab) · core sections visible · dates carried into listing URL · share/save actions |

Tests tagged `@smoke` form the quick confidence suite (`npm run test:smoke`).

## Project layout

```
.
├── src/
│   ├── pages/            # Page Object Model
│   │   ├── BasePage.ts   # navigation + popup handling shared by all pages
│   │   ├── HomePage.ts
│   │   ├── SearchResultsPage.ts
│   │   └── ListingPage.ts
│   ├── fixtures/test.ts  # injects page objects into every test
│   └── utils/dates.ts    # relative date helpers (no stale hard-coded dates)
├── tests/                # specs
├── test-data/            # JSON used by data-driven tests
├── .github/workflows/    # CI: chromium / firefox / webkit matrix, nightly run
└── playwright.config.ts
```

## Getting started

```bash
npm install
npm run install:browsers   # downloads Chromium, Firefox, WebKit
npm test                   # all projects
npm run test:chromium      # single browser
npm run test:smoke         # @smoke only
npm run test:headed        # watch it run
npm run report             # open last HTML report
```

Copy `.env.example` to `.env` to point the suite at another base URL.

## Design notes

- **Locators**: `getByTestId` / `getByRole` first; CSS only as a fallback. Airbnb's `data-testid`s are stable across redesigns, class names are not.
- **Popups**: cookie consent, "get the app" sheets and promo modals are dismissed centrally in `BasePage.dismissPopups()` so specs stay about the feature under test.
- **Search navigation**: most specs build the canonical `/s/<place>/homes?checkin=…` URL directly instead of driving the date picker. It is faster, deterministic and still exercises the real results page; the home-page search flow is covered once, on purpose.
- **Dates**: always relative to "today" via `stayDates()` so the suite never fails because a hard-coded date slipped into the past.
- **New tabs**: Airbnb opens listings in a new tab; `SearchResultsPage.openListing()` waits for the `page` event and returns a `ListingPage` bound to that tab.
- **Reliability**: `trace: retain-on-failure`, screenshots and video on failure, 2 retries in CI. Third-party sites change without notice — if a locator breaks, the trace viewer shows exactly where.

## CI

Every push and PR runs the suite on Chromium, Firefox and WebKit in parallel; a nightly schedule catches drift in the live site. HTML reports are uploaded as artifacts, and traces/screenshots are uploaded only when something fails.

---

Maintained by [Müge Güngör](https://github.com/mugegungor) · Test Automation Engineer
