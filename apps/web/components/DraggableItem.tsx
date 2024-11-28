import { useCallback, useEffect, useRef, useState } from "react";
import { X } from 'lucide-react';
import { MapElement } from "@/types/Space";

interface DraggableItemProps {
    mapElement: MapElement;
    gridSize: number;
    children: React.ReactNode;
    updateMapElement: (id: string, newX: number, newY: number) => void;
    onDelete: (id: string) => void;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
    mapElement,
    updateMapElement,
    gridSize,
    children,
    onDelete
}) => {
    const [position, setPosition] = useState({ x: mapElement.x, y: mapElement.y });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const elementRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.target === elementRef.current) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    }, [position]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            const newX = Math.round((e.clientX - dragStart.x) / gridSize) * gridSize;
            const newY = Math.round((e.clientY - dragStart.y) / gridSize) * gridSize;
            setPosition({ x: newX, y: newY });
        }
    }, [isDragging, dragStart, gridSize]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            updateMapElement(mapElement.id, position.x, position.y);
        }
    }, [isDragging, mapElement.id, position.x, position.y, updateMapElement]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div
            ref={elementRef}
            className="absolute cursor-move group"
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                width: `${mapElement.element.width}px`,
                height: `${mapElement.element.height}px`
            }}
            onMouseDown={handleMouseDown}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(mapElement.id);
                }}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <X size={16} />
            </button>
            {children}
        </div>
    );
};

