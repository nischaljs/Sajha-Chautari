import React, { useEffect, useRef, useState, useCallback } from "react";
import { Map, Position, SpaceElement, } from "@/types/Space";
import{User} from "@/types/User"

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

const ELEMENT_SIZE = 20; // Element placeholder size
const AVATAR_RADIUS = 10; // Placeholder avatar circle radius

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

    // Initialize canvas context
    useEffect(() => {
        if (canvasRef.current) {
            contextRef.current = canvasRef.current.getContext("2d");
        }
    }, []);

    // Utility to calculate relative positions for drawing
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
        if (!canvasRef.current || !context || !backgroundImageRef.current) return;

        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        const backgroundImg = backgroundImageRef.current;
        if (backgroundImg.complete && backgroundImg.naturalWidth) {
            context.drawImage(backgroundImg, 0, 0);
        } else {
            console.error("Background image is not ready.");
        }
    }, [backgroundImageRef]);

    // Draw map elements
    const drawElements = useCallback(() => {
        const context = contextRef.current;
        if (!context || !elementImagesRef.current) return;

        elements.forEach((element) => {
            if (!elementImagesRef.current) return;
            const img = elementImagesRef.current.get(element.id);
            const { x, y } = getRelativePosition(element.x, element.y);

            if (img) {
                context.drawImage(img, x, y);
            } else {
                context.fillStyle = "#00FF00"; // Placeholder color
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
            if (!avatarImagesRef.current) return;

            let img = avatarImagesRef.current.get(user.id);

            if (!img) {
                // Placeholder avatar image
                img = new Image();
                img.src = "https://via.placeholder.com/50";
                avatarImagesRef.current.set(user.id, img);
            }

            if (img.complete && img.naturalWidth) {
                context.drawImage(img, x, y);
            } else {
                // Draw placeholder circle
                context.beginPath();
                context.arc(x + AVATAR_RADIUS, y + AVATAR_RADIUS, AVATAR_RADIUS, 0, 2 * Math.PI);
                context.fillStyle = user.id === currentUserId ? "#FFD700" : "#007BFF";
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

            animationFrameIdRef.current = requestAnimationFrame(animateCanvas);
        };

        if (contextRef.current) {
            animationFrameIdRef.current = requestAnimationFrame(animateCanvas);
        }

        return () => {
            if (animationFrameIdRef.current !== null) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, [drawBackground, drawElements, drawAvatars, map]);

    // Handle keyboard movement
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            const { key } = event;
            const speed = 1;
            const newPosition = { ...position };

            switch (key) {
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
                style={{ border: "1px solid black" }}
            />
        </div>
    );
};

export default Canvas;
