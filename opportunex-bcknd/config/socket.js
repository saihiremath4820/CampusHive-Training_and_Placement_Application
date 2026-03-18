let _io = null;

module.exports = {
  init: (httpServer) => {
    const { Server } = require('socket.io');
    _io = new Server(httpServer, {
      cors: {
        origin: [
          process.env.CLIENT_URL,
          'http://localhost:5173',
          'http://localhost:5174',
        ].filter(Boolean),
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
    });
    return _io;
  },
  getIO: () => {
    if (!_io) throw new Error('Socket.IO not initialized');
    return _io;
  }
};
