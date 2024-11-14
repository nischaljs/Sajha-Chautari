import { Server, Socket } from "socket.io";
import api from "../services/api";
import { userStates } from "./userController";

export function handleMovement(socket: Socket, io: Server) {
  socket.on("movement", async (newPosition: { x: number; y: number }) => {
    try {
      const isOccupied = await checkPositionAvailability(
        newPosition,
        socket.data.mapData.width,
        socket.data.mapData.height
      );
      const spaceId = socket.data.spaceId;
      const userId = socket.data.userId;

      if (isOccupied) {
        socket.emit("movementResult", {
          success: false,
          message: "Position is occupied. Cannot move here.",
        });
        return;
      }

      const previousData = userStates[spaceId].get(userId) || {
        id: userId,
        avatar: "",
        nickname: "",
      };

      userStates[spaceId].set(userId, {
        ...previousData,
        position: { x: newPosition.x, y: newPosition.y },
      });

      // Send success response to moving user
      socket.emit("movementResult", {
        success: true,
        userId: userId,
        newCoordinates: newPosition,
        users: userStates[spaceId]
      });

      // Broadcast to other users in the space EXCEPT the sender
      socket.broadcast.to(socket.data.spaceId).emit("othersmoved", {
        success: true,
        userId: userId,
        users: userStates[spaceId]
      });
    } catch (error) {
      console.error("Error handling movement:", error);
      socket.emit("movementResult", {
        success: false,
        message: "Movement failed",
      });
    }
  });
}

async function checkPositionAvailability(
  position: { x: number; y: number },
  width: number,
  height: number
): Promise<boolean> {
  const response = await api.get(`/arenas/check-position`, {
    params: {
      x: position.x,
      y: position.y,
      width: height,
      height: width
    }
  });

  return response.data.data;
}