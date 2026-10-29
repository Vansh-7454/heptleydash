const agentController = require('../agents/AgentController');
const geminiProvider = require('../services/ai/GeminiProvider');

const aiController = {
  // GET /api/ai/status
  getStatus: async (req, res) => {
    const isConfigured = geminiProvider.isConfigured();
    res.status(200).json({
      success: true,
      ready: isConfigured,
      model: geminiProvider.getModelName(),
      message: isConfigured
        ? 'AI Sales Agent is online and connected to Gemini.'
        : 'GEMINI_API_KEY is not configured in backend/.env. AI endpoints will report unavailable.',
    });
  },

  // POST /api/ai/customer-summary
  getCustomerSummary: async (req, res, next) => {
    try {
      const { customerId } = req.body;
      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: 'customerId is required in request body.',
        });
      }

      const result = await agentController.handleCustomerSummary(customerId, req.user);
      res.status(200).json(result);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  // POST /api/ai/follow-up-recommendation
  getFollowUpRecommendation: async (req, res, next) => {
    try {
      const { customerId } = req.body;
      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: 'customerId is required in request body.',
        });
      }

      const result = await agentController.handleFollowUpRecommendation(customerId, req.user);
      res.status(200).json(result);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  // POST /api/ai/follow-up-message
  getFollowUpMessage: async (req, res, next) => {
    try {
      const { customerId, purpose } = req.body;
      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: 'customerId is required in request body.',
        });
      }

      const result = await agentController.handleFollowUpMessage(customerId, purpose, req.user);
      res.status(200).json(result);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  // POST /api/ai/lead-analysis
  getLeadAnalysis: async (req, res, next) => {
    try {
      const { leadId } = req.body;
      if (!leadId) {
        return res.status(400).json({
          success: false,
          message: 'leadId is required in request body.',
        });
      }

      const result = await agentController.handleLeadAnalysis(leadId, req.user);
      res.status(200).json(result);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  // POST /api/ai/meeting-notes
  processMeetingNotes: async (req, res, next) => {
    try {
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          message: 'text containing meeting/call notes is required.',
        });
      }

      const result = await agentController.handleMeetingNotes(text, req.user);
      res.status(200).json(result);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  // POST /api/ai/agent
  processAgentChat: async (req, res, next) => {
    try {
      const { message, context } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'message is required for AI agent interaction.',
        });
      }

      const result = await agentController.handleAgentChat({ message, context }, req.user);
      res.status(200).json(result);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  // POST /api/ai/confirm-action
  confirmAction: async (req, res, next) => {
    try {
      const { action, proposedData } = req.body;
      if (!action || !proposedData) {
        return res.status(400).json({
          success: false,
          message: 'action and proposedData are required to confirm execution.',
        });
      }

      const result = await agentController.handleConfirmAction({ action, proposedData }, req.user);
      res.status(200).json(result);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      next(err);
    }
  },
};

module.exports = aiController;
