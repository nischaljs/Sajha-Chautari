import React, { useEffect, useRef, useCallback } from "react";
import { Map, Position, SpaceElement } from "@/types/Space";
import { User } from "@/types/User";

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

const ELEMENT_SIZE = 20;
const AVATAR_RADIUS = 10;

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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const frameCount = useRef(0);

    // Helper function to clamp a position within the canvas bounds
    const clampPosition = (x: number, y: number, radius: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x, y };

        return {
            x: Math.max(radius, Math.min(canvas.width - radius, x)),
            y: Math.max(radius, Math.min(canvas.height - radius, y)),
        };
    };

    // Initialize canvas context
    useEffect(() => {
        if (canvasRef.current) {
            contextRef.current = canvasRef.current.getContext("2d");
        }
    }, []);

    // Calculate relative position on the canvas
    const getRelativePosition = useCallback(
        (x: number, y: number) => ({
            x: x - position.x,
            y: y - position.y,
        }),
        [position]
    );

    // Draw the background
    const drawBackground = useCallback(() => {
        const context = contextRef.current;
        const canvas = canvasRef.current;
        if (!canvas || !context) return;

        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background image
        if (backgroundImageRef.current?.complete && backgroundImageRef.current?.naturalWidth) {
            context.drawImage(backgroundImageRef.current, 0, 0, canvas.width, canvas.height);
        } else {
            // Fallback to a plain background color
            context.fillStyle = "#f0f0f0";
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, [backgroundImageRef]);

    // Draw space elements
    const drawElements = useCallback(() => {
        const context = contextRef.current;
        if (!context || !elementImagesRef.current) return;

        elements.forEach((element) => {
            const img = elementImagesRef.current!.get(element.id);
            const { x, y } = getRelativePosition(element.x, element.y);

            if (img) {
                context.drawImage(img, x, y, ELEMENT_SIZE, ELEMENT_SIZE);
            } else {
                context.fillStyle = "#00FF00"; // Default green block
                context.fillRect(x, y, ELEMENT_SIZE, ELEMENT_SIZE);
            }
        });
    }, [elements, elementImagesRef, getRelativePosition]);

    // Draw avatars
    const drawAvatars = useCallback(() => {
        const context = contextRef.current;
        if (!context || !avatarImagesRef.current) return;

        users.forEach((user) => {
            const userPosition =
                user.id === currentUserId ? position : user.position || { x: 0, y: 0 };
            const { x, y } = getRelativePosition(userPosition.x, userPosition.y);
            const { x: clampedX, y: clampedY } = clampPosition(x, y, AVATAR_RADIUS);

            const img = avatarImagesRef.current!.get(user.id);
            if (img) {
                context.drawImage(img, clampedX - AVATAR_RADIUS, clampedY - AVATAR_RADIUS, AVATAR_RADIUS * 2, AVATAR_RADIUS * 2);
            } else {
                context.fillStyle = user.id === currentUserId ? "#0000FF" : "#FF0000"; // Blue for current user, red for others
                context.beginPath();
                context.arc(clampedX, clampedY, AVATAR_RADIUS, 0, 2 * Math.PI);
                context.fill();
            }
        });
    }, [users, avatarImagesRef, currentUserId, position, getRelativePosition]);

    // Animation loop
    useEffect(() => {
        const animateCanvas = () => {
            if (!contextRef.current || !map) return;

            drawBackground();
            drawElements();
            drawAvatars();

            // Throttle log output
            if (frameCount.current % 10 === 0) {
                console.log("Canvas animation frame:", frameCount.current);
            }
            frameCount.current++;

            animationFrameIdRef.current = requestAnimationFrame(animateCanvas);
        };

        animationFrameIdRef.current = requestAnimationFrame(animateCanvas);

        return () => {
            if (animationFrameIdRef.current !== null) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, [drawBackground, drawElements, drawAvatars, map]);

    // Handle keyboard movement
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            const speed = 10;
            let newPosition = { ...position };

            switch (event.key) {
                case "ArrowLeft":
                    newPosition.x -= speed;
                    break;
                case "ArrowUp":
                    newPosition.y -= speed;
                    break;
                case "ArrowRight":
                    newPosition.x += speed;
                    break;
                case "ArrowDown":
                    newPosition.y += speed;
                    break;
                default:
                    return;
            }

            onMove(newPosition);
        },
        [position, onMove]
    );

    // Attach keyboard event listener
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div style={{ position: "relative" }}>
            <canvas
                ref={canvasRef}
                width={map?.width || 800}
                height={map?.height || 600}
                // width={800}
                // height={600}
                style={{ border: "1px solid black", width: "100%", height: "auto" }}
            />
        </div>
    );
};

export default Canvas;
