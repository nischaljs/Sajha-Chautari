import { Server, Socket } from "socket.io";
import api from "../services/api";
import { userStates, UserState } from "./userController";

export function handleMovement(socket: Socket, io: Server) {
  socket.on("movement", async (data: { x: number; y: number; timestamp: number }) => {
    const { x, y, timestamp } = data;
    const spaceId = socket.data.spaceId;
    const userId = socket.data.userId;

    try {
      if (!spaceId || !userId || !userStates[spaceId]) {
        throw new Error("Invalid space or user.");
      }

      const currentState = userStates[spaceId].get(userId);
      if (!currentState) {
        throw new Error("User state not found.");
      }

      // Validate timestamp to prevent out-of-order updates
      if (currentState.lastMoveTimestamp && currentState.lastMoveTimestamp > timestamp) {
        socket.emit("movementResult", {
          success: false,
          message: "Outdated movement request",
          data: {
            newCoordinates: currentState.position,
            users: Array.from(userStates[spaceId].values()),
            timestamp: currentState.lastMoveTimestamp
          }
        });
        return;
      }

      // Basic boundary validation
      const mapData = socket.data.mapData;
      if (x < 0 || x > mapData.width || y < 0 || y > mapData.height) {
        socket.emit("movementResult", {
          success: false,
          message: "Position out of bounds",
          data: {
            newCoordinates: currentState.position,
            users: Array.from(userStates[spaceId].values()),
            timestamp
          }
        });
        return;
      }

      // Check position availability
      const isOccupied = await checkPositionAvailability(
        { x, y },
        mapData.width,
        mapData.height
      );

      if (isOccupied) {
        socket.emit("movementResult", {
          success: false,
          message: "Position is occupied",
          data: {
            newCoordinates: currentState.position,
            users: Array.from(userStates[spaceId].values()),
            timestamp
          }
        });
        return;
      }

      // Update user position
      const updatedState = {
        ...currentState,
        position: { x, y },
        lastMoveTimestamp: timestamp
      };
      userStates[spaceId].set(userId, updatedState);
      const allUsers = Array.from(userStates[spaceId].values());

      console.log("movement result is to be imitted")
      // Emit to all users including the moving user
      io.to(spaceId).emit("movementResult", {
        success: true,
        data: {
          newCoordinates: { x, y },
          users: allUsers,
          timestamp
        }
      });

    } catch (error: any) {
      console.error("Error handling movement:", error);
      socket.emit("movementResult", {
        success: false,
        message: error.message || "Movement failed",
        data: {
          newCoordinates: userStates[spaceId]?.get(userId)?.position || { x: 0, y: 0 },
          users: Array.from(userStates[spaceId]?.values() || []),
          timestamp
        }
      });
    }
  });
}

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
    return response.data.data;
  } catch (error) {
    console.error("Error checking position availability:", error);
    throw new Error("Failed to check position availability.");
  }
}