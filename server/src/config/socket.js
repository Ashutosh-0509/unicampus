const { Server } = require('socket.io');

let ioInstance = null;

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('join:user', ({ userId, role, branch }) => {
      if (!userId) return;

      socket.join(`user:${userId}`);

      if (role === 'student' && branch) {
        socket.join(`branch:${branch}`);
      }

      if (role === 'faculty') {
        socket.join(`faculty:${userId}`);
      }

      console.log(`🔌 User ${userId} joined rooms`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  ioInstance = io;
  return io;
}

function getIO() {
  return ioInstance;
}

module.exports = { initSocket, getIO };
