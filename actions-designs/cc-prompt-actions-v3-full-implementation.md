# Implement Actions Register V3 - Complete Replacement

## Overview

Replace the existing Actions system with a new gateway-intelligent Actions Register. The new system features:
- AI-generated actions via right-hand sidebar (not modal)
- Criterion linking showing which assessment gap each action addresses
- Impact scoring showing estimated readiness improvement
- Five Case Model tabs for filtering
- Dependency tracking between actions
- Comprehensive activity feed with audit trail

## Reference Designs

Open each of these in a browser to see the exact UI to implement:

| State | File |
|-------|------|
| Empty State | `/mnt/user-data/outputs/actions-empty-state.html` |
| Loading State | `/mnt/user-data/outputs/actions-loading-state.html` |
| Draft Review (Sidebar) | `/mnt/user-data/outputs/actions-draft-review.html` |
| Populated Table | `/mnt/user-data/outputs/actions-populated-table.html` |
| Action Detail Modal | `/mnt/user-data/outputs/actions-detail-modal.html` |

---

## Database Schema Changes

Run these migrations to add the required columns:

```sql
-- Add criterion linking
ALTER TABLE actions ADD COLUMN IF NOT EXISTS criterion_id INTEGER REFERENCES assessment_criteria(id);

-- Add Five Case Model category
ALTER TABLE actions ADD COLUMN IF NOT EXISTS case_category VARCHAR(20);
-- Values: 'strategic', 'economic', 'commercial', 'financial', 'management'

-- Add impact scoring
ALTER TABLE actions ADD COLUMN IF NOT EXISTS estimated_impact INTEGER;
-- Percentage points (e.g., 8 means +8% readiness improvement)

-- Add dependency tracking
ALTER TABLE actions ADD COLUMN IF NOT EXISTS blocked_by_action_id INTEGER REFERENCES actions(id);

-- Add source tracking
ALTER TABLE actions ADD COLUMN IF NOT EXISTS source_type VARCHAR(20) DEFAULT 'manual';
-- Values: 'manual', 'ai_generated'

ALTER TABLE actions ADD COLUMN IF NOT EXISTS source_assessment_run_id INTEGER REFERENCES assessment_runs(id);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_actions_project_status ON actions(project_id, action_status);
CREATE INDEX IF NOT EXISTS idx_actions_criterion ON actions(criterion_id);
CREATE INDEX IF NOT EXISTS idx_actions_case_category ON actions(case_category);
```

---

## Component Structure

```
src/components/actions/
├── ActionsPage.tsx                 # Main page component
├── ActionsHeader.tsx               # Title + Add/Generate buttons
├── ActionsSummary.tsx              # 6 stat cards row
├── ActionsTable/
│   ├── ActionsTableCard.tsx        # White card wrapper
│   ├── CaseCategoryTabs.tsx        # Five Case tabs
│   ├── ActionsFilters.tsx          # Search + filter dropdowns
│   ├── ActionsTable.tsx            # Table component
│   ├── ActionRow.tsx               # Individual row
│   ├── CriterionCell.tsx           # RAG + code + name
│   ├── StatusBadge.tsx             # Status pill
│   ├── PriorityBadge.tsx           # Priority pill
│   ├── ImpactBadge.tsx             # +X% green text
│   ├── OwnerCell.tsx               # Avatar + name
│   ├── DueDateCell.tsx             # Date with overdue state
│   └── ActionsPagination.tsx       # Pagination footer
├── AIGenerationSidebar/
│   ├── AIGenerationSidebar.tsx     # Main sidebar wrapper
│   ├── SidebarHeader.tsx           # Title + close button
│   ├── GenerationStats.tsx         # 3-column stats
│   ├── RefinementSection.tsx       # Quick chips + custom input
│   ├── SuggestedActionsList.tsx    # Scrollable cards list
│   ├── SuggestedActionCard.tsx     # Individual action card
│   ├── SidebarFooter.tsx           # Dismiss/Approve buttons
│   ├── LoadingState.tsx            # Progress steps + skeletons
│   └── hooks/
│       └── useActionGeneration.ts  # Generation API hook
├── ActionDetailModal/
│   ├── ActionDetailModal.tsx       # Modal wrapper
│   ├── ModalHeader.tsx             # Title + badges
│   ├── ActionDescription.tsx       # Description section
│   ├── LinkedCriterionCard.tsx     # Clickable criterion link
│   ├── ActivityFeed.tsx            # Comments + events
│   ├── CommentInput.tsx            # Add comment form
│   ├── ActivityItem.tsx            # Single activity entry
│   ├── MetadataSidebar.tsx         # Right column fields
│   └── ModalFooter.tsx             # Delete/Cancel/Save
├── EmptyState.tsx                  # No actions yet view
├── CreateActionModal.tsx           # Manual action creation
└── hooks/
    ├── useActions.ts               # Actions CRUD operations
    ├── useActionStats.ts           # Stats calculation
    └── useActionFilters.ts         # Filter state management
```

---

## Type Definitions

```typescript
// types/actions.ts

export type ActionStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled' | 'wont_fix';

export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';

export type CaseCategory = 'strategic' | 'economic' | 'commercial' | 'financial' | 'management';

export type ActionSource = 'manual' | 'ai_generated';

export interface Action {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  action_status: ActionStatus;
  priority: ActionPriority;
  assigned_to: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  
  // New fields
  criterion_id: number | null;
  case_category: CaseCategory | null;
  estimated_impact: number | null;
  blocked_by_action_id: number | null;
  source_type: ActionSource;
  source_assessment_run_id: number | null;
  
  // Joined relations
  criterion?: {
    id: number;
    code: string;
    name: string;
    case_category: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  blocked_by?: {
    id: number;
    title: string;
  };
}

export interface SuggestedAction {
  title: string;
  description: string;
  criterion_id: number;
  criterion_code: string;
  criterion_name: string;
  criterion_rag: 'RED' | 'AMBER' | 'GREEN';
  case_category: CaseCategory;
  priority: ActionPriority;
  estimated_impact: number;
  suggested_due_date: string | null;
}

export interface GenerationResult {
  actions: SuggestedAction[];
  summary: {
    total_generated: number;
    gaps_addressed: number;
    potential_impact: number;
  };
}

export interface ActionStats {
  total: number;
  in_progress: number;
  completed: number;
  overdue: number;
  blocked: number;
  not_started: number;
  potential_impact: number;
}
```

---

## Data Fetching

### Fetch Actions with Relations

```typescript
// hooks/useActions.ts

export function useActions(projectId: number, filters?: ActionFilters) {
  return useQuery({
    queryKey: ['actions', projectId, filters],
    queryFn: async () => {
      let query = supabase
        .from('actions')
        .select(`
          *,
          criterion:assessment_criteria(id, code, name, case_category),
          assignee:users!assigned_to(id, name, email),
          blocked_by:actions!blocked_by_action_id(id, title)
        `)
        .eq('project_id', projectId)
        .order('due_date', { ascending: true, nullsFirst: false });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('action_status', filters.status);
      }
      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.caseCategory && filters.caseCategory !== 'all') {
        query = query.eq('case_category', filters.caseCategory);
      }
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Action[];
    }
  });
}
```

### Calculate Stats

```typescript
// hooks/useActionStats.ts

export function useActionStats(actions: Action[]): ActionStats {
  return useMemo(() => {
    const now = new Date();
    
    const overdue = actions.filter(a => 
      a.due_date && 
      new Date(a.due_date) < now && 
      !['completed', 'cancelled', 'wont_fix'].includes(a.action_status)
    ).length;

    const potentialImpact = actions
      .filter(a => !['completed', 'cancelled', 'wont_fix'].includes(a.action_status))
      .reduce((sum, a) => sum + (a.estimated_impact || 0), 0);

    return {
      total: actions.length,
      in_progress: actions.filter(a => a.action_status === 'in_progress').length,
      completed: actions.filter(a => a.action_status === 'completed').length,
      overdue,
      blocked: actions.filter(a => a.action_status === 'blocked').length,
      not_started: actions.filter(a => a.action_status === 'not_started').length,
      potential_impact: potentialImpact,
    };
  }, [actions]);
}
```

---

## AI Generation Sidebar

### State Management

```typescript
// AIGenerationSidebar.tsx

interface SidebarState {
  isOpen: boolean;
  isGenerating: boolean;
  suggestedActions: SuggestedAction[];
  summary: GenerationResult['summary'] | null;
  refinementPrompt: string;
  generationProgress: {
    step: string;
    percentage: number;
  };
}

const [state, setState] = useState<SidebarState>({
  isOpen: false,
  isGenerating: false,
  suggestedActions: [],
  summary: null,
  refinementPrompt: '',
  generationProgress: { step: '', percentage: 0 }
});
```

### N8N Webhook Integration

```typescript
// hooks/useActionGeneration.ts

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL;

export function useActionGeneration(projectId: number) {
  const generateActions = async (refinementPrompt?: string) => {
    // Get latest assessment run
    const { data: latestRun } = await supabase
      .from('assessment_runs')
      .select('id')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!latestRun) throw new Error('No assessment run found');

    const response = await fetch(`${N8N_WEBHOOK_URL}/generate_action_plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        assessment_run_id: latestRun.id,
        refinement_prompt: refinementPrompt || null
      })
    });

    if (!response.ok) throw new Error('Generation failed');
    
    return await response.json() as GenerationResult;
  };

  const approveActions = async (actions: SuggestedAction[]) => {
    const actionsToInsert = actions.map(action => ({
      project_id: projectId,
      title: action.title,
      description: action.description,
      criterion_id: action.criterion_id,
      case_category: action.case_category,
      priority: action.priority,
      estimated_impact: action.estimated_impact,
      due_date: action.suggested_due_date,
      action_status: 'not_started',
      source_type: 'ai_generated',
      source_assessment_run_id: latestRunId,
    }));

    const { data, error } = await supabase
      .from('actions')
      .insert(actionsToInsert)
      .select();

    if (error) throw error;
    return data;
  };

  return { generateActions, approveActions };
}
```

### Sidebar Animation

```typescript
// AIGenerationSidebar.tsx

<div className={cn(
  "fixed top-0 right-0 h-full w-[440px] bg-navy shadow-2xl z-50 flex flex-col",
  "transform transition-transform duration-300 ease-out",
  isOpen ? "translate-x-0" : "translate-x-full"
)}>
  {/* Sidebar content */}
</div>

{/* Overlay */}
{isOpen && (
  <div 
    className="fixed inset-0 bg-black/20 z-40"
    onClick={() => setIsOpen(false)}
  />
)}
```

### Quick Refinement Chips

```typescript
// RefinementSection.tsx

const quickPrompts = [
  { label: 'Make more specific', prompt: 'Make the actions more specific with concrete deliverables' },
  { label: 'Add due dates', prompt: 'Suggest realistic due dates based on complexity' },
  { label: 'Break into sub-tasks', prompt: 'Break large actions into smaller sub-tasks' },
  { label: 'Suggest owners', prompt: 'Suggest appropriate owners based on action type' },
];

<div className="flex flex-wrap gap-2 mb-3">
  {quickPrompts.map(({ label, prompt }) => (
    <button
      key={label}
      onClick={() => handleRegenerate(prompt)}
      className="px-2.5 py-1 text-xs bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-colors"
    >
      {label}
    </button>
  ))}
</div>
```

---

## Action Detail Modal

### Activity Feed Types

```typescript
type ActivityType = 'comment' | 'status_change' | 'assignment' | 'created' | 'due_date_change';

interface ActivityItem {
  id: string;
  type: ActivityType;
  user_id: string;
  user_name: string;
  created_at: string;
  data: {
    // For comments
    content?: string;
    mentions?: string[];
    // For status changes
    from_status?: ActionStatus;
    to_status?: ActionStatus;
    // For assignments
    assigned_to?: string;
    // For created
    source?: 'manual' | 'ai_generated';
    assessment_version?: number;
  };
}
```

### Fetching Activity

```typescript
// Fetch from action_history + action_comments tables
const fetchActivity = async (actionId: number) => {
  const [{ data: history }, { data: comments }] = await Promise.all([
    supabase
      .from('action_history')
      .select('*, user:users(name)')
      .eq('action_id', actionId)
      .order('created_at', { ascending: false }),
    supabase
      .from('action_comments')
      .select('*, user:users(name)')
      .eq('action_id', actionId)
      .order('created_at', { ascending: false })
  ]);

  // Merge and sort by date
  return [...(history || []), ...(comments || [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};
```

---

## Five Case Model Tabs

```typescript
// CaseCategoryTabs.tsx

interface TabConfig {
  key: CaseCategory | 'all';
  label: string;
  color: string;
}

const tabs: TabConfig[] = [
  { key: 'all', label: 'All', color: 'slate' },
  { key: 'strategic', label: 'Strategic', color: 'blue' },
  { key: 'economic', label: 'Economic', color: 'emerald' },
  { key: 'commercial', label: 'Commercial', color: 'violet' },
  { key: 'financial', label: 'Financial', color: 'amber' },
  { key: 'management', label: 'Management', color: 'rose' },
];

// Count actions per category
const getCounts = (actions: Action[]) => {
  return tabs.reduce((acc, tab) => {
    acc[tab.key] = tab.key === 'all' 
      ? actions.length 
      : actions.filter(a => a.case_category === tab.key).length;
    return acc;
  }, {} as Record<string, number>);
};
```

---

## Visual States

### Overdue Detection

```typescript
const isOverdue = (action: Action) => {
  if (!action.due_date) return false;
  if (['completed', 'cancelled', 'wont_fix'].includes(action.action_status)) return false;
  return new Date(action.due_date) < new Date();
};

const getDaysOverdue = (dueDate: string) => {
  const diff = Date.now() - new Date(dueDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};
```

### Blocked Row Styling

```typescript
// ActionRow.tsx
<tr className={cn(
  "action-row transition-colors",
  action.action_status === 'blocked' && "bg-purple-50/30"
)}>
```

### Completed Row Styling

```typescript
// ActionRow.tsx
<td>
  <a className={cn(
    "text-sm font-semibold hover:text-copper",
    action.action_status === 'completed' 
      ? "text-slate-400 line-through decoration-slate-300" 
      : "text-navy"
  )}>
    {action.title}
  </a>
</td>
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Day 1)
- [ ] Run database migrations
- [ ] Create type definitions
- [ ] Set up component folder structure
- [ ] Implement useActions hook with filters
- [ ] Implement useActionStats hook

### Phase 2: Main Table (Day 1-2)
- [ ] ActionsPage layout
- [ ] ActionsSummary stats bar
- [ ] CaseCategoryTabs
- [ ] ActionsFilters
- [ ] ActionsTable with all columns
- [ ] ActionRow with visual states
- [ ] Pagination

### Phase 3: Empty & Loading States (Day 2)
- [ ] EmptyState component
- [ ] Loading skeletons for table

### Phase 4: AI Generation Sidebar (Day 2-3)
- [ ] AIGenerationSidebar wrapper with animation
- [ ] LoadingState with progress steps
- [ ] SuggestedActionCard
- [ ] RefinementSection with quick chips
- [ ] SidebarFooter with approve/dismiss
- [ ] useActionGeneration hook
- [ ] Wire up N8N webhook

### Phase 5: Action Detail Modal (Day 3)
- [ ] Modal layout with 2/3 + 1/3 grid
- [ ] LinkedCriterionCard
- [ ] ActivityFeed with comments + events
- [ ] CommentInput with @mentions
- [ ] MetadataSidebar with editable fields
- [ ] Save/Delete functionality

### Phase 6: Polish & Integration (Day 4)
- [ ] CreateActionModal for manual actions
- [ ] Wire dashboard "Critical Gaps" to link to Actions filtered by criterion
- [ ] Test full flow: generate → review → approve → track → complete
- [ ] Remove old Actions components

---

## Routing

```typescript
// App.tsx or router config
<Route path="/projects/:id/actions" element={<ActionsPage />} />
```

The ActionsPage should be accessible from the sidebar navigation (already exists).

---

## Key Differences from Current Implementation

| Current | New |
|---------|-----|
| Modal for AI generation | Right-hand sidebar |
| No criterion linking | Full criterion display with RAG |
| No impact scores | +X% per action |
| No Five Case tabs | Full tab bar with counts |
| Basic comments | Full activity feed with audit trail |
| Simple table | Rich table with visual states |
| No stats bar | 6 stat cards including potential impact |

---

## N8N Webhook Endpoint

Create a new N8N workflow with webhook trigger at `/generate_action_plan`:

**Input:**
```json
{
  "project_id": 49,
  "assessment_run_id": 5,
  "refinement_prompt": "Focus on Financial Case gaps"
}
```

**Output:**
```json
{
  "actions": [
    {
      "title": "Complete Quantified Risk Assessment",
      "description": "Update QRA with latest cost estimates...",
      "criterion_id": 156,
      "criterion_code": "G3-IV-4.1",
      "criterion_name": "Cost Contingency Analysis",
      "criterion_rag": "RED",
      "case_category": "financial",
      "priority": "critical",
      "estimated_impact": 6,
      "suggested_due_date": "2025-01-15"
    }
  ],
  "summary": {
    "total_generated": 14,
    "gaps_addressed": 12,
    "potential_impact": 31
  }
}
```

The N8N workflow should:
1. Fetch RED/AMBER assessment results for the given run
2. Join with criteria to get codes/names
3. Send to AI to generate remediation actions
4. Calculate impact estimates based on criterion weights
5. Return structured response

---

## Files to Delete After Migration

Once the new system is working:
- `src/components/actions/` (old folder if different structure)
- Any old action-related modals
- Old action generation logic

---

## Testing Checklist

- [ ] Empty state shows correctly with no actions
- [ ] "Generate with AI" opens sidebar
- [ ] Loading state shows progress steps
- [ ] Generated actions display in sidebar cards
- [ ] Quick chips trigger regeneration
- [ ] Custom refinement prompt works
- [ ] Individual approve/reject per action works
- [ ] "Approve All" saves all actions
- [ ] Table displays with all columns
- [ ] Five Case tabs filter correctly
- [ ] Filters work (status, priority, owner, due date)
- [ ] Clicking action opens detail modal
- [ ] Modal shows linked criterion
- [ ] Comments can be added with @mentions
- [ ] Activity feed shows history
- [ ] Status/priority can be changed
- [ ] Overdue actions show red styling
- [ ] Blocked actions show purple styling
- [ ] Completed actions show strikethrough
- [ ] Stats bar updates correctly
- [ ] Pagination works
