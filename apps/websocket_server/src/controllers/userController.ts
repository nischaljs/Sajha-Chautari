import { Server, Socket } from "socket.io";
import { userService } from "../services/userService";

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
  MIN_DISTANCE: 150, // Minimum distance between spawned users
  SPAWN_ATTEMPTS: 10, // Maximum attempts to find a valid spawn position
  SPAWN_RADIUS: 140, // Radius to look for alternative spawn positions
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
  attempt: number
): { x: number; y: number } => {
  if (attempt === 0) return basePosition;

  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * SPAWN_CONFIG.SPAWN_RADIUS;
  
  return {
    x: basePosition.x + distance * Math.cos(angle),
    y: basePosition.y + distance * Math.sin(angle),
  };
};

// Find a valid spawn position
const findValidSpawnPosition = (
  basePosition: { x: number; y: number },
  spaceId: string
): { x: number; y: number } => {
  for (let i = 0; i < SPAWN_CONFIG.SPAWN_ATTEMPTS; i++) {
    const testPosition = generateSpawnPosition(basePosition, i);
    if (isValidPosition(testPosition, spaceId, SPAWN_CONFIG.MIN_DISTANCE)) {
      return testPosition;
    }
  }
  // If no valid position found, return a position slightly offset from base
  return generateSpawnPosition(basePosition, 1);
};

const createUserState = async (
  userId: string,
  socket: Socket,
  userData?: Partial<UserState>
): Promise<UserState> => {
  const user = socket.data.user || userData;
  const basePosition = {
    x: socket.data.mapData.dropX,
    y: socket.data.mapData.dropY
  };

  // Find a valid spawn position
  const validPosition = findValidSpawnPosition(basePosition, socket.data.spaceId);

  return {
    id: userId,
    email: user.email || "",
    nickname: user.nickname || "Guest",
    avatarId: user.avatarId,
    position: validPosition,
    lastMoveTimestamp: Date.now(),
    avatar: user.avatar || { id: "", imageUrl: "", name: "" },
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
    socket.emit("initialize_space", {
      success: true,
      data: {
        users: existingUsers,
        currentUserId: userId
      }
    });

    socket.broadcast.to(spaceId).emit("join_space", {
      success: true,
      data: {
        user: socket.data.user
      }
    });
  } catch (error) {
    console.error("Error in onUserConnected:", error);
    socket.emit("join_space", { success: false, error: "Failed to join space" });
  }
};

export const onUserDisconnected = async (socket: Socket, io: Server) => {
  const { spaceId, userId } = socket.data;

  try {
    roomUsers[spaceId]?.delete(userId);
    userStates[spaceId]?.delete(userId);

    cleanupRoom(spaceId);

    socket.broadcast.to(spaceId).emit("leave_space", {
      success: true,
      data: {
        id: userId,
        users: Array.from(userStates[spaceId]?.values() || [])
      }
    });
    socket.leave(spaceId);
  } catch (error) {
    console.error("Error in onUserDisconnected:", error);
    socket.emit("leave_space", { success: false, error: "Failed to leave space" });
  }
};