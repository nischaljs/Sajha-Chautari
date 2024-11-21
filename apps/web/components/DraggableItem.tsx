import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface DraggableItemProps {
  id: number;
  initialPosition: { x: number; y: number };
  initialSize?: { width: number; height: number };
  gridSize: number;
  children: React.ReactNode;
  item: any,
  setCanvasItems: (item: any) => void;
  onPositionChange?: (id: number, position: { x: number; y: number }) => void;
  onDelete?: (position: { x: number; y: number }) => void; // New prop for deletion
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  initialPosition,
  initialSize,
  item,
  setCanvasItems,
  gridSize,
  children,
  onDelete
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size] = useState(initialSize || { width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === elementRef.current) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.round((e.clientX - dragStart.x) / gridSize) * gridSize;
      const newY = Math.round((e.clientY - dragStart.y) / gridSize) * gridSize;

      setPosition({ x: newX, y: newY });
    }
  }, [isDragging, dragStart, gridSize, id]);

  const handleMouseUp = () => {
    setIsDragging(false);

    // Update the item position instead of adding a new one
    setCanvasItems((prev: any) => {
      // Find the index of the dragged item and update its position
      return prev.map((existingItem: any) =>
        existingItem.id === id
          ? { ...existingItem, position }  // Update the position of the dragged item
          : existingItem
      );
    });

    console.log("Updated the canvas items");
  };


  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering drag when clicking delete
    onDelete?.(position);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  return (
    <div
      ref={elementRef}
      className="absolute cursor-move group"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${size.width}px`,
        height: `${size.height}px`
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X size={16} />
      </button>

      {children}
    </div>
  );
};