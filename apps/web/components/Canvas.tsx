import React, { useEffect, useRef, useCallback, useState } from "react";
import { GameMap, Position, SpaceElement } from "@/types/Space";
import { User } from "@/types/User";

interface CanvasProps {
    users: User[];
    position: Position;
    elements: SpaceElement[];
    map: GameMap | null;
    backgroundImageRef: React.RefObject<HTMLImageElement | null>;
    elementImagesRef: React.RefObject<globalThis.Map<string, HTMLImageElement>>;
    avatarImagesRef: React.RefObject<globalThis.Map<string, HTMLImageElement>>;
    currentUserId: string;
    onMove: (newPosition: Position) => void;
}

const AVATAR_SIZE = 40;
const BASE_MOVE_SPEED = 5;
const CAMERA_BUFFER = 200;
const MOVEMENT_SMOOTHING = 0.15;
const CAMERA_SMOOTHING = 0.08;

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
    elementImagesRef,
    avatarImagesRef,
    currentUserId,
    onMove,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
    const movementRef = useRef<MovementState>({ up: false, down: false, left: false, right: false });
    const lastUpdateRef = useRef<number>(0);
    const interpolatedPositionsRef = useRef<Map<string, Position>>(new Map());

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            contextRef.current = canvas.getContext("2d");
        }

        // Initialize interpolated positions
        users.forEach(user => {
            if (user.position) {
                interpolatedPositionsRef.current.set(user.id, { ...user.position });
            }
        });
    }, []);

    // Smooth movement handler
    const handleMovement = useCallback((deltaTime: number) => {
        if (!map) return;

        const moveSpeed = BASE_MOVE_SPEED * (deltaTime / 16.67); // Normalize for 60fps
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

        const newX = Math.max(0, Math.min(map.width, position.x + dx));
        const newY = Math.max(0, Math.min(map.height, position.y + dy));

        if (newX !== position.x || newY !== position.y) {
            onMove({ x: newX, y: newY });
        }
    }, [position, map, onMove]);

    // Update camera with buffer zones
    const updateCamera = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const currentUser = users.find(u => u.id === currentUserId);
        if (!currentUser?.position) return;

        const viewportWidth = canvas.width;
        const viewportHeight = canvas.height;

        // Calculate camera target position with buffer zones
        let targetX = -(currentUser.position.x - viewportWidth / 2);
        let targetY = -(currentUser.position.y - viewportHeight / 2);

        // Apply buffer zones
        if (Math.abs(targetX - cameraOffset.x) > CAMERA_BUFFER) {
            targetX = cameraOffset.x + (targetX - cameraOffset.x) * CAMERA_SMOOTHING;
        }
        if (Math.abs(targetY - cameraOffset.y) > CAMERA_BUFFER) {
            targetY = cameraOffset.y + (targetY - cameraOffset.y) * CAMERA_SMOOTHING;
        }

        setCameraOffset(prev => ({
            x: prev.x + (targetX - prev.x) * CAMERA_SMOOTHING,
            y: prev.y + (targetY - prev.y) * CAMERA_SMOOTHING
        }));
    }, [users, currentUserId]);

    // Interpolate user positions
    const updateUserPositions = useCallback(() => {
        users.forEach(user => {
            if (!user.position) return;

            const currentPos = interpolatedPositionsRef.current.get(user.id);
            if (!currentPos) {
                interpolatedPositionsRef.current.set(user.id, { ...user.position });
                return;
            }

            // Smooth interpolation
            const newX = currentPos.x + (user.position.x - currentPos.x) * MOVEMENT_SMOOTHING;
            const newY = currentPos.y + (user.position.y - currentPos.y) * MOVEMENT_SMOOTHING;

            interpolatedPositionsRef.current.set(user.id, { x: newX, y: newY });
        });
    }, [users]);

    // Animation loop with delta time
    useEffect(() => {
        let lastFrameTime = performance.now();

        const animate = (currentTime: number) => {
            const deltaTime = currentTime - lastFrameTime;
            lastFrameTime = currentTime;

            if (currentTime - lastUpdateRef.current > 16) { // Cap at ~60fps
                handleMovement(deltaTime);
                updateCamera();
                updateUserPositions();
                drawBackground();
                drawAvatars();
                lastUpdateRef.current = currentTime;
            }

            animationFrameIdRef.current = requestAnimationFrame(animate);
        };

        animate(performance.now());
        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, [handleMovement, updateCamera, updateUserPositions]);

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
    const drawBackground = useCallback(() => {
        const context = contextRef.current;
        const canvas = canvasRef.current;
        if (!canvas || !context || !map) return;

        context.save();
        context.translate(cameraOffset.x, cameraOffset.y);

        // Clear entire canvas
        context.clearRect(-cameraOffset.x, -cameraOffset.y, canvas.width, canvas.height);

        // Draw grid
        const gridSize = 50;
        context.strokeStyle = "#ddd";
        context.beginPath();
        
        const startX = Math.floor(-cameraOffset.x / gridSize) * gridSize;
        const startY = Math.floor(-cameraOffset.y / gridSize) * gridSize;
        const endX = startX + canvas.width + gridSize;
        const endY = startY + canvas.height + gridSize;

        for (let x = startX; x < endX; x += gridSize) {
            context.moveTo(x, startY);
            context.lineTo(x, endY);
        }
        for (let y = startY; y < endY; y += gridSize) {
            context.moveTo(startX, y);
            context.lineTo(endX, y);
        }
        context.stroke();

        // Draw map boundaries
        context.strokeStyle = "#FF0000";
        context.strokeRect(0, 0, map.width, map.height);

        context.restore();
    }, [cameraOffset, map]);

    // Drawing functions remain similar but use interpolated positions
    const drawAvatars = useCallback(() => {
        const context = contextRef.current;
        if (!context) return;

        context.save();
        context.translate(cameraOffset.x, cameraOffset.y);

        users.forEach((user) => {
            const interpolatedPos = interpolatedPositionsRef.current.get(user.id);
            if (!interpolatedPos) return;

            const { x, y } = interpolatedPos;

            context.beginPath();
            context.arc(x, y, AVATAR_SIZE / 2, 0, Math.PI * 2);
            context.fillStyle = user.id === currentUserId ? "#4A90E2" : "#E24A4A";
            context.fill();

            context.fillStyle = "#000";
            context.textAlign = "center";
            context.font = "12px Arial";
            context.fillText(user.nickname || "User", x, y + AVATAR_SIZE);
        });

        context.restore();
    }, [users, currentUserId, cameraOffset]);

    // ... rest of the drawing code remains the same ...

    return (
        <div className="relative w-full h-full overflow-hidden">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
            />
        </div>
    );
};

export default Canvas;