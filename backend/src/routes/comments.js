/**
 * Comments API Routes
 * Handles comments and mentions on actions
 * Uses Supabase REST API (works with Vercel serverless)
 */

import express from 'express';
import { body, param } from 'express-validator';
import { supabase } from '../db/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validateRequest.js';

const router = express.Router();

/**
 * GET /api/actions/:actionId/comments
 * Get all comments for an action (with threading support)
 */
router.get(
  '/actions/:actionId/comments',
  [
    param('actionId').isInt().withMessage('Action ID must be an integer'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { actionId } = req.params;

    const { data: comments, error } = await supabase
      .from('action_comments')
      .select(`
        *,
        user:users(id, name, email),
        comment_mentions(
          mentioned_user:users!mentioned_user_id(id, name, email)
        )
      `)
      .eq('action_id', actionId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Format comments with hierarchical structure
    const formattedComments = comments.map(c => ({
      id: c.id,
      action_id: c.action_id,
      comment_text: c.comment_text,
      parent_comment_id: c.parent_comment_id,
      created_at: c.created_at,
      updated_at: c.updated_at,
      user: c.user,
      mentions: c.comment_mentions?.map(m => m.mentioned_user).filter(Boolean) || [],
      replies: []
    }));

    // Build hierarchical structure
    const commentMap = new Map();
    const topLevelComments = [];

    formattedComments.forEach(comment => {
      commentMap.set(comment.id, comment);
    });

    formattedComments.forEach(comment => {
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        topLevelComments.push(comment);
      }
    });

    res.json({
      success: true,
      data: topLevelComments,
      count: comments.length
    });
  })
);

/**
 * POST /api/actions/:actionId/comments
 * Add a new comment to an action
 */
router.post(
  '/actions/:actionId/comments',
  [
    param('actionId').isInt().withMessage('Action ID must be an integer'),
    body('user_id').isInt().withMessage('user_id is required'),
    body('comment_text').isString().trim().isLength({ min: 1 }).withMessage('comment_text is required'),
    body('parent_comment_id').optional().isInt(),
    body('mentions').optional().isArray(),
    body('mentions.*').optional().isInt(),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { actionId } = req.params;
    const { user_id, comment_text, parent_comment_id, mentions } = req.body;

    // Verify action exists
    const { data: actionExists } = await supabase
      .from('actions')
      .select('id')
      .eq('id', actionId)
      .single();

    if (!actionExists) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Action not found'
      });
    }

    // Verify parent comment exists if provided
    if (parent_comment_id) {
      const { data: parentExists } = await supabase
        .from('action_comments')
        .select('id')
        .eq('id', parent_comment_id)
        .eq('action_id', actionId)
        .single();

      if (!parentExists) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Parent comment not found'
        });
      }
    }

    // Insert comment
    const { data: comment, error: commentError } = await supabase
      .from('action_comments')
      .insert({
        action_id: actionId,
        user_id,
        comment_text,
        parent_comment_id: parent_comment_id || null
      })
      .select()
      .single();

    if (commentError) {
      throw new Error(`Database error: ${commentError.message}`);
    }

    // Insert mentions if provided
    if (mentions && mentions.length > 0) {
      const mentionRecords = mentions.map(mentionedUserId => ({
        comment_id: comment.id,
        mentioned_user_id: mentionedUserId
      }));

      const { error: mentionsError } = await supabase
        .from('comment_mentions')
        .insert(mentionRecords);

      if (mentionsError) {
        // Non-critical error, log but continue
        console.error('Error inserting mentions:', mentionsError.message);
      }
    }

    // Get user info
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', user_id)
      .single();

    // Get mentions info
    let mentionsInfo = [];
    if (mentions && mentions.length > 0) {
      const { data: mentionedUsers } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', mentions);

      mentionsInfo = mentionedUsers || [];
    }

    res.status(201).json({
      success: true,
      data: {
        id: comment.id,
        action_id: comment.action_id,
        comment_text: comment.comment_text,
        parent_comment_id: comment.parent_comment_id,
        created_at: comment.created_at,
        user: user,
        mentions: mentionsInfo.map(m => ({
          user_id: m.id,
          user_name: m.name,
          user_email: m.email
        })),
        replies: []
      },
      message: 'Comment added successfully'
    });
  })
);

/**
 * PATCH /api/comments/:id
 * Update a comment (edit comment text)
 */
router.patch(
  '/comments/:id',
  [
    param('id').isInt().withMessage('Comment ID must be an integer'),
    body('comment_text').isString().trim().isLength({ min: 1 }).withMessage('comment_text is required'),
    body('user_id').isInt().withMessage('user_id is required for authorization'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { comment_text, user_id } = req.body;

    // Update comment (only if user owns it)
    const { data, error } = await supabase
      .from('action_comments')
      .update({
        comment_text,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Comment not found or you do not have permission to edit it'
      });
    }

    res.json({
      success: true,
      data,
      message: 'Comment updated successfully'
    });
  })
);

/**
 * DELETE /api/comments/:id
 * Delete a comment
 */
router.delete(
  '/comments/:id',
  [
    param('id').isInt().withMessage('Comment ID must be an integer'),
    body('user_id').isInt().withMessage('user_id is required for authorization'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;

    // Delete comment (only if user owns it)
    const { data, error } = await supabase
      .from('action_comments')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id)
      .select('id');

    if (error || !data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Comment not found or you do not have permission to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  })
);

export default router;
