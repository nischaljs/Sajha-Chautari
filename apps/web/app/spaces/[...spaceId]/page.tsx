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

const VirtualSpace: React.FC = () => {
  const params = useParams();
  const spaceId = params.spaceId ? String(params.spaceId) : null;
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
  const DEFAULT_AVATAR_URL =
    "https://cdn.pixabay.com/photo/2024/02/15/14/57/animal-8575560_640.jpg";

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

  useEffect(() => {
    if (gameState.map) {
      loadImages();
    }
  }, [gameState.map, gameState.elements]);

  const loadImages = async () => {
    if (!gameState.map?.thumbnail) return;

    const bgImage = new Image();
    bgImage.src = gameState.map.thumbnail;
    await new Promise((resolve) => (bgImage.onload = resolve));
    backgroundImageRef.current = bgImage;

    const loadImage = async (element: SpaceElement) => {
      if (!elementImagesRef.current.has(element.id)) {
        const img = new Image();
        img.src = element.element.imageUrl;
        await new Promise((resolve) => (img.onload = resolve));
        elementImagesRef.current.set(element.id, img);
      }
    };
    await Promise.all([
      ...gameState.elements.map(loadImage),
      ...gameState.map.mapElements.map(loadImage),
    ]);

    const loadUserAvatar = async (user: User) => {
      if (!avatarImagesRef.current.has(user.id) && user.avatar?.imageUrl) {
        const img = new Image();
        img.src = user.avatar.imageUrl || DEFAULT_AVATAR_URL;
        await new Promise((resolve) => (img.onload = resolve));
        avatarImagesRef.current.set(user.id, img);
      }
    };
    await Promise.all(gameState.users.map(loadUserAvatar));
  };

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
      });
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Socket connected");
        setGameState((prev) => ({ ...prev, connected: true }));
      });

      newSocket.on("initialize_space", (data) => {
        if (data.success) {
          console.log("Initialized space with users:", data.users);
          setGameState((prev) => ({
            ...prev,
            users: data.users,
            currentUserId: data.currentUserId,
          }));
        } else {
          console.error("Failed to initialize space:", data.error);
        }
      });

      newSocket.on("movementResult", (data) => {
        console.log("Movement result:", data);
        if (data.success) {
          setGameState((prev) => ({
            ...prev,
            position: data.newCoordinates,
            users: Array.from(data.users.values()),
          }));
        } else {
          console.error("Movement failed:", data.message);
        }
      });

      newSocket.on("others_move", (data) => {
        if (data.success) {
          console.log("Others moved:", data.users);
          setGameState((prev) => ({
            ...prev,
            users: Array.from(data.users.values()),
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
      <UserList users={gameState.users} />
    </Card>
  );
};

export default VirtualSpace;