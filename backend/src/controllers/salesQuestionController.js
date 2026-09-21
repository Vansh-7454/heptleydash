const mongoose = require('mongoose');
const SalesQuestion = require('../models/SalesQuestion');
const Customer = require('../models/Customer');
const Website = require('../models/Website');
const User = require('../models/User');
const Notification = require('../models/Notification');
const idService = require('../services/idService');
const { getIO, emitNotification } = require('../socket');

const enrichQuestion = async (q) => {
  const [customer, website, askingUser] = await Promise.all([
    q.customerId ? Customer.findOne({ customerId: q.customerId }).select('name company') : null,
    q.websiteId ? Website.findOne({ websiteId: q.websiteId }).select('websiteName websiteUrl') : null,
    User.findOne({ salesMemberId: q.askedBySalesMemberId }).select('name email'),
  ]);

  return {
    id: q._id.toString(),
    questionId: q.questionId,
    subject: q.subject || '',
    question: q.question,
    customerId: q.customerId,
    customerName: customer ? `${customer.name} (${customer.company})` : '',
    websiteId: q.websiteId,
    websiteName: website ? website.websiteName : '',
    websiteUrl: website ? website.websiteUrl : '',
    askedBySalesMemberId: q.askedBySalesMemberId,
    askedByName: askingUser ? askingUser.name : q.askedBySalesMemberId,
    priority: q.priority,
    status: q.status,
    answer: q.answer || '',
    answeredBy: q.answeredBy || '',
    answeredByName: q.answeredBy || 'Developer',
    answeredAt: q.answeredAt,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  };
};

const salesQuestionController = {
  // GET /api/sales-questions
  getAll: async (req, res, next) => {
    try {
      const { status, priority, websiteId, customerId } = req.query;
      const query = {};

      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (websiteId) query.websiteId = websiteId;
      if (customerId) query.customerId = customerId;

      // Role isolation: Sales sees their own questions; Developers and Admin see organization-wide
      if (req.user.role === 'sales') {
        query.askedBySalesMemberId = req.user.salesMemberId;
      }

      const questions = await SalesQuestion.find(query).sort({ createdAt: -1 });
      const enriched = await Promise.all(questions.map((q) => enrichQuestion(q)));

      res.status(200).json({
        success: true,
        count: enriched.length,
        questions: enriched,
        salesQuestions: enriched,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/sales-questions/:id
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = id.startsWith('Q-') ? { questionId: id } : { _id: id };
      const q = await SalesQuestion.findOne(query);

      if (!q) {
        return res.status(404).json({
          success: false,
          message: `Sales Question '${id}' not found.`,
        });
      }

      // Sales user can only view their own
      if (req.user.role === 'sales' && q.askedBySalesMemberId !== req.user.salesMemberId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view questions asked by your account.',
        });
      }

      const enriched = await enrichQuestion(q);

      res.status(200).json({
        success: true,
        question: enriched,
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/sales-questions (Sales & Admin)
  create: async (req, res, next) => {
    try {
      const { question, subject, customerId, websiteId, priority } = req.body;

      if (!question || !question.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Question content is required.',
        });
      }

      const askedBySalesMemberId =
        req.user.role === 'sales'
          ? req.user.salesMemberId
          : req.body.askedBySalesMemberId || 'ADMIN';

      if (!askedBySalesMemberId) {
        return res.status(400).json({
          success: false,
          message: 'Missing asking sales member identity.',
        });
      }

      const questionId = await idService.getNextSalesQuestionId();

      const newQ = await SalesQuestion.create({
        questionId,
        subject: subject ? subject.trim() : '',
        question: question.trim(),
        customerId: customerId ? customerId.trim() : null,
        websiteId: websiteId ? websiteId.trim() : null,
        askedBySalesMemberId,
        priority: priority || 'MEDIUM',
        status: 'OPEN',
      });

      const enriched = await enrichQuestion(newQ);

      // Create Notification for Developers & Admin
      const notif = await Notification.create({
        recipientRole: 'developer',
        type: 'new_sales_question',
        title: `New Question [${enriched.priority}]: ${questionId}`,
        message: `${req.user.name || 'Sales'} asked: "${enriched.question.slice(0, 80)}${enriched.question.length > 80 ? '...' : ''}"`,
        targetTab: 'sales-questions',
        targetId: questionId,
        read: false,
      });

      emitNotification(notif);

      // Realtime emit
      const io = getIO();
      if (io) {
        io.to('admin-room').emit('question:created', enriched);
        io.to('developer-room').emit('question:created', enriched);
        io.to('sales-room').emit('question:created', enriched);
        if (req.user.salesMemberId) {
          io.to(`sales-${req.user.salesMemberId}`).emit('question:created', enriched);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Sales Question submitted successfully.',
        ...enriched,
        question: enriched,
        salesQuestion: enriched,
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/sales-questions/:id/answer (Developers & Admin)
  answer: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { answer, status = 'ANSWERED' } = req.body;

      if (!answer || !answer.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Answer text is required.',
        });
      }

      const query = id.startsWith('Q-') ? { questionId: id } : { _id: id };
      const q = await SalesQuestion.findOne(query);

      if (!q) {
        return res.status(404).json({
          success: false,
          message: `Sales Question '${id}' not found.`,
        });
      }

      q.answer = answer.trim();
      q.status = status;
      q.answeredBy = req.user.name || 'Developer';
      q.answeredAt = new Date();

      await q.save();
      const enriched = await enrichQuestion(q);

      // Create Notification for the Sales Member who asked
      const notif = await Notification.create({
        recipientRole: 'sales',
        recipientSalesMemberId: q.askedBySalesMemberId,
        type: 'question_answered',
        title: `Question Answered: ${q.questionId}`,
        message: `${q.answeredBy} answered: "${q.answer.slice(0, 80)}${q.answer.length > 80 ? '...' : ''}"`,
        targetTab: 'sales-questions',
        targetId: q.questionId,
        read: false,
      });

      emitNotification(notif);

      // Realtime emit
      const io = getIO();
      if (io) {
        io.to('admin-room').emit('question:answered', enriched);
        io.to('developer-room').emit('question:answered', enriched);
        io.to('sales-room').emit('question:answered', enriched);
        io.to(`sales-${q.askedBySalesMemberId}`).emit('question:answered', enriched);
      }

      res.status(200).json({
        success: true,
        message: 'Answer submitted successfully.',
        ...enriched,
        question: enriched,
        salesQuestion: enriched,
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/sales-questions/:id (Update Status / Priority)
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { subject, status, priority, answer } = req.body;

      const query = id.startsWith('Q-') ? { questionId: id } : { _id: id };
      const q = await SalesQuestion.findOne(query);

      if (!q) {
        return res.status(404).json({
          success: false,
          message: `Sales Question '${id}' not found.`,
        });
      }

      if (subject !== undefined) q.subject = subject.trim();
      if (status) q.status = status;
      if (priority) q.priority = priority;
      if (answer !== undefined) {
        q.answer = answer.trim();
        q.answeredBy = req.user.name || 'Developer';
        q.answeredAt = new Date();
      }

      await q.save();
      const enriched = await enrichQuestion(q);

      const io = getIO();
      if (io) {
        io.to('admin-room').emit('question:updated', enriched);
        io.to('developer-room').emit('question:updated', enriched);
        io.to('sales-room').emit('question:updated', enriched);
        io.to(`sales-${q.askedBySalesMemberId}`).emit('question:updated', enriched);
      }

      res.status(200).json({
        success: true,
        message: 'Question updated successfully.',
        question: enriched,
      });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/sales-questions/:id (Admin & Sales)
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = id.startsWith('Q-')
        ? { questionId: id }
        : mongoose.Types.ObjectId.isValid(id)
        ? { _id: id }
        : { questionId: id };
      const q = await SalesQuestion.findOne(query);

      if (!q) {
        return res.status(404).json({
          success: false,
          message: `Sales Question '${id}' not found.`,
        });
      }

      // Sales user can delete their own question
      if (
        req.user.role === 'sales' &&
        q.askedBySalesMemberId &&
        req.user.salesMemberId &&
        q.askedBySalesMemberId !== req.user.salesMemberId
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only delete questions asked by your account.',
        });
      }

      await SalesQuestion.deleteOne({ _id: q._id });

      // Clean up any notifications associated with this question so no stale notifications remain or are sent
      await Notification.deleteMany({
        $or: [
          { targetId: q.questionId },
          { targetId: q._id.toString() },
          { title: { $regex: q.questionId, $options: 'i' } },
        ],
      });

      const io = getIO();
      if (io) {
        io.to('admin-room').emit('question:deleted', { id: q._id.toString(), questionId: q.questionId });
        io.to('developer-room').emit('question:deleted', { id: q._id.toString(), questionId: q.questionId });
        io.to('sales-room').emit('question:deleted', { id: q._id.toString(), questionId: q.questionId });
        if (q.askedBySalesMemberId) {
          io.to(`sales-${q.askedBySalesMemberId}`).emit('question:deleted', { id: q._id.toString(), questionId: q.questionId });
        }
        io.emit('notification:deleted', { targetId: q.questionId, id: q._id.toString() });
      }

      res.status(200).json({
        success: true,
        message: `Sales Question '${q.questionId}' deleted successfully.`,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = salesQuestionController;
