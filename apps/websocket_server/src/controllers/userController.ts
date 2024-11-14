import { Server, Socket } from "socket.io";
import { userService } from "../services/userService";

// Types
interface Position {
  x: number;
  y: number;
}

interface UserState {
  id: string;
  avatar: string;
  nickname: string;
  position: Position;
}

interface MapData {
  width: number;
  height: number;
}

interface SocketData {
  spaceId: string;
  userId: string;
  mapData: MapData;
}

interface JoinSpaceResponse {
  success: boolean;
  id: string;
  users?: UserState | UserState[];
}

// State management
export const roomUsers: Record<string, Set<string>> = {};
export const userStates: Record<string, Map<string, UserState>> = {};

// Helper functions
function initializeRoom(spaceId: string): void {
  if (!roomUsers[spaceId]) {
    roomUsers[spaceId] = new Set();
    userStates[spaceId] = new Map();
  }
}

function cleanupRoom(spaceId: string): void {
  if (roomUsers[spaceId]?.size === 0) {
    delete roomUsers[spaceId];
    delete userStates[spaceId];
  }
}

async function createUserState(userId: string, userData?: Partial<UserState>): Promise<UserState> {
  const user = userData || await userService.getUserDetails(userId);
  
  return {
    id: userId,
    avatar: user?.avatar || "",
    nickname: user?.nickname || "Guest",
    position: { 
      x: user?.positionX || 0, 
      y: user?.positionY || 0 
    }
  };
}

// Main functions
export async function onUserConnected(socket: Socket<any, any, any, SocketData>, io: Server) {
  const { spaceId, userId } = socket.data;

  try {
    // Join the room
    await socket.join(spaceId);
    
    // Initialize room if needed
    initializeRoom(spaceId);
    
    // Add user to room
    roomUsers[spaceId].add(userId);

    // Create or get user state
    const userState = await createUserState(
      userId,
      userStates[spaceId].get(userId)
    );
    
    // Store user state
    userStates[spaceId].set(userId, userState);

    // Send existing users to new user
    const existingUsers = Array.from(userStates[spaceId].values());
    socket.emit("initialize_space", { 
      success: true, 
      users: existingUsers 
    });

    // Notify others about new user
    socket.broadcast.to(spaceId).emit("join_space", {
      success: true,
      id: userId,
      users: userState
    });

  } catch (error) {
    console.error("Error in onUserConnected:", error);
    socket.emit("join_space", {
      success: false,
      id: userId,
      error: "Failed to join space"
    });
  }
}

export async function onUserDisconnected(socket: Socket<any, any, any, SocketData>, io: Server) {
  const { spaceId, userId } = socket.data;

  try {
    if (!roomUsers[spaceId]) {
      throw new Error(`Room ${spaceId} not found`);
    }

    // Remove user from room
    roomUsers[spaceId].delete(userId);
    userStates[spaceId]?.delete(userId);

    // Clean up empty room
    cleanupRoom(spaceId);

    // Notify others
    socket.broadcast.to(spaceId).emit("leave_space", {
      success: true,
      id: userId
    });

    // Leave the room
    await socket.leave(spaceId);

  } catch (error) {
    console.error("Error in onUserDisconnected:", error);
    socket.emit("leave_space", {
      success: false,
      id: userId,
      error: "Failed to leave space"
    });
  }
}