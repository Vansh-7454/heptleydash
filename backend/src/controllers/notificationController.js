const Notification = require('../models/Notification');

const notificationController = {
  // GET /api/notifications
  getAll: async (req, res, next) => {
    try {
      const query = {
        $or: [{ recipientRole: 'all' }],
      };

      if (req.user.role === 'admin') {
        query.$or.push({ recipientRole: 'admin' });
      } else if (req.user.role === 'sales') {
        if (req.user.salesMemberId) {
          query.$or.push({ recipientSalesMemberId: req.user.salesMemberId });
        }
        query.$or.push({ recipientRole: 'sales' });
      } else if (req.user.role === 'developer') {
        query.$or.push({ recipientRole: 'developer' });
      }

      if (req.user.id) {
        query.$or.push({ recipientUserId: req.user.id });
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = notifications.filter((n) => !n.read).length;

      res.status(200).json({
        success: true,
        count: notifications.length,
        unreadCount,
        notifications: notifications.map((n) => ({
          ...n.toObject(),
          id: n._id.toString(),
        })),
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/notifications/:id/read
  markAsRead: async (req, res, next) => {
    try {
      const { id } = req.params;
      const notification = await Notification.findByIdAndUpdate(
        id,
        { read: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found.',
        });
      }

      res.status(200).json({
        success: true,
        notification: {
          ...notification.toObject(),
          id: notification._id.toString(),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/notifications/read-all
  markAllAsRead: async (req, res, next) => {
    try {
      const query = { read: false, $or: [{ recipientRole: 'all' }] };

      if (req.user.role === 'admin') {
        query.$or.push({ recipientRole: 'admin' });
      } else if (req.user.role === 'sales') {
        if (req.user.salesMemberId) {
          query.$or.push({ recipientSalesMemberId: req.user.salesMemberId });
        }
        query.$or.push({ recipientRole: 'sales' });
      } else if (req.user.role === 'developer') {
        query.$or.push({ recipientRole: 'developer' });
      }

      await Notification.updateMany(query, { read: true });

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = notificationController;
