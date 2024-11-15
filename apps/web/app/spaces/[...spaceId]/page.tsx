"use client";
import React, { useEffect, useRef, useState } from "react";
import Canvas from "@/components/Canvas";
import { Card } from "@/components/ui/card";
import UserList from "@/components/UserList";
import {
  Map,
  Position,
  SpaceDetailsResponse,
  SpaceElement,
  User,
} from "@/types/Space";
import api from "@/utils/axiosInterceptor";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useUserContext } from "@/context/UserContext";

const VirtualSpace: React.FC = () => {
  const params = useParams();
  const spaceId = params.spaceId ? String(params.spaceId) : null;
  const user = useUserContext();

  const [gameState, setGameState] = useState<{
    users: User[];
    position: Position;
    connected: boolean;
    error: string;
    map: Map | null;
    elements: SpaceElement[];
    spaceDetails: SpaceDetailsResponse | null;
    currentUserId: string;
  }>({
    users: [],
    position: { x: 0, y: 0 },
    connected: false,
    error: "",
    map: null,
    elements: [],
    spaceDetails: null,
    currentUserId: "",
  });

  const [socket, setSocket] = useState<Socket | null>(null);

  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const elementImagesRef = useRef<globalThis.Map<string, HTMLImageElement>>(
    new globalThis.Map()
  );
  const avatarImagesRef = useRef<globalThis.Map<string, HTMLImageElement>>(
    new globalThis.Map()
  );

  // Fetch initial space data
  useEffect(() => {
    if (spaceId) {
      const fetchSpace = async () => {
        try {
          const response = await api.get<{ data: SpaceDetailsResponse }>(
            `/arenas/${spaceId}`
          );
          const spaceData = response.data.data;
          setGameState((prev) => ({
            ...prev,
            spaceDetails: spaceData,
            map: spaceData.map,
            elements: spaceData.elements,
            position: { x: spaceData.map.dropX, y: spaceData.map.dropY },
          }));
        } catch (error) {
          console.error("Error fetching space data:", error);
          setGameState((prev) => ({
            ...prev,
            error: "Failed to load space data",
          }));
        }
      };
      fetchSpace();
    }
  }, [spaceId]);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (spaceId && token) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
      if (!socketUrl) {
        console.error("Socket URL not found");
        setGameState((prev) => ({
          ...prev,
          error: "Socket URL not found",
        }));
        return;
      }

      const newSocket = io(socketUrl, {
        auth: { spaceId, token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
      setSocket(newSocket);

      // Handle WebSocket events
      newSocket.on("connect", () => {
        console.log("Socket connected");
        setGameState((prev) => ({ ...prev, connected: true }));
      });

      newSocket.on("initialize_space", (data) => {
        if (data.success) {
          setGameState((prev) => ({
            ...prev,
            users: data.users,
            currentUserId: data.currentUserId,
          }));
        } else {
          console.error("Failed to initialize space:", data.error);
        }
      });

      newSocket.on("join_space", (data) => {
        if (data.success) {
          setGameState((prev) => ({
            ...prev,
            users: data.users,
          }));
        }
      });

      newSocket.on("others_move", (data) => {
        if (data.success) {
          setGameState((prev) => ({
            ...prev,
            users: data.users,
          }));
        } else {
          console.error("Error in others_move event:", data.error);
        }
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setGameState((prev) => ({ ...prev, connected: false }));
      });

      return () => {
        console.log("Disconnecting socket");
        newSocket.disconnect();
      };
    }
  }, [spaceId]);

  // Handle movement events from the Canvas component
  const handleMovement = (newPosition: Position) => {
    if (socket) {
      socket.emit("movement", newPosition);
    }
  };

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
      <div>
        {user ? (<UserList users={gameState.users} currentUserId={user?.id} />) :null}
      </div>
    </Card>
  );
};

export default VirtualSpace;
