import express, { Express, Request, Response } from "express";
import dotenv from 'dotenv';
import { GlobalErrorHandler } from "../middlewares/GlobalErrorHandler";
import mainRouter from "./routes";

dotenv.config();
const app: Express = express();
const port = process.env.PORT ||  3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
      success:true,
      message: "HTTP Server is running ",
      data:{}
    });
  });

app.use('/api/v1',mainRouter);
app.use(GlobalErrorHandler());

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

