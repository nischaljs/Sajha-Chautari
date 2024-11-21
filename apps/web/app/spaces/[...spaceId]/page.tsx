"use client";
import Canvas from "@/components/Canvas";
import { Minimap } from "@/components/MiniMap";
import { Card } from "@/components/ui/card";
import UserList from "@/components/UserList";
import { useUserContextState } from "@/context/UserContext";
import {
  GameState,
  Position,
  SocketResponse,
  SpaceDetailsResponse
} from "@/types/Space";
import { User } from "@/types/User";
import api from "@/utils/axiosInterceptor";
import { mapBaseUrl } from "@/utils/Links";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const initialGameState: GameState = {
  users: [],
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
  const lastMovementRef = useRef<{ position: Position; timestamp: number } | null>(null);

  const backgroundImageRef = useRef<HTMLImageElement | null>(null);


  // Fetch initial space data
  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const response = await api.get<{ data: SpaceDetailsResponse }>(`/arenas/${spaceId}`);
        const spaceData = response.data.data;
        console.log("space datas", spaceData);
        preloadBackgroundImage(spaceData);
        const combinedElements = [
          ...(spaceData.map.mapElements || []),
          ...(spaceData.elements || [])
        ];
        const transformedUsers = spaceData.users.map((user) => ({
          id: user.id,
          email: user.email || "unknown@example.com", // Provide a default value if email is missing
          nickname: user.nickname,
          avatarId: user.avatarId || undefined, // Convert `null` to `undefined`
          position: user.position || { x: spaceData.map.dropX, y: spaceData.map.dropY }, // Default position if missing
          avatar: user.avatar
            ? {
              id: user.avatar.id || "unknown", // Handle missing `id`
              imageUrl: user.avatar.imageUrl || undefined, // Convert `null` to `undefined`
              name: user.avatar.name || "Unnamed Avatar", // Provide a default name
            }
            : undefined, // Handle missing `avatar`
        }));

        setGameState((prev) => ({
          ...prev,
          spaceDetails: spaceData,
          map: spaceData.map,
          elements: combinedElements || [],
          position: { x: spaceData.map.dropX, y: spaceData.map.dropY },
          users: transformedUsers, // Use transformed users
          connected: true,
          error: "",
          currentUserId: prev.currentUserId, // Preserve the current user ID
        }));
      } catch (error) {
        console.error("Failed to fetch space details:", error);
        setGameState((prev) => ({
          ...prev,
          error: "Failed to load space data.",
        }));
      }
    };


    fetchSpace();
  }, [spaceId]);

  function preloadBackgroundImage(spaceData: SpaceDetailsResponse) {
    if (!spaceData.map.thumbnail) return;
    const image = new Image();
    image.src = `${mapBaseUrl}${spaceData.map.thumbnail}`;
    image.alt = `${spaceData.map.name}`;
    image.width = spaceData.map.width;
    image.height = spaceData.map.height;
    image.onload = () => {
      backgroundImageRef.current = image;
      console.log("background images loaded ", backgroundImageRef);
    }
  }


  // Initialize WebSocket connection
  useEffect(() => {
    if (isLoading || !spaceId || !user) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketUrl || !localStorage.getItem("token")) return;

    setIsConnecting(true);

    const newSocket = io(socketUrl, {
      auth: {
        spaceId,
        token: localStorage.getItem("token"),
        user
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    const socketEvents = {
      connect: () => {
        setGameState(prev => ({ ...prev, connected: true }));
        setIsConnecting(false);
      },

      initialize_space: (data: SocketResponse<{ users: User[]; currentUserId: string }>) => {
        if (data.success) {
          setGameState(prev => ({
            ...prev,
            users: data.data!.users.map(u => ({
              ...u,
              position: u.position || { x: prev.map?.dropX || 0, y: prev.map?.dropY || 0 }
            })),
            currentUserId: data.data!.currentUserId,
          }));
        }
      },

      movementResult: (data: SocketResponse<{ newCoordinates: Position; users: User[]; timestamp: number }>) => {
        if (data.success) {
          // Only update if this is the most recent move or server override
          const shouldUpdate = !lastMovementRef.current ||
            data.data!.timestamp >= lastMovementRef.current.timestamp;

          if (shouldUpdate) {
            setGameState(prev => {
              const updatedUsers = data.data!.users.map(u => {
                if (u.id === prev.currentUserId) {
                  return {
                    ...u,
                    position: data.data!.newCoordinates,
                    lastMoveTimestamp: data.data!.timestamp
                  };
                }
                return u;
              });

              return {
                ...prev,
                position: data.data!.newCoordinates,
                users: updatedUsers
              };
            });
          }
        } else {
          // Revert to last known good position on failure
          if (lastMovementRef.current) {
            setGameState(prev => ({
              ...prev,
              position: lastMovementRef.current!.position,
              users: prev.users.map(u => {
                if (u.id === prev.currentUserId) {
                  return {
                    ...u,
                    position: lastMovementRef.current!.position
                  };
                }
                return u;
              })
            }));
          }
        }
      },

      others_move: (data: SocketResponse<{ newCoordinates: Position; timestamp: number; movedUserId: string; }>) => {
        console.log('other moved')
        if (data.success) {
          setGameState(prev => ({
            ...prev,
            users: prev.users.map(user =>
              user.id === data.data!.movedUserId
                ? { ...user, position: data.data!.newCoordinates }
                : user
            ),
          }));
        }
      },

      join_space: (data: SocketResponse<{ user: User }>) => {
        console.log('someone joined the space', user)
        if (data.success) {
          setGameState(prev => ({
            ...prev,
            users: [...prev.users, data.data!.user],
          }));

        }
      },

      leave_space: (data: SocketResponse<{ id: string }>) => {
        if (data.success) {
          setGameState(prev => ({
            ...prev,
            users: prev.users.filter((user) => user.id != data.data!.id),
          }))
        }
      },

      disconnect: () => {
        setGameState(prev => ({ ...prev, connected: false }));
        setIsConnecting(false);
      }
    };

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
    console.log("hanele movement")
    if (!socket || !gameState.map || !gameState.connected) return;

    const { width, height } = gameState.map;

    // Validate boundaries
    if (newPosition.x < 0 || newPosition.x > width ||
      newPosition.y < 0 || newPosition.y > height) {
      return;
    }

    const moveTimestamp = Date.now();
    lastMovementRef.current = {
      position: newPosition,
      timestamp: moveTimestamp
    };

    // Update local state immediately for smooth movement
    setGameState(prev => {
      const updatedUsers = prev.users.map(u =>
        u.id === prev.currentUserId
          ? {
            ...u,
            position: newPosition,
            lastMoveTimestamp: moveTimestamp
          }
          : u
      );

      return {
        ...prev,
        position: newPosition,
        users: updatedUsers
      };
    });
    console.log('movement got emitted');

    // Emit movement to server
    socket.emit("movement", {
      x: newPosition.x,
      y: newPosition.y,
      timestamp: moveTimestamp
    });
  };


  useEffect(() => {
    console.log("GameState updated:", gameState);
  }, [gameState]);

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
    <Card className="virtual-space relative">
      <Canvas
        users={gameState.users}
        position={gameState.position}
        elements={gameState.elements}
        map={gameState.map}
        backgroundImageRef={backgroundImageRef}
        currentUserId={gameState.currentUserId}
        onMove={handleMovement}
      />
      {gameState.map && (
        <Minimap
          canvasWidth={gameState.map.width}
          canvasHeight={gameState.map.height}
          viewportWidth={window.innerWidth}
          viewportHeight={window.innerHeight}
          position={gameState.position}
          backgroundColor="#fff"
          // elements={gameState.elements}
          onPositionChange={handleMovement}
        />
      )}
      {user && (
        <UserList
          users={gameState.users}
          currentUserId={user.id}
        />
      )}
    </Card>
  );

}

export default VirtualSpace;