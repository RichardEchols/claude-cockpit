# Kiyomi Cockpit Redesign Spec

## Current State
The cockpit (claude-cockpit) already has:
- ✅ ChatView with message bubbles and streaming
- ✅ QuickActions horizontal scroll bar
- ✅ SessionSidebar for chat history
- ✅ TerminalView for raw CLI output
- ✅ AuthGate for security
- ✅ ProjectSwitcher
- ✅ VoiceRecorder component
- ✅ FileUpload component
- ✅ Framer Motion animations
- ✅ Apple-style dark UI (surface-primary, separator, etc.)

## What Needs to Change

### 1. Split-Panel Layout (CRITICAL)
Current: Full-screen chat only
New: Chat panel LEFT + Dashboard panel RIGHT (collapsible)

```
┌──────────────────────────────────────────────────┐
│  ✨ Kiyomi — Lawyer Assistant        ⚙️  📊  👤 │
├─────────────────────┬────────────────────────────┤
│                     │                            │
│   💬 CHAT PANEL     │   📊 DASHBOARD PANEL       │
│                     │                            │
│  [Session history]  │  [Quick Action Buttons]    │
│  [Streaming msgs]   │  🔵 Case Overview          │
│                     │  🔵 SOL Deadlines           │
│                     │  🔵 Monthly Report          │
│                     │                            │
│  [Quick Actions]    │  [Business Cards]          │
│  [Voice 🎤]        │  - Active Cases: 12        │
│                     │  - SOL This Month: 3       │
│  ┌───────────────┐  │  - Revenue MTD: $45K       │
│  │ Type here...  │  │                            │
│  └───────────────┘  │  [Saved Reports List]      │
│                     │  📄 Jan 2026 Report         │
│                     │  📄 Dec 2025 Report         │
└─────────────────────┴────────────────────────────┘
```

### 2. Dashboard Panel Component (NEW)
Create `DashboardPanel.tsx`:
- Shows vertical-specific data cards (metrics, lists, deadlines)
- Quick action buttons (big, colorful, one-tap)
- Saved reports list
- Collapsible — toggle via 📊 icon in header
- On mobile: swipe between chat and dashboard (tab bar)
- Data source: reads from Kiyomi's memory files via API

### 3. Vertical-Aware Quick Actions (ENHANCED)
Current: Static hardcoded actions in constants.ts
New: Dynamic actions loaded from vertical template config

```typescript
// lib/verticals.ts
interface VerticalTemplate {
  id: string
  name: string  
  icon: string
  quickActions: QuickAction[]
  dashboardCards: DashboardCard[]
  color: string
}

const LAWYER_TEMPLATE: VerticalTemplate = {
  id: 'lawyer',
  name: 'Legal Assistant',
  icon: '⚖️',
  color: '#3B82F6',
  quickActions: [
    { label: 'Case Overview', prompt: 'Show me all my active cases', icon: 'briefcase' },
    { label: 'SOL Deadlines', prompt: 'Show statute of limitations deadlines this month', icon: 'clock' },
    { label: 'Draft Demand Letter', prompt: 'Help me draft a demand letter', icon: 'file-text' },
    { label: 'Billing Summary', prompt: 'Show my billing summary for this month', icon: 'dollar-sign' },
    { label: 'Monthly Report', prompt: 'Generate my monthly case report', icon: 'bar-chart' },
  ],
  dashboardCards: [
    { label: 'Active Cases', source: 'memory/cases/active.json', type: 'count' },
    { label: 'SOL This Month', source: 'memory/deadlines/', type: 'count' },
    { label: 'Revenue MTD', source: 'memory/billing/', type: 'sum' },
  ],
}
```

### 4. Quick Action Buttons (REDESIGNED)
Current: Small horizontal scroll chips
New: Large, vertical grid of colorful buttons in dashboard panel

```tsx
// Big button style for non-technical users
<button className="
  w-full p-4 rounded-xl
  bg-blue-500/10 border border-blue-500/30
  hover:bg-blue-500/20 
  text-left flex items-center gap-3
">
  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
    <Briefcase className="w-5 h-5 text-white" />
  </div>
  <div>
    <div className="font-semibold text-white">Case Overview</div>
    <div className="text-xs text-gray-400">View all active cases</div>
  </div>
</button>
```

### 5. First-Run Tutorial (NEW)
Create `FirstRunTutorial.tsx`:
- Overlay that shows on first launch
- 4 steps with spotlight/highlight:
  1. "Talk to me here" → spotlight chat input
  2. "Press buttons for quick help" → spotlight quick actions
  3. "See your data here" → spotlight dashboard
  4. "Try saying 'Good morning'!" → dismiss
- Stored in localStorage: `kiyomi_tutorial_complete`
- Skip button always visible

### 6. Header Redesign
Current: Menu + Project switcher + Terminal + Logout
New: Kiyomi branding + vertical name + settings + dashboard toggle + profile

```
✨ Kiyomi — Legal Assistant        ⚙️  📊  👤
```

### 7. Report Viewer (NEW)
Create `ReportViewer.tsx`:
- Opens saved HTML/PDF reports in a modal or side panel
- List of saved reports in dashboard panel
- Click to open, print button, share button

## File Changes Summary

### New Files
- `src/components/DashboardPanel.tsx` — business data + actions + reports
- `src/components/FirstRunTutorial.tsx` — onboarding overlay  
- `src/components/ReportViewer.tsx` — saved report viewer
- `src/components/VerticalButton.tsx` — big colorful action button
- `src/lib/verticals.ts` — vertical template definitions
- `src/lib/verticals/lawyer.ts` — lawyer template
- `src/lib/verticals/content-creator.ts` — content creator template
- `src/lib/verticals/small-business.ts` — small business template

### Modified Files
- `src/components/Dashboard.tsx` — add split-panel layout
- `src/components/QuickActions.tsx` — load from vertical template
- `src/app/page.tsx` — add first-run tutorial check
- `src/lib/constants.ts` — remove hardcoded quick actions, add vertical config
- `src/lib/types.ts` — add VerticalTemplate, DashboardCard types

## Design System (Keep Existing)
- Dark theme with Apple-style glass effects
- surface-primary, surface-secondary, surface-tertiary
- separator, txt-primary, txt-secondary, accent
- Framer Motion for all transitions
- Rounded-xl corners, subtle borders
- Inter font (or SF Pro if available)

## Mobile Responsive
- < 768px: Tab bar switching between Chat and Dashboard
- >= 768px: Side-by-side split panel
- Dashboard panel default width: 380px, resizable
