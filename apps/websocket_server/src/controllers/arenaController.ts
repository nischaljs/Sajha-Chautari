import { Server, Socket } from "socket.io";
import api from "../services/api";
import { userStates, UserState } from "./userController";


// Constants for movement validation
// const MOVEMENT_THRESHOLD = 50; // Maximum allowed movement distance per update
// const POSITION_UPDATE_INTERVAL = 100; // Minimum time between position updates in ms

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
  socket.on("movement", async (data: { x: number; y: number; timestamp: number }) => {
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
      
      // if (timeSinceLastUpdate < POSITION_UPDATE_INTERVAL) {
      //   socket.emit("movementResult", {
      //     success: false,
      //     message: "Movement too frequent",
      //     data: {
      //       newCoordinates: lastValidPosition,
      //       users: Array.from(userStates[spaceId].values()),
      //       timestamp: lastValidPosition.lastUpdate
      //     }
      //   });
      //   return;
      // }
      
      
      const distance = Math.sqrt(
        Math.pow(x - lastValidPosition.x, 2) + 
        Math.pow(y - lastValidPosition.y, 2)
      );

      // if (distance > MOVEMENT_THRESHOLD) {
      //   socket.emit("movementResult", {
      //     success: false,
      //     message: "Invalid movement distance",
      //     data: {
      //       newCoordinates: lastValidPosition,
      //       users: Array.from(userStates[spaceId].values()),
      //       timestamp: lastValidPosition.lastUpdate
      //     }
      //   });
      //   return;
      // }
      
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

      
      
      
      
      console.log('you triggered movement 2')

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

      console.log("movement result is to be initiated ")
      // Emit to all users including the moving user
      socket.emit("movementResult", {
        success: true,
        data: {
          newCoordinates: { x, y },
          users: allUsers,
          timestamp
        }
      });


      console.log("others moved ")

      socket.broadcast.to(spaceId).emit("others_move", {
        success: true,
        data: {
          newCoordinates: { x, y },
          movedUserId:userId,
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