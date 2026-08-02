# GlowCycle

GlowCycle is an AI-powered skincare and style assistant that adapts recommendations based on your skin, menstrual cycle, and climate. It uses YouCam Skin AI to analyze skin concerns from a selfie, then combines that with cycle-aware and climate-aware logic to recommend routines, products, and style guidance.

## Why this project?

A lot of people make skincare decisions in the wrong context:
- their skin changes with hormones,
- their environment changes how skin behaves,
- and their product choices are usually guesswork.

GlowCycle solves that by bringing skin analysis, cycle tracking, and climate-aware recommendations into one experience.

## Features

- **AI skin analysis** using YouCam Skin AI.
- **Cycle-aware recommendations** based on menstrual phase and cycle day.
- **Climate-aware skincare guidance** for humid/tropical and dry/non-tropical conditions.
- **Routine builder** with AM and PM steps tailored to the user.
- **Product suggestions** based on skin concern, actives, and price tier.
- **Color analysis and style guidance** for a broader glow-up experience.
- **Journal and progress tracking** to monitor changes over time.

## Hackathon alignment

This project is built for the **YouCam API Skin AI & Apparel VTO Hackathon** and demonstrates clear consumer value by helping users make better skincare and fashion decisions with AI.

It integrates YouCam API technology in a way that is:
- practical,
- non-trivial,
- product-focused,
- and easy to understand in a demo.

## Tech stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS or plain CSS
- **Backend / Auth / Database:** Firebase
- **Charts:** Recharts
- **API calls:** Fetch
- **AI API:** YouCam Skin AI

## Folder structure

```text
src/
  assets/
  components/
  data/
  lib/
  pages/
  styles/
```

### Folder overview

- `components/` — reusable UI pieces like cards, badges, forms, and charts.
- `data/` — static product lists, routine templates, and color palette presets.
- `lib/` — cycle logic, recommendation rules, YouCam API helpers, and Firebase helpers.
- `pages/` — full app screens like onboarding, dashboard, routine, products, and progress.
- `styles/` — global styling and theme files.

## How it works

1. The user signs up or logs in.
2. The user enters their cycle information and climate/location.
3. The user uploads a selfie.
4. GlowCycle sends the image to YouCam Skin AI.
5. The app stores and displays skin scores.
6. The app calculates the current menstrual phase.
7. The app generates a skincare routine and product recommendations.
8. Optional style and color guidance is shown.
9. The user can track progress over time.

## Main pages

- **Auth** — login and sign-up.
- **Onboarding** — cycle info, climate, and selfie upload.
- **Dashboard** — current phase, skin summary, and insight cards.
- **Routine** — AM and PM skincare steps.
- **Products** — filtered product recommendations.
- **Color Analysis** — palette and style suggestions.
- **Journal** — mood, sleep, and breakout logging.
- **Progress** — charts and trends.

## YouCam API usage

GlowCycle uses **YouCam Skin AI** to analyze a selfie and detect skin concerns such as:
- acne
- oiliness
- moisture
- redness
- radiance
- texture

These results are then combined with:
- menstrual cycle phase,
- climate type,
- and routine rules

to generate personalized guidance.

## Project structure

```text
src/
  components/
    Navbar.jsx
    SkinScoreCard.jsx
    PhaseBadge.jsx
    RoutineCard.jsx
    ProductCard.jsx
    ColorSwatch.jsx
    JournalForm.jsx
    LineChartSimple.jsx

  data/
    products.js
    routines.js
    palettes.js

  lib/
    cycle.js
    skincareRules.js
    youcam.js
    firestore.js

  pages/
    Auth.jsx
    Onboarding.jsx
    Dashboard.jsx
    Routine.jsx
    Products.jsx
    ColorAnalysis.jsx
    Journal.jsx
    Progress.jsx
```

## Setup

### Prerequisites

- Node.js 18+
- A Firebase project
- A YouCam API account and API key

### Installation

```bash
git clone <your-repo-url>
cd glowcycle
npm install
npm run dev
```

### Environment variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_YOUCAM_API_KEY=
```

## Local development

Start the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Demo flow

The demo shows:

1. Sign up
2. Enter cycle and climate information
3. Upload a selfie
4. View YouCam skin analysis results
5. See cycle phase