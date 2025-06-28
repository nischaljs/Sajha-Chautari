import { Server, Socket } from "socket.io";
import { userStates, UserState } from "./userController";

// Constants for movement validation
const MOVEMENT_THRESHOLD = 200; // Maximum allowed movement distance per update
const POSITION_UPDATE_INTERVAL = 50; // Minimum time between position updates in ms

interface MovementData {
  x: number;
  y: number;
  timestamp: number;
}

interface PositionState {
  x: number;
  y: number;
  lastUpdate: number;
}

const lastValidPositions: Map<string, PositionState> = new Map();

export function handleMovement(socket: Socket, io: Server) {
  socket.on("movement", async (data: MovementData) => {
    const { x, y, timestamp } = data;
    const spaceId = socket.data.spaceId;
    const userId = socket.data.userId;
    const mapData = socket.data.mapData;
    
    try {
      if (!spaceId || !userId || !userStates[spaceId]) {
        throw new Error("Invalid space or user.");
      }
      
      const currentState = userStates[spaceId].get(userId);
      if (!currentState) {
        throw new Error("User state not found.");
      }

      const lastValidPosition = lastValidPositions.get(userId) || {
        x: currentState.position.x,
        y: currentState.position.y,
        lastUpdate: Date.now()
      };
      
      const timeSinceLastUpdate = timestamp - lastValidPosition.lastUpdate;
      
      // Rate limiting
      if (timeSinceLastUpdate < POSITION_UPDATE_INTERVAL) {
        socket.emit("movementResult", {
          success: false,
          message: "Movement too frequent",
          data: {
            newCoordinates: lastValidPosition,
            users: Array.from(userStates[spaceId].values()),
            timestamp: lastValidPosition.lastUpdate
          }
        });
        return;
      }
      
      // Distance validation
      const distance = Math.sqrt(
        Math.pow(x - lastValidPosition.x, 2) + 
        Math.pow(y - lastValidPosition.y, 2)
      );

      if (distance > MOVEMENT_THRESHOLD) {
        socket.emit("movementResult", {
          success: false,
          message: "Invalid movement distance",
          data: {
            newCoordinates: lastValidPosition,
            users: Array.from(userStates[spaceId].values()),
            timestamp: lastValidPosition.lastUpdate
          }
        });
        return;
      }
      
      // Boundary validation
      if (x < 0 || x > mapData.width || y < 0 || y > mapData.height) {
        socket.emit("movementResult", {
          success: false,
          message: "Position out of bounds",
          data: {
            newCoordinates: lastValidPosition,
            users: Array.from(userStates[spaceId].values()),
            timestamp: lastValidPosition.lastUpdate
          }
        });
        return;
      }

      // Check for collisions with other users
      const isCollidingWithUser = Array.from(userStates[spaceId].values()).some((user) => {
        if (user.id === userId) return false;
        const distX = x - user.position.x;
        const distY = y - user.position.y;
        const distance = Math.sqrt(distX * distX + distY * distY);
        return distance < 80; // Collision threshold
      });

      if (isCollidingWithUser) {
        socket.emit("movementResult", {
          success: false,
          message: "Position is occupied by another user",
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
      
      // Update last valid position
      lastValidPositions.set(userId, {
        x, y,
        lastUpdate: timestamp
      });

      const allUsers = Array.from(userStates[spaceId].values());

      // Emit to the moving user
      socket.emit("movementResult", {
        success: true,
        data: {
          newCoordinates: { x, y },
          users: allUsers,
          timestamp
        }
      });

      // Emit to other users in the space
      socket.broadcast.to(spaceId).emit("others_move", {
        success: true,
        data: {
          newCoordinates: { x, y },
          movedUserId: userId,
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