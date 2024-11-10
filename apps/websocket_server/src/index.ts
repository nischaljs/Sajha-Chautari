import http from 'http';
import express from 'express';
import { createSocketServer } from './socket';


const app = express();
const httpServer = http.createServer(app);


const io = createSocketServer(httpServer);


const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
