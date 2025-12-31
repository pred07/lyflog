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
- **Custom Metrics**: Any internal state you define (e.g., Anxiety, Focus, Energy).
- **Notes**: Any context.

### 2. The Dashboard (`/dashboard`)
View your **Dashboard** to see your rhythm.
- **Visuals**: premium **Gradient Area Charts** with glowing aesthetics.
- **Context**: Dashed **Reference Lines** (e.g., 7-day Sleep avg) show how today compares to your baseline.
- **Loading**: Smooth **Skeleton Loaders** for a fluid experience.

### 3. Trends & Analysis (`/trends`)
Use the **"Trends"** page to find connections.
- **Deep Analysis**: Plot **ANY** metric against another.
- **Custom Correlations**: Compare "Anxiety" (your custom metric) vs "Sleep" (standard) to find hidden patterns.
- **Scatter Plot**: Visualize the relationship strength between variables.

### 4. User-Defined States (`/profile`)
Make the app yours in the **Profile** tab.
- **Metric Manager**: Add custom sliders for any internal state you want to track (e.g., "Creativity", "Social Battery").
- **Adaptive UI**: The Log and Trends pages automatically adapt to your custom schema.

### 5. Mobile Experience
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
