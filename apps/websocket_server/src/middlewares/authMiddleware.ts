import { Socket } from "socket.io";
import api from "../services/api";
import { UserInfo } from "@repo/schematype";

let token = "";
let spaceId = "";
let user = {};
export function authMiddleware(socket: Socket, next: (err?: Error) => void) {
  token = socket.handshake.auth.token;
  spaceId = socket.handshake.auth.spaceId;
  user = socket.handshake.auth.user;

  isValidTokenAndSpace()
    .then((isValid) => {
      if (isValid.bool) {
        socket.data.userId = isValid?.user?.id;
        socket.data.spaceId = spaceId;
        socket.data.mapData = isValid.mapData;
        socket.data.user = user;
      
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
  user: UserInfo | null;
  mapData:{} |null;
}> {
  try {
    const response = await api.post("/spaces/join-space", {
      spaceId: spaceId,
    });


    if (!response.data.success) {
      return { bool: false, user: null, mapData:null };
    }

    return { bool: true, user: response?.data?.data?.user, mapData:response?.data?.data?.spaceResponse?.map };
  } catch (error) {
  
    return { bool: false, user: null, mapData:null };
  }
}
