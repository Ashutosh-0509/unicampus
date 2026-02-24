const { getIO } = require('../config/socket');

function emitToUser(userId, event, payload) {
  const io = getIO();
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(event, payload);
}

function emitToBranch(branch, event, payload) {
  const io = getIO();
  if (!io || !branch) return;
  io.to(`branch:${branch}`).emit(event, payload);
}

module.exports = { emitToUser, emitToBranch };
