# SYNAPSE

A science-first, personal observability system designed for people navigating difficult life phases (burnout, grief, transition). It acts as a **quiet mirror**—reflecting your data without judgment, gamification, or advice.

![SYNAPSE Dashboard](/public/hero-screenshot.png)

## 🌟 Core Philosophy

- **Observation > Intervention**: See the patterns first.
- **Neutrality**: No "good" or "bad" labels. Just data.
- **Privacy**: Your data is yours. 

## 🚀 How to Use

### 1. Daily Logging (`/log`)
Go to the **"Log Activity"** tab daily. It takes ~30 seconds.
- **Sleep**: Hours slept.
- **Workout**: Type and duration (or "Rest").
- **Meditation**: Minutes sat.
- **Learning**: Minutes spent learning (optional).
- **Notes**: Any context (e.g., "Late coffee", "High stress meeting").

*SYNAPSE does not diagnose or treat medical or mental health conditions. It supports self-observation and understanding, and can be used alongside professional care.*
*Tip: You don't have to fill everything. Consistency matters more than completeness.*

### 2. The Dashboard (`/dashboard`)
View your **Dashboard** to see your rhythm.
- **Views**: Toggle between 7-day, 30-day, or 90-day views.
- **Metrics**: Click the tabs (Sleep, Workout, etc.) to switch charts.
- **Pattern Recognition**: Look for baselines. What is your "normal"?

### 3. Trends & Analysis (`/trends`)
Use the **"Trends"** page to find connections.
- **Scatter Plots**: Compare two metrics (e.g., "Sleep Duration" vs. "Workout Duration").
- **Correlation**: The app calculates a simple correlation coefficient to see if variables move together.
- **Self-Inquiry**: Does sleeping more actually lead to more activity? Or less?

### 4. Settings & Data
- **Theme**: Toggle Dark/Light mode in the header.
- **Export**: Download all your data as CSV/JSON anytime from the **Export** tab.
- **Privacy**: Delete account functionality is available in Settings.

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Firebase Firestore
- **Auth**: Firebase Auth (Google SSO)
- **Styling**: Tailwind CSS (Custom Design System)
- **Charts**: Recharts

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
- **Testing**: Use built-in test accounts:
  - User: `admin`, Pass: `admin`
  - User: `test`, Pass: `test`

## 📄 License

MIT. Built for the Night Wind Operations collection.
