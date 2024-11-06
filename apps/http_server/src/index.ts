import express, { Express, Request, Response } from "express";

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

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

