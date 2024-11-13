'use client'


import Canvas from "@/components/Canvas";
import { Card } from "@/components/ui/card";
import UserList from "@/components/UserList";
import { Map, Position, SpaceDetailsResponse, SpaceElement, User } from "@/types/Space";
import api from "@/utils/axiosInterceptor";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
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
  const elementImagesRef = useRef<globalThis.Map<string, HTMLImageElement>>(new globalThis.Map());
  const avatarImagesRef = useRef<globalThis.Map<string, HTMLImageElement>>(new globalThis.Map());
  const DEFAULT_AVATAR_URL = '/api/placeholder/32/32'

  useEffect(() => {
    if (spaceId) {
      const fetchSpace = async () => {
        try {
          console.log("Fetching space data...");
          const response = await api.get<{ data: SpaceDetailsResponse }>(`/arenas/${spaceId}`);
          const spaceData = response.data.data;
          console.log("Space data fetched:", spaceData);
          setGameState((prev) => ({
            ...prev,
            spaceDetails: spaceData,
            map: spaceData.map,
            elements: spaceData.elements,
            position: { x: spaceData.map.dropX, y: spaceData.map.dropY },
          }));
        } catch (error) {
          console.error("Failed to load space data:", error);
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
      console.log("Loading images...");
      loadImages();
    }
  }, [gameState.map, gameState.elements]);

  const loadImages = async () => {
    if (!gameState.map?.thumbnail) return;

    console.log("Loading background image...");
    const bgImage = new Image();
    bgImage.src = gameState.map.thumbnail;
    await new Promise((resolve) => (bgImage.onload = resolve));
    backgroundImageRef.current = bgImage;

    console.log("Loading element images...");
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

    console.log("Loading user avatar images...");
    const loadUserAvatar = async (user: User) => {
      if (!avatarImagesRef.current.has(user.id) && user.avatar?.imageUrl) {
        const img = new Image();
        img.src = user.avatar.imageUrl || DEFAULT_AVATAR_URL;
        await new Promise((resolve) => (img.onload = resolve));
        avatarImagesRef.current.set(user.id, img);
      }
    };
    await Promise.all(gameState.users.map(loadUserAvatar));

    console.log("All images loaded, drawing scene...");
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

      console.log("Connecting to socket...");
      const ws = io(socketUrl, {
        auth: {
          token: token,
          spaceId: spaceId,
        },
      });

      ws.on("connect", () => {
        console.log("Connected to socket");
        setGameState((prev) => ({
          ...prev,
          connected: true,
        }));
      });

      ws.on("initialize_space", (data: { success: boolean; users: User[]; currentUserId: string }) => {
        if (data.success) {
          console.log("Space initialized:", data);
          setGameState((prev) => ({
            ...prev,
            users: data.users,
            connected: true,
            currentUserId: data.currentUserId,
          }));
        } else {
          console.error("Failed to initialize space:", data);
        }
      });

      ws.on("join_space", (data: { success: boolean; users: User }) => {
        if (data.success) {
          console.log("User joined the space:", data);
          setGameState((prev) => ({
            ...prev,
            users: [...prev.users, data.users],
          }));
        } else {
          console.error("Failed to join space:", data);
        }
      });

      ws.on("leave_space", (data: { success: boolean; id: string }) => {
        if (data.success) {
          console.log("User left the space:", data);
          setGameState((prev) => ({
            ...prev,
            users: prev.users.filter((user) => user.id !== data.id),
          }));
        } else {
          console.error("Failed to leave space:", data);
        }
      });

      ws.on("movementResult", (data: { success: boolean; newCoordinates: Position; message?: string }) => {
        if (data.success) {
          console.log("Movement successful:", data);
          setGameState((prev) => ({
            ...prev,
            position: data.newCoordinates,
          }));
        } else {
          console.error("Movement failed:", data);
          setGameState((prev) => ({
            ...prev,
            error: data.message || "Movement failed",
          }));
        }
      });

      ws.on("disconnect", () => {
        console.log("Disconnected from socket");
        setGameState((prev) => ({
          ...prev,
          connected: false,
        }));
      });

      setSocket(ws);

      return () => {
        console.log("Disconnecting from socket...");
        ws.disconnect();
      };
    }
  }, [spaceId]);



  
  return (
    <Card className="p-6 mx-auto relative">
      <div className="space-y-4">
        {gameState.connected ? (
          <>
            <div className="text-lg font-bold mb-4">
              Space: {gameState.spaceDetails?.name || spaceId}
            </div>
            <Canvas
              map={gameState.map}
              elements={gameState.elements}
              users={gameState.users}
              position={gameState.position}
              backgroundImageRef={backgroundImageRef}
              elementImagesRef={elementImagesRef}
              avatarImagesRef={avatarImagesRef}
              socket={socket}
            />
            {gameState.error && (
              <div className="text-red-500 text-center p-2 bg-red-50 rounded">
                {gameState.error}
              </div>
            )}
            <UserList users={gameState.users} currentUserId={gameState.currentUserId} />
          </>
        ) : (
          <div className="text-center py-4">Connecting...</div>
        )}
      </div>
    </Card>
  );
};

export default VirtualSpace;