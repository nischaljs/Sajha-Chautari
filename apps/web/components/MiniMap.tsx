import React, { useEffect, useRef, useState } from 'react';

interface MinimapProps {
  canvasWidth: number;
  canvasHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  position: { x: number; y: number };
  elements?: Array<{
    id: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }>;
  onPositionChange: (position: { x: number; y: number }) => void;
  backgroundColor?: string;
}

export const Minimap: React.FC<MinimapProps> = ({
  canvasWidth,
  canvasHeight,
  viewportWidth,
  viewportHeight,
  position,
  elements = null,
  onPositionChange,
  backgroundColor
}) => {
  const minimapWidth = 200; // Width of the minimap
  const scale = minimapWidth / canvasWidth;
  const minimapHeight = Math.round(canvasHeight * scale);
  const minimapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate viewport rectangle dimensions
  const viewportRect = {
    width: Math.round(viewportWidth * scale),
    height: Math.round(viewportHeight * scale),
    x: Math.round(-position.x * scale),
    y: Math.round(-position.y * scale),
  };

  // Ensure the viewport rectangle stays within the minimap bounds
  const clampedViewportRect = {
    x: Math.max(0, Math.min(viewportRect.x, minimapWidth - viewportRect.width)),
    y: Math.max(0, Math.min(viewportRect.y, minimapHeight - viewportRect.height)),
    width: viewportRect.width,
    height: viewportRect.height
  };

  const backgroundStyle = backgroundColor!.startsWith('url(') 
    ? {
        backgroundImage: backgroundColor,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : { backgroundColor };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (minimapRef.current) {
      setIsDragging(true);
      updatePosition(e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      updatePosition(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updatePosition = (e: React.MouseEvent) => {
    if (!minimapRef.current) return;

    const rect = minimapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate new position ensuring viewport stays within canvas bounds
    const newX = Math.max(
      Math.min(0, -((x - clampedViewportRect.width / 2) / scale)),
      -(canvasWidth - viewportWidth)
    );
    const newY = Math.max(
      Math.min(0, -((y - clampedViewportRect.height / 2) / scale)),
      -(canvasHeight - viewportHeight)
    );

    onPositionChange({ x: newX, y: newY });
  };

  useEffect(() => {
    if (isDragging) {
      // Add global mouse event listeners
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (minimapRef.current) {
          const event = e as unknown as React.MouseEvent;
          handleMouseMove(event);
        }
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="fixed bottom-4 right-4 shadow-lg rounded-lg overflow-hidden border border-gray-200 bg-white p-2">
      <div
        ref={minimapRef}
        className="relative cursor-pointer"
        style={{
          width: minimapWidth,
          height: minimapHeight,
          ...backgroundStyle
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Render elements */}
        {elements && elements.map((element, index) => (
          <div
            key={element.id + index}
            className="absolute bg-red-500 opacity-50"
            style={{
              width: Math.max(2, Math.round(element.size.width * scale)),
              height: Math.max(2, Math.round(element.size.height * scale)),
              transform: `translate(${Math.round(element.position.x * scale)}px, ${Math.round(
                element.position.y * scale
              )}px)`,
            }}
          />
        ))}

        {/* Viewport rectangle */}
        <div
          className="absolute border-2 border-red-500 pointer-events-none"
          style={{
            width: clampedViewportRect.width,
            height: clampedViewportRect.height,
            transform: `translate(${clampedViewportRect.x}px, ${clampedViewportRect.y}px)`,
          }}
        />
      </div>
    </div>
  );
};
