"use client";
import Canvas from "@/components/Canvas";
import { MiniMapUser } from "@/components/MiniMapUser";
import { Card } from "@/components/ui/card";
import UserList from "@/components/UserList";
import { useUserContextState } from "@/context/UserContext";
import {
  GameState,
  MapElement,
  Position,
  SocketResponse,
  SpaceDetailsResponse,
  SpaceElement,
  SpaceElements
} from "@/types/Space";
import { User } from "@/types/User";
import api from "@/utils/axiosInterceptor";
import { mapBaseUrl } from "@/utils/Links";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const spaceId = params.spaceId ? String(params.spaceId) : null;
  const { user, isLoading } = useUserContextState();
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string>("");
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);

  // Preload background image
  const preloadBackgroundImage = (spaceData: SpaceDetailsResponse) => {
    if (!spaceData.map.thumbnail) return;
    const image = new Image();
    image.src = `${mapBaseUrl}${spaceData.map.thumbnail}`;
    image.alt = spaceData.map.name;
    image.onload = () => {
      backgroundImageRef.current = image;
    };
    image.onerror = () => {
      console.error("Failed to load background image");
    };
  };

  // Fetch space details
  useEffect(() => {
    const fetchSpace = async () => {
      if (!spaceId) return;
      try {
        const response = await api.get<{ data: SpaceDetailsResponse }>(`/arenas/${spaceId}`);
        const spaceData = response.data.data;
        console.log('Space data loaded:', spaceData);
    
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
          error: "",
        }));
      } catch (error) {
        console.error("Failed to load space data:", error);
        setGameState((prev) => ({ ...prev, error: "Failed to load space data." }));
        setConnectionError("Failed to load space data. Please try again.");
      }
    };

    fetchSpace();
  }, [spaceId]);

  // WebSocket connection and event handling
  useEffect(() => {
    if (socket || isLoading || !spaceId || !user) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    const token = localStorage.getItem("token");
    
    if (!socketUrl || !token) {
      setConnectionError("Missing socket URL or authentication token");
      return;
    }

    setIsConnecting(true);
    setConnectionError("");

    console.log("Connecting to socket with:", { socketUrl, spaceId, user: user.id });

    const newSocket = io(socketUrl, {
      auth: {
        spaceId,
        token,
        user,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socketEvents = {
      connect: () => {
        console.log("Socket connected successfully");
        setGameState((prev) => ({ ...prev, connected: true, error: "" }));
        setIsConnecting(false);
        setConnectionError("");
      },
      
      connect_error: (error: any) => {
        console.error("Socket connection error:", error);
        setConnectionError("Failed to connect to the space. Please check your connection.");
        setIsConnecting(false);
      },
      
      initialize_space: (data: SocketResponse<{ users: User[]; currentUserId: string }>) => {
        console.log("Space initialized:", data);
        if (data.success && data.data) {
          setGameState((prev) => ({
            ...prev,
            users: data.data!.users,
            currentUserId: data.data!.currentUserId,
          }));
        }
      },
      
      movementResult: (data: SocketResponse<{ newCoordinates: Position; users: User[] }>) => {
        if (data.success && data.data) {
          setGameState((prev) => ({
            ...prev,
            position: data.data!.newCoordinates,
            users: data.data!.users,
          }));
        } else {
          console.warn("Movement failed:", data.message);
        }
      },
      
      others_move: (data: SocketResponse<{ newCoordinates: Position; movedUserId: string }>) => {
        if (data.success && data.data) {
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
      
      user_joined: (data: SocketResponse<{ user: User; users: User[] }>) => {
        if (data.success && data.data) {
          setGameState((prev) => ({
            ...prev,
            users: data.data!.users,
          }));
        }
      },
      
      user_left: (data: SocketResponse<{ userId: string; users: User[] }>) => {
        if (data.success && data.data) {
          setGameState((prev) => ({
            ...prev,
            users: data.data!.users,
          }));
        }
      },
      
      disconnect: (reason: string) => {
        console.log("Socket disconnected:", reason);
        setGameState((prev) => ({ ...prev, connected: false }));
        setIsConnecting(false);
        if (reason === "io server disconnect") {
          // Server disconnected the socket, try to reconnect
          newSocket.connect();
        }
      },
    };

    Object.entries(socketEvents).forEach(([event, handler]) => {
      newSocket.on(event, handler);
    });

    setSocket(newSocket);

    return () => {
      console.log("Cleaning up socket connection");
      newSocket.disconnect();
      setSocket(null);
    };
  }, [spaceId, user, isLoading]);

  const handleMovement = (newPosition: Position) => {
    if (!socket || !gameState.connected) {
      console.warn("Cannot move: socket not connected");
      return;
    }

    socket.emit("movement", {
      x: newPosition.x,
      y: newPosition.y,
      timestamp: Date.now(),
    });
  };

  // Loading states
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Connection Error</div>
          <p className="text-gray-600 mb-4">{connectionError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-lg">Connecting to space...</p>
        </div>
      </div>
    );
  }

  if (!gameState.connected && !isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 text-xl mb-4">Disconnected</div>
          <p className="text-gray-600 mb-4">Lost connection to the space</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reconnect
          </button>
        </div>
      </div>
    );
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