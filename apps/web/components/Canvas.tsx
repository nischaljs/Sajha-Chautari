// Canvas component
import React, { useEffect, useRef, useState } from "react";
import { Position, SpaceElement, User, Map } from "@/types/Space";

interface CanvasProps {
  users: User[];
  position: Position;
  elements: SpaceElement[];
  map: Map | null;
  backgroundImageRef: React.RefObject<HTMLImageElement | null>;
  elementImagesRef: React.RefObject<globalThis.Map<string, HTMLImageElement>>;
  avatarImagesRef: React.RefObject<globalThis.Map<string, HTMLImageElement>>;
  currentUserId: string;
  onMove: (newPosition: Position) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  users,
  position,
  elements,
  map,
  backgroundImageRef,
  elementImagesRef,
  avatarImagesRef,
  currentUserId,
  onMove,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      setContext(canvasRef.current.getContext("2d"));
    }
  }, []);

  useEffect(() => {
    const animateCanvas = () => {
      if (!context || !map) return;
      drawBackground();
      drawElements();
      drawAvatars();
      const id = requestAnimationFrame(animateCanvas);
      setAnimationFrameId(id);
    };

    if (context) {
      const id = requestAnimationFrame(animateCanvas);
      setAnimationFrameId(id);
    }

    return () => {
      // Cancel the animation loop when the component unmounts
      // or the context changes
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [context, map, shouldRender]);

 

  // const animateCanvas = () => {
  //   if (!context || !map) return;
  //   drawBackground();
  //   drawElements();
  //   drawAvatars();
  //   console.log("just animated the canvas");
  // };

  // useEffect(() => {
  //   const intervalId = setInterval(animateCanvas, 50); // Redraw the canvas every 50ms (20 FPS)
  //   return () => clearInterval(intervalId); // Cleanup interval
  // }, [users, position, elements, map]);

  const handleKeyDown = (event: KeyboardEvent) => {
    const { keyCode } = event;
    const speed = 1; // Adjust the movement speed as needed
    let newPosition: Position = { ...position };

    switch (keyCode) {
      case 37: // Left arrow
        newPosition.x -= speed;
        break;
      case 38: // Up arrow
        newPosition.y -= speed;
        break;
      case 39: // Right arrow
        newPosition.x += speed;
        break;
      case 40: // Down arrow
        newPosition.y += speed;
        break;
      default:
        return;
    }

    onMove(newPosition);
    setShouldRender(true);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const drawBackground = () => {
    if (!canvasRef.current || !context) {
      console.log("Canvas or context is null");
      return;
    }
    if (backgroundImageRef.current) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      context.drawImage(backgroundImageRef.current, 0, 0);
    }
  };

  const drawElements = () => {
    if (!elementImagesRef.current || !context) return;

    elements.forEach((element) => {
      console.log("drawing elements");
      const img = elementImagesRef.current?.get(element.id) || new Image();

      if (img.src && img.complete) {
        context.drawImage(
          img,
          element.x - position.x,
          element.y - position.y
        );
      } else {
        context.beginPath();
        context.arc(
          element.x - position.x,
          element.y - position.y,
          15,
          0,
          2 * Math.PI
        );
        context.fillStyle = "#00FF00";
        context.fill();
      }
    });
  };

  const drawAvatars = () => {
    if (!avatarImagesRef.current || !context) return;

    users.forEach((user) => {
      const img = avatarImagesRef.current?.get(user.id);

      const avatarPosition: Position = user.id === currentUserId
        ? position
        : user.position || { x: 0, y: 0 };

      console.log("avatar position", avatarPosition);

      if (img) {
        context.drawImage(
          img,
          avatarPosition.x - position.x,
          avatarPosition.y - position.y
        );
      } else {
        const radius = 16;
        context.beginPath();
        context.arc(
          avatarPosition.x - position.x + radius,
          avatarPosition.y - position.y + radius,
          radius,
          0,
          2 * Math.PI
        );

        const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
        console.log("random color", randomColor);
        context.fillStyle = randomColor;
        context.fill();
      }
    });
  };

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={map?.width || 800}
        height={map?.height || 600}
        style={{ border: "1px solid black" }}
      />
    </div>
  );
};

export default Canvas;