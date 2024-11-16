import React, { useEffect, useRef, useState, useCallback } from "react";
import { Map, Position, SpaceElement, } from "@/types/Space";
import { User } from "@/types/User"

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

    // Initialize canvas context
    useEffect(() => {
        if (canvasRef.current) {
            contextRef.current = canvasRef.current.getContext("2d");
        }
    }, []);

    const getRelativePosition = useCallback(
        (x: number, y: number) => ({
            x: x - position.x,
            y: y - position.y,
        }),
        [position]
    );

    // Modified drawBackground to always clear the canvas
    const drawBackground = useCallback(() => {
        const context = contextRef.current;
        const canvas = canvasRef.current;
        if (!canvas || !context) return;

        // Always clear the entire canvas first
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Then draw the background if available
        if (backgroundImageRef.current?.complete && backgroundImageRef.current?.naturalWidth) {
            context.drawImage(backgroundImageRef.current, 0, 0);
        } else {
            // Optional: Draw a fallback background color if no image is available
            context.fillStyle = "#f0f0f0";
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, [backgroundImageRef]);

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
                context.fillStyle = "#00FF00";
                context.fillRect(x, y, ELEMENT_SIZE, ELEMENT_SIZE);
            }
        });
    }, [elements, elementImagesRef, getRelativePosition]);

    const drawAvatars = useCallback(() => {
        const context = contextRef.current;
        if (!context || !avatarImagesRef.current) return;

        users.forEach((user) => {
            const userPosition =
                user.id === currentUserId ? position : user.position || { x: 0, y: 0 };
            const { x, y } = getRelativePosition(userPosition.x, userPosition.y);
            if (!avatarImagesRef.current) return;

            let img = avatarImagesRef.current.get(user.id);

            if (img?.complete && img?.naturalWidth) {
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
    }, [drawBackground, drawElements, drawAvatars, map, users, position]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            const { key } = event;
            const speed = 10;
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