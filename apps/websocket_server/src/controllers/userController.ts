import { Server, Socket } from "socket.io";

// Define User State
export interface UserState {
  id: string;
  email?: string;
  nickname: string;
  avatarId?: string;
  position: {
    x: number;
    y: number;
  };
  lastMoveTimestamp?: number;
  avatar?: {
    id: string;
    imageUrl?: string;
    name?: string;
  };
}

// Configuration
const SPAWN_CONFIG = {
  MIN_DISTANCE: 100, // Minimum distance between spawned users
  SPAWN_ATTEMPTS: 10, // Maximum attempts to find a valid spawn position
  SPAWN_RADIUS: 150, // Radius to look for alternative spawn positions
};

// State Management
const roomUsers: Record<string, Set<string>> = {};
export const userStates: Record<string, Map<string, UserState>> = {};

// Utility Functions
const initializeRoom = (spaceId: string): void => {
  if (!roomUsers[spaceId]) {
    roomUsers[spaceId] = new Set();
    userStates[spaceId] = new Map();
  }
};

const cleanupRoom = (spaceId: string): void => {
  if (roomUsers[spaceId]?.size === 0) {
    delete roomUsers[spaceId];
    delete userStates[spaceId];
  }
};

// Calculate distance between two points
const calculateDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }): number => {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
};

// Check if a position is valid (not too close to other users)
const isValidPosition = (
  position: { x: number; y: number },
  spaceId: string,
  minDistance: number
): boolean => {
  if (!userStates[spaceId]) return true;
  
  for (const userState of userStates[spaceId].values()) {
    if (calculateDistance(position, userState.position) < minDistance) {
      return false;
    }
  }
  return true;
};

// Generate a new spawn position
const generateSpawnPosition = (
  basePosition: { x: number; y: number },
  attempt: number,
  mapData: any
): { x: number; y: number } => {
  if (attempt === 0) return basePosition;

  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * SPAWN_CONFIG.SPAWN_RADIUS;
  
  const newX = Math.max(50, Math.min(basePosition.x + distance * Math.cos(angle), mapData.width - 50));
  const newY = Math.max(50, Math.min(basePosition.y + distance * Math.sin(angle), mapData.height - 50));
  
  return { x: newX, y: newY };
};

// Find a valid spawn position
const findValidSpawnPosition = (
  basePosition: { x: number; y: number },
  spaceId: string,
  mapData: any
): { x: number; y: number } => {
  for (let i = 0; i < SPAWN_CONFIG.SPAWN_ATTEMPTS; i++) {
    const testPosition = generateSpawnPosition(basePosition, i, mapData);
    if (isValidPosition(testPosition, spaceId, SPAWN_CONFIG.MIN_DISTANCE)) {
      return testPosition;
    }
  }
  // If no valid position found, return a position slightly offset from base
  return generateSpawnPosition(basePosition, 1, mapData);
};

const createUserState = async (
  userId: string,
  socket: Socket,
  userData?: Partial<UserState>
): Promise<UserState> => {
  const user = socket.data.user || userData;
  const basePosition = {
    x: socket.data.mapData?.dropX || 400,
    y: socket.data.mapData?.dropY || 300
  };

  // Find a valid spawn position
  const validPosition = findValidSpawnPosition(basePosition, socket.data.spaceId, socket.data.mapData);

  return {
    id: userId,
    email: user?.email || "",
    nickname: user?.nickname || "Guest",
    avatarId: user?.avatarId,
    position: validPosition,
    lastMoveTimestamp: Date.now(),
    avatar: user?.avatar || { id: "", imageUrl: "", name: "" },
  };
};

// Socket Handlers
export const onUserConnected = async (socket: Socket, io: Server) => {
  const { spaceId, userId } = socket.data;

  try {
    socket.join(spaceId);
    initializeRoom(spaceId);

    roomUsers[spaceId].add(userId);
    const userState = await createUserState(userId, socket, userStates[spaceId]?.get(userId));
    userStates[spaceId].set(userId, userState);

    const existingUsers = Array.from(userStates[spaceId].values());
    
    // Send initialization data to the connecting user
    socket.emit("initialize_space", {
      success: true,
      data: {
        users: existingUsers,
        currentUserId: userId
      }
    });

    // Notify other users about the new user
    socket.broadcast.to(spaceId).emit("user_joined", {
      success: true,
      data: {
        user: userState,
        users: existingUsers
      }
    });

    console.log(`User ${userId} connected to space ${spaceId}`);
  } catch (error) {
    console.error("Error in onUserConnected:", error);
    socket.emit("connection_error", { success: false, error: "Failed to join space" });
  }
};

export const onUserDisconnected = async (socket: Socket, io: Server) => {
  const { spaceId, userId } = socket.data;

  try {
    if (roomUsers[spaceId]) {
      roomUsers[spaceId].delete(userId);
    }
    if (userStates[spaceId]) {
      userStates[spaceId].delete(userId);
    }

    cleanupRoom(spaceId);

    // Notify remaining users about the disconnection
    socket.broadcast.to(spaceId).emit("user_left", {
      success: true,
      data: {
        userId: userId,
        users: Array.from(userStates[spaceId]?.values() || [])
      }
    });
    
    socket.leave(spaceId);
    console.log(`User ${userId} disconnected from space ${spaceId}`);
  } catch (error) {
    console.error("Error in onUserDisconnected:", error);
  }
};