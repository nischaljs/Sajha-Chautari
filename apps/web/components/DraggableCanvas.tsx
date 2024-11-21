import React, { useState } from "react";
import { GridOverlay } from "./GridOverlay";
import { ZoomButtons } from "./ZoomButtons";

interface DraggableCanvasProps {
  children: React.ReactNode;
  width: number; // Canvas width
  height: number; // Canvas height
  backgroundColor: string;
  gridSize: number;
  showGrid: boolean;
  position: { x: number; y: number };
  setPosition: ({ x, y }: { x: number; y: number }) => void;
}

export const DraggableCanvas: React.FC<DraggableCanvasProps> = ({
  children,
  width,
  height,
  backgroundColor,
  gridSize,
  showGrid,
  position,
  setPosition,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1); // Zoom scale state

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const nextX = e.clientX - dragStart.x;
      const nextY = e.clientY - dragStart.y;

      // Enforce boundaries
      setPosition({
        x: Math.min(0, Math.max(nextX, -(width - window.innerWidth))),
        y: Math.min(0, Math.max(nextY, -(height - window.innerHeight))),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Determine background style
  const backgroundStyle = backgroundColor.startsWith('url(') 
    ? {
        backgroundImage: backgroundColor,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : { backgroundColor };

  // Zoom in handler
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale * 1.2, 2));  // Limit zoom-in to 2x
  };

  // Zoom out handler
  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale / 1.2, 0.2));  // Limit zoom-out to 0.2x
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Zoom Buttons Component */}
      <ZoomButtons onZoomIn={zoomIn} onZoomOut={zoomOut} />

      <div
        className="absolute cursor-move"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, // Apply zoom scale
          width: `${width}px`,
          height: `${height}px`,
          ...backgroundStyle,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {showGrid && <GridOverlay size={gridSize} width={width} height={height} />}
        {children}
      </div>
    </div>
  );
};
