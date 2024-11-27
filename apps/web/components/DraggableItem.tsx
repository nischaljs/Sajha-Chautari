import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface DraggableItemProps {
  canvas_id: string;
  initialPosition: { x: number; y: number };
  initialSize?: { width: number; height: number };
  gridSize: number;
  children: React.ReactNode;
  item: any;
  setCanvasItems: React.Dispatch<React.SetStateAction<any[]>>;
  onDelete?: (position: { x: number; y: number }) => void;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  canvas_id,
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
  }, [isDragging, dragStart, gridSize]);

  const handleMouseUp = () => {
    setIsDragging(false);
    
    setCanvasItems(prev => prev.map(existingItem => 
      existingItem.canvasId === canvas_id
        ? { ...existingItem, position }
        : existingItem
    ));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
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

export default DraggableItem;