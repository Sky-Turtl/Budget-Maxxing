# Budget-Maxxing

A personal budgeting web app: paycheck/tax calculator (FICA, federal, state, tiered 401k
match), post-tax allocations, monthly budget categories, subscriptions, purchase logging,
and a spending summary with fiscal-year tracking.

## Setup

1. **Create a Firebase project** at https://console.firebase.google.com.
   - Enable **Authentication → Email/Password**.
   - Enable **Firestore Database** (production mode).
   - Deploy `firestore.rules` and `firestore.indexes.json` (via Firebase CLI:
     `firebase deploy --only firestore`), or paste `firestore.rules` into the console's Rules tab.
   - In Project Settings → General, register a Web App and copy the config values.

2. **Local dev config**: copy `.env.example` to `.env` and fill in the `VITE_FIREBASE_*` values
   from step 1.

3. **Install & run**:
   ```
   npm install
   npm run dev
   ```

4. **Tests**: `npm run test` (vitest, covers all `src/domain` business logic).

## Deploying to GitHub Pages

1. In the repo's Settings → Pages, set Source to **GitHub Actions**.
2. In Settings → Secrets and variables → Actions, add repo secrets for each `VITE_FIREBASE_*`
   value from `.env.example`.
3. Push to `main` — `.github/workflows/deploy.yml` runs tests, builds, and deploys to
   `https://<your-username>.github.io/Budget-Maxxing/`.

## Notes / known limitations (v1)

- Filing status is single-filer only.
- Federal tax brackets/standard deduction use current published figures — review yearly.
- State tax brackets are populated accurately for the top ~15 states by population plus all
  no-income-tax states (see `src/domain/tax/stateTaxData.ts`). Other states fall back to a
  manual effective-rate override entered on the Paycheck Calculator page.
- 401k employer match uses tiered, cumulative-percent breakpoints
  (`src/domain/retirement/employerMatch.ts`).
