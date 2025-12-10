// Action Types for Actions Register V3

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
  assigned_to: number | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;

  // New fields for V3
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
    id: number;
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

export interface ActionFilters {
  status?: ActionStatus | 'all';
  priority?: ActionPriority | 'all';
  caseCategory?: CaseCategory | 'all';
  search?: string;
  assignedTo?: number;
}

// Activity Feed types for detail modal
export type ActivityType = 'comment' | 'status_change' | 'assignment' | 'created' | 'due_date_change';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  user_id: number;
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
    source?: ActionSource;
    assessment_version?: number;
  };
}
