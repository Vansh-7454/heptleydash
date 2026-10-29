// In-app event emitter stub (replaces external Socket.IO dependency)
let ioInstance = null;

const initSocket = () => null;
const getIO = () => null;
const emitRoleAware = () => {};
const emitNotification = () => {};

module.exports = {
  initSocket,
  getIO,
  emitRoleAware,
  emitNotification,
};
