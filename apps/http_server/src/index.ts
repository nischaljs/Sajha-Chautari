import dotenv from "dotenv";
dotenv.config();
import express, { Express, Request, Response } from "express";
import { GlobalErrorHandler } from "../middlewares/GlobalErrorHandler";
import mainRouter from "./routes";
import cors from "cors";
import path from "path";

const app: Express = express();
const port = process.env.PORT || 3000;

//server static files from the public directory
app.use('/uploads',express.static(path.join(__dirname, 'public/uploads')));

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "HTTP Server is running ",
    data: {},
  });
});

app.use("/api/v1", mainRouter);
app.use(GlobalErrorHandler());

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
