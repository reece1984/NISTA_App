/**
 * Actions API Routes
 * Handles all CRUD operations for action items
 * Uses Supabase REST API (works with Vercel serverless)
 */

import express from 'express';
import { body, param, query } from 'express-validator';
import { supabase } from '../db/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validateRequest.js';

const router = express.Router();

/**
 * GET /api/projects/:projectId/actions
 * Get all actions for a project with optional filters
 */
router.get(
  '/projects/:projectId/actions',
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    query('status').optional().isIn(['not_started', 'in_progress', 'blocked', 'completed', 'cancelled']),
    query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    query('assigned_to').optional().isInt(),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { status, priority, assigned_to } = req.query;

    // Build query with filters
    let query = supabase
      .from('actions')
      .select(`
        *,
        assigned_user:users!assigned_to(id, name, email),
        criterion:assessment_criteria!criterion_id(id, criterion_code, title, category, dimension),
        action_comments(id),
        action_assessments(
          assessment_id
        )
      `)
      .eq('project_id', projectId);

    if (status) {
      query = query.eq('action_status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (assigned_to) {
      query = query.eq('assigned_to', assigned_to);
    }

    // Order by priority and due date
    query = query.order('priority', { ascending: false })
                 .order('due_date', { ascending: true, nullsFirst: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Format response
    const actions = data.map(action => ({
      ...action,
      assigned_to: action.assigned_user || null,
      criterion: action.criterion ? {
        id: action.criterion.id,
        criterion_code: action.criterion.criterion_code,  // Will become criterionCode after toCamelCase
        title: action.criterion.title,                     // Will stay title
        category: action.criterion.category                // Will stay category
      } : null,
      comment_count: action.action_comments?.length || 0,
      linked_findings: action.action_assessments?.map(aa => ({ assessment_id: aa.assessment_id })) || []
    }));

    // Remove temporary fields
    actions.forEach(action => {
      delete action.assigned_user;
      delete action.action_comments;
      delete action.action_assessments;
    });

    res.json({
      success: true,
      data: actions,
      count: actions.length
    });
  })
);

/**
 * GET /api/actions/:id
 * Get detailed action information including history and comments
 */
router.get(
  '/actions/:id',
  [
    param('id').isInt().withMessage('Action ID must be an integer'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Get basic action first
    const { data: action, error: actionError } = await supabase
      .from('actions')
      .select('*')
      .eq('id', id)
      .single();

    if (actionError) {
      if (actionError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Action not found'
        });
      }
      throw new Error(`Database error: ${actionError.message}`);
    }

    // Get related data separately
    const [assignedUser, createdByUser, updatedByUser, actionAssessments, actionHistory, actionComments] = await Promise.all([
      // Assigned user
      action.assigned_to ? supabase.from('users').select('id, name, email').eq('id', action.assigned_to).single() : Promise.resolve({ data: null }),
      // Created by user
      action.created_by ? supabase.from('users').select('id, name').eq('id', action.created_by).single() : Promise.resolve({ data: null }),
      // Updated by user
      action.updated_by ? supabase.from('users').select('id, name').eq('id', action.updated_by).single() : Promise.resolve({ data: null }),
      // Action assessments with assessment details
      supabase
        .from('action_assessments')
        .select(`
          assessment_id,
          assessments(
            id,
            rag_rating,
            finding,
            evidence,
            assessment_criteria(criterion_code)
          )
        `)
        .eq('action_id', id),
      // Action history
      supabase
        .from('action_history')
        .select('*')
        .eq('action_id', id)
        .order('changed_at', { ascending: false }),
      // Action comments
      supabase
        .from('action_comments')
        .select('*')
        .eq('action_id', id)
        .order('created_at', { ascending: true })
    ]);

    // Get user details for history and comments
    const historyUserIds = [...new Set((actionHistory.data || []).map(h => h.changed_by).filter(Boolean))];
    const commentUserIds = [...new Set((actionComments.data || []).map(c => c.user_id).filter(Boolean))];

    const historyUsers = historyUserIds.length > 0
      ? await supabase.from('users').select('id, name, email').in('id', historyUserIds)
      : { data: [] };

    const commentUsers = commentUserIds.length > 0
      ? await supabase.from('users').select('id, name, email').in('id', commentUserIds)
      : { data: [] };

    const historyUserMap = (historyUsers.data || []).reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
    const commentUserMap = (commentUsers.data || []).reduce((acc, u) => ({ ...acc, [u.id]: u }), {});

    // Format response
    const formattedAction = {
      id: action.id,
      project_id: action.project_id,
      source_assessment_run_id: action.source_assessment_run_id,
      title: action.title,
      description: action.description,
      action_status: action.action_status,
      priority: action.priority,
      due_date: action.due_date,
      completed_at: action.completed_at,
      created_at: action.created_at,
      updated_at: action.updated_at,
      created_by: createdByUser.data || null,
      updated_by: updatedByUser.data || null,
      assigned_to: assignedUser.data || null,
      linked_findings: (actionAssessments.data || []).map(aa => {
        const assessment = aa.assessments;
        if (!assessment) return null;
        return {
          id: assessment.id,
          criterion_code: assessment.assessment_criteria?.criterion_code,
          rag_rating: assessment.rag_rating,
          finding: assessment.finding,
          evidence: assessment.evidence
        };
      }).filter(Boolean),
      history: (actionHistory.data || []).map(h => ({
        id: h.id,
        field_changed: h.field_changed,
        old_value: h.old_value,
        new_value: h.new_value,
        changed_at: h.changed_at,
        changed_by: historyUserMap[h.changed_by] || null
      })),
      comments: (actionComments.data || []).map(c => ({
        id: c.id,
        comment_text: c.comment_text,
        parent_comment_id: c.parent_comment_id,
        created_at: c.created_at,
        user: commentUserMap[c.user_id] || null,
        mentions: [] // We'll skip mentions for now
      }))
    };

    res.json({
      success: true,
      data: formattedAction
    });
  })
);

/**
 * PATCH /api/actions/bulk
 * Bulk update multiple actions
 * IMPORTANT: This route must be defined BEFORE /actions/:id to prevent "bulk" being matched as an ID
 */
router.patch(
  '/actions/bulk',
  [
    body('action_ids').isArray({ min: 1 }).withMessage('action_ids must be a non-empty array'),
    body('action_ids.*').isInt(),
    body('updates').isObject().withMessage('updates must be an object'),
    body('updated_by').isInt().withMessage('updated_by is required'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { action_ids, updates, updated_by } = req.body;

    // Debug logging
    console.log('Bulk update request:', { action_ids, updates, updated_by });

    // Validate that at least one field is being updated
    const allowedFields = ['action_status', 'priority', 'assigned_to', 'due_date'];
    const fieldsToUpdate = Object.keys(updates).filter(key => allowedFields.includes(key));

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'No valid fields to update'
      });
    }

    // Build update object - include updated_by for trigger tracking
    const updateData = { ...updates, updated_by };

    const { data, error } = await supabase
      .from('actions')
      .update(updateData)
      .in('id', action_ids)
      .select('id');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    res.json({
      success: true,
      data: {
        updated_count: data.length,
        updated_ids: data.map(r => r.id)
      },
      message: `Successfully updated ${data.length} action(s)`
    });
  })
);

/**
 * PATCH /api/actions/:id
 * Update a single action
 * History is automatically logged by database trigger
 */
router.patch(
  '/actions/:id',
  [
    param('id').isInt().withMessage('Action ID must be an integer'),
    body('title').optional().isString().trim().isLength({ min: 1, max: 255 }),
    body('description').optional().isString(),
    body('action_status').optional().isIn(['not_started', 'in_progress', 'blocked', 'completed', 'cancelled']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assigned_to').optional().isInt(),
    body('due_date').optional().isISO8601(),
    body('completed_at').optional().isISO8601(),
    body('updated_by').isInt().withMessage('updated_by is required'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Filter only allowed fields
    const allowedFields = ['title', 'description', 'action_status', 'priority', 'assigned_to', 'due_date', 'completed_at', 'updated_by'];
    const filteredUpdates = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'No valid fields to update'
      });
    }

    const { data, error } = await supabase
      .from('actions')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Action not found'
        });
      }
      throw new Error(`Database error: ${error.message}`);
    }

    res.json({
      success: true,
      data,
      message: 'Action updated successfully'
    });
  })
);

/**
 * DELETE /api/actions/bulk
 * Bulk delete multiple actions
 * IMPORTANT: This route must be defined BEFORE /actions/:id to prevent "bulk" being matched as an ID
 */
router.delete(
  '/actions/bulk',
  [
    body('action_ids').isArray({ min: 1 }).withMessage('action_ids must be a non-empty array'),
    body('action_ids.*').isInt(),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { action_ids } = req.body;

    // Debug logging
    console.log('Bulk delete request:', { action_ids });

    const { data, error } = await supabase
      .from('actions')
      .delete()
      .in('id', action_ids)
      .select('id');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    res.json({
      success: true,
      data: {
        deleted_count: data.length,
        deleted_ids: data.map(r => r.id)
      },
      message: `Successfully deleted ${data.length} action(s)`
    });
  })
);

/**
 * GET /api/actions/:id/history
 * Get complete history for an action
 */
router.get(
  '/actions/:id/history',
  [
    param('id').isInt().withMessage('Action ID must be an integer'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('action_history')
      .select(`
        *,
        changed_by_user:users!changed_by(id, name, email)
      `)
      .eq('action_id', id)
      .order('changed_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const formattedHistory = data.map(h => ({
      id: h.id,
      action_id: h.action_id,
      field_changed: h.field_changed,
      old_value: h.old_value,
      new_value: h.new_value,
      changed_at: h.changed_at,
      changed_by: h.changed_by_user || null
    }));

    res.json({
      success: true,
      data: formattedHistory,
      count: formattedHistory.length
    });
  })
);

/**
 * POST /api/actions/confirm
 * Create actions from an action plan draft
 */
router.post(
  '/actions/confirm',
  [
    body('draft_id').isInt().withMessage('draft_id must be an integer'),
    body('user_id').isInt().withMessage('user_id must be an integer'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { draft_id, user_id } = req.body;

    // 1. Get the draft
    const { data: draft, error: draftError } = await supabase
      .from('action_plan_drafts')
      .select('*')
      .eq('id', draft_id)
      .single();

    if (draftError || !draft) {
      return res.status(404).json({
        success: false,
        error: 'Draft not found'
      });
    }

    // 2. Parse draft_data to get proposed actions
    let draftData = draft.draft_data;

    // Handle string JSON
    if (typeof draftData === 'string') {
      try {
        draftData = JSON.parse(draftData);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: 'Invalid draft data format'
        });
      }
    }

    // Extract actions array (handle both formats)
    let actions = draftData?.proposedActions || draftData;

    if (!Array.isArray(actions) || actions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No actions to create'
      });
    }

    // 3. Get project_id from assessment run
    const { data: assessmentRun, error: runError } = await supabase
      .from('assessment_runs')
      .select('project_id')
      .eq('id', draft.assessment_run_id)
      .single();

    if (runError || !assessmentRun) {
      return res.status(404).json({
        success: false,
        error: 'Assessment run not found'
      });
    }

    const projectId = assessmentRun.project_id;

    // 4. Create actions in database
    const createdActions = [];
    const errors = [];

    for (const action of actions) {
      // Handle both camelCase and snake_case
      const title = action.title;
      const description = action.description;
      const priority = action.priority || 'medium';
      const dueDate = action.suggestedDueDate || action.suggested_due_date || null;
      const assignedTo = action.assignedTo || action.assigned_to || null;
      const linkedAssessmentIds = action.linkedAssessmentIds || action.linked_assessment_ids || [];

      // Insert action
      const { data: createdAction, error: insertError } = await supabase
        .from('actions')
        .insert({
          project_id: projectId,
          source_assessment_run_id: draft.assessment_run_id,
          title,
          description,
          priority,
          due_date: dueDate,
          assigned_to: assignedTo,
          action_status: 'not_started',
          created_by: user_id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating action:', insertError);
        errors.push({ title, error: insertError.message });
        continue;
      }

      createdActions.push(createdAction);

      // 5. Link to assessment findings
      if (linkedAssessmentIds && linkedAssessmentIds.length > 0) {
        const assessmentLinks = linkedAssessmentIds.map(assessmentId => ({
          action_id: createdAction.id,
          assessment_id: assessmentId,
          created_at: new Date().toISOString()
        }));

        const { error: linkError } = await supabase
          .from('action_assessments')
          .insert(assessmentLinks);

        if (linkError) {
          console.error('Error linking assessments:', linkError);
        }
      }
    }

    // 6. Update draft status to 'confirmed'
    await supabase
      .from('action_plan_drafts')
      .update({
        draft_status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', draft_id);

    res.json({
      success: true,
      data: {
        created_action_count: createdActions.length,
        action_ids: createdActions.map(a => a.id),
        errors: errors.length > 0 ? errors : undefined
      }
    });
  })
);

export default router;
