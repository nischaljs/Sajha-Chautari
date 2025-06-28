import { Socket } from "socket.io";
import api from "../services/api";
import { UserInfo } from "@repo/schematype";

export function authMiddleware(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth.token;
  const spaceId = socket.handshake.auth.spaceId;
  const user = socket.handshake.auth.user;

  if (!token || !spaceId || !user) {
    const error = new Error("Missing authentication data");
    return next(error);
  }

  isValidTokenAndSpace(token, spaceId)
    .then((isValid) => {
      if (isValid.bool) {
        socket.data.userId = isValid?.user?.id;
        socket.data.spaceId = spaceId;
        socket.data.mapData = isValid.mapData;
        socket.data.user = user;
        socket.data.token = token;
        next();
      } else {
        const error = new Error("Unauthorized");
        next(error);
      }
    })
    .catch((error) => {
      console.error("Auth middleware error:", error);
      const err = new Error("Unauthorized");
      next(err);
    });
}

async function isValidTokenAndSpace(token: string, spaceId: string): Promise<{
  bool: boolean;
  user: UserInfo | null;
  mapData: {} | null;
}> {
  try {
    const response = await api.post("/spaces/join-space", {
      spaceId: spaceId,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.data.success) {
      return { bool: false, user: null, mapData: null };
    }

    return { 
      bool: true, 
      user: response?.data?.data?.user, 
      mapData: response?.data?.data?.spaceResponse?.map 
    };
  } catch (error) {
    console.error("Token validation error:", error);
    return { bool: false, user: null, mapData: null };
  }
}