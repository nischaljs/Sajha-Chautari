import { Server, Socket } from "socket.io";
import { userService } from "../services/userService";


export const roomUsers: Record<string, Set<string>> = {};
export const userStates: Record<string, Map<string, { avatar: string, nickname: string, position: { x: number, y: number }, }>> = {};

export async function onUserConnected(socket: Socket, io: Server) {
    try {
        const spaceId = socket.data.spaceId;
        const userId = socket.data.userId;

        socket.join(spaceId);

        if (!roomUsers[spaceId]) {
            roomUsers[spaceId] = new Set();
            userStates[spaceId] = new Map();
        }


        roomUsers[spaceId].add(userId);

        //TODO: user jasle join garxa usel chei aafnu avatar haru brodcast garxa ra rule le chei just teslai plot garxan thisway when the one new user joins areu le pheri http server hit garnu pardaina

        const user = await userService.getUserDetails(userId);

        userStates[spaceId].set(userId, {
            avatar: user?.avatar || "",
            nickname: user?.nickname || "Guest",
            position: { x: user?.positionX, y: user?.positionY }
        });

        const users = Array.from(userStates[spaceId].values());
        socket.emit('initialize_space', { success: true, users });


        io.to(spaceId).emit('join_space', {
            success: true,
            id: socket.id,
            users: { userId, avatar: user.avatar, position: { x: user?.positionX, y: user?.positionY } }
        })
    } catch (error) {
        socket.emit('join_space', {
            success: false,
            id: socket.id
        })
    }
}

export function onUserDisconnected(socket: Socket, io: Server) {
    try {
        const spaceId = socket.data.spaceId;

        if (roomUsers[spaceId]) {
            roomUsers[spaceId].delete(socket.id);

            // If the room is empty, remove it from the map
            if (roomUsers[spaceId].size === 0) {
                delete roomUsers[spaceId];
            }
        }


        io.to(spaceId).emit('leave_space', {
            success: true,
            id: socket.id
        })
        socket.leave(spaceId);

    } catch (error) {
        socket.emit('leave_space', {
            success: false,
            id: socket.id
        })
    }
}

