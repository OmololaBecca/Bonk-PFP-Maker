# BONK PFP Maker: Playwright E2E Tests

![Playwright E2E tests](https://github.com/OmololaBecca/Bonk-PFP-Maker/actions/workflows/playwright.yml/badge.svg)

End-to-end tests for [BONK PFP Maker](https://bonk-tribe.vercel.app), a web app where Solana memecoin communities build and download profile pictures. The suite checks real user journeys from the landing page to the downloaded PNG, on Chrome, Firefox, Safari (WebKit) and a mobile Chrome viewport.

## Bugs found

The suite found three issues in the live app. Each is a test that describes the correct behaviour, marked `test.fail()`. The run stays green while the bug exists, and goes red when the bug is fixed, as a reminder to move the test into the regular suite.

| Issue | Type | Expected | Actual |
|---|---|---|---|
| Export resolution | Functional | 1024x1024 PNG, as the home page "High-res Export" card promises | 320x320 PNG |
| SSX sticker pack | Functional | SSX shows its own stickers (home page lists 3) | SSX shows the Bonk sticker files |
| Preview popup | Accessibility | Popup has `role="dialog"` so screen readers announce it | No dialog role |

## What is tested

21 tests, each run on 4 browser and device setups.

| Suite | Tests | Covers |
|---|---|---|
| `home.spec.js` | 3 | Page title and hero, "Try BONK PFP Maker" opens the editor, all four communities listed |
| `editor.spec.js` | 11 | Communities and sample avatars, avatar change redraws the canvas, adding and hiding a sticker, all 5 solid backgrounds, gradient backgrounds, USD sticker pack |
| `preview-download.spec.js` | 4 | Preview popup opens and closes, download is a valid PNG named `pfp.png`, downloaded image keeps the chosen background |
| `known-issues.spec.js` | 3 | The bugs above |

## How it works

- **Page Object Model.** Selectors and actions live in `pages/`, so a UI change is fixed in one place.
- **User-facing selectors.** Elements are found by role and accessible name (`getByRole('button', { name: 'Preview' })`), the way a user or screen reader finds them.
- **No hard waits.** Playwright auto-waiting and `expect.poll` replace `waitForTimeout`.
- **Canvas assertions.** The PFP is drawn on a `<canvas>`, so the tests read its pixels. A checksum proves the image changed, and a pixel check proves the background is the right colour.
- **Download validation.** The downloaded file is checked for the PNG signature, its size is read from the header, and its pixels are decoded to confirm the export matches what the user built.
- **Debugging on failure.** CI keeps a screenshot, a video and a trace for every failed test.

## Project structure

```
.
├── .github/workflows/playwright.yml   # CI: push, pull request, daily run
├── pages/
│   ├── HomePage.js
│   └── PfpMakerPage.js
├── tests/
│   ├── home.spec.js
│   ├── editor.spec.js
│   ├── preview-download.spec.js
│   └── known-issues.spec.js
├── utils/images.js                    # PNG reading and colour helpers
└── playwright.config.js
```

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npx playwright install
npm test                  # all browsers
npm run test:chromium     # Chrome only
npm run test:headed       # watch it run in a browser window
npm run report            # open the HTML report
```

To test another deployment, set `BASE_URL`:

```bash
BASE_URL=https://your-preview-url.vercel.app npm test
```

## Continuous integration

GitHub Actions runs the suite on every push and pull request to `main`, every day at 06:00 UTC, and on demand. Each browser runs as its own parallel job. The HTML report for each job is uploaded as an artifact under the run's **Summary** page.

## Author

Omolola Olaoye, QA Engineer. [LinkedIn](https://www.linkedin.com/in/omolola-olaoye)
