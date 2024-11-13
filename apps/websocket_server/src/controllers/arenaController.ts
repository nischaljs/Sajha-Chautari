import { Server, Socket } from "socket.io";
import api from "../services/api";
import { userService } from "../services/userService";
import { userStates } from "./userController";

export function handleMovement(socket: Socket, io: Server) {
  socket.on("movement", async (newPosition: { x: number; y: number }) => {
    try {
      const isOccupied = await checkPositionAvailability(newPosition,socket.data.mapData.width, socket.data.mapData.height);
      const spaceId = socket.data.spaceId;
      const userId = socket.data.userId;


      if (isOccupied) {
        socket.emit("movementResult", {
          success: false,
          message: "Position is occupied. Cannot move here.",
        });
      } else {
        const previousData = userStates[spaceId].get(userId) || {
          id:userId,
          avatar: "",
          nickname: "",
        };

        userStates[spaceId].set(userId, {

          ...previousData,
          position: { x: newPosition.x, y: newPosition.y },
        });

        io.to(socket.data.spaceId).emit("movementResult", {
          success: true,
          userId:userId,
          newCoordinates: newPosition,
          users:userStates[spaceId]
        });

  

      }
    } catch (error) {
      console.error("Error handling movement:", error);
      socket.emit("movementResult", {
        success: false,
        message: "Movement failed",
      });
    }
  });
}

async function checkPositionAvailability(position: {
  x: number;
  y: number;
}, width: number,
  height: number): Promise<boolean> {
  //check if the position is occupied by the object or not
  //TODO: check for the other users position as well
  const response = await api.get(
    `/arenas/check-position`, {
    params: {
      x: position.x,
      y: position.y,
      width: height,
      height: width
    }
  }
  );

  return response.data.data;
}
