# Gateway Success UI Refresh - Implementation Prompt for Claude Code

## Context
This is a B2B SaaS platform for Programme Directors managing £100M+ UK infrastructure projects. The design needs to feel institutional, authoritative, and Treasury-grade — not startup-y.

## Core Problem
Copper/brown accent colour is overused, making everything feel equally emphasized (i.e., nothing stands out). Need to establish clear visual hierarchy.

## The "One Copper Rule"
Each page should have **at most ONE copper-coloured button** — the primary action. All other buttons should be navy/slate.

---

## Global Changes

### 1. Update CSS Variables / Tailwind Config

Add or update these colours:
```
navy-950: #0B1221
navy-900: #111827  
navy-800: #1E293B
navy-700: #334155
copper-500: #C2713A (keep existing)
slate-50 through slate-900 (use Tailwind defaults)
```

### 2. Button Hierarchy

**Primary (copper) - ONE per view:**
```jsx
className="bg-[#C2713A] hover:bg-[#A65F2E] text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
```

**Secondary (slate outline):**
```jsx
className="bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 px-5 py-2.5 rounded-lg font-medium transition-colors"
```

**Tertiary (text link):**
```jsx
className="text-slate-700 hover:text-[#C2713A] font-medium"
```

### 3. Status Badges

**Completed:** Change from green to slate
```jsx
// Before
className="bg-green-100 text-green-800"

// After  
className="bg-slate-700 text-white text-xs font-medium px-2.5 py-1 rounded"
```

**Draft:**
```jsx
className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded border border-slate-200"
```

**In Progress:**
```jsx
className="bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded border border-amber-200"
```

### 4. Cards

Standard card (no shadow):
```jsx
className="bg-white border border-slate-200 rounded-lg p-6"
```

Interactive card (has hover):
```jsx
className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
```

Info/highlight card (replace blue):
```jsx
// Before
className="bg-blue-50 border-blue-200"

// After
className="bg-slate-50 border border-slate-200 border-l-4 border-l-slate-400"
```

---

## Page-Specific Changes

### Dashboard Page (Projects List)

1. **Stats row:** Remove heavy icon backgrounds, use simple monoline icons
2. **"Create Project" button:** This is the ONE copper button on this page
3. **"View Project" links:** Change to text links (slate, copper on hover), not styled buttons
4. **Project card badges:** 
   - "completed" → slate-700 bg, white text
   - "draft" → slate-100 bg, slate-600 text
5. **Project card metadata:** Use · separators instead of icons: "£5M · Energy · 26 Nov 2025"

### Project Overview Tab

1. **"View Template Criteria" link:** Change from copper to slate-700 text link with arrow
2. **"View Full Assessment" button:** This is the ONE copper button
3. **Assessment At A Glance cards:** 
   - Add supporting text under numbers (e.g., "5" → "5 requiring action")
   - Keep RAG badge standard colours (red/amber/green for actual ratings)

### Documents Tab

1. **"Add Documents" button:** Change to slate outline (secondary)
2. **"View Results" button:** This is the ONE copper button  
3. **"Re-run" button:** Change to slate outline (secondary)
4. **Blue info card:** Change to slate-50 bg with slate-400 left border
5. **Document status "Uploaded":** Green text with checkmark, no green background

### Assessment Summary Tab

1. **Export buttons (Action Plan, Excel, PDF):** All should be slate outline style, same visual weight
2. **Keep:** RAG badge colours for actual ratings
3. **Section markers (KEY STRENGTHS, CRITICAL ISSUES):** Use coloured dots (green/red/amber) before headings

### Assessment Dashboard Tab

1. **No changes needed:** RAG colours are appropriate here for data visualization
2. **Priority Actions cards:** Keep red badges, they're contextually correct

---

## Typography Refinements

Ensure consistent usage:
- **Page titles:** text-2xl font-semibold text-slate-900
- **Section headers:** text-xl font-semibold text-slate-900  
- **Card titles:** text-lg font-medium text-slate-800
- **Body:** text-base text-slate-700
- **Secondary/labels:** text-sm text-slate-500
- **Badges:** text-xs font-medium uppercase tracking-wide

---

## Files to Update

1. Global styles / Tailwind config (colours)
2. Any shared Button component
3. Any shared Badge/Status component
4. Dashboard/ProjectsList page
5. Project Overview tab
6. Project Documents tab
7. Assessment Summary tab

---

## Testing Checklist

After changes, verify:
- [ ] Only ONE copper button per page view
- [ ] "Completed" badges are slate, not green
- [ ] No bright blue info cards remain
- [ ] Links are slate (copper on hover only)
- [ ] Card borders are consistent slate-200
- [ ] Typography hierarchy is consistent
- [ ] Hover states work on interactive elements
