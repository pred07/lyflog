# SYNAPSE — Personal Observatory

> *"A mirror, not a mentor. See yourself clearly."*

SYNAPSE is a personal data reflection system designed for people navigating difficult life phases—burnout, grief, major transitions, or simply seeking clarity without pressure. Unlike typical wellness apps that gamify your life with streaks and scores, SYNAPSE acts as a **quiet mirror**, reflecting your patterns without judgment or advice.

**Live Demo**: [https://lyflog.vercel.app](https://lyflog.vercel.app)

![SYNAPSE Dashboard](/public/hero-screenshot.png)

---

## 🎯 Who Is This For?

SYNAPSE is designed for people who:
- Are navigating **burnout** or high-stress periods
- Are recovering from **major life changes** (career shift, loss, relocation)
- Feel **pressure from gamified apps** (broken streaks, guilt trips)
- Want **clarity, not optimization**
- Prefer **observation over intervention**

---

## 🧠 Core Philosophy

### The Three Principles

1. **Observation > Intervention**  
   See the patterns first. No advice, no coaching, no "you should..."

2. **Neutrality**  
   There are no "good" or "bad" days. Just data. A day with high anxiety isn't a failure—it's information.

3. **Privacy**  
   Your data lives in your Firebase account. No analytics, no tracking, no selling your patterns.

---

## 🌐 The Dual Dashboard System

SYNAPSE separates **Action** (doing) from **Reflection** (analyzing) to reduce anxiety and cognitive load.

### Action Mode
When you're *in the moment*, you don't need charts or comparisons. You need simple, operational tools.

### Reflection Mode
When you're ready to *understand*, you can explore patterns, correlations, and trends without the pressure of daily tracking.

---

## ✨ Features

### 1. **Dashboard (Patterns)** — *Reflection Mode*
**"How does it all connect?"**

Your central hub for understanding long-term patterns.

**What You See**:
- **Core Metrics**: Sleep hours, workout duration, meditation, learning time
- **Health Metrics**: Steps, water intake, calories, UV exposure, heart rate, weight
- **Personal States**: Anxiety, focus, energy (rated 1-5)
- **Exposures**: Caffeine cups, screen time hours, alcohol, etc.

**Unique Features**:
- **Déjà Vu (Similar Past Days)**: Mathematically finds days that resemble today. Useful for asking "What did I do differently when I felt like this before?"
- **Silent Pattern Indicators**: Subtle dots that appear when the system detects a correlation (e.g., "Sleep ↑ when Caffeine ↓")
- **Isolation Mode**: Temporarily exclude vacation days, sick periods, or other outliers from your analysis
- **Gradient Charts**: Visual trends with baseline comparisons

**Why It Matters**: Instead of asking "Am I doing well?", you ask "What's the pattern?"

---

### 2. **Daily Check (Habits)** — *Action Mode*
**"Did I show up?"**

A simple presence tracker for daily routines.

**How It Works**:
- Open in the morning or evening
- Check off what you did (✓) or didn't do (✗)
- No streaks, no guilt, no pressure

**Features**:
- **Custom Habit Groups**: Organize by category (Morning Routine, Self-Care, etc.)
- **Spreadsheet Calendar**: See your month at a glance
- **Inline Editing**: Rename or delete habits on the fly
- **Mobile FAB**: Quick-add button for easy access on phones
- **Completion Percentages**: See overall consistency without judgment

**Philosophy**: This isn't about perfection. It's about seeing if you're showing up for the things that matter to you.

---

### 3. **Live Log (Session)** — *Action Mode*
**"What did I do?"**

A real-time notebook for workouts, study sessions, or practice.

**How It Works**:
- Open *during* your activity
- Log exercises, sets, reps, or topics as you go
- No charts, no past comparisons—just pure operational recording

**Features**:
- **Session Builder**: Create templates for recurring activities
- **Set Tracking**: Log multiple sets with rest times
- **History Autocomplete**: Quickly repeat previous exercises
- **Notes**: Add context for each session

**Why It's Different**: Most apps show you graphs while you're trying to work out. SYNAPSE gives you a clean slate so you can focus on the task, not the data.

---

### 4. **Log Activity** — *Data Entry*
**"Record the day"**

The input form for your daily quantitative data.

**What You Log**:
- **Core Metrics**: Sleep hours, workout type/duration, meditation, learning time
- **Health Metrics**: Steps, water (L), calories, UV index, heart rate (bpm), weight (kg)
- **Personal States**: Anxiety, focus, energy (1-5 scale)
- **Exposures**: Caffeine, screen time, alcohol, etc.
- **Notes**: Free-form text for context

**Features**:
- **Voice Logging**: Tap the mic and say "Slept 7 hours, anxiety 3, two coffees". AI pre-fills the form.
- **Quick Entry**: Designed to take 30 seconds
- **Mobile-Optimized**: Appropriate keyboards for each input type (decimal for sleep, numeric for steps)

**Philosophy**: Logging should be fast and friction-free, not a chore.

---

### 5. **Timeline** — *Context Mode*
**"What happened when?"**

A scrolling history of your life, one day at a time.

**What You See**:
- **Unified Day Cards**: Each day shows sleep, workouts, habits completed, and mood
- **Session Summaries**: See what exercises you did
- **Notes**: Read your past reflections
- **30-Day View**: Scroll through the last month

**Use Cases**:
- "What was I doing when I felt great last week?"
- "Did I log anything unusual on that stressful day?"
- "How consistent was I this month?"

**Why It's Useful**: Sometimes you need context, not correlation. The timeline gives you the story of your days.

---

### 6. **Trends & Analysis** — *Deep Reflection*
**"What correlates?"**

Advanced analytical tools for pattern discovery.

**Features**:
- **Scatter Plots**: Visualize relationships (e.g., Caffeine vs. Anxiety)
- **Cross-Category Analysis**: Compare exposures vs. core metrics
- **Network Map**: Interactive graph showing how *all* your metrics connect
- **Correlation Scanning**: Auto-detects significant relationships (>0.6)
- **Heatmaps**: See intensity of correlations at a glance

**Example Insights**:
- "My focus is 0.72 correlated with sleep"
- "Anxiety drops when I meditate >15 minutes"
- "Workout days have 40% more steps"

**Philosophy**: Let the data reveal the patterns. Don't force hypotheses.

---

### 7. **Search & Discovery** — *Pattern Hunting*
**"Find the pattern"**

Reverse-engineer your good (or bad) days.

**How It Works**:
- Search for a condition: "Focus > 4"
- See all days that match
- Get automatic frequency analysis: "On 82% of these days, you slept >7hr"

**Use Cases**:
- "What do my high-energy days have in common?"
- "When was the last time I felt this anxious?"
---

### 10. **Profile & Configuration** — *Make It Yours*
**"Customize the system"**

Tailor SYNAPSE to your life.

**Features**:
- **Metrics Manager**: Create custom state sliders (e.g., "Creativity", "Pain Level")
- **Exposures Manager**: Define what external inputs to track
- **Habit Manager**: Add, edit, delete, and organize habits
- **Logbook Manager**: Create custom structured logs
- **Theme Toggle**: Light/dark mode

**Philosophy**: Your life is unique. Your tracking system should be too.

---

### 11. **Data Export** — *Own Your Data*
**"Take it with you"**

Export everything to CSV for backup or external analysis.

**What You Can Export**:
- All daily logs
- All habit entries
- All session data
- All logbook entries

**Format**: Clean CSV files, ready for Excel, Google Sheets, or Python analysis.

**Philosophy**: Your data is yours. No lock-in, no barriers.

---

## 🎨 Design Principles

### Calm Interface
- Muted colors, no bright reds or greens
- Gradients instead of harsh contrasts
- Smooth animations, no jarring transitions

### Mobile-First
- Bottom navigation for thumb-friendly access
- Optimized touch targets (44px minimum)
- Appropriate mobile keyboards (decimal for sleep, numeric for steps)
- 3-column health metrics grid on mobile for compact display

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
1. **Morning**: Open `/habits` and check off your morning routine
2. **During Activities**: Use `/session` for workouts or study
3. **Evening**: Spend 30 seconds on `/log` to record the day
4. **Weekly**: Check `/dashboard` to see emerging patterns
5. **Monthly**: Use `/search` to discover what your best days have in common

---

## 🛠️ For Developers

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication (Google SSO)
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts
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
│   │   ├── dashboard/     # Patterns view
│   │   ├── habits/        # Daily check
│   │   ├── session/       # Live log
│   │   ├── log/           # Data entry
│   │   ├── timeline/      # History view
│   │   ├── trends/        # Analysis tools
│   │   ├── search/        # Pattern discovery
│   │   └── logbook/       # Custom logs
│   ├── login/             # Authentication
│   └── page.tsx           # Landing page
├── components/            # React components
├── lib/                   # Utilities and Firebase
└── public/                # Static assets
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
- **Bottom Navigation**: Thumb-friendly access to all features
- **Touch Targets**: All buttons meet 44px minimum for easy tapping
- **Smart Keyboards**: Decimal keyboards for sleep/water, numeric for steps/calories
- **Responsive Grids**: 3-column health metrics on mobile, 2-column on tablet
- **Optimized Padding**: More content space on small screens
- **Smooth Animations**: Native-feeling transitions

---

## 🎯 Anti-Features

What SYNAPSE deliberately **doesn't** do:

- ❌ **No Streaks**: Missed a day? It doesn't matter. Data is just data.
- ❌ **No Scores**: You are not a number. There is no "Health Score" here.
- ❌ **No Advice**: We don't tell you to drink water. We just show you if you did.
- ❌ **No Gamification**: No badges, no levels, no achievements.
- ❌ **No Social Features**: This is for you, not for comparison.
- ❌ **No Notifications**: We won't nag you to log.

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
- **Your worst days contain as much information as your best**
- **A mirror is more useful than a mentor**

If you're tired of apps that make you feel guilty for being human, SYNAPSE might be for you.

---

**Live Demo**: [https://lyflog.vercel.app](https://lyflog.vercel.app)  
**Repository**: [https://github.com/pred07/lyflog](https://github.com/pred07/lyflog)

*"See yourself clearly."*
