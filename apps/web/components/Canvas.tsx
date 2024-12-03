import { Position, SpaceElements, User } from "@/types/Space";
import { avatarsBaseUrl, objectsBaseUrl } from "@/utils/Links";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface CanvasProps {
  users: User[];
  position: Position;
  elements: SpaceElements[];
  map: { width: number; height: number } | null;
  backgroundImageRef: React.RefObject<HTMLImageElement | null>;
  currentUserId: string;
  onMove: (newPosition: Position) => void;
}

const VIEWPORT_WIDTH = window.innerWidth;
const VIEWPORT_HEIGHT = window.innerHeight;
const CHARACTER_SIZE = 100;
const MOVEMENT_SPEED = 5;

const Canvas: React.FC<CanvasProps> = ({
  users,
  position,
  elements,
  map,
  backgroundImageRef,
  currentUserId,
  onMove,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>();
  const keysPressed = useRef<Set<string>>(new Set());
  const elementImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const userAvatarsRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload element images
  useEffect(() => {
    let loadedCount = 0;
    const totalImages = elements.length;

    elements.forEach((element) => {
      if (!elementImagesRef.current.has(element.id)) {
        const img = new Image();
        img.src = objectsBaseUrl + element.imageUrl;
        img.onload = () => {
          elementImagesRef.current.set(element.id, img);
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
        };
        img.onerror = () => {
          console.error(`Failed to load image for element: ${element.id}`);
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
        };
      }
    });

    // If there are no elements, set imagesLoaded to true
    if (totalImages === 0) {
      setImagesLoaded(true);
    }
  }, [elements]);

  // Preload user avatars
  useEffect(() => {
    users.forEach((user) => {
      if (user.avatar?.imageUrl && !userAvatarsRef.current.has(user.id)) {
        const img = new Image();
        img.src = `${avatarsBaseUrl}${user.avatar.imageUrl}`;
        img.onload = () => {
          userAvatarsRef.current.set(user.id, img);
        };
        img.onerror = () => {
          console.error(`Failed to load avatar for user: ${user.id}`);
        };
      }
    });
  }, [users]);

  const calculateCameraOffset = useCallback((playerPos: Position) => {
    if (!map) return { x: 0, y: 0 };
    return {
      x: Math.max(0, Math.min(playerPos.x - VIEWPORT_WIDTH / 2, map.width - VIEWPORT_WIDTH)),
      y: Math.max(0, Math.min(playerPos.y - VIEWPORT_HEIGHT / 2, map.height - VIEWPORT_HEIGHT)),
    };
  }, [map]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;

    canvas.width = VIEWPORT_WIDTH;
    canvas.height = VIEWPORT_HEIGHT;

    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.key.toLowerCase());
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key.toLowerCase());

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [map]);
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !map || !canvas || !imagesLoaded) return;
  
    const currentUser = users.find((u) => u.id === currentUserId);
    if (!currentUser?.position) return;
  
    const cameraOffset = calculateCameraOffset(currentUser.position);
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    ctx.save();
    ctx.translate(-cameraOffset.x, -cameraOffset.y);
  
    // Draw background
    if (backgroundImageRef.current) {
      ctx.drawImage(backgroundImageRef.current, 0, 0, map.width, map.height);
    }
  
    // Draw elements with their images
    elements.forEach((element) => {
      const elementImage = elementImagesRef.current.get(element.id);
      if (elementImage) {
        ctx.drawImage(
          elementImage,
          element.x,
          element.y,
          element.width,
          element.height
        );
      } else {
        ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
        ctx.fillRect(element.x, element.y, element.width, element.height);
      }
    });
  
    // Draw users
    users.forEach((user) => {
      if (!user.position) return;
  
      ctx.save();
      ctx.translate(user.position.x, user.position.y);
  
      const avatar = userAvatarsRef.current.get(user.id);
      if (avatar) {
        ctx.drawImage(
          avatar,
          -CHARACTER_SIZE / 2,
          -CHARACTER_SIZE / 2,
          CHARACTER_SIZE,
          CHARACTER_SIZE
        );
      } else {
        ctx.beginPath();
        ctx.fillStyle = user.id === currentUserId ? "#4CAF50" : "#2196F3";
        ctx.arc(0, 0, CHARACTER_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
      }
  
      ctx.fillStyle = "red";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(user.nickname, 0, -CHARACTER_SIZE / 2 - 5);
  
      ctx.restore();
    });
  
    ctx.restore();
  
    // Calculate movement based on key presses
    let moveX = 0;
    let moveY = 0;
  
    if (keysPressed.current.has("w") || keysPressed.current.has("arrowup")) moveY -= MOVEMENT_SPEED;
    if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown")) moveY += MOVEMENT_SPEED;
    if (keysPressed.current.has("a") || keysPressed.current.has("arrowleft")) moveX -= MOVEMENT_SPEED;
    if (keysPressed.current.has("d") || keysPressed.current.has("arrowright")) moveX += MOVEMENT_SPEED;
  
    if (moveX !== 0 || moveY !== 0) {
      const newPos = {
        x: Math.max(CHARACTER_SIZE / 2, Math.min(currentUser.position.x + moveX, map.width - CHARACTER_SIZE / 2)),
        y: Math.max(CHARACTER_SIZE / 2, Math.min(currentUser.position.y + moveY, map.height - CHARACTER_SIZE / 2)),
      };
  
      // Check for collisions
      const isCollidingWithElement = elements.some((element) => {
        return (
          newPos.x + CHARACTER_SIZE / 2 > element.x &&
          newPos.x - CHARACTER_SIZE / 2 < element.x + element.width &&
          newPos.y + CHARACTER_SIZE / 2 > element.y &&
          newPos.y - CHARACTER_SIZE / 2 < element.y + element.height
        );
      });
  
      const isCollidingWithUser = users.some((user) => {
        if (user.id === currentUserId || !user.position) return false;
        const distX = newPos.x - user.position.x;
        const distY = newPos.y - user.position.y;
        const distance = Math.sqrt(distX * distX + distY * distY);
        return distance < CHARACTER_SIZE; // Collision if distance is less than character size
      });
  
      if (!isCollidingWithElement && !isCollidingWithUser) {
        onMove(newPos);
      }
    }
  
    animationFrameRef.current = requestAnimationFrame(render);
  }, [users, elements, map, currentUserId, onMove, calculateCameraOffset, backgroundImageRef, imagesLoaded]);
  

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="bg-gray-900"
        style={{
          width: VIEWPORT_WIDTH,
          height: VIEWPORT_HEIGHT,
        }}
      />
      <div className="absolute bottom-4 left-4 text-white bg-black/50 rounded p-2">
        <p>Use WASD or arrow keys to move</p>
      </div>
    </div>
  );
};

export default Canvas;

