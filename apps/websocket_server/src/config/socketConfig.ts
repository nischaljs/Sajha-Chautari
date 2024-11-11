export const socketConfig = {
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
  },
  cors: {
    origin: "*",
  },
};
