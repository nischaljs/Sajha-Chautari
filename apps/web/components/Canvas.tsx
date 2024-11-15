// import React, { useEffect, useRef, useState } from "react";
// import { Position, SpaceElement, User, Map } from "@/types/Space";
// import Image from "next/image";

// interface CanvasProps {
//   users: User[];
//   position: Position;
//   elements: SpaceElement[];
//   map: Map | null;
//   backgroundImageRef: React.RefObject<HTMLImageElement | null>;
//   elementImagesRef: React.RefObject<globalThis.Map<string, HTMLImageElement>>;
//   avatarImagesRef: React.RefObject<globalThis.Map<string, HTMLImageElement>>;
//   currentUserId: string;
//   onMove: (newPosition: Position) => void;
// }

// const Canvas: React.FC<CanvasProps> = ({
//   users,
//   position,
//   elements,
//   map,
//   backgroundImageRef,
//   elementImagesRef,
//   avatarImagesRef,
//   currentUserId,
//   onMove,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
//   const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

//   useEffect(() => {
//     if (canvasRef.current) {
//       setContext(canvasRef.current.getContext("2d"));
//     }
//   }, []);

//   useEffect(() => {
//     const animateCanvas = () => {
//       if (!context || !map) return;

//       drawBackground();
//       drawElements();
//       drawAvatars();

//       const id = requestAnimationFrame(animateCanvas);
//       setAnimationFrameId(id);
//     };

//     if (context) {
//       const id = requestAnimationFrame(animateCanvas);
//       setAnimationFrameId(id);
//     }

//     return () => {
//       if (animationFrameId !== null) {
//         cancelAnimationFrame(animationFrameId);
//       }
//     };
//   }, [context, map, users, position]);

//   const handleKeyDown = (event: KeyboardEvent) => {
//     const { key } = event;
//     const speed = 1;
//     let newPosition: Position = { ...position };

//     switch (key) {
//       case "ArrowLeft":
//         newPosition.x -= speed;
//         break;
//       case "ArrowUp":
//         newPosition.y -= speed;
//         break;
//       case "ArrowRight":
//         newPosition.x += speed;
//         break;
//       case "ArrowDown":
//         newPosition.y += speed;
//         break;
//       default:
//         return;
//     }

//     onMove(newPosition); // Notify parent of new position
//   };

//   useEffect(() => {
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [handleKeyDown]);

//   const drawBackground = () => {
//     if (!canvasRef.current || !context || !backgroundImageRef.current) return;

//     context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     context.drawImage(backgroundImageRef.current, 0, 0);
//   };

//   const drawElements = () => {
//     if (!context || !elementImagesRef.current) return;

//     elements.forEach((element) => {
//       // @ts-ignore
//       const img = elementImagesRef.current ? elementImagesRef.current.get(element.id) : <img
//         id="source"
//         src="https://mdn.github.io/shared-assets/images/examples/rhino.jpg"
//         width="300"
//         height="227" />;
//       if (img.complete) {
//         context.drawImage(
//           img,
//           element.x - position.x,
//           element.y - position.y
//         );
//       } else {
//         // Draw placeholder for element
//         context.fillStyle = "#00FF00";
//         context.fillRect(
//           element.x - position.x,
//           element.y - position.y,
//           20,
//           20
//         );
//       }
//     });
//   };

//   const drawAvatars = () => {
//     if (!context || !avatarImagesRef.current) return;

//     users.forEach((user) => {
//       // Ensure img exists in avatarImagesRef, else create new Image object
//       // @ts-ignore
//       let img = avatarImagesRef.current ? avatarImagesRef.current.get(user.id) : <img
//         id="source"
//         src="https://mdn.github.io/shared-assets/images/examples/rhino.jpg"
//         width="300"
//         height="227" />;
//       if (!avatarImagesRef.current) {
//         img = <img
//           id="source"
//           src="https://mdn.github.io/shared-assets/images/examples/rhino.jpg"
//           width="300"
//           height="227" />;
//         // @ts-ignore
//         avatarImagesRef.current.set(user.id, img);
//       }

//       // Check if the image has been loaded
//       if (img.complete) {
//         const userPosition: Position =
//           user.id === currentUserId ? position : user.position || { x: 0, y: 0 };

//         // Draw the avatar if image is loaded
//         context.drawImage(
//           img,
//           userPosition.x - position.x,
//           userPosition.y - position.y
//         );
//       } else {
//         // Set the image source if not already loaded
//         if (!img.src) {
//           const DEFAULT_AVATAR_URL = "https://cdn.pixabay.com/photo/2024/02/15/14/57/animal-8575560_640.jpg";
//           img.src = DEFAULT_AVATAR_URL; // You can customize this URL or fetch it dynamically
//         }

//         // Draw placeholder if avatar image isn't available or still loading
//         const radius = 10;
//         const userPosition: Position =
//           user.id === currentUserId ? position : user.position || { x: 0, y: 0 };

//         context.beginPath();
//         context.arc(
//           userPosition.x - position.x + radius,
//           userPosition.y - position.y + radius,
//           radius,
//           0,
//           2 * Math.PI
//         );
//         context.fillStyle = user.id === currentUserId ? "#FFD700" : "#007BFF";
//         context.fill();
//       }
//     });
//   };

//   return (
//     <div style={{ position: "relative" }}>
//       <canvas
//         ref={canvasRef}
//         width={map?.width || 800}
//         height={map?.height || 600}
//         style={{ border: "1px solid black" }}
//       />
//     </div>
//   );
// };

// export default Canvas;
