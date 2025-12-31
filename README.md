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
- **Standard Metrics**: Sleep, Workout, Meditation, Learning.
- **Custom States**: Any internal state you define (e.g., Anxiety, Focus, Energy).
- **Exposures**: External inputs like Caffeine, Alcohol, Screen Time (tracked separately, no judgment).
- **Notes**: Any context.

### 2. The Dashboard (`/dashboard`)
View your **Dashboard** to see your rhythm.
- **4 Clear Sections**: Overview, Core Metrics, Personal States, Exposures.
- **Visuals**: Premium **Gradient Area Charts** with reference lines showing your 7-day baseline.
- **Adaptive**: Automatically displays your custom states and exposures.

### 3. Trends & Analysis (`/trends`)
Use the **"Trends"** page to find connections.
- **Deep Analysis**: Plot **ANY** metric against another (including Exposures vs States).
- **Cross-Category**: Compare "Caffeine" (exposure) vs "Sleep" (core) or "Anxiety" (personal state).
- **Scatter Plot**: Visualize correlation strength with coefficient calculation.

### 4. Logbook (`/logbook`) — NEW
For detailed tracking that doesn't fit daily sliders.
- **Structured Data**: Track Gym sets, Study topics, Practice sessions in spreadsheet-like tables.
- **Custom Columns**: Text, Number, Checkbox, Select, Notes—strict typing prevents arbitrary scoring.
- **Demo Ready**: Admin account includes pre-filled Gym Training logbook with 10 realistic entries.
- **Mobile-First**: Horizontal scroll with sticky date column, touch-friendly inputs.

### 5. User-Defined Configuration (`/profile`)
Make the app yours in the **Profile** tab.
- **Metrics Manager**: Add custom sliders for internal states (e.g., "Creativity", "Social Battery").
- **Exposures Manager**: Define what external inputs to track (e.g., "Nicotine", "Late-night screens").
- **Logbook Manager**: Create custom logbooks for specific activities.
- **Adaptive UI**: All pages automatically adapt to your schema.

### 6. Mobile Experience
- **Sticky Navigation**: Thumb-friendly bottom navigation bar for seamless switching.
- **Touch Feedback**: Subtle press animations for tactile assurance.

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
