import dotenv from "dotenv";
dotenv.config();
import express, { Express, Request, Response } from "express";
import { GlobalErrorHandler } from "../middlewares/GlobalErrorHandler";
import mainRouter from "./routes";
import cors from "cors";

const app: Express = express();
const port = process.env.PORT || 3000;

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
