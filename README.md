# SYNAPSE — Personal Observatory

> *"A mirror, not a mentor. See yourself clearly."*

SYNAPSE is a **focused, scientifically-presented daily tracker** for people seeking clarity without pressure. Track 6 core metrics (activity, mood, energy, stress), visualize patterns with professional charts, and discover correlations using statistical analysis—all without gamification, streaks, or judgment.

**Live Demo**: [https://lyflog.vercel.app](https://lyflog.vercel.app)

![SYNAPSE Dashboard](/public/hero-screenshot.png)

---

## 🎯 Who Is This For?

SYNAPSE is designed for people who:
- Are navigating **burnout** or high-stress periods
- Are recovering from **major life changes** (career shift, loss, relocation)
- Feel **pressure from gamified apps** (broken streaks, guilt trips)
- Want **clarity through data**, not optimization
- Prefer **observation over intervention**

---

## 🧠 Core Philosophy

### The Three Principles

1. **Observation > Intervention**  
   See the patterns first. No advice, no coaching, no "you should..."

2. **Neutrality**  
   There are no "good" or "bad" days. Just data. A day with high stress isn't a failure—it's information.

3. **Privacy**  
   Your data lives in your Firebase account. No analytics, no tracking, no selling your patterns.

---

## ✨ Features

### 1. **Daily Log** — *Quick Entry (<30s)*
**"Record the day"**

A clean, minimal form with only 6 core fields:

**What You Log**:
- **Workout Done**: Checkbox (yes/no)
- **Workout Duration**: Minutes (optional, appears when checked)
- **Mood**: Slider (1-5 scale)
- **Energy**: Slider (1-5 scale)
- **Stress**: Slider (1-5 scale)
- **Note**: Optional one-line context (max 200 characters)

**Features**:
- Auto-filled date (today)
- Live slider value display
- Mobile-optimized touch targets
- Saves in <2 seconds

**Philosophy**: Logging should be fast and friction-free, not a chore.

---

### 2. **Scientific Dashboard** — *Pattern Discovery*
**"What correlates?"**

Professional data visualization with statistical rigor.

**What You See**:

#### Summary Statistics Panel
- **Activity Frequency**: Percentage of days with workouts (30-day window)
- **Mean States**: Average mood, energy, stress levels
- **Activity Impact**: Mood elevation percentage on workout days

#### Multi-Metric Trend Chart
- Overlaid area charts for mood, energy, and stress
- 30-day rolling window with smooth interpolation
- Workout days marked as vertical indicators
- Professional gradients and gridlines

#### Statistical Correlations
- **Pearson correlation coefficients** (r-values)
- Activity-Mood, Activity-Energy, Activity-Stress correlations
- Visual progress bars showing correlation strength
- Sample size transparency (n=30)
- Confidence intervals

**Scientific Language**:
- "Positive correlation observed between physical activity and mood elevation (r=0.67)"
- "Elevated dopaminergic activity typically associated with physical exercise"
- "Cortisol regulation appears improved with consistent activity"
- "Pattern suggests association between..." (non-diagnostic)

**Philosophy**: Let the data reveal the patterns. Present observations, not prescriptions.

---

### 3. **Profile** — *Minimal Settings*
**"Make it yours"**

Simple, essential configuration:
- **Username**: Edit your display name
- **Theme**: Light/dark mode toggle
- **Data Export**: Download all logs as CSV
- **Settings**: Basic app configuration
- **Logout**: Sign out securely

---

### 4. **Data Export** — *Own Your Data*
**"Take it with you"**

Export everything to CSV for backup or external analysis.

**What You Can Export**:
- All daily logs with 6 core fields
- Date, workout data, mood, energy, stress, notes

**Format**: Clean CSV files, ready for Excel, Google Sheets, or Python analysis.

**Philosophy**: Your data is yours. No lock-in, no barriers.

---

## 🎨 Design Principles

### Scientific Aesthetic
- Professional charts with proper axis labels
- Statistical terminology (correlation, variance, r-values)
- Medical/neuroscience language (dopamine, serotonin, cortisol)
- Data-dense but readable visualizations
- Calm color palette with vibrant accents

### Mobile-First
- Bottom navigation with 3 items (Dashboard, Log, Me)
- Thumb-friendly touch targets (44px minimum)
- Responsive layouts for all screen sizes
- Smooth animations

### Accessible
- High contrast mode support
- Semantic HTML
- Keyboard navigation
- Screen reader friendly

---

## 🚀 Getting Started

### Try the Live Demo
1. Visit [https://lyflog.vercel.app](https://lyflog.vercel.app)
2. Click **"View Live Demo"**
3. Explore with 45 days of realistic demo data

### Create Your Account
1. Click **"Log In / Demo"**
2. Choose **"Continue with Google"**
3. Start logging your first day

### Recommended Workflow
1. **Daily**: Spend 30 seconds on `/log` to record the day
2. **Weekly**: Check `/dashboard` to see emerging patterns
3. **Monthly**: Review correlation analysis to discover what affects your mood/energy

---

## 🛠️ For Developers

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication (Google SSO)
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts (area charts, correlation visualizations)
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Local Setup
```bash
# Clone the repository
git clone https://github.com/pred07/lyflog.git
cd lyflog

# Install dependencies
npm install

# Configure Firebase
# Create a project at console.firebase.google.com
# Enable Firestore and Authentication
# Add your config to lib/firebase/config.ts

# Run development server
npm run dev
```

### Project Structure
```
lyflog/
├── app/                    # Next.js app router pages
│   ├── (app)/             # Protected routes
│   │   ├── dashboard/     # Scientific visualizations
│   │   ├── log/           # 6-field data entry
│   │   ├── profile/       # User settings
│   │   ├── export/        # CSV export
│   │   └── settings/      # App configuration
│   ├── login/             # Authentication
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── auth/             # Auth provider
│   ├── layout/           # Navigation (4 desktop, 3 mobile)
│   └── dashboard/        # Chart components
├── lib/                   # Utilities and Firebase
│   ├── firebase/         # Firestore CRUD
│   ├── types/            # TypeScript interfaces
│   └── dummyData.ts      # Demo data generator
└── public/                # Static assets
```

### Data Model

**DailyLog Interface** (6 core fields):
```typescript
interface DailyLog {
    logId: string;
    userId: string;
    date: Date;
    
    // Core metrics
    workoutDone: boolean;       // Activity binary
    workoutDuration?: number;   // Minutes (optional)
    mood: number;               // 1-5
    energy: number;             // 1-5
    stress: number;             // 1-5
    note?: string;              // Optional context
    
    createdAt: Date;
}
```

---

## 🔐 Privacy & Data

### Where Your Data Lives
- **Your Firebase Project**: All data is stored in your personal Firebase Firestore database
- **No Third-Party Analytics**: We don't track usage, collect metrics, or sell data
- **No Server Storage**: The app is client-side; we don't have access to your data

### Demo Account
- Uses `localStorage` for temporary data
- Resets on browser clear
- No personal information required

### Production Account
- Requires Google Sign-In
- Data persists in your Firebase account
- You control retention and deletion

---

## 📱 Mobile Experience

SYNAPSE is fully optimized for mobile use:
- **Bottom Navigation**: 3 items (Dashboard, Log, Me) for thumb-friendly access
- **Touch Targets**: All buttons meet 44px minimum for easy tapping
- **Responsive Charts**: Scales beautifully on all screen sizes
- **Optimized Padding**: More content space on small screens
- **Smooth Animations**: Native-feeling transitions

---

## 🎯 Anti-Features

What SYNAPSE deliberately **doesn't** do:

- ❌ **No Streaks**: Missed a day? It doesn't matter. Data is just data.
- ❌ **No Scores**: You are not a number. There is no "Health Score" here.
- ❌ **No Advice**: We don't tell you what to do. We just show you patterns.
- ❌ **No Gamification**: No badges, no levels, no achievements.
- ❌ **No Social Features**: This is for you, not for comparison.
- ❌ **No Notifications**: We won't nag you to log.
- ❌ **No Over-Engineering**: Only 6 fields. No habits, timelines, or complex features.

---

## 🔬 Scientific Approach

### Statistical Methods
- **Pearson Correlation**: Measures linear relationships between activity and subjective states
- **Sample Size Transparency**: Always shows n= for statistical context
- **Null Handling**: Gracefully handles small datasets (<3 days)
- **Non-Diagnostic**: Presents correlations, never makes medical claims

### Language Guidelines
**✅ Used:**
- Neuroscience terms (dopamine, serotonin, cortisol, endorphins)
- Statistical terms (correlation coefficient, r-values, variance)
- Psychological terms (mood regulation, stress response, affect)

**❌ Avoided:**
- Diagnostic claims ("you have depression")
- Prescriptive advice ("you should exercise more")
- Medical recommendations ("you need treatment")

**Tone**: Scientific observer, not medical advisor.

---

## 🤝 Contributing

SYNAPSE is open source and welcomes contributions:
- **Bug Reports**: Open an issue on GitHub
- **Feature Requests**: Describe your use case
- **Pull Requests**: Follow the existing code style
- **Documentation**: Help improve this README

---

## 📄 License

MIT License. Built as part of the Night Wind Operations collection.

---

## 💬 Philosophy

SYNAPSE was built on the belief that:
- **Data should inform, not judge**
- **Patterns emerge from observation, not optimization**
- **Clarity comes from seeing, not from being told**
- **Simplicity beats complexity**
- **A mirror is more useful than a mentor**

If you're tired of apps that make you feel guilty for being human, SYNAPSE might be for you.

---

**Live Demo**: [https://lyflog.vercel.app](https://lyflog.vercel.app)  
**Repository**: [https://github.com/pred07/lyflog](https://github.com/pred07/lyflog)

*"See yourself clearly."*
