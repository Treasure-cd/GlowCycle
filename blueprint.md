# GlowCycle

An AI-powered skincare and style assistant that adapts recommendations based on:
- Skin condition from YouCam Skin AI
- Menstrual cycle phase
- Climate context: tropical vs non-tropical
- Personal style/color analysis
- Optional journal + progress tracking

## Project Goal

Build a polished web app that helps users understand:
- What their skin looks like right now
- How their cycle may be affecting it
- What routine they should follow today
- What colors and style choices suit them best
- How their needs change across climate and season

This project is designed for the YouCam API Skin AI & Apparel VTO Hackathon and focuses on clear consumer value, strong UX, and a non-obvious use of YouCam APIs.

## Core Problem

People often make skincare and style decisions without enough context:
- Skin changes with hormonal cycles
- Skin needs vary by climate
- Many people buy products without knowing what will actually help
- Fashion/color choices are often guessed rather than personalized

GlowCycle solves this by combining skin analysis, cycle awareness, and climate-aware recommendations into one experience.

## Target Users

Primary:
- Women with acne-prone or cycle-sensitive skin

Secondary:
- Anyone who wants personalized skincare and style guidance
- Users in hot/humid climates
- Users in dry/cold climates
- Users looking for better color and outfit recommendations

## Core Value Proposition

GlowCycle helps users:
- Understand current skin condition with AI
- See how cycle phase may influence skin
- Get a routine tailored to both skin and climate
- Discover flattering colors and style choices
- Track improvement over time

## Why This Is Different

Most apps do one of these things:
- Skin scanner only
- Period tracker only
- Color analysis only
- Outfit recommendation only

GlowCycle combines them into one coherent journey:
- Skin AI + cycle phase + climate + style
- More practical than a generic beauty AI app
- More defensible than a thin API wrapper

## Hackathon Angle

This project fits the hackathon well because it:
- Integrates YouCam Skin AI
- Can optionally include Apparel VTO or color analysis
- Has real consumer and retail value
- Feels like a full product experience
- Is easy for judges to understand quickly

## Main Features

### 1. Onboarding
Users enter:
- Last period start date
- Average cycle length
- Climate profile or location
- Optional skin goals
- Optional skin type

### 2. Skin Analysis
Users upload a selfie and get:
- Acne score
- Oiliness score
- Moisture score
- Redness score
- Texture score
- Overall skin summary

### 3. Cycle Awareness
The app calculates:
- Current cycle day
- Current phase
- Expected high-risk skin window
- Phase-based routine recommendations

### 4. Climate Awareness
The app adjusts advice based on:
- Tropical/humid conditions
- Dry/cold conditions
- UV / heat / sweat considerations

### 5. Routine Builder
The app generates:
- Morning routine
- Night routine
- Phase-specific advice
- Climate-specific adjustments
- Ingredient suggestions

### 6. Product Recommendations
Users see suggested products by:
- Concern
- Price range
- Availability
- Ingredient type
- Climate suitability

### 7. Style / Color Analysis
The app can also show:
- Undertone
- Seasonal color palette
- Best clothing colors
- Best makeup shades
- Simple outfit guidance

### 8. Journal / Tracking
Optional but valuable:
- Mood tracking
- Sleep tracking
- Breakout notes
- Trend tracking over time

### 9. Progress Dashboard
Users can visualize:
- Acne over time
- Moisture over time
- Mood vs cycle phase
- Routine consistency

## YouCam API Usage

### Required
Use at least one YouCam API from the Skin or Fashion category.

Recommended:
- YouCam Skin Analysis API

Optional:
- Apparel Virtual Try-On
- Color analysis / style-related API
- Makeup or cloth-related visual features

## Product Vision

The app should feel like:
- A skincare coach
- A style assistant
- A cycle-aware wellness companion
- A retail decision support tool

It should not feel like:
- A raw API demo
- A generic image uploader
- A chatbot with a skin prompt

## Suggested MVP Scope

### Must-have
- Auth
- Onboarding
- Skin selfie upload
- YouCam skin analysis
- Cycle phase calculator
- Routine recommendations
- Product suggestions
- Dashboard

### Nice-to-have
- Color analysis
- Outfit suggestions
- Journal
- Progress charts
- Climate-based adjustments
- Apparel VTO

### Stretch
- AI chat assistant
- Weather integration
- Personalized forecasts
- Social/shareable results

## Recommended Project Structure

```text
src/
  assets/
  components/
  data/
  lib/
  pages/
  routes/
  styles/
```

### Components
Reusable UI pieces like:
- Navbar
- Skin score cards
- Routine cards
- Product cards
- Color swatches
- Charts
- Forms

### Data
Static or seed content such as:
- Product list
- Routine templates
- Color palette presets
- Climate rules

### Lib
Core logic helpers such as:
- Cycle phase calculator
- Routine generator
- YouCam API wrapper
- Recommendation engine
- Firestore helpers

### Pages
Main views such as:
- Auth
- Onboarding
- Dashboard
- Routine
- Products
- Color analysis
- Journal
- Progress

## Data Model

### User Profile
Stores:
- User ID
- Email
- Location
- Climate type
- Cycle length
- Last period start
- Skin type
- Skin goals

### Skin Scans
Stores:
- Timestamp
- Cycle day
- Cycle phase
- Skin scores
- Notes
- YouCam task ID

### Journal Entries
Stores:
- Mood
- Sleep
- Breakouts
- Notes
- Date

### Products
Stores:
- Name
- Category
- Key actives
- Concerns solved
- Price tier
- Availability
- Climate suitability

## Recommendation Logic

The app should combine three inputs:
1. Skin AI results
2. Cycle phase
3. Climate type

Example logic:
- Higher acne + luteal phase = acne-focused routine
- Lower moisture + dry climate = barrier repair and hydration
- Higher oiliness + hot/humid climate = lightweight, non-comedogenic products

## Routine Design Principles

### In humid/tropical climates
Prioritize:
- Lightweight textures
- Oil control
- Non-comedogenic products
- Sweat-friendly routines
- Strong SPF usage

### In dry/cold climates
Prioritize:
- Hydration
- Barrier repair
- Gentler actives
- Richer moisturizers
- Less stripping cleansers

### By cycle phase
Adjust routines based on:
- Menstrual phase: support hydration
- Follicular phase: introduce actives gently
- Ovulatory phase: maintain and protect
- Luteal phase: prioritize oil control and acne management

## Demo Flow

The ideal demo should show:
1. Sign up / onboarding
2. Enter cycle info and climate
3. Upload selfie
4. View skin analysis
5. See cycle phase and forecast
6. Receive routine
7. See product recommendations
8. Optionally see color analysis or outfit suggestion
9. Show progress tracking

## Submission Checklist

Before submitting, make sure you have:
- Working public/private repo
- README with setup instructions
- Screenshot images
- Demo video under 3 minutes
- Clear description of YouCam API used
- Explanation of consumer/retail value
- Testing access or login credentials if needed

## Suggested Narrative for Judges

This project helps people make better skincare and style decisions by combining:
- AI skin diagnostics
- Menstrual cycle awareness
- Climate-specific advice
- Personalized product recommendations
- Optional fashion guidance

It is especially useful for people whose skin changes with hormones and environment, and for anyone who wants more confidence in what products or styles to choose.

## Final Positioning

GlowCycle is a cycle-aware, climate-aware beauty and style companion powered by YouCam AI.

It bridges:
- Skin health
- Hormonal changes
- Climate differences
- Fashion confidence
- Retail decision-making