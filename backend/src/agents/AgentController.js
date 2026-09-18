const AIAuditLog = require('../models/AIAuditLog');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const Activity = require('../models/Activity');
const idService = require('../services/idService');
const { emitRoleAware } = require('../socket');
const geminiProvider = require('../services/ai/GeminiProvider');
const promptBuilder = require('../services/ai/PromptBuilder');
const aiContextBuilder = require('../services/ai/AIContextBuilder');
const salesAgent = require('./SalesAgent');

class AgentController {
  /**
   * Helper to log audit records
   */
  async _logAudit({ userCtx, requestType, relatedCustomerId, relatedLeadId, promptPreview, toolsUsed, actionProposed, status, errorMessage, durationMs }) {
    try {
      await AIAuditLog.create({
        userId: userCtx.id || userCtx.userId,
        userRole: userCtx.role,
        salesMemberId: userCtx.salesMemberId,
        userName: userCtx.name,
        requestType,
        relatedCustomerId: relatedCustomerId || null,
        relatedLeadId: relatedLeadId || null,
        promptPreview: promptPreview ? promptPreview.slice(0, 200) : '',
        toolsUsed: toolsUsed || [],
        actionProposed: actionProposed || null,
        status: status || 'success',
        errorMessage: errorMessage || null,
        durationMs: durationMs || 0,
        model: geminiProvider.getModelName(),
      });
    } catch (auditErr) {
      console.warn('[AgentController] Failed to record AI audit log:', auditErr.message);
    }
  }

  /**
   * 1. Customer Summary: POST /api/ai/customer-summary
   */
  async handleCustomerSummary(customerId, userCtx) {
    const startTime = Date.now();
    try {
      const fullContext = await aiContextBuilder.buildCustomerContext(customerId, userCtx);

      const systemInstruction = promptBuilder.buildSystemInstruction(userCtx);
      const prompt = promptBuilder.buildCustomerSummaryPrompt(fullContext);

      const summaryData = await geminiProvider.generateContent({
        systemInstruction,
        prompt,
        jsonMode: true,
      });

      await this._logAudit({
        userCtx,
        requestType: 'customer_summary',
        relatedCustomerId: fullContext.customer.customerId,
        toolsUsed: ['buildCustomerContext', 'getCustomerPayments', 'getRecentActivities', 'getOpenFollowUps'],
        status: 'success',
        durationMs: Date.now() - startTime,
      });

      return {
        success: true,
        type: 'customer_summary',
        customerId: fullContext.customer.customerId,
        summary: summaryData,
      };
    } catch (err) {
      await this._logAudit({
        userCtx,
        requestType: 'customer_summary',
        relatedCustomerId: customerId,
        status: err.statusCode === 403 ? 'rejected_unauthorized' : 'failed',
        errorMessage: err.message,
        durationMs: Date.now() - startTime,
      });
      throw err;
    }
  }

  /**
   * 2. Follow-Up Recommendation: POST /api/ai/follow-up-recommendation
   */
  async handleFollowUpRecommendation(customerId, userCtx) {
    const startTime = Date.now();
    try {
      const fullContext = await aiContextBuilder.buildCustomerContext(customerId, userCtx);
      const flags = aiContextBuilder.evaluateCustomerFollowUpFlags(
        fullContext.customer,
        fullContext.pendingFollowUps,
        fullContext.payments,
        fullContext.recentActivities
      );

      const systemInstruction = promptBuilder.buildSystemInstruction(userCtx);
      const prompt = promptBuilder.buildFollowUpRecommendationPrompt(fullContext, flags);

      const recommendation = await geminiProvider.generateContent({
        systemInstruction,
        prompt,
        jsonMode: true,
      });

      await this._logAudit({
        userCtx,
        requestType: 'followup_recommendation',
        relatedCustomerId: fullContext.customer.customerId,
        toolsUsed: ['buildCustomerContext', 'evaluateCustomerFollowUpFlags'],
        status: 'success',
        durationMs: Date.now() - startTime,
      });

      return {
        success: true,
        type: 'followup_recommendation',
        customerId: fullContext.customer.customerId,
        flags,
        recommendation,
      };
    } catch (err) {
      await this._logAudit({
        userCtx,
        requestType: 'followup_recommendation',
        relatedCustomerId: customerId,
        status: err.statusCode === 403 ? 'rejected_unauthorized' : 'failed',
        errorMessage: err.message,
        durationMs: Date.now() - startTime,
      });
      throw err;
    }
  }

  /**
   * 3. Draft Follow-Up Message: POST /api/ai/follow-up-message
   */
  async handleFollowUpMessage(customerId, purpose, userCtx) {
    const startTime = Date.now();
    try {
      const validPurposes = [
        'payment_reminder',
        'service_followup',
        'onboarding_followup',
        'renewal',
        'general_checkin',
        'meeting_followup',
      ];
      const cleanPurpose = validPurposes.includes(purpose) ? purpose : 'general_checkin';

      const fullContext = await aiContextBuilder.buildCustomerContext(customerId, userCtx);

      const systemInstruction = promptBuilder.buildSystemInstruction(userCtx);
      const prompt = promptBuilder.buildFollowUpMessagePrompt(fullContext, cleanPurpose);

      const draft = await geminiProvider.generateContent({
        systemInstruction,
        prompt,
        jsonMode: true,
      });

      await this._logAudit({
        userCtx,
        requestType: 'followup_message',
        relatedCustomerId: fullContext.customer.customerId,
        toolsUsed: ['buildCustomerContext'],
        status: 'success',
        durationMs: Date.now() - startTime,
      });

      return {
        success: true,
        type: 'draft_message',
        customerId: fullContext.customer.customerId,
        purpose: cleanPurpose,
        draft,
      };
    } catch (err) {
      await this._logAudit({
        userCtx,
        requestType: 'followup_message',
        relatedCustomerId: customerId,
        status: err.statusCode === 403 ? 'rejected_unauthorized' : 'failed',
        errorMessage: err.message,
        durationMs: Date.now() - startTime,
      });
      throw err;
    }
  }

  /**
   * 4. Lead Analysis: POST /api/ai/lead-analysis
   */
  async handleLeadAnalysis(leadId, userCtx) {
    const startTime = Date.now();
    try {
      const leadContext = await aiContextBuilder.buildLeadContext(leadId, userCtx);

      const systemInstruction = promptBuilder.buildSystemInstruction(userCtx);
      const prompt = promptBuilder.buildLeadAnalysisPrompt(leadContext);

      const analysis = await geminiProvider.generateContent({
        systemInstruction,
        prompt,
        jsonMode: true,
      });

      await this._logAudit({
        userCtx,
        requestType: 'lead_analysis',
        relatedLeadId: leadContext.lead.leadId,
        toolsUsed: ['buildLeadContext'],
        status: 'success',
        durationMs: Date.now() - startTime,
      });

      return {
        success: true,
        type: 'lead_analysis',
        leadId: leadContext.lead.leadId,
        analysis,
      };
    } catch (err) {
      await this._logAudit({
        userCtx,
        requestType: 'lead_analysis',
        relatedLeadId: leadId,
        status: err.statusCode === 403 ? 'rejected_unauthorized' : 'failed',
        errorMessage: err.message,
        durationMs: Date.now() - startTime,
      });
      throw err;
    }
  }

  /**
   * 5. Meeting Notes Extraction: POST /api/ai/meeting-notes
   */
  async handleMeetingNotes(rawNotes, userCtx) {
    const startTime = Date.now();
    if (!rawNotes || !rawNotes.trim()) {
      throw new Error('Raw meeting or call notes text is required.');
    }

    try {
      const systemInstruction = promptBuilder.buildSystemInstruction(userCtx);
      const prompt = promptBuilder.buildMeetingNotesPrompt(rawNotes.trim());

      const structured = await geminiProvider.generateContent({
        systemInstruction,
        prompt,
        jsonMode: true,
      });

      await this._logAudit({
        userCtx,
        requestType: 'meeting_notes',
        promptPreview: rawNotes.slice(0, 150),
        status: 'success',
        durationMs: Date.now() - startTime,
      });

      return {
        success: true,
        type: 'meeting_notes',
        rawLength: rawNotes.length,
        structured,
        requiresConfirmation: false, // User must explicitly review before choosing to save
      };
    } catch (err) {
      await this._logAudit({
        userCtx,
        requestType: 'meeting_notes',
        status: 'failed',
        errorMessage: err.message,
        durationMs: Date.now() - startTime,
      });
      throw err;
    }
  }

  /**
   * 6. Conversational Agent: POST /api/ai/agent
   */
  async handleAgentChat({ message, context }, userCtx) {
    const startTime = Date.now();
    try {
      const result = await salesAgent.processUserRequest({ message, context, userCtx });

      await this._logAudit({
        userCtx,
        requestType: 'agent_chat',
        relatedCustomerId: context?.customerId || null,
        relatedLeadId: context?.leadId || null,
        promptPreview: message.slice(0, 150),
        toolsUsed: result.toolsUsed,
        actionProposed: result.proposedAction,
        status: 'success',
        durationMs: Date.now() - startTime,
      });

      return {
        success: true,
        ...result,
      };
    } catch (err) {
      await this._logAudit({
        userCtx,
        requestType: 'agent_chat',
        promptPreview: message ? message.slice(0, 150) : '',
        status: err.statusCode === 403 ? 'rejected_unauthorized' : 'failed',
        errorMessage: err.message,
        durationMs: Date.now() - startTime,
      });
      throw err;
    }
  }

  /**
   * 7. Confirm Proposed Action: POST /api/ai/confirm-action
   * Explicit user authorization to execute a previously proposed write action.
   */
  async handleConfirmAction({ action, proposedData }, userCtx) {
    const startTime = Date.now();
    if (!action || !proposedData) {
      throw new Error('Action type and proposedData are required for execution confirmation.');
    }

    try {
      // Validate customer ownership if customerId is specified
      if (proposedData.customerId) {
        const cleanCustId = String(proposedData.customerId).trim();
        const custQuery = cleanCustId.startsWith('CUS-') ? { customerId: cleanCustId } : { _id: cleanCustId };
        const customer = await Customer.findOne(custQuery);
        if (customer && userCtx.role === 'sales' && customer.salesMemberId !== userCtx.salesMemberId) {
          const err = new Error(`Forbidden: You do not have permission to execute write actions on customer account '${customer.customerId}'.`);
          err.statusCode = 403;
          throw err;
        }
      }

      // Validate lead ownership if leadId is specified
      if (proposedData.leadId) {
        const cleanLeadId = String(proposedData.leadId).trim();
        const leadQuery = cleanLeadId.startsWith('LEAD-') ? { leadId: cleanLeadId } : { _id: cleanLeadId };
        const lead = await Lead.findOne(leadQuery);
        if (lead && userCtx.role === 'sales' && lead.salesMemberId !== userCtx.salesMemberId) {
          const err = new Error(`Forbidden: You do not have permission to execute write actions on lead '${lead.leadId}'.`);
          err.statusCode = 403;
          throw err;
        }
      }

      if (action === 'createFollowUp') {
        const followUpId = await idService.getNextFollowUpId();
        const salesMemberId = userCtx.role === 'sales' ? userCtx.salesMemberId : (proposedData.salesMemberId || 'SM-001');

        const followUp = await FollowUp.create({
          followUpId,
          customerId: proposedData.customerId || null,
          leadId: proposedData.leadId || null,
          entityType: proposedData.entityType || 'Customer',
          entityName: proposedData.entityName,
          company: proposedData.company || '',
          salesMemberId,
          title: proposedData.title,
          type: proposedData.type || 'Call',
          priority: proposedData.priority || 'Medium',
          date: proposedData.date,
          time: proposedData.time || '11:00 AM',
          note: proposedData.note || 'Created via confirmed AI proposal',
          status: 'Pending',
        });

        const followUpObj = {
          ...followUp.toObject(),
          id: followUp._id.toString(),
        };

        // Real-time broadcast
        emitRoleAware('followup:created', followUpObj, salesMemberId);

        await this._logAudit({
          userCtx,
          requestType: 'confirm_action',
          actionProposed: { action, followUpId },
          status: 'success',
          durationMs: Date.now() - startTime,
        });

        return {
          success: true,
          message: `Follow-up ${followUpId} scheduled successfully upon user confirmation.`,
          entity: followUpObj,
        };
      }

      if (action === 'createActivity') {
        const salesMemberId = userCtx.role === 'sales' ? userCtx.salesMemberId : (proposedData.salesMemberId || 'SM-001');

        const activity = await Activity.create({
          customerId: proposedData.customerId || null,
          leadId: proposedData.leadId || null,
          salesMemberId,
          salesMemberName: userCtx.name || proposedData.salesMemberName || 'Team Member',
          entityName: proposedData.entityName || '',
          title: proposedData.title || 'Note added by AI Assistant',
          type: proposedData.type || 'Note',
          description: proposedData.description || '',
          createdBy: userCtx.id || userCtx.userId,
        });

        const activityObj = {
          ...activity.toObject(),
          id: activity._id.toString(),
        };

        emitRoleAware('activity:created', activityObj, salesMemberId);

        await this._logAudit({
          userCtx,
          requestType: 'confirm_action',
          actionProposed: { action, activityId: activityObj.id },
          status: 'success',
          durationMs: Date.now() - startTime,
        });

        return {
          success: true,
          message: 'Activity recorded successfully upon user confirmation.',
          entity: activityObj,
        };
      }

      throw new Error(`Unsupported confirmable action: '${action}'.`);
    } catch (err) {
      await this._logAudit({
        userCtx,
        requestType: 'confirm_action',
        status: 'failed',
        errorMessage: err.message,
        durationMs: Date.now() - startTime,
      });
      throw err;
    }
  }
}

const agentController = new AgentController();
module.exports = agentController;
