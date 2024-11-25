import React from 'react';
import { Position, SpaceElements, User } from '@/types/Space';

interface MiniMapUserProps {
    canvasWidth: number;
    canvasHeight: number;
    viewportWidth: number;
    viewportHeight: number;
    position: Position;
    elements: SpaceElements[];
    users: User[];
    currentUserId: string;
    backgroundColor: string;
}

export const MiniMapUser: React.FC<MiniMapUserProps> = ({
    canvasWidth,
    canvasHeight,
    viewportWidth,
    viewportHeight,
    position,
    elements,
    users,
    currentUserId,
    backgroundColor,
}) => {
    const miniMapSize = 200;
    const scale = Math.min(miniMapSize / canvasWidth, miniMapSize / canvasHeight);

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const backgroundStyle = backgroundColor!.startsWith('url(')
        ? {
            backgroundImage: backgroundColor,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }
        : { backgroundColor };

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, miniMapSize, miniMapSize);

        // Draw background


        // Draw elements
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        elements.forEach((element) => {
            ctx.fillRect(
                element.x * scale,
                element.y * scale,
                element.width * scale,
                element.height * scale
            );
        });

        // Draw users
        users.forEach((user) => {
            if (user.position) {
                ctx.fillStyle = user.id === currentUserId ? '#4CAF50' : '#2196F3';
                ctx.beginPath();
                ctx.arc(
                    user.position.x * scale,
                    user.position.y * scale,
                    3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        });

        // Draw viewport
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            (position.x - viewportWidth / 2) * scale,
            (position.y - viewportHeight / 2) * scale,
            viewportWidth * scale,
            viewportHeight * scale
        );
    }, [canvasWidth, canvasHeight, viewportWidth, viewportHeight, position, elements, users, currentUserId, backgroundColor, scale]);

    return (
        <div className="absolute bottom-4 right-4 bg-black/50 rounded p-2">
            <canvas
                ref={canvasRef}
                className="border border-white"
                width={miniMapSize}
                height={miniMapSize}
                style={{
                    ...backgroundStyle
                }}
            />
        </div>
    );
};

