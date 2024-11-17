// userController.ts
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

const createUserState = async (
  userId: string, 
  socket: Socket, 
  userData?: Partial<UserState>
): Promise<UserState> => {
  const user = socket.data.user || userData;
  
  return {
    id: userId,
    email: user.email || "",
    nickname: user.nickname || "Guest",
    avatarId: user.avatarId,
    position: { 
      x: socket.data.mapData.dropX, 
      y: socket.data.mapData.dropY 
    },
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
      id: userId,
      data: {
        users: Array.from(userStates[spaceId]?.values() || [])
      }
    });
    socket.leave(spaceId);
  } catch (error) {
    console.error("Error in onUserDisconnected:", error);
    socket.emit("leave_space", { success: false, error: "Failed to leave space" });
  }
};