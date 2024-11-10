import { Server, Socket } from 'socket.io';
import api from '../services/api';
import { userService } from '../services/userService';

export function handleMovement(socket: Socket, io: Server) {
    socket.on('movement', async (newPosition: { x: number; y: number }) => {
        try {

            const isOccupied = await checkPositionAvailability(newPosition);

            if (isOccupied) {
                socket.emit('movementResult', {
                    success: false,
                    message: "Position is occupied. Cannot move here.",
                });
            } else {

                userService.updateUserPosition(socket.id, newPosition);
                io.to(socket.data.spaceId).emit('movementResult', {
                    success: true,
                    newCoordinates: newPosition,
                });
            }
        } catch (error) {
            console.error('Error handling movement:', error);
            socket.emit('movementResult', { success: false, message: 'Movement failed' });
        }
    });
}


async function checkPositionAvailability(position: { x: number; y: number }): Promise<boolean> {
    //check if the position is occupied by the object or not 
    //TODO: check for the other users position as well
    const response = await api.get(`/arena/check-position?x=${position.x}&y=${position.y}`);
    console.log("response fo check postion", response.data.data);

    return response.data.data;
}
