# GlowCycle ✨

**[Live Demo on Vercel] (Insert your vercel URL here)** | **[Demo Video] (Insert your YouTube link here)**

GlowCycle is an AI-powered skincare assistant that adapts recommendations based on your skin, menstrual cycle, and climate. It uses **YouCam Skin AI** to analyze skin concerns from a selfie, then combines that with cycle-aware and climate-aware logic to recommend routines, evaluate specific products, and help users track their skin over time.

## Why this project?
A lot of people make skincare decisions in the wrong context:
- Their skin changes with hormones.
- Their environment changes how skin behaves.
- Their product choices are usually guesswork.

GlowCycle solves that by bringing skin analysis, cycle tracking, and climate-aware recommendations into one cohesive experience. It answers the question: *"What should I do next?"*

## Key Features
- **AI Skin Analysis:** Powered by YouCam Skin AI to detect acne, oiliness, moisture, redness, and texture.
- **Retail "Product Check" Flow:** A frictionless, zero-login tool meant to be embedded on retail sites. Scans the user's face and determines if a specific product (e.g., 10% Niacinamide) is a *"Good fit right now"* based on their cycle day and current climate.
- **Cycle & Climate-Aware Logic:** Adjusts recommendations based on menstrual phase (Menstrual, Follicular, Ovulation, Luteal) and real-time local weather.
- **Journal & Progress Tracking:** Users can log their daily skin changes to discover personal patterns over time.

## Hackathon Alignment
This project is built for the **YouCam API Skin AI & Apparel VTO Hackathon** and demonstrates clear consumer and retail value. 
It integrates YouCam API technology in a way that is highly practical, non-trivial, and designed specifically to bridge the gap between AI skin analysis and real-world purchase decisions.

## Tech Stack
- **Frontend:** React + Vite + TypeScript
- **Styling:** Tailwind CSS
- **Backend / APIs:** Vercel Serverless Functions (Node.js) to securely proxy API requests.
- **Auth & Database:** Firebase Authentication & Cloud Firestore
- **External APIs:** YouCam Skin AI API, OpenWeatherMap API

## Setup & Local Development

Because this project uses Vercel Serverless Functions to securely hide API keys, you must use the Vercel CLI to run the development server.

### 1. Prerequisites
- Node.js 18+
- [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`)
- A Firebase project
- A YouCam API Key
- An OpenWeather API Key

### 2. Installation
```bash
git clone <your-repo-url>
cd glowcycle
npm install

### 3. Environment Variables
Create a `.env` file in the project root. **Note:** Firebase keys use the `VITE_` prefix to be exposed to the frontend. YouCam and Weather keys do **not** use a prefix, as they are securely accessed via the backend Vercel functions.

\`\`\`env
# Client-side variables (Firebase)
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Server-side variables (Vercel API Routes)
YOUCAM_API_KEY=your_youcam_key_here
WEATHER_API_KEY=your_openweather_key_here
\`\`\`

### 4. Running Locally
Do not use \`npm run dev\`. To properly emulate the serverless API routes, run:

\`\`\`bash
vercel dev
\`\`\`
The app will be available at `http://localhost:3000`.

## Demo Flow
To fully experience GlowCycle, we recommend testing the following flows:

1. **The Retail Flow:** Visit `/check` without logging in to test the fleeting "Product Check" retail embed.
2. **The Core Flow:** Sign up, log your period start date on the Cycle calendar, and take a Skin Scan to see how your cycle phase and weather impact your results.
3. **The Journal:** Log a daily entry to see how scanned dates map to your history.