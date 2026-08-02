# GlowCycle Implementation Guide

## 1. Tech Stack

- Frontend: React + Vite
- Styling: Tailwind CSS or plain CSS
- Auth / DB: Firebase Auth + Firestore
- Charts: Recharts
- API calls: native fetch
- Core AI: YouCam Skin Analysis API
- Optional fashion features: YouCam Apparel VTO / color analysis

## 2. Suggested Folder Structure

```text
src/
  assets/
  components/
  data/
  lib/
  pages/
  styles/
```

### Folder Purpose

#### `components/`
Reusable UI pieces:
- Navbar
- Skin score cards
- Routine cards
- Product cards
- Color swatches
- Journal form
- Progress chart wrappers

#### `data/`
Static content and presets:
- Product catalog
- Routine templates
- Color palette presets
- Climate guidance presets

#### `lib/`
Core logic:
- Cycle phase calculator
- Routine generator
- YouCam API helpers
- Firestore helpers
- Recommendation matching

#### `pages/`
Full screens:
- Auth
- Onboarding
- Dashboard
- Routine
- Products
- Color analysis
- Journal
- Progress

---

## 3. App Flow

### User Journey

1. User signs up or logs in.
2. User enters period data and climate/location.
3. User uploads a selfie.
4. App sends image to YouCam Skin Analysis.
5. App saves skin scores.
6. App calculates cycle phase.
7. App generates routine and product suggestions.
8. User can optionally view style/color suggestions.
9. User can track progress over time.

---

## 4. Core Logic Files

### `src/lib/cycle.js`

This file calculates:
- cycle day
- menstrual phase
- follicular phase
- ovulatory phase
- luteal phase

```js
export function getPhaseInfo(lastPeriodStartStr, cycleLength = 28) {
  const lastPeriodStart = new Date(lastPeriodStartStr);
  const today = new Date();

  const diffTime = today.getTime() - lastPeriodStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const cycleDay = ((diffDays - 1) % cycleLength) + 1;
  const ovulationDay = cycleLength - 14;

  let phase;
  if (cycleDay <= 5) phase = "menstrual";
  else if (cycleDay < ovulationDay - 1) phase = "follicular";
  else if (cycleDay <= ovulationDay + 2) phase = "ovulatory";
  else phase = "luteal";

  return { cycleDay, phase, ovulationDay };
}
```

---

### `src/lib/skincareRules.js`

This generates a routine based on:
- cycle phase
- YouCam skin scores

```js
const BASE_ROUTINES = {
  menstrual: {
    am: [
      { type: "cleanser", label: "Gentle cleanser", focus: "hydration" },
      { type: "serum", label: "Hydrating serum", focus: "hydration" },
      { type: "moisturizer", label: "Light moisturizer", focus: "barrier" },
      { type: "spf", label: "SPF 50", focus: "protection" },
    ],
    pm: [
      { type: "cleanser", label: "Gentle cleanser", focus: "hydration" },
      { type: "serum", label: "Soothing serum", focus: "barrier" },
      { type: "moisturizer", label: "Richer moisturizer", focus: "barrier" },
    ],
  },
  follicular: {
    am: [
      { type: "cleanser", label: "Mild cleanser", focus: "balance" },
      { type: "serum", label: "Antioxidant serum", focus: "glow" },
      { type: "moisturizer", label: "Light moisturizer", focus: "balance" },
      { type: "spf", label: "SPF 50", focus: "protection" },
    ],
    pm: [
      { type: "cleanser", label: "Mild cleanser", focus: "balance" },
      { type: "treatment", label: "Gentle exfoliant", focus: "clarity" },
      { type: "moisturizer", label: "Light moisturizer", focus: "balance" },
    ],
  },
  ovulatory: {
    am: [
      { type: "cleanser", label: "Gentle cleanser", focus: "maintain" },
      { type: "serum", label: "Brightening serum", focus: "glow" },
      { type: "moisturizer", label: "Light moisturizer", focus: "maintain" },
      { type: "spf", label: "SPF 50", focus: "protection" },
    ],
    pm: [
      { type: "cleanser", label: "Gentle cleanser", focus: "maintain" },
      { type: "treatment", label: "Mild exfoliant", focus: "glow" },
      { type: "moisturizer", label: "Light moisturizer", focus: "maintain" },
    ],
  },
  luteal: {
    am: [
      { type: "cleanser", label: "Gentle foaming cleanser", focus: "oil-control" },
      { type: "serum", label: "Niacinamide serum", focus: "oil-control" },
      { type: "moisturizer", label: "Light non-comedogenic moisturizer", focus: "barrier" },
      { type: "spf", label: "SPF 50", focus: "protection" },
    ],
    pm: [
      { type: "cleanser", label: "Gentle foaming cleanser", focus: "oil-control" },
      { type: "treatment", label: "Salicylic acid or azelaic acid", focus: "anti-acne" },
      { type: "moisturizer", label: "Light moisturizer", focus: "barrier" },
    ],
  },
};

export function generateRoutine(phase, scores) {
  const base = BASE_ROUTINES[phase] || BASE_ROUTINES.follicular;
  const am = JSON.parse(JSON.stringify(base.am));
  const pm = JSON.parse(JSON.stringify(base.pm));

  if (scores.acne.ui_score < 60) {
    pm.push({
      type: "treatment",
      label: "Spot treatment",
      focus: "anti-acne",
    });
  }

  if (scores.moisture.ui_score < 60) {
    am.push({
      type: "moisturizer",
      label: "Extra hydrating layer",
      focus: "hydration",
    });
    pm.push({
      type: "moisturizer",
      label: "Barrier-support moisturizer",
      focus: "barrier",
    });
  }

  if (scores.oiliness.ui_score < 60) {
    am.push({
      type: "serum",
      label: "Lightweight oil-control serum",
      focus: "oil-control",
    });
  }

  if (scores.redness.ui_score < 60) {
    pm.push({
      type: "serum",
      label: "Soothing serum",
      focus: "soothing",
    });
  }

  return { am, pm };
}
```

---

### `src/lib/youcam.js`

This handles the YouCam skin analysis flow.

```js
const BASE_URL = "https://yce-api-01.makeupar.com";
const API_KEY = import.meta.env.VITE_YOUCAM_API_KEY;

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "YouCam API error");
  return data;
}

export async function uploadSkinImage(file) {
  const fileRes = await request("/s2s/v2.0/file/skin-analysis", {
    method: "POST",
    body: JSON.stringify({
      files: [
        {
          content_type: file.type,
          file_name: file.name,
          file_size: file.size,
        },
      ],
    }),
  });

  const fileInfo = fileRes.data.files;
  const uploadUrl = fileInfo.requests.url;
  const fileId = fileInfo.file_id;

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
      "Content-Length": String(file.size),
    },
    body: file,
  });

  if (!uploadRes.ok) throw new Error("Image upload failed");

  return { fileId };
}

export async function startSkinAnalysis(fileId) {
  const taskRes = await request("/s2s/v2.0/task/skin-analysis", {
    method: "POST",
    body: JSON.stringify({
      src_file_id: fileId,
      dst_actions: ["acne", "oiliness", "moisture", "redness", "radiance", "texture"],
      format: "json",
    }),
  });

  return { taskId: taskRes.data.task_id };
}

export async function pollSkinAnalysis(taskId) {
  while (true) {
    const data = await request(`/s2s/v2.0/task/skin-analysis/${taskId}`);
    const status = data.data.task_status;

    if (status === "success") return data.data.results;
    if (status === "error") throw new Error("Skin analysis failed");

    await new Promise((r) => setTimeout(r, 2000));
  }
}

export async function runFullSkinAnalysis(file) {
  const { fileId } = await uploadSkinImage(file);
  const { taskId } = await startSkinAnalysis(fileId);
  return await pollSkinAnalysis(taskId);
}
```

---

## 5. Firestore Helpers

### Purpose
These helpers make it easier to:
- save user profiles
- save scans
- save journal entries
- fetch recent data

### Suggested collections
- `users`
- `skin_scans`
- `journal_entries`

```js
import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

const usersRef = collection(db, "users");
const skinScansRef = collection(db, "skin_scans");
const journalRef = collection(db, "journal_entries");

export async function createUserProfile(uid, profile) {
  await setDoc(doc(usersRef, uid), {
    ...profile,
    createdAt: new Date().toISOString(),
  });
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(usersRef, uid));
  return snap.exists() ? snap.data() : null;
}

export async function saveSkinScan(uid, scanData) {
  await addDoc(skinScansRef, {
    uid,
    ...scanData,
    createdAt: new Date().toISOString(),
  });
}

export async function getSkinScans(uid) {
  const q = query(skinScansRef, where("uid", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
```

---

## 6. Component Checklist

### `components/Navbar.jsx`
- App navigation
- Links to dashboard, routine, products, colors, journal, progress
- Sign out button

### `components/SkinScoreCard.jsx`
- Displays acne/oil/moisture/redness/radiance
- Can show score bars or simple numbers

### `components/RoutineCard.jsx`
- Shows AM or PM routine
- Steps list
- Product suggestions under each step

### `components/ProductCard.jsx`
- Product name
- Category
- Active ingredients
- Price tier
- Availability

### `components/ColorSwatch.jsx`
- Color box
- Swatch name
- Palette grouping

### `components/JournalForm.jsx`
- Mood, sleep, breakout, note input

### `components/PhaseBadge.jsx`
- Displays current cycle phase
- Should be color-coded

### `components/LineChartSimple.jsx`
- Reusable chart wrapper for progress visualization

---

## 7. Page Checklist

### `pages/Auth.jsx`
- Login
- Sign up
- Basic error handling

### `pages/Onboarding.jsx`
- Last period input
- Cycle length input
- Location/climate input
- Selfie upload
- Start analysis button

### `pages/Dashboard.jsx`
- Phase summary
- Latest skin scores
- Key insight text
- Quick links

### `pages/Routine.jsx`
- AM and PM routine cards
- Product recommendations
- Human-readable explanations

### `pages/Products.jsx`
- Product catalog
- Search/filter by concern
- Budget filtering

### `pages/ColorAnalysis.jsx`
- Undertone
- Palette
- Best colors
- Style guidance

### `pages/Journal.jsx`
- Mood and habit logging
- Recent entries list

### `pages/Progress.jsx`
- Charts
- Trends over time
- Optional phase comparisons

---

## 8. Product Data Structure

You can keep this in a static file first.

```js
[
  {
    id: "cleanser-1",
    name: "Gentle Gel Cleanser",
    category: "cleanser",
    focus_tags: ["hydration", "barrier"],
    actives: ["glycerin"],
    price_tier: "budget",
    availability: "pharmacy"
  }
]
```

### Fields to include
- id
- name
- category
- focus_tags
- actives
- price_tier
- availability
- climate_tags
- image_url optional

---

## 9. Recommendation Logic

### Inputs
- Skin scores
- Cycle phase
- Climate type
- Optional journal data

### Rules
- Low moisture + dry climate → hydration and barrier support
- High oil + humid climate → lightweight oil control
- High acne + luteal phase → acne management
- High redness → soothing actives
- Warm undertone → warm palette suggestions
- Cool undertone → cool palette suggestions

---

## 10. Climate Logic

### Tropical / humid
Prioritize:
- Lightweight textures
- Non-comedogenic formulas
- Sweat-friendly routines
- Strong SPF
- Breathable fabrics

### Dry / cold
Prioritize:
- Ceramides
- Rich moisturizers
- Gentle cleansing
- Barrier support
- Less stripping actives

### Why this matters
Climate changes how skin behaves, so the same routine should not be recommended everywhere.

---

## 11. Demo Flow

Your demo should show the app in this order:
1. Sign up
2. Enter period + climate
3. Upload selfie
4. View skin analysis
5. See current phase
6. Get routine
7. Get product recommendations
8. View color analysis
9. Show progress or journal

Keep the demo under 3 minutes.

---

## 12. Submission Notes

Make sure your repo includes:
- clean file structure
- README with setup steps
- `.env.example`
- screenshots
- demo video link
- testing instructions

## 13. Build Priority

If time gets tight, build in this order:
1. Auth and onboarding
2. Skin upload and analysis
3. Cycle phase calculator
4. Routine generator
5. Product recommendations
6. Dashboard
7. Color analysis
8. Journal and progress

## 14. Final Project Framing

GlowCycle is a cycle-aware, climate-aware skincare and style assistant powered by YouCam AI.

It helps users:
- understand current skin condition
- know what phase they’re in
- adapt routines to climate
- get better product recommendations
- discover flattering colors and style guidance
- track improvement over time