"use client";
import React, { useEffect, useRef, useState } from "react";
import { debugLogger } from "@/utils/debugLogger";
import Canvas from "@/components/Canvas";
import { Card } from "@/components/ui/card";
import UserList from "@/components/UserList";
import {
  GameState,
  Position,
  SpaceDetailsResponse,
  SocketResponse
} from "@/types/Space";
import api from "@/utils/axiosInterceptor";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useUserContextState } from "@/context/UserContext";
import { User } from "@/types/User";

const initialGameState: GameState = {
  users:[],
  position: { x: 0, y: 0 },
  connected: false,
  error: "",
  map: null,
  elements: [],
  spaceDetails: null,
  currentUserId: "",
};

const VirtualSpace: React.FC = () => {
  const params = useParams();
  const spaceId = params.spaceId ? String(params.spaceId) : null;
  const { user, isLoading } = useUserContextState();
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const elementImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const avatarImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Fetch initial space data
  useEffect(() => {
    const fetchSpace = async () => {
      if (!spaceId) return;
      
      try {
        const response = await api.get<{ data: SpaceDetailsResponse }>(`/arenas/${spaceId}`);
        const spaceData = response.data.data;
        
        setGameState(prev => {
          const newState = {
            ...prev,
            spaceDetails: spaceData,
            map: spaceData.map,
            elements: spaceData.elements,
            position: { x: spaceData.map.dropX, y: spaceData.map.dropY },
          };
          debugLogger.state('FETCH_SPACE', prev, newState);
          return newState;
        });
      } catch (error) {
        debugLogger.error('fetchSpace', error);
        setGameState(prev => ({
          ...prev,
          error: "Failed to load space data",
        }));
      }
    };

    fetchSpace();
  }, [spaceId]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (isLoading || !spaceId || !user) return;

    const token = localStorage.getItem("token");
    if (!token) {
      debugLogger.error('socket', 'No token found');
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketUrl) {
      debugLogger.error('socket', 'Socket URL not found');
      return;
    }

    setIsConnecting(true);

    
    const newSocket = io(socketUrl, {
      auth: { spaceId, token, user },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    // Socket event handlers
    const socketEvents = {
      connect: () => {
        debugLogger.connection(user.id, spaceId);
        setGameState(prev => ({ ...prev, connected: true }));
        setIsConnecting(false);
      },

      initialize_space: (data: SocketResponse<{ users: User[]; currentUserId: string }>) => {
        debugLogger.socket('initialize_space', data);
        if (data.success) {
          setGameState(prev => ({
            ...prev,
            users: data.data!.users,
            currentUserId: data.data!.currentUserId,
          }));
        }
      },

      join_space: (data: SocketResponse<{ users: User[] }>) => {
        debugLogger.socket('join_space', data);
        if (data.success) {
          setGameState(prev => ({
            ...prev,
            users: data.data!.users,
          }));
        }
      },

      movementResult: (data: SocketResponse<{ newCoordinates: Position; users: User[] }>) => {
        debugLogger.socket('movementResult', data);
        if (data.success) {
          setGameState(prev => ({
            ...prev,
            position: {
              x:data.data!.newCoordinates.x,
              y:data.data!.newCoordinates.y
            },
            users: data.data!.users
          }));
        }
      },

      others_move: (data: SocketResponse<{ users: User[] }>) => {
        debugLogger.socket('others_move', data);
        if (data.success) {
          setGameState(prev => ({
            ...prev,
            users: data.data!.users,
          }));
        }
      },

      leave_space: (data: SocketResponse<{ users: User[]; id: string }>) => {
        debugLogger.socket('leave_space', data);
        if (data.success) {
          setGameState(prev => ({
            ...prev,
            users: data.data!.users,
          }));
        }
      },

      disconnect: () => {
        debugLogger.socket('disconnect', {});
        setGameState(prev => ({ ...prev, connected: false }));
        setIsConnecting(false);
      }
    };

    // Register all socket events
    Object.entries(socketEvents).forEach(([event, handler]) => {
      newSocket.on(event, handler);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [spaceId, user, isLoading]);

  const handleMovement = (newPosition: Position) => {
    if (!socket) return;
    debugLogger.socket('movement', newPosition);
    socket.emit("movement", newPosition);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isConnecting) {
    return <div>Connecting to space...</div>;
  }

  if (!gameState.connected) {
    return <div>Disconnected from space. Attempting to reconnect...</div>;
  }

  return (
    <Card className="virtual-space">
      <Canvas
        users={gameState.users}
        position={gameState.position}
        elements={gameState.elements}
        map={gameState.map}
        backgroundImageRef={backgroundImageRef}
        elementImagesRef={elementImagesRef}
        avatarImagesRef={avatarImagesRef}
        currentUserId={gameState.currentUserId}
        onMove={handleMovement}
      />
      {user && (
        <UserList 
          users={gameState.users} 
          currentUserId={user.id} 
        />
      )}
    </Card>
  );
};

export default VirtualSpace;