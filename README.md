# SYNAPSE

A science-first, personal observability system designed for people navigating difficult life phases (burnout, grief, transition). It acts as a **quiet mirror**—reflecting your data without judgment, gamification, or advice.

![SYNAPSE Dashboard](/public/hero-screenshot.png)

## 🌟 Core Philosophy

- **Observation > Intervention**: See the patterns first.
- **Neutrality**: No "good" or "bad" labels. Just data.
- **Privacy**: Your data is yours.

## 🚀 How to Use: The Dual Dashboard System

SYNAPSE uses a **Dual Dashboard** approach (Action vs. Reflection) to separate operational tracking from analytical observation.

### 1. Daily Check (`/habits`) — *Action Mode*
**"Did I show up?"**
- **Purpose**: Quick presence tracking for daily routines.
- **Usage**: Open morning/night. Mark habits as ✔ (Done) or ✖ (Missed).
- **Philosophy**: No streaks, no scores, no pressure. Just a record of consistency.
- **Features**: Weekly calendar view, custom habit groups.

### 2. Live Log (`/session`) — *Action Mode*
**"What did I do?"**
- **Purpose**: Operational logging during an activity (Gym, Study, Practice).
- **Usage**: Open *during* the session. Log exercises, sets, or topics in real-time.
- **Philosophy**: A live notebook. No charts, no past comparisons to distract you.
- **Features**: Session builder, set tracking, history autocomplete.

### 3. Patterns (`/dashboard`) — *Reflection Mode*
**"How does it connect?"**
- **Purpose**: Analytical observation of your long-term trends.
- **Usage**: Check weekly to see correlations (e.g., "How does Gym affect Sleep?").
- **Features**: 
  - **Core Metrics**: Sleep, Workout duration, Meditation minutes (logged via `/log`).
  - **Personal States**: Anxiety, Focus, Energy.
  - **Exposures**: Caffeine, Screen Time.
  - **Visuals**: Gradient area charts with baseline comparisons.
  - **Similar Past Days ("Deja Vu")**: Shows past days that mathematically resemble today's pattern.
  - **Silent Indicators**: Subtle dots indicating discovered correlations.

### 4. Timeline (`/timeline`) — *Context Mode*
**"What happened when?"**
- **Purpose**: A linear, scrolling history of all your data (Logs, Habits, Sessions) in context.
- **Usage**: Scroll back to see what you did on a specific day.
- **Features**:
    - **Unified View**: See sleep, workouts, habits, and mood in one card per day.
    - **Day DNA**: Quick scan of your day's footprint.

### 5. Quantitative Log (`/log`)
- **Purpose**: The data entry point for quantitative metrics shown in **Patterns**.
- **Usage**: Spend 30 seconds daily to log Sleep hours, State ratings (1-5), and Exposure counts.
- **Features**:
  - **Voice Logging**: Tap the mic and say "Slept 7 hours, anxiety 3". AI pre-fills the form.

### 6. Logbook (`/logbook`)
- **Purpose**: Structured archival for detailed records that don't fit the other dashboards.

### 7. Advanced Analysis (`/trends`)
**"What correlates?"**
- **Purpose**: Deep dive into correlations between metrics.
- **Features**: 
  - **Scatter Plots**: Visualize correlation strength (e.g., Caffeine vs. Anxiety).
  - **Cross-Category Analysis**: Compare Exposures vs. Core Metrics.
  - **Network Map (`/trends/network`)**: Interactive force-directed graph showing how *all* your metrics connect.
  - **Correlation Scanning**: Auto-detects significant relationships (>0.6) and highlights them.

### 8. Search & Discovery (`/search`)
**"Find the pattern"**
- **Purpose**: Reverse engineer your good (or bad) days.
- **Usage**: Search for condition "Focus > 4" → See what happened on those days.
- **Features**: Automatic frequency analysis ("On 82% of these days, you slept > 7hr").

### 9. Context & Isolation (`/settings/zones`)
**"Manage the outliers"**
- **Isolation Mode**: Toggle in Dashboard to exclude specific periods (Vacation, Sick days) from your data analysis.
- **Context Zones**: Define date ranges to tag as special contexts.

### 10. Configuration (`/profile`)
**"Make it yours"**
- **Purpose**: Customize the system to your life.
- **Features**:
  - **Metrics Manager**: Create custom sliders for new states (e.g., "Creativity").
  - **Exposures Manager**: Define external inputs to track.
  - **Logbook Manager**: Create custom structured logs.

### 11. Mobile Experience
- **Sticky Navigation**: Thumb-friendly bottom navigation bar.
- **Touch Feedback**: Optimized touch targets and animations.

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Firebase Firestore
- **Auth**: Firebase Auth (Google SSO + Legacy Test Accounts)
- **Styling**: Tailwind CSS (Custom Design System)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Utils**: date-fns

## 📦 Setup & Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/pred07/lyflog.git
   cd lyflog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable **Firestore Database** and **Authentication (Google)**
   - Copy your config to `lib/firebase/config.ts` (or use .env)

4. **Run Locally**
   ```bash
   npm run dev
   ```

## 🔐 Accounts

- **Production**: Use "Continue with Google"
- **Live Demo**: Click "View Live Demo" on the login page for instant access (uses `test_admin` profile).
- **Testing**:
  - User: `admin`, Pass: `admin`
  - User: `test`, Pass: `test`

## 📄 License

MIT. Built for the Night Wind Operations collection.
