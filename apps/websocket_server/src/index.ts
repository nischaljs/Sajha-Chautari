import dotenv from "dotenv";
dotenv.config();

import http from "http";
import express from "express";
import { createSocketServer } from "./socket";


const app = express();
const httpServer = http.createServer(app);

const io = createSocketServer(httpServer);

const PORT = process.env.SOCKET_PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
