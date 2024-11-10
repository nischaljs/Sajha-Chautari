import { Server, Socket } from "socket.io";
import { userService } from "../services/userService";


export const roomUsers: Record<string, Set<string>> = {};

export function onUserConnected (socket: Socket, io: Server) {
try {
    const spaceId = socket.data.spaceId;
    socket.join(spaceId);

    if (!roomUsers[spaceId]) {
        roomUsers[spaceId] = new Set();
    }
    roomUsers[spaceId].add(socket.data.userId);

    //TODO: user jasle join garxa usel chei aafnu avatar haru brodcast garxa ra rule le chei just teslai plot garxan thisway when the one new user joins areu le pheri http server hit garnu pardaina
    
    const users = userService.getUserDetails(roomUsers[spaceId]);
    io.to(spaceId).emit('join_space',{
        success: true,
        id:socket.id,
        users:users
    })
} catch (error) {
    socket.emit('join_space',{
        success: false,
        id:socket.id
      })
}
}

export function onUserDisconnected (socket: Socket, io: Server) {
    try {
        const spaceId = socket.data.spaceId;
        io.to(spaceId).emit('leave_space',{
            success:true,
            id:socket.id
        })
        socket.leave(spaceId);

    } catch (error) {
        
    }
}

