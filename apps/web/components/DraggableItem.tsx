
"use state"

import { Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

interface DraggableItemProps {
    children: React.ReactNode;
    id: number | string;
    initialPosition: { x: number; y: number };
    gridSize: number;
    elementData?: any;  // Optional additional element metadata
  }
  
  export const DraggableItem: React.FC<DraggableItemProps> = ({ 
    children, 
    id, 
    initialPosition, 
    gridSize,
    elementData 
  }) => {
    const [position, setPosition] = useState(initialPosition);
  
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      // Snap to grid logic
      const snappedX = Math.round(e.clientX / gridSize) * gridSize;
      const snappedY = Math.round(e.clientY / gridSize) * gridSize;
      
      setPosition({ x: snappedX, y: snappedY });
    };
  
    return (
      <div
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          cursor: 'move'
        }}
        onDragOver={handleDragOver}
      >
        {children}
      </div>
    );
  };