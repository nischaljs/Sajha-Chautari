// types/shared.ts
export interface Position {
    x: number;
    y: number;
  }
  
  export interface Avatar {
    id: string;
    imageUrl?: string;
    name?: string;
  }
  
  export interface UserState {
    id: string;
    email: string;
    nickname: string;
    avatarId?: string;
    position: Position;
    avatar?: Avatar;
    lastActivity?: Date;
  }
  
  export interface SpaceState {
    id: string;
    name: string;
    capacity: number;
    width: number;
    height: number;
    dropPoint: Position;
  }
  
  // Error handling types
  export interface ServiceError extends Error {
    code?: string;
    details?: unknown;
  }
  
  // Response types
  export interface SocketResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
  }
  
  // Utility functions for error handling
  export class SocketError extends Error {
    constructor(
      message: string,
      public code: string = 'INTERNAL_ERROR',
      public details?: unknown
    ) {
      super(message);
      this.name = 'SocketError';
    }
  }
  
  export const createSuccessResponse = <T>(data: T): SocketResponse<T> => ({
    success: true,
    data,
  });
  
  export const createErrorResponse = (error: SocketError): SocketResponse => ({
    success: false,
    error: error.message,
    code: error.code,
  });
  
  // Validation utilities
  export const validatePosition = (
    position: Position,
    spaceState: SpaceState
  ): boolean => {
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      throw new SocketError('Invalid position format', 'INVALID_POSITION');
    }
  
    if (
      position.x < 0 ||
      position.y < 0 ||
      position.x > spaceState.width ||
      position.y > spaceState.height
    ) {
      throw new SocketError('Position out of bounds', 'POSITION_OUT_OF_BOUNDS');
    }
  
    return true;
  };
  
  // Logger utility
  export const logger = {
    info: (message: string, meta?: object) => {
      console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    },
    error: (message: string, error: Error, meta?: object) => {
      console.error(
        `[ERROR] ${message}`,
        {
          error: {
            stack: error.stack,
            ...(error as ServiceError),
          },
          ...meta,
        }
      );
    },
    debug: (message: string, meta?: object) => {
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
      }
    },
  };