import React from 'react';

interface MinimapProps {
    canvasWidth: number;
    canvasHeight: number;
    viewportWidth: number;
    viewportHeight: number;
    position: { x: number; y: number };
    elements: {
        id: string;
        position: { x: number; y: number };
        size: { width: number; height: number };
    }[];
    onPositionChange: (position: { x: number; y: number }) => void;
    backgroundColor: string;
}

export const Minimap: React.FC<MinimapProps> = ({
    canvasWidth,
    canvasHeight,
    viewportWidth,
    viewportHeight,
    position,
    elements,
    onPositionChange,
    backgroundColor
}) => {
    const minimapWidth = 200;
    const minimapHeight = (canvasHeight / canvasWidth) * minimapWidth;
    const scale = minimapWidth / canvasWidth;

    const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale - viewportWidth / 2;
        const y = (e.clientY - rect.top) / scale - viewportHeight / 2;
        onPositionChange({ x: -x, y: -y });
    };

    return (
        <div
            className="absolute bottom-4 right-4 border border-gray-300 shadow-md"
            style={{
                width: `${minimapWidth}px`,
                height: `${minimapHeight}px`,
                backgroundColor: backgroundColor.startsWith('url(') ? 'transparent' : backgroundColor,
                backgroundImage: backgroundColor.startsWith('url(') ? backgroundColor : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
            onClick={handleMinimapClick}
        >
            {elements.map((element,index) => (
                <div
                    key={element.id+index}
                    className="absolute bg-blue-500 opacity-50"
                    style={{
                        left: `${element.position.x * scale}px`,
                        top: `${element.position.y * scale}px`,
                        width: `${element.size.width * scale}px`,
                        height: `${element.size.height * scale}px`,
                    }}
                />
            ))}
            <div
                className="absolute border-2 border-red-500"
                style={{
                    left: `${-position.x * scale}px`,
                    top: `${-position.y * scale}px`,
                    width: `${viewportWidth * scale}px`,
                    height: `${viewportHeight * scale}px`,
                }}
            />
        </div>
    );
};

