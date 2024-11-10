import { Server } from 'socket.io';
import { authMiddleware } from './middlewares/authMiddleware';
import * as arenaController from './controllers/arenaController';
import * as userController from './controllers/userController';
import { socketConfig } from './config/socketConfig';

export function createSocketServer(httpServer: any) {
  const io = new Server(httpServer, socketConfig);


  io.use(authMiddleware);

  // Handle new connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);



    userController.onUserConnected(socket, io);
    arenaController.handleMovement(socket, io);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      userController.onUserDisconnected(socket, io);
    });
  });

  return io;
}
