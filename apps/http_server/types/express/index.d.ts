import { role } from "../../src/middlewares/authmiddleware";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: role;
      file?:{
        fileName :string
        path:string
      }
    }
  }
}
