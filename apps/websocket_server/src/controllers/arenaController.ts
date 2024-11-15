import { Server, Socket } from "socket.io";
import api from "../services/api";
import { userStates } from "./userController";
import { UserState } from "./userController";

export function handleMovement(socket: Socket, io: Server) {
  socket.on("movement", async (newPosition: { x: number; y: number }) => {
    const spaceId = socket.data.spaceId;
    const userId = socket.data.userId;

    try {
      // Ensure user and space are valid
      if (!spaceId || !userId || !userStates[spaceId]) {
        throw new Error("Invalid space or user.");
      }

      // Check if the new position is available
      const isOccupied = await checkPositionAvailability(
        newPosition,
        socket.data.mapData.width,
        socket.data.mapData.height
      );

      if (isOccupied) {
        socket.emit("movementResult", {
          success: false,
          message: "Position is occupied. Cannot move here.",
        });
        return;
      }

      // Update user's position in the room state
      const previousData = userStates[spaceId].get(userId);
      if (!previousData) {
        throw new Error("User state not found.");
      }

      const updatedState: UserState = {
        ...previousData,
        position: { x: newPosition.x, y: newPosition.y },
      };
      userStates[spaceId].set(userId, updatedState);

      // Notify the user about the successful movement
      socket.emit("movementResult", {
        success: true,
        userId,
        newCoordinates: newPosition,
        users: Array.from(userStates[spaceId].values()), // Convert map to array
      });

      // Broadcast movement to other users in the same space
      socket.broadcast.to(spaceId).emit("others_moved", {
        success: true,
        userId,
        updatedUser: updatedState,
      });
    } catch (error:any) {
      console.error("Error handling movement:", error);
      socket.emit("movementResult", {
        success: false,
        message: error.message || "Movement failed.",
      });
    }
  });
}

// Utility Function to Check Position Availability
async function checkPositionAvailability(
  position: { x: number; y: number },
  width: number,
  height: number
): Promise<boolean> {
  try {
    const response = await api.get(`/arenas/check-position`, {
      params: {
        x: position.x,
        y: position.y,
        width,
        height,
      },
    });

    console.log("what the api has responded for the arena check for collision ", response.data.data);

    return response.data.data; // Assume the API returns a boolean in `data`
  } catch (error) {
    console.error("Error checking position availability:", error);
    throw new Error("Failed to check position availability.");
  }
}
