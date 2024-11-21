import React, { useEffect, useRef, useCallback, useState } from "react";
import { GameMap, Position, SpaceElement, SpaceElements } from "@/types/Space";
import { User } from "@/types/User";

interface CanvasProps {
    users: User[];
    position: Position;
    elements: SpaceElements[];
    map: GameMap | null;
    backgroundImageRef: React.RefObject<HTMLImageElement | null>;
    currentUserId: string;
    onMove: (newPosition: Position) => void;
}

const AVATAR_SIZE = 40;
const BASE_MOVE_SPEED = 5;

interface MovementState {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
}

const Canvas: React.FC<CanvasProps> = ({
    users,
    position,
    elements,
    map,
    backgroundImageRef,
    currentUserId,
    onMove,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const movementRef = useRef<MovementState>({ up: false, down: false, left: false, right: false });
    const elementImagesRef = useRef<{[key: string]: HTMLImageElement}>({});


    // Preload element images
    useEffect(() => {
        elements.forEach((element) => {
            if (element.imageUrl) {
                const img = new Image();
                img.src = element.imageUrl;
                img.onload = () => {
                    elementImagesRef.current[element.id] = img;
                };
            }
        });
    }, [elements]);


    // Prevent default scroll behaviors
    useEffect(() => {
        const preventScroll = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
                e.preventDefault();
            }
        };

        document.addEventListener('keydown', preventScroll, { passive: false });
        return () => {
            document.removeEventListener('keydown', preventScroll);
        };
    }, []);

    // Initialize fullscreen canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && map) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.zIndex = '10';
            contextRef.current = canvas.getContext("2d");
            document.body.style.overflow = 'hidden';
        }
    }, [map]);

    // Smooth movement handler with corrected direction
    const handleMovement = useCallback((deltaTime: number) => {
        if (!map) return;

        const moveSpeed = BASE_MOVE_SPEED * (deltaTime / 16.67);
        let dx = 0;
        let dy = 0;

        if (movementRef.current.left) dx -= moveSpeed;
        if (movementRef.current.right) dx += moveSpeed;
        if (movementRef.current.up) dy -= moveSpeed;
        if (movementRef.current.down) dy += moveSpeed;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            dx = (dx / magnitude) * moveSpeed;
            dy = (dy / magnitude) * moveSpeed;
        }

        const newX = Math.max(0, Math.min(map.width - AVATAR_SIZE, position.x + dx));
        const newY = Math.max(0, Math.min(map.height - AVATAR_SIZE, position.y + dy));

        if (newX !== position.x || newY !== position.y) {
            onMove({ x: newX, y: newY });
        }
    }, [position, map, onMove]);

    // Draw background and all elements
    const draw = useCallback(() => {
        const context = contextRef.current;
        const canvas = canvasRef.current;
        if (!context || !canvas || !map) return;

        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate view offset to center current user
        const viewOffsetX = position.x - canvas.width / 2 + AVATAR_SIZE / 2;
        const viewOffsetY = position.y - canvas.height / 2 + AVATAR_SIZE / 2;

        // Draw background
        if (backgroundImageRef.current) {
            context.drawImage(
                backgroundImageRef.current, 
                -viewOffsetX, 
                -viewOffsetY, 
                map.width, 
                map.height
            );
        }

        // Draw map elements
        elements.forEach((element) => {
            context.beginPath();
            context.rect(
                element.x - viewOffsetX, 
                element.y - viewOffsetY, 
                element?.width, 
                element?.height
            );
            context.fillStyle = 'gray';
            context.fill();
        });

        // Draw avatars
        users.forEach((user) => {
            const { x, y } = user.position || { x: 0, y: 0 };

            // Calculate screen position
            const screenX = x - viewOffsetX;
            const screenY = y - viewOffsetY;

            context.beginPath();
            context.arc(screenX, screenY, AVATAR_SIZE / 2, 0, Math.PI * 2);
            context.fillStyle = user.id === currentUserId ? "#4A90E2" : "#E24A4A";
            context.fill();

            context.fillStyle = "#000";
            context.textAlign = "center";
            context.font = "12px Arial";
            context.fillText(user.nickname || "User", screenX, screenY + AVATAR_SIZE);
        });
    }, [users, elements, backgroundImageRef.current, map, currentUserId, position]);

    // Animation loop
    useEffect(() => {
        let animationFrameId: number;
        let lastFrameTime = performance.now();

        const animate = (currentTime: number) => {
            const deltaTime = currentTime - lastFrameTime;
            lastFrameTime = currentTime;

            handleMovement(deltaTime);
            draw();

            animationFrameId = requestAnimationFrame(animate);
        };

        animate(performance.now());
        return () => cancelAnimationFrame(animationFrameId);
    }, [handleMovement, draw]);

    // Input handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;
            switch (e.key) {
                case "ArrowLeft": case "a": movementRef.current.left = true; break;
                case "ArrowRight": case "d": movementRef.current.right = true; break;
                case "ArrowUp": case "w": movementRef.current.up = true; break;
                case "ArrowDown": case "s": movementRef.current.down = true; break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowLeft": case "a": movementRef.current.left = false; break;
                case "ArrowRight": case "d": movementRef.current.right = false; break;
                case "ArrowUp": case "w": movementRef.current.up = false; break;
                case "ArrowDown": case "s": movementRef.current.down = false; break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ border: 'none', margin: 0, padding: 0 }}
        />
    );
};

export default Canvas;