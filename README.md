# NYTVND LifeLog

**"A quiet mirror during a difficult phase — not a voice telling me what to do."**

A science-first personal observability system designed for people navigating difficult phases of life such as work stress, emotional fatigue, low motivation, breakups, and periods of psychological strain.

## Important Notice

NYTVND LifeLog does not diagnose or treat medical or mental health conditions. It supports self-observation and understanding, and can be used alongside professional care.

## Features

- **Daily Logging**: Track sleep, workout, meditation, learning time, and optional notes
- **Observatory Dashboard**: Visualize patterns over time with neutral, data-first charts
- **Trends Analysis**: Explore correlations between metrics (with clear disclaimers)
- **Data Export**: Download your complete data as CSV or JSON
- **Privacy-First**: Full data ownership and account deletion
- **Dark/Light Theme**: Comfortable viewing in any environment

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Firebase (Firestore)
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Authentication**: Test mode (username/password with bcrypt) — Google SSO ready

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project created

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

4. Add your Firebase configuration to `.env.local`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Copy your Firebase config to `.env.local`
4. Deploy Firestore security rules (see below)

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /daily_logs/{logId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## Architecture

The authentication layer is fully abstracted through `AuthProvider` to enable seamless migration from test username/password auth to Google SSO without touching business logic.

### Key Files

- `components/auth/AuthProvider.tsx` - Abstracted auth interface
- `lib/firebase/auth.ts` - Auth implementation (replaceable)
- `lib/firebase/firestore.ts` - Database operations
- `app/(app)/` - Protected application pages

## Design Philosophy

- **No gamification**: No XP, streaks, badges, or scores
- **No judgment**: No "good/bad" or "healthy/unhealthy" language
- **Neutral presentation**: Data displayed for user interpretation
- **No advice**: System observes, user derives meaning

## Language Guidelines

✅ **Use**: Observe, Patterns, Phases, Trends, Recovery, Variability, Understanding, Clarity

❌ **Never use**: Heal, Cure, Fix, Overcome, Improve, Optimize, Discipline, Lazy, Weak, Success, Failure

## Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
