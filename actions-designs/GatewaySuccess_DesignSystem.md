# Gateway Success Design System & UI Improvements

## Executive Summary

Your application serves **Programme Directors managing £100M+ UK infrastructure projects**. These are senior government and enterprise stakeholders who need:
- **Instant credibility** — Treasury/IPA-grade professionalism
- **Information density** — Complex data presented clearly
- **Quiet confidence** — Not flashy, but unmistakably high-quality

The current design overuses the copper/brown accent colour, has inconsistent spacing, and lacks the visual hierarchy needed for quick decision-making.

---

## Design Direction: "Institutional Precision"

**Tone:** Refined, authoritative, data-confident — like Bloomberg Terminal meets Government Digital Service meets McKinsey report.

**Not:** Startup-y, playful, trendy, or generic SaaS.

---

## Colour System

### Current Problems
- Copper (#C17A56 / brown-orange) is overused on buttons, badges, highlights, cards
- Creates visual fatigue and reduces emphasis when everything is "highlighted"
- Doesn't feel authoritative enough for government/Treasury audience

### New Palette

```css
:root {
  /* Primary - Deep Navy (authority, trust) */
  --navy-950: #0B1221;
  --navy-900: #111827;
  --navy-800: #1E293B;
  --navy-700: #334155;
  --navy-600: #475569;
  
  /* Neutral - Slate (professional, readable) */
  --slate-500: #64748B;
  --slate-400: #94A3B8;
  --slate-300: #CBD5E1;
  --slate-200: #E2E8F0;
  --slate-100: #F1F5F9;
  --slate-50: #F8FAFC;
  
  /* Accent - Copper (RESERVED for primary CTAs only) */
  --copper-600: #B45309;
  --copper-500: #C2713A;
  --copper-400: #D97706;
  
  /* RAG Status - Standard, not branded */
  --rag-green: #059669;
  --rag-amber: #D97706;
  --rag-red: #DC2626;
  
  /* Supporting */
  --white: #FFFFFF;
  --success-bg: #ECFDF5;
  --warning-bg: #FFFBEB;
  --error-bg: #FEF2F2;
}
```

### Colour Usage Rules

| Element | Current | New |
|---------|---------|-----|
| Primary buttons | Copper everywhere | Copper for ONE primary CTA per view only |
| Secondary buttons | Copper outline | Navy or slate outline |
| Status badges (completed) | Green | Slate-700 with subtle green left border |
| Status badges (draft) | Grey outline | Slate-200 background |
| Card borders | Light grey | Slate-200 |
| Section backgrounds | White/grey inconsistent | White cards on slate-50 background |
| Links | Copper | Navy-700, copper on hover |
| Icons | Mixed | Slate-500 default |

---

## Typography

### Current Problems
- Generic sans-serif
- Inconsistent sizing and weight
- Headers don't create enough hierarchy

### Recommendations

```css
/* Keep system fonts for performance, but refine usage */
--font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;

/* Type Scale */
--text-4xl: 2.25rem;    /* Page titles */
--text-2xl: 1.5rem;     /* Section headers */
--text-xl: 1.25rem;     /* Card headers */
--text-lg: 1.125rem;    /* Subsection headers */
--text-base: 1rem;      /* Body */
--text-sm: 0.875rem;    /* Secondary text, labels */
--text-xs: 0.75rem;     /* Badges, metadata */

/* Weights */
--font-semibold: 600;   /* Headers */
--font-medium: 500;     /* Emphasis */
--font-normal: 400;     /* Body */
```

### Hierarchy Rules
- **Page titles:** text-2xl, font-semibold, slate-900
- **Section headers:** text-xl, font-semibold, slate-900
- **Card titles:** text-lg, font-medium, slate-800
- **Body text:** text-base, font-normal, slate-700
- **Secondary/meta:** text-sm, font-normal, slate-500
- **Badges:** text-xs, font-medium, uppercase tracking-wide

---

## Component Redesigns

### 1. Dashboard (Image 1)

**Current Issues:**
- Stats cards have weak visual hierarchy
- Project cards are visually heavy with copper badges
- "Create Project" button competes with everything

**Improvements:**

```
STATS ROW
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ ○ 7             │ ↗ 1             │ ⚠ 15            │ ✓ 0             │
│ Total Projects  │ In Progress     │ Critical Actions│ Completed       │
│                 │                 │ (amber text)    │ of 60 actions   │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
- Remove heavy icons, use subtle monoline icons
- "Critical Actions" number in amber, others in slate-900
- Cards: white bg, slate-200 border, no shadows

PROJECT CARDS
┌──────────────────────────────────────────────────────────────────────┐
│ test assessment                                        [Completed]   │
│                                                        (slate badge) │
│ £5M · Energy · Created 26 Nov 2025                                   │
│                                                                      │
│ View Project →                                                       │
└──────────────────────────────────────────────────────────────────────┘
- Status badge: Completed = slate-700 bg, white text (not green)
- Status badge: Draft = slate-200 bg, slate-600 text
- Remove icons from metadata row, use · separator
- "View Project" as text link, not styled area
```

### 2. Project Overview (Image 2)

**Current Issues:**
- "View Template Criteria" link in copper feels like a CTA but isn't primary
- "Assessment At A Glance" cards lack visual weight
- Red "View Full Assessment" button screams danger, not action

**Improvements:**

```
ASSESSMENT TEMPLATE CARD
┌──────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                                          │
│ │Template │  PAR: Project Assessment Review                          │
│ └─────────┘  Comprehensive assessment across all dimensions...       │
│              View Criteria →  (navy link, not copper)                │
└──────────────────────────────────────────────────────────────────────┘

ASSESSMENT AT A GLANCE
┌────────────────────┬────────────────────┬────────────────────────────┐
│ OVERALL RATING     │ CRITICAL ISSUES    │ CRITERIA ASSESSED          │
│ ┌─────┐            │                    │                            │
│ │ RED │  22%       │ 5                  │ 50                         │
│ └─────┘  Ready     │ requiring action   │ of 50 complete             │
└────────────────────┴────────────────────┴────────────────────────────┘
- RAG badge uses standard red, not branded
- Add context: "22% Ready" next to badge
- Add supporting text under numbers

PRIMARY CTA
┌────────────────────────┐
│  View Full Assessment  │  ← Copper button (the ONE primary CTA)
└────────────────────────┘
- This is the main action, so it gets copper
- Remove chart icon, text is enough
```

### 3. Documents Tab (Image 3)

**Current Issues:**
- "Add Documents" button in copper competes with "Re-run" and "View Results"
- Three copper buttons on one screen = no hierarchy
- Blue info card clashes with copper accent

**Improvements:**

```
HEADER ROW
Project Documents (1)                              [+ Add Documents]
Upload up to 50 PDF documents...                   (slate outline btn)

INFO CARD - Remove blue, use subtle slate
┌──────────────────────────────────────────────────────────────────────┐
│ Recommended Documents for PAR: Project Assessment Review             │
│ Comprehensive health check of ongoing project delivery          ∨    │
└──────────────────────────────────────────────────────────────────────┘
- Border-left: 3px slate-400 (not full blue bg)
- Background: slate-50

DOCUMENT ROW
┌──────────────────────────────────────────────────────────────────────┐
│ 📄 HS2_Phase_One_Full_Business_Case_2020.pdf              ↗    🗑   │
│    Full Business Case · Uploaded 12/11/2025                          │
│    ✓ Uploaded                                                        │
└──────────────────────────────────────────────────────────────────────┘
- Status badge: green left border + "Uploaded" text, no green bg

BOTTOM ACTION BAR
┌──────────────────────────────────────────────────────────────────────┐
│ Update Assessment                                                    │
│ Re-run the assessment with your latest documents    [Re-run] [View]  │
│                                                     (slate) (copper) │
└──────────────────────────────────────────────────────────────────────┘
- "View Results" = copper (primary CTA)
- "Re-run" = slate/navy outline (secondary)
```

### 4. Assessment Summary (Image 4)

**Current Issues:**
- Good content hierarchy, but buttons (Action Plan, Excel, PDF) are garish
- Green/red/red button colours don't follow system

**Improvements:**

```
EXPORT BUTTONS
[Action Plan]  [Excel]  [PDF]
   navy         navy     navy    ← All secondary style, same weight

Or use icon-only with tooltips:
[📋] [📊] [📄]  ← Subtle slate icons

RATING CARD
┌──────────────────────────────────────────────────────────────────────┐
│ OVERALL ASSESSMENT RATING                            50              │
│ ┌─────┐                                              Criteria        │
│ │ Red │  22% Ready                                   Assessed        │
│ └─────┘                                                              │
├──────────────────────────────────────────────────────────────────────┤
│ The HS2 project is assessed red with low confidence...               │
│                                                                      │
│ ● KEY STRENGTHS                                                      │
│   Criteria 6,7,8: Strong alignment with government strategic...      │
│                                                                      │
│ ● CRITICAL ISSUES                                                    │
│   Criterion 14: Lack of documented options appraisal...              │
│                                                                      │
│ ● OVERALL RECOMMENDATION                                             │
│   Do not proceed until critical gaps are remediated...               │
└──────────────────────────────────────────────────────────────────────┘
- Section markers (●) in appropriate colours: green/red/amber
- Clean left-aligned text, no excessive styling
```

### 5. Dashboard Visualizations (Image 5)

**Current Issues:**
- Donut chart colours are fine (standard RAG)
- "Priority Actions" cards have red badges that work
- Overall clean, but bar chart could be clearer

**Improvements:**

```
PRIORITY ACTIONS
- Keep red badges, they're appropriate here
- Add hover state: slight lift + shadow
- Truncated text: add "..." and tooltip on hover

BAR CHART
- Stack order: Green, Amber, Red (left to right for positive framing)
- Add value labels inside bars if space permits
- Y-axis labels: ensure full dimension names visible
```

---

## Button Hierarchy System

### The "One Copper Rule"

Each view should have **at most ONE copper button** — the primary action you want users to take.

| Level | Style | Usage |
|-------|-------|-------|
| **Primary** | Copper bg, white text | ONE per view: "View Assessment", "Create Project", "Run Analysis" |
| **Secondary** | Navy/slate outline | Supporting actions: "Re-run", "Add Documents", "Export" |
| **Tertiary** | Text link, navy | Navigation: "View Criteria →", "View Project →" |
| **Destructive** | Red outline | Delete actions only |

### Button Styles

```css
/* Primary - Copper (use sparingly) */
.btn-primary {
  background: var(--copper-500);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
}
.btn-primary:hover {
  background: var(--copper-600);
}

/* Secondary - Navy outline */
.btn-secondary {
  background: transparent;
  color: var(--navy-700);
  border: 1px solid var(--slate-300);
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
}
.btn-secondary:hover {
  background: var(--slate-50);
  border-color: var(--slate-400);
}

/* Tertiary - Text link */
.btn-text {
  background: none;
  border: none;
  color: var(--navy-700);
  font-weight: 500;
  padding: 0;
}
.btn-text:hover {
  color: var(--copper-500);
}
```

---

## Card & Container Patterns

### Standard Card

```css
.card {
  background: white;
  border: 1px solid var(--slate-200);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

/* No shadows by default - cleaner, more professional */
/* Add shadow only on hover for interactive cards */
.card-interactive:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  border-color: var(--slate-300);
}
```

### Info/Highlight Card (replacing blue cards)

```css
.card-info {
  background: var(--slate-50);
  border: 1px solid var(--slate-200);
  border-left: 3px solid var(--slate-400);
  border-radius: 0.5rem;
  padding: 1rem 1.5rem;
}
```

### Stats Card

```css
.stat-card {
  background: white;
  border: 1px solid var(--slate-200);
  border-radius: 0.5rem;
  padding: 1.25rem 1.5rem;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--slate-900);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--slate-500);
  margin-top: 0.25rem;
}

/* Critical stat gets amber value */
.stat-value--critical {
  color: var(--rag-amber);
}
```

---

## Status Badges

### Current → New

| Status | Current | New |
|--------|---------|-----|
| Completed | Green bg | Slate-700 bg, white text |
| In Progress | Amber | Amber-100 bg, amber-800 text, amber border |
| Draft | Grey outline | Slate-100 bg, slate-600 text |
| Processing | Blue? | Slate-700 bg with subtle pulse animation |

### RAG Badges (keep distinct)

```css
.rag-green {
  background: var(--rag-green);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: var(--text-sm);
}

.rag-amber {
  background: var(--rag-amber);
  color: white;
  /* ... */
}

.rag-red {
  background: var(--rag-red);
  color: white;
  /* ... */
}
```

---

## Spacing System

Use consistent spacing throughout:

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
```

### Application

- **Card padding:** space-6 (24px)
- **Section gap:** space-8 (32px)
- **Element gap within cards:** space-4 (16px)
- **Inline element gap:** space-2 (8px)
- **Page max-width:** 1280px (max-w-6xl)
- **Page horizontal padding:** space-6 (24px)

---

## Implementation Priority

### Phase 1: Quick Wins (1-2 hours)
1. Replace all copper buttons except primary CTAs with slate outline style
2. Change "completed" badges from green to slate-700
3. Standardise card borders to slate-200

### Phase 2: Systematic (2-4 hours)
4. Implement button hierarchy across all views
5. Update info cards from blue to slate
6. Refine typography scale

### Phase 3: Polish (4-6 hours)
7. Add hover states and micro-interactions
8. Ensure consistent spacing throughout
9. Review and refine each page

---

## Before/After Summary

| Element | Before | After |
|---------|--------|-------|
| Primary CTA | Copper everywhere | ONE copper per view |
| Secondary buttons | Copper outline | Slate/navy outline |
| Completed badge | Green | Slate-700 |
| Info cards | Bright blue | Subtle slate |
| Links | Copper | Navy (copper on hover) |
| Card borders | Light grey | Slate-200, consistent |
| Shadows | Inconsistent | None default, hover only |
| Button icons | Everywhere | Only when adding clarity |

This system creates **visual breathing room**, establishes **clear hierarchy**, and projects the **institutional authority** that Programme Directors expect.
