import { Socket } from "socket.io";
import api from "../services/api";

let token = "";
let spaceId = "";
export function authMiddleware(socket: Socket, next: (err?: Error) => void) {
  token = socket.handshake.auth.token;
  spaceId = socket.handshake.auth.spaceId;

  isValidTokenAndSpace()
    .then((isValid) => {
      if (isValid.bool) {
        socket.data.userId = isValid.userId;
        socket.data.spaceId = spaceId;
        next();
      } else {
        const error = new Error("Unauthorized");
        next(error);
      }
    })
    .catch((error) => {
      const err = new Error("Unauthorized");
      next(err);
    });
}

export { spaceId, token };

async function isValidTokenAndSpace(): Promise<{
  bool: boolean;
  userId: string | null;
}> {
  try {
    const response = await api.post("/spaces/join-space", {
      spaceId: spaceId,
    });

    if (!response.data.success) {
      return { bool: false, userId: null };
    }

    return { bool: true, userId: response?.data?.data?.user?.id };
  } catch (error) {
    console.error("Error during token validation:", error);
    return { bool: false, userId: null };
  }
}
