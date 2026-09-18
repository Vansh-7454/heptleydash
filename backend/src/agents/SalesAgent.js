const geminiProvider = require('../services/ai/GeminiProvider');
const promptBuilder = require('../services/ai/PromptBuilder');
const aiContextBuilder = require('../services/ai/AIContextBuilder');
const toolRegistry = require('../services/ai/ToolRegistry');

class SalesAgent {
  /**
   * Main conversational and analytical entrypoint
   */
  async processUserRequest({ message, context = {}, userCtx }) {
    if (!message || !message.trim()) {
      throw new Error('Message content is required for AI processing.');
    }

    const cleanMsg = message.trim();
    let crmContext = {};
    const toolResults = [];

    const lowerMsg = cleanMsg.toLowerCase();

    // 1. Detect explicit or implicit entity IDs in message / context
    let targetCustomerId = null;
    let targetLeadId = null;

    // Check if the user is asking for a generic template, cold outreach, or a new/unregistered customer
    const isGeneralOrNewProspectDraft =
      lowerMsg.includes('new customer') ||
      lowerMsg.includes('new client') ||
      lowerMsg.includes('naya customer') ||
      lowerMsg.includes('naye customer') ||
      lowerMsg.includes('kisi naye') ||
      lowerMsg.includes('unregistered') ||
      lowerMsg.includes('template') ||
      lowerMsg.includes('generic') ||
      lowerMsg.includes('general') ||
      lowerMsg.includes('cold') ||
      lowerMsg.includes('outreach') ||
      lowerMsg.includes('pitch') ||
      lowerMsg.includes('prospective');

    const custMatch = cleanMsg.match(/CUS-\d{4}/i);
    if (custMatch) {
      targetCustomerId = custMatch[0].toUpperCase();
    } else if (context.customerId && String(context.customerId).trim() && !isGeneralOrNewProspectDraft) {
      targetCustomerId = String(context.customerId).trim();
    }

    const leadMatch = cleanMsg.match(/LEAD-\d{4}/i);
    if (leadMatch) {
      targetLeadId = leadMatch[0].toUpperCase();
    } else if (context.leadId && String(context.leadId).trim()) {
      targetLeadId = String(context.leadId).trim();
    }

    // 2. If no explicit customer ID, check if user is asking about customers/clients/invoices/emails
    const customerIntent =
      lowerMsg.includes('customer') ||
      lowerMsg.includes('client') ||
      lowerMsg.includes('contract') ||
      lowerMsg.includes('email') ||
      lowerMsg.includes('invoice');

    if (!targetCustomerId && customerIntent && !isGeneralOrNewProspectDraft) {
      const custSearch = await toolRegistry.executeTool('searchCustomers', {}, userCtx);
      crmContext.customerList = custSearch.customers || [];
      toolResults.push({ tool: 'searchCustomers', count: custSearch.count, status: 'success' });

      // Check if user specifically mentioned an existing customer name or company
      const mentionedCustomer = custSearch.customers?.find((c) =>
        lowerMsg.includes(c.name.toLowerCase()) || lowerMsg.includes(c.company.toLowerCase())
      );

      if (mentionedCustomer) {
        targetCustomerId = mentionedCustomer.customerId;
      } else if (lowerMsg.includes('summarize') || lowerMsg.includes('contract status')) {
        if (custSearch.customers && custSearch.customers.length > 0) {
          targetCustomerId = custSearch.customers[0].customerId;
        }
      }
    }

    // 3. Fetch authorized Customer Context if targeted
    if (targetCustomerId) {
      try {
        const fullContext = await aiContextBuilder.buildCustomerContext(targetCustomerId, userCtx);
        crmContext.referencedCustomer = fullContext.customer;
        crmContext.recentPayments = fullContext.payments;
        crmContext.recentActivities = fullContext.recentActivities;
        crmContext.pendingFollowUps = fullContext.pendingFollowUps;
        toolResults.push({ tool: 'buildCustomerContext', customerId: targetCustomerId, status: 'success' });
      } catch (err) {
        if (err.statusCode === 403 || err.message.includes('Access Denied')) {
          const deniedError = new Error(`Access Denied: You do not have permission to view customer '${targetCustomerId}'.`);
          deniedError.statusCode = 403;
          throw deniedError;
        }
        toolResults.push({ tool: 'buildCustomerContext', customerId: targetCustomerId, status: 'not_found' });
      }
    }

    // 4. If no explicit lead ID, check if user is asking about leads/pipeline
    const leadIntent =
      !isGeneralOrNewProspectDraft &&
      (lowerMsg.includes('lead') || lowerMsg.includes('pipeline') || (lowerMsg.includes('prospect') && !lowerMsg.includes('prospective')));

    if (!targetLeadId && leadIntent) {
      const leadSearch = await toolRegistry.executeTool('searchLeads', {}, userCtx);
      crmContext.leadList = leadSearch.leads || [];
      toolResults.push({ tool: 'searchLeads', count: leadSearch.count, status: 'success' });

      if (lowerMsg.includes('summarize') && leadSearch.leads && leadSearch.leads.length > 0) {
        targetLeadId = leadSearch.leads[0].leadId;
      }
    }

    // 5. Fetch authorized Lead Context if targeted
    if (targetLeadId && !crmContext.referencedCustomer) {
      try {
        const leadContext = await aiContextBuilder.buildLeadContext(targetLeadId, userCtx);
        crmContext.referencedLead = leadContext.lead;
        crmContext.recentActivities = leadContext.recentActivities;
        crmContext.recentFollowUps = leadContext.recentFollowUps;
        toolResults.push({ tool: 'buildLeadContext', leadId: targetLeadId, status: 'success' });
      } catch (err) {
        if (err.statusCode === 403 || err.message.includes('Access Denied')) {
          const deniedError = new Error(`Access Denied: You do not have permission to view lead '${targetLeadId}'.`);
          deniedError.statusCode = 403;
          throw deniedError;
        }
        toolResults.push({ tool: 'buildLeadContext', leadId: targetLeadId, status: 'not_found' });
      }
    }

    // 6. Detect intent for follow-ups, overdue, or pending tasks
    const isFollowUpQuery =
      !isGeneralOrNewProspectDraft &&
      (lowerMsg.includes('overdue') ||
        lowerMsg.includes('pending') ||
        (lowerMsg.includes('follow-up') && !lowerMsg.includes('draft') && !lowerMsg.includes('message')) ||
        (lowerMsg.includes('followup') && !lowerMsg.includes('draft') && !lowerMsg.includes('message')) ||
        lowerMsg.includes('priorit') ||
        lowerMsg.includes('task') ||
        lowerMsg.includes('today'));

    if (isFollowUpQuery) {
      const overdueRes = await toolRegistry.executeTool('getOverdueFollowUps', {}, userCtx);
      crmContext.overdueFollowUps = overdueRes.followUps;
      toolResults.push({ tool: 'getOverdueFollowUps', count: overdueRes.count, status: 'success' });

      if (crmContext.referencedCustomer) {
        const openRes = await toolRegistry.executeTool(
          'getOpenFollowUps',
          { customerId: crmContext.referencedCustomer.customerId },
          userCtx
        );
        crmContext.openFollowUps = openRes.followUps;
      }
    }

    // 7. Detect write proposals (e.g. "Create a follow-up", "Schedule a call", "Schedule follow-up task")
    const isWriteIntent =
      /create (a )?(follow-?up|meeting|call|task)/i.test(cleanMsg) ||
      /schedule (a )?(follow-?up|meeting|call|task)/i.test(cleanMsg) ||
      /remind me to/i.test(cleanMsg);

    let writeProposal = null;
    if (isWriteIntent) {
      const finalCustomerId =
        targetCustomerId ||
        crmContext.referencedCustomer?.customerId ||
        (crmContext.customerList && crmContext.customerList[0]?.customerId) ||
        null;
      const finalLeadId = !finalCustomerId
        ? targetLeadId ||
          crmContext.referencedLead?.leadId ||
          (crmContext.leadList && crmContext.leadList[0]?.leadId) ||
          null
        : null;

      const typeMatch = cleanMsg.match(/call|meeting|email|whatsapp/i);
      const chosenType = typeMatch
        ? typeMatch[0].charAt(0).toUpperCase() + typeMatch[0].slice(1).toLowerCase()
        : 'Call';

      const proposal = await toolRegistry.executeTool(
        'proposeFollowUp',
        {
          title: `Follow-up regarding ${cleanMsg.slice(0, 40)}`,
          customerId: finalCustomerId,
          leadId: finalLeadId,
          type: chosenType,
          note: `Proposed by AI Assistant based on user request: "${cleanMsg}"`,
        },
        userCtx
      );

      writeProposal = proposal;
      toolResults.push({ tool: 'proposeFollowUp', proposal: writeProposal.summary, status: 'proposed' });
    }

    // 5. Generate prompt and call Gemini
    const systemInstruction = promptBuilder.buildSystemInstruction(userCtx);
    const agentPrompt = promptBuilder.buildAgentPrompt({
      message: cleanMsg,
      crmContext,
      toolResults,
    });

    const aiResponse = await geminiProvider.generateContent({
      systemInstruction,
      prompt: agentPrompt,
      temperature: 0.2,
      jsonMode: true,
    });

    // 6. Ensure writeProposal is attached if generated
    if (writeProposal) {
      aiResponse.requiresConfirmation = true;
      aiResponse.type = 'action_confirmation';
      aiResponse.proposedAction = writeProposal;
    }

    let finalMessage = aiResponse.message || 'Response generated from CRM context.';
    const draftContent =
      aiResponse.data?.body ||
      aiResponse.data?.content ||
      aiResponse.data?.message ||
      (aiResponse.type === 'draft_message' ? aiResponse.message : null);

    // Normalize aiResponse.data.body so the UI preview card and copy button work seamlessly
    if (aiResponse.type === 'draft_message' || draftContent) {
      if (!aiResponse.data || typeof aiResponse.data !== 'object') {
        aiResponse.data = {};
      }
      if (!aiResponse.data.body && draftContent && typeof draftContent === 'string') {
        aiResponse.data.body = draftContent;
      }
      if (!aiResponse.type || aiResponse.type === 'answer') {
        aiResponse.type = 'draft_message';
      }
    }

    if (draftContent && typeof draftContent === 'string' && !finalMessage.includes(draftContent)) {
      finalMessage = `${finalMessage}\n\n${draftContent}`;
    }

    const defaultSuggestions = isGeneralOrNewProspectDraft
      ? ['Draft a follow-up WhatsApp message', 'Draft an email proposal', 'Show my active pipeline']
      : ['Summarize Customer', 'Find Overdue Follow-ups', 'Review Meeting Notes'];

    return {
      message: finalMessage,
      type: aiResponse.type || 'answer',
      data: aiResponse.data || crmContext,
      suggestedActions:
        aiResponse.suggestedActions && aiResponse.suggestedActions.length > 0
          ? aiResponse.suggestedActions
          : defaultSuggestions,
      requiresConfirmation: Boolean(aiResponse.requiresConfirmation),
      proposedAction: aiResponse.proposedAction || null,
      toolsUsed: toolResults.map((t) => t.tool),
    };
  }
}

const salesAgent = new SalesAgent();
module.exports = salesAgent;
