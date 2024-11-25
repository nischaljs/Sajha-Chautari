"use client";
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useParams } from "next/navigation";
import Canvas from "@/components/Canvas";
import { Card } from "@/components/ui/card";
import UserList from "@/components/UserList";
import { useUserContextState } from "@/context/UserContext";
import api from "@/utils/axiosInterceptor";
import { mapBaseUrl } from "@/utils/Links";
import {
  GameState,
  Position,
  SocketResponse,
  SpaceDetailsResponse,
  SpaceElement,
  SpaceElements,
  MapElement
} from "@/types/Space";
import { User } from "@/types/User";
import { Minimap } from "@/components/MiniMap";
import { MiniMapUser } from "@/components/MiniMapUser";

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

// Helper function to transform elements to the correct type
const transformElements = (
  mapElements: MapElement[] = [],
  spaceElements: SpaceElement[] = []
): SpaceElements[] => {
  const transformElement = (element: MapElement | SpaceElement): SpaceElements => {
    const baseElement = 'element' in element ? element.element : element;
    return {
      id: element.id,
      x: element.x,
      y: element.y,
      width: baseElement.width,
      height: baseElement.height,
      imageUrl: baseElement.imageUrl,
      static: baseElement.static,
      name: baseElement.name,
    };
  };

  return [
    ...mapElements.map(transformElement),
    ...spaceElements.map(transformElement)
  ];
};

const VirtualSpace: React.FC = () => {
  const params = useParams();
  const spaceId = params.spaceId ? String(params.spaceId) : null;
  const { user, isLoading } = useUserContextState();
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);

  // Preload background image
  const preloadBackgroundImage = (spaceData: SpaceDetailsResponse) => {
    if (!spaceData.map.thumbnail) return;
    const image = new Image();
    image.src = `${mapBaseUrl}${spaceData.map.thumbnail}`;
    image.alt = spaceData.map.name;
    image.onload = () => {
      backgroundImageRef.current = image;
      console.log("Background image loaded:", image.src);
    };
  };

  // Fetch space details
  useEffect(() => {
    const fetchSpace = async () => {
      if (!spaceId) return;
      try {
        const response = await api.get<{ data: SpaceDetailsResponse }>(`/arenas/${spaceId}`);
        const spaceData = response.data.data;
        console.log('spaceData',spaceData);
        preloadBackgroundImage(spaceData);

        const transformedElements = transformElements(
          spaceData.map.mapElements,
          spaceData.elements
        );

        setGameState((prev) => ({
          ...prev,
          spaceDetails: spaceData,
          map: spaceData.map,
          elements: transformedElements,
          position: { x: spaceData.map.dropX, y: spaceData.map.dropY },
          connected: true,
          error: "",
        }));
      } catch (error) {
        console.error("Failed to fetch space details:", error);
        setGameState((prev) => ({ ...prev, error: "Failed to load space data." }));
      }
    };

    fetchSpace();
  }, [spaceId]);

  // WebSocket connection and event handling
  useEffect(() => {
    if (socket || isLoading || !spaceId || !user) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketUrl || !localStorage.getItem("token")) return;

    setIsConnecting(true);

    const newSocket = io(socketUrl, {
      auth: {
        spaceId,
        token: localStorage.getItem("token"),
        user,
      },
      reconnection: true,
    });

    const socketEvents = {
      connect: () => {
        console.log("WebSocket connected");
        setGameState((prev) => ({ ...prev, connected: true }));
        setIsConnecting(false);
      },
      initialize_space: (data: SocketResponse<{ users: User[]; currentUserId: string }>) => {
        if (data.success) {
          setGameState((prev) => ({
            ...prev,
            users: data.data!.users,
            currentUserId: data.data!.currentUserId,
          }));
        }
      },
      movementResult: (data: SocketResponse<{ newCoordinates: Position; users: User[] }>) => {
        if (data.success) {
          setGameState((prev) => ({
            ...prev,
            position: data.data!.newCoordinates,
            users: data.data!.users,
          }));
        }
      },
      others_move: (data: SocketResponse<{ newCoordinates: Position; movedUserId: string }>) => {
        if (data.success) {
          setGameState((prev) => ({
            ...prev,
            users: prev.users.map(user =>
              user.id === data.data!.movedUserId
                ? { ...user, position: data.data!.newCoordinates }
                : user
            ),
          }));
        }
      },
      disconnect: () => {
        console.log("WebSocket disconnected");
        setGameState((prev) => ({ ...prev, connected: false }));
        setIsConnecting(false);
      },
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
    if (!socket || !gameState.connected) return;

    socket.emit("movement", {
      x: newPosition.x,
      y: newPosition.y,
      timestamp: Date.now(),
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (isConnecting) return <div>Connecting to space...</div>;
  if (!gameState.connected) return <div>Disconnected from space...</div>;

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

      {gameState.map && backgroundImageRef.current && (
        <MiniMapUser
          canvasWidth={gameState.map.width}
          canvasHeight={gameState.map.height}
          viewportWidth={window.innerWidth}
          viewportHeight={window.innerHeight}
          position={gameState.position}
          elements={gameState.elements}
          users={gameState.users}
          currentUserId={gameState.currentUserId}
          backgroundColor={`url(${backgroundImageRef.current.src})`}
        />
      )}
      {user && <UserList users={gameState.users} currentUserId={user.id} />}
    </Card>
  );
};

export default VirtualSpace;