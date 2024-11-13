
import React, { useRef, useEffect } from "react";
import { Map, SpaceElement, User, Position } from "@/types/Space";
import { Socket } from "socket.io-client";

const TILE_SIZE = 32;
const MOVE_STEP = 32;

interface CanvasProps {
  map: Map | null;
  elements: SpaceElement[];
  users: User[];
  position: Position;
  backgroundImageRef: React.RefObject<HTMLImageElement>;
  elementImagesRef: React.RefObject<globalThis.Map<string, HTMLImageElement>> | null;
  avatarImagesRef: React.RefObject<globalThis.Map<string, HTMLImageElement>> | null;
  socket:Socket | null
}

const Canvas: React.FC<CanvasProps> = ({
  map,
  elements,
  users,
  position,
  backgroundImageRef,
  elementImagesRef,
  avatarImagesRef,
  socket
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const DEFAULT_AVATAR_URL: CanvasImageSource = new Image();
  DEFAULT_AVATAR_URL.src = "https://mdn.github.io/shared-assets/images/examples/rhino.jpg";
  


  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) contextRef.current = ctx;
    }
  }, []);

  useEffect(() => {
    if (contextRef.current && map && backgroundImageRef.current) {
      console.log("Drawing scene...");
      drawScene();
    }
  }, [map, elements, users, position, backgroundImageRef, elementImagesRef, avatarImagesRef]);


  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': handleMovement('up'); break;
        case 'ArrowDown': case 's': handleMovement('down'); break;
        case 'ArrowLeft': case 'a': handleMovement('left'); break;
        case 'ArrowRight': case 'd': handleMovement('right'); break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);


  const handleMovement = (direction: 'up' | 'down' | 'left' | 'right') => {
    console.log("You moved in direction :",direction);
    const newPosition = { ...position };
    switch (direction) {
      case 'up': newPosition.y = Math.max(0, newPosition.y - MOVE_STEP); break;
      case 'down': newPosition.y = Math.min((map?.height || 0) - TILE_SIZE, newPosition.y + MOVE_STEP); break;
      case 'left': newPosition.x = Math.max(0, newPosition.x - MOVE_STEP); break;
      case 'right': newPosition.x = Math.min((map?.width || 0) - TILE_SIZE, newPosition.x + MOVE_STEP); break;
    }
    console.log("new position now ", newPosition);

    if (isValidPosition(newPosition)) {
        socket?.emit('movement', newPosition);
        console.log("You emitted the movement event")
    }
  };

  const isValidPosition = (position: Position): boolean => {
    if (!map) return false;

    if (
      position.x < 0 ||
      position.x > map.width - TILE_SIZE ||
      position.y < 0 ||
      position.y > map.height - TILE_SIZE
    ) {
      return false;
    }

    const collision = [...map.mapElements, ...elements].some(element => {
      if (!element.element.static) return false;
      return (
        position.x < element.x + element.element.width &&
        position.x + TILE_SIZE > element.x &&
        position.y < element.y + element.element.height &&
        position.y + TILE_SIZE > element.y
      );
    });

    console.log("did you collides", collision);
    return !collision;
  };



  const drawScene = () => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (!context || !canvas || !map) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(backgroundImageRef.current!, 0, 0, canvas.width, canvas.height);

    [...map.mapElements, ...elements].forEach((element) => {
      const elementImage = elementImagesRef?.current?.get(element.id);
      if (elementImage) {
        context.drawImage(
          elementImage,
          element.x,
          element.y,
          element.element.width,
          element.element.height
        );
      }
    });

    users.forEach((user) => {
      const userAvatar = avatarImagesRef?.current?.get(user.id);
      const position = user.position || {
        x: map?.dropX || 0,
        y: map?.dropY || 0,
      };

      if (userAvatar) {
        context.drawImage(userAvatar, position.x, position.y, TILE_SIZE, TILE_SIZE);
      } else {
        context.drawImage(DEFAULT_AVATAR_URL, position.x, position.y, TILE_SIZE, TILE_SIZE)
      }

      context.fillStyle = "white";
      context.strokeStyle = "black";
      context.lineWidth = 2;
      context.font = "14px Arial";
      context.textAlign = "center";
      const textX = position.x + TILE_SIZE / 2;
      const textY = position.y - 5;
      context.strokeText(user.nickname, textX, textY);
      context.fillText(user.nickname, textX, textY);
    });
  };

  return (
    <canvas
      ref={canvasRef}
      width={map?.width || 800}
      height={map?.height || 600}
      className="border border-gray-200 rounded-lg bg-blue-400"
    />
  );
};

export default Canvas;