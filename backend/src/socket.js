const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let ioInstance = null;

const initSocket = (httpServer) => {
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  // Authentication Middleware
  ioInstance.use((socket, next) => {
    try {
      const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

      if (!authHeader) {
        return next(new Error('Authentication failed: No token provided'));
      }

      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
      const secret = process.env.JWT_SECRET || 'heptley_crm_secure_jwt_secret_key_2026';

      const decoded = jwt.verify(token, secret);
      socket.user = {
        id: decoded.id,
        role: decoded.role,
        salesMemberId: decoded.salesMemberId || null,
        name: decoded.name || '',
        email: decoded.email || '',
      };

      next();
    } catch (err) {
      return next(new Error(`Authentication failed: ${err.message}`));
    }
  });

  ioInstance.on('connection', (socket) => {
    const { user } = socket;

    // Join Role & Isolation Rooms
    if (user.role === 'admin') {
      socket.join('admin-room');
    } else if (user.role === 'sales' && user.salesMemberId) {
      socket.join(`sales-${user.salesMemberId}`);
    }

    // Join personal user room for direct alerts
    if (user.id) {
      socket.join(`user-${user.id}`);
    }

    console.log(
      `[Socket.IO] Connected: ${user.name || user.email} | Role: ${user.role} | Rooms: ${Array.from(socket.rooms).join(', ')}`
    );

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Disconnected: ${user.name || user.email} (${reason})`);
    });
  });

  return ioInstance;
};

const getIO = () => {
  return ioInstance;
};

/**
 * Emit event to Admins and the specific assigned Sales Member only.
 * Other sales reps will NOT receive this event.
 */
const emitRoleAware = (event, data, salesMemberId = null) => {
  if (!ioInstance) return;

  // 1. Admin room always receives organizational updates
  ioInstance.to('admin-room').emit(event, data);

  // 2. Assigned sales member receives update in their private room
  if (salesMemberId) {
    ioInstance.to(`sales-${salesMemberId}`).emit(event, data);
  }
};

/**
 * Targeted notification dispatcher based on recipient constraints
 */
const emitNotification = (notification) => {
  if (!ioInstance) return;

  const payload = {
    ...notification.toObject?.() || notification,
    id: notification._id?.toString() || notification.id,
  };

  if (notification.recipientRole === 'admin') {
    ioInstance.to('admin-room').emit('notification:new', payload);
  } else if (notification.recipientSalesMemberId) {
    ioInstance.to(`sales-${notification.recipientSalesMemberId}`).emit('notification:new', payload);
  } else if (notification.recipientUserId) {
    ioInstance.to(`user-${notification.recipientUserId}`).emit('notification:new', payload);
  } else {
    // Broadcast if for 'all'
    ioInstance.to('admin-room').emit('notification:new', payload);
    if (notification.recipientSalesMemberId) {
      ioInstance.to(`sales-${notification.recipientSalesMemberId}`).emit('notification:new', payload);
    }
  }
};

module.exports = {
  initSocket,
  getIO,
  emitRoleAware,
  emitNotification,
};
