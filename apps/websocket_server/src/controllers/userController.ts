import { Server, Socket } from "socket.io";

export function onUserConnected (socket: Socket, io: Server) {
try {
    const spaceId = socket.data.spaceId;
    socket.join(spaceId);

    //TODO: user jasle join garxa usel chei aafnu avatar haru brodcast garxa ra rule le chei just teslai plot garxan thisway when the one new user joins areu le pheri http server hit garnu pardaina 
    io.to(spaceId).emit('join_space',{
        success: true,
        id:socket.id
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