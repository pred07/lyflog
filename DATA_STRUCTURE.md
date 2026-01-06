# Data Structure & Flow Documentation

This document explains where all data is stored in Firestore and how the dashboard retrieves and displays information.

## Firestore Collections

### 1. User Profile
**Location**: `users/{userId}`

**Contains**:
- `userId`: Unique user identifier
- `username`: Display name
- `email`: User email (for Google SSO users)
- `theme`: 'light' or 'dark'
- `createdAt`: Account creation timestamp
- `metrics`: Array of custom state configurations (e.g., Anxiety, Focus, Depression)
- `exposures`: Array of exposure tracking configurations (e.g., Caffeine, Screen Time)
- `logbooks`: Array of custom logbook configurations
- `habits`: Array of habit configurations

**Example**:
```json
{
  "userId": "user_123",
  "username": "John Doe",
  "theme": "dark",
  "metrics": [
    { "id": "anxiety", "label": "Anxiety", "type": "range", "max": 5 },
    { "id": "depression", "label": "Depression", "type": "range", "max": 5 }
  ],
  "exposures": [
    { "id": "caffeine", "label": "Caffeine", "type": "count" }
  ]
}
```

---

### 2. Daily Logs
**Location**: `users/{userId}/dailyLogs/{logId}`

**Contains**:
- Core metrics: `sleep`, `workout`, `meditation`, `learning`
- Health metrics: `steps`, `water`, `calories`, `uvIndex`, `heartRate`, `weight`
- Custom metrics: Stored in `metrics` object (e.g., `{ "anxiety": 3, "depression": 2 }`)
- Custom exposures: Stored in `exposures` object
- `note`: Text notes for the day
- `date`: Log date
- `createdAt`: Creation timestamp

**Example**:
```json
{
  "logId": "log_20260106",
  "userId": "user_123",
  "date": "2026-01-06T00:00:00Z",
  "sleep": 7.5,
  "steps": 8500,
  "water": 2.5,
  "workout": { "type": "Running", "duration": 30 },
  "meditation": 15,
  "metrics": {
    "anxiety": 2,
    "depression": 1,
    "focus": 4
  },
  "exposures": {
    "caffeine": 2
  },
  "note": "Felt great today!"
}
```

---

### 3. Habit Entries
**Location**: `users/{userId}/habitEntries/{entryId}`

**Contains**:
- `habitId`: Reference to habit configuration
- `date`: Date of the entry
- `done`: Boolean indicating completion
- `notes`: Optional notes for this habit entry
- `createdAt`, `updatedAt`: Timestamps

---

### 4. Session Entries (Deep Work)
**Location**: `users/{userId}/sessionEntries/{sessionId}`

**Contains**:
- `title`: Session title
- `duration`: Duration in minutes
- `category`: Session category
- `date`: Session date

---

### 5. Logbook Entries
**Location**: `users/{userId}/logbookEntries/{entryId}`

**Contains**:
- `logbookId`: Reference to logbook configuration
- `date`: Entry date
- `data`: Object containing column values

---

### 6. Context Zones
**Location**: `users/{userId}/contextZones/{zoneId}`

**Contains**:
- `label`: Zone label (e.g., "Vacation", "Sick")
- `startDate`, `endDate`: Date range
- `description`: Optional description

**Purpose**: Used for "Isolation Mode" to filter out abnormal periods from analytics

---

## Dashboard Data Sources

The dashboard (`/dashboard`) displays data from multiple sources:

1. **Core Metrics** - Read from `users/{userId}/dailyLogs` (last 7 days)
2. **Personal States** - Configuration from `users/{userId}.metrics`, data from `dailyLogs.metrics`
3. **Exposures** - Configuration from `users/{userId}.exposures`, data from `dailyLogs.exposures`
4. **Correlations** - Analyzes all `dailyLogs` (minimum 20 days required)
5. **Isolation Mode** - Filters using `users/{userId}/contextZones`

---

## Custom States Flow

### Adding a New Custom State (e.g., "Depression")

1. Go to `/profile` → "My States" → Click "+"
2. Enter state name → Click "Add"
3. System updates `users/{userId}.metrics` array
4. **NEW**: Calls `refreshUser()` - state appears immediately without reload
5. State now appears in log form and dashboard

### Where Data is Saved

- **Configuration**: `users/{userId}.metrics`
- **Daily Values**: `users/{userId}/dailyLogs/{logId}.metrics.{stateId}`
- **Dashboard**: Reads both to display trend charts

---

## Summary Table

| Feature | Data Location | Read By |
|---------|--------------|---------|
| User profile, custom metrics | `users/{userId}` | All pages via AuthProvider |
| Daily logs (sleep, steps, etc.) | `users/{userId}/dailyLogs` | Dashboard, Timeline, Search, Trends |
| Habit completions | `users/{userId}/habitEntries` | Habits page, Timeline |
| Deep work sessions | `users/{userId}/sessionEntries` | Session page, Timeline |
| Logbook entries | `users/{userId}/logbookEntries` | Logbook page |
| Context zones | `users/{userId}/contextZones` | Dashboard (isolation mode) |

All data is scoped to the user - Firestore security rules ensure users can only access their own data.
