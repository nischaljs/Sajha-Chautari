import { Socket } from 'socket.io';
import api from '../services/api';

export function authMiddleware(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth.token;

  isValidToken(token).then((isValid) => {
    if (isValid) {
      next(); 
    } else {
      const error = new Error('Unauthorized');
      next(error); 
    }
  }).catch((error) => {
    const err = new Error('Unauthorized');
    next(err); 
  });
}


// Mock function to check token validity
 async function isValidToken(token: string): Promise<boolean> {
  try {
    const response = await api('/auth/valid-token', 
    );

    if (!response.data.success) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error during token validation:', error);
    return false;
  }
}
