# Abbotsford Market Pulse

Abbotsford Market Pulse is a single‑page React app that visualizes 10+ years of Abbotsford real estate benchmark data and gives light, data‑driven guidance via the “Ask Pulse AI” assistant.

The app is designed to:

- Show **benchmark pricing and trend direction** for detached, townhouse, and apartment segments.
- Surface **sales‑to‑active ratios** as a simple “momentum” gauge.
- Let you **ask questions in plain language**, including via **voice input**, with strong guardrails that keep the assistant in a data‑only role.
- Allow a **private, admin‑only CSV uploader** (localhost only) to push monthly data into Firestore without touching code.

---

## Tech Stack

- **Frontend**: React + TypeScript
- **Build tool**: Vite
- **State & effects**: React hooks
- **Backend / data store**: Firebase Firestore
- **Auth**: None for public reading; Firestore rules control writes

Key files:

- `src/App.tsx` – main page layout, month dropdown, charts, and admin panel.
- `src/ChatAssistant.tsx` – Ask Pulse AI chat widget (text + voice input).
- `src/data/marketData.ts` – audited historical benchmark series used as a local fallback.
- `src/data/hiddenStats.ts` – hidden volume stats (sales / listings) used by the assistant.
- `src/adminUploader.ts` – CSV → Firestore uploader used from the admin panel.
- `src/firebase.ts` – Firebase app + Firestore initialization.

---

## Prerequisites

- Node.js 18+ (recommended)
- A Firebase project with Firestore enabled

You should have a Firestore collection named:

- `abbotsford_stats` – documents keyed by IDs like `jan_2015`, `feb_2020`, `mar_2026`, etc.

Each document looks like:

```json
{
  "detached": {
    "benchmark": 1234500,
    "sales": 50,
    "newListings": 100,
    "activeListings": 250,
    "salesToActiveRatio": 20,
    "oneMonthChange": 1.23,
    "oneYearChange": 4.56
  },
  "townhouse": { ... },
  "apartment": { ... }
}
```

The admin uploader will calculate the percentage and ratio fields for you from the CSV.

---

## Getting Started (Local Development)

1. **Install dependencies**

```bash
npm install
```

2. **Configure Firebase**

The Firebase config lives in `src/firebase.ts`. Make sure it points at the correct Firebase project:

```ts
const firebaseConfig = {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...',
  measurementId: '...'
};
```

3. **Run the dev server**

```bash
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`).

---

## Firestore Security Rules (Recommended Pattern)

Typical rules used during development:

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for market data
    match /abbotsford_stats/{monthId} {
      allow read: if true;
      allow write: if false; // temporarily set to true when running admin uploads
    }

    // Everything else must be authenticated
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

- For **normal operation**, keep `allow write: if false;` to prevent public writes.
- When you need to bulk‑upload or correct data, temporarily change it to `allow write: if true;`, perform the admin action from localhost, then change it back.

---

## Admin: CSV Data Uploader (Localhost Only)

The admin panel is rendered only when you’re on `localhost`:

- Scroll to the bottom of the app.
- You’ll see **“ADMIN: DATA UPLOADER”** with:
  - A textarea for CSV.
  - An **“UPLOAD TO FIREBASE”** button.
  - A **“RUN BULK BENCHMARK FIX”** button (one‑time historical correction tool).

### CSV Format

The uploader expects:

```text
Property Type,Benchmark Price,Sales,New Listings,Active Listings
Detached,1199100,85,140,452
Townhouse,634600,40,80,180
Apartment,403800,55,95,342
```

Rules:

- **Header row** must come first and is skipped.
- **Property Type**: `Detached`, `Townhouse`, or `Apartment` (case‑insensitive).
- **Numeric fields**: plain numbers, no `$` or commas.

When you click **UPLOAD TO FIREBASE**:

1. You’re prompted for a **month ID**, e.g. `feb_2026`.
2. The app:
   - Fetches `prevMonthId` and `lastYearId` for percentage calculations.
   - Builds `benchmark`, `sales`, `newListings`, `activeListings`.
   - Computes `salesToActiveRatio`, `oneMonthChange`, and `oneYearChange`.
   - Writes the full object to `abbotsford_stats/{monthId}` in Firestore.

To **test safely**, use a throwaway ID like `jan_2019_test`; the main month dropdown only shows real `mon_year` patterns, so test docs won’t appear in the UI.

---

## Ask Pulse AI Assistant

The floating chat widget in the bottom‑right corner is implemented in `ChatAssistant.tsx`.

Capabilities:

- Answers questions about:
  - Benchmarks (e.g. “What was the detached benchmark in Feb 2020?”).
  - Sales counts (e.g. “How many apartments sold in March 2024?”).
- Dynamically chooses **category** based on:
  - The selected category in the main app.
  - Keywords like “apartment”, “townhouse”, “house/detached”.
- Dynamically chooses **month** based on:
  - The selected month in the main app.
  - Month/year words in the question (“in March 2021”, “Feb 2019”, “last year in June”).

### Guardrails

- For questions like **“Is now a good time to sell/buy?”** or **“Should I sell my home?”**, the assistant:
  - Does **not** give personal advice.
  - Returns a scripted response that:
    - Mentions current benchmarks and sales‑to‑active ratio.
    - Explicitly says it is **not a licensed advisor**.
    - Directs the user to **book a strategy call with Don** via the button at the top of the app.
- After three queries, it may show an additional CTA reinforcing that real strategy should be discussed directly with you.

### Voice Input

- Next to the input box is a **mic button**:
  - If supported by the browser (Web Speech API), clicking it starts **speech‑to‑text**.
  - Recognized speech is placed into the text field.
  - You can review/edit and then hit **SEND**.
- Voice is **input only**; the app does not read answers aloud by default.

---

## Historical Data Fallback

The app prefers Firestore for live data:

- `App.tsx` reads `abbotsford_stats/{selectedMonth}`.
- `ChatAssistant.tsx` also tries Firestore first for `monthId`.

If a document is missing or Firestore is unavailable, the assistant falls back to:

- `auditedStats` in `src/data/marketData.ts` (benchmarks and ratios).
- `hiddenStats` in `src/data/hiddenStats.ts` (sales / listings volume).

This ensures the assistant still has a full 10‑year historical view even if not all months have been uploaded to Firestore yet.

---

## Deployment Notes

Deployment is environment‑specific, but in general:

1. Build the app:

```bash
npm run build
```

2. Deploy the contents of `dist/` to your hosting provider (Firebase Hosting, Netlify, Vercel, static S3 bucket, etc.).

3. Make sure:
   - `firebaseConfig` points to the **production** Firebase project.
   - Firestore rules are set to `allow write: if false;` for `abbotsford_stats` unless you are intentionally doing an admin upload.

---

## Common Tasks

- **Update a month’s stats**:
  - Temporarily set Firestore rules to allow writes on `abbotsford_stats`.
  - Run `npm run dev` and use the admin uploader on localhost.
  - Paste the month’s CSV and enter the correct `mon_year` ID.
  - Revert Firestore rules to disallow public writes.

- **Fix a historical series** (e.g. older apartment benchmarks):
  - Use a script like `src/bulkFixBenchmarks.ts` (already set up for one historical correction) to walk over all affected months and overwrite only the `benchmark` fields.
  - Run that script via the localhost admin panel, then remove or disable it after use.

---

## Troubleshooting

- **Permission denied / insufficient permissions** when uploading:
  - Check Firestore rules; writes to `abbotsford_stats` must be temporarily allowed.
- **Test month not visible in dropdown**:
  - Only real `mon_year` IDs are in the dropdown; test IDs (e.g. `jan_2019_test`) won’t show. View them directly in Firestore if needed.
- **Voice button missing**:
  - Browser likely doesn’t support the Web Speech API (try Chrome or Edge on desktop).

If you run into anything unexpected, most issues show up clearly either in the browser console or Firestore rules simulator. Checking both usually explains what’s going on. 

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
