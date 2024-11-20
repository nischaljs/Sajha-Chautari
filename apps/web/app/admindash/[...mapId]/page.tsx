"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { DraggableCanvas } from "@/components/DraggableCanvas";
import { DraggableItem } from "@/components/DraggableItem";
import { ElementsSidebar } from "@/components/ElementsSidebar";
import MapEditorToolbar from "@/components/MapEditorToolbar";
import api from "@/utils/axiosInterceptor";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Minimap } from "@/components/MiniMap";
import { useAutoSave } from "@/hooks/useAutoSave";
import IsSaving from "@/components/IsSaving";
import { Position } from "@/types/Space";

// Define Element interface to match backend
interface Element {
    id: string;
    name: string;
    imageUrl: string;
    width: number;
    height: number;
    static: boolean;
}

// Define Item interface for canvas items
interface CanvasItem extends Element {
    canvasId: number;
    position: { x: number; y: number };
}

const MapEditor: React.FC = () => {
    const mapBaseUrl = process.env.NEXT_PUBLIC_HTTP_MAP;
    const objectBaseUrl = process.env.NEXT_PUBLIC_HTTP_OBJECT;
    const router = useRouter();
    const params = useParams();

    // Extract mapId from search params
    const [mapId, setMapId] = useState<string | null>(null);

    // State Management
    const [isToolbarOpen, setIsToolbarOpen] = useState(true);
    const [mapName, setMapName] = useState("");
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");
    const [showGrid, setShowGrid] = useState(true);
    const [gridSize, setGridSize] = useState(32);
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });

    
    // Elements States
    const [availableElements, setAvailableElements] = useState<Element[]>([]);
    const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);

    const { isSaving } = useAutoSave(mapId, canvasItems, 10000);
    
    // File and Submission States
    const backgroundInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use effect to get mapId from URL
    useEffect(() => {
        const id = params.mapId ? String(params.mapId) : null
        setMapId(id);
    }, []);

    // Fetch map details
    useEffect(() => {
        const fetchMapDetails = async () => {
            console.log('mapId is present', mapId);
            if (mapId && mapId !== 'createMap') {
                try {
                    const response = await api.get(`/admin/maps/${mapId}`);
                    console.log(response.data);
                    if (response.data.success) {
                        const { map, elements } = response.data.data;

                        // Set map details
                        setMapName(map.name);
                        setCanvasSize({ width: map.width, height: map.height });

                        // Set canvas items from existing map elements
                        setCanvasItems(elements.map((elem: any) => ({
                            ...elem,
                            canvasId: elem.canvasId || Date.now() // Fallback if no canvas ID
                        })));

                        // Optional: Set background if thumbnail exists
                        if (map.thumbnail) {
                            setBackgroundColor(`url(${mapBaseUrl}${map.thumbnail})`);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch map details", error);
                    alert("Failed to load map details");
                }
            }
        };

        fetchMapDetails();
    }, [mapId]);

    // Fetch Available Elements on Component Mount
    useEffect(() => {
        const fetchElements = async () => {
            try {
                const response = await api.get("/spaces/elements");
                if (response.data.success) {
                    setAvailableElements(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch elements", error);
            }
        };

        fetchElements();
    }, []);

    // Handle Background Upload
    const handleBackgroundUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setBackgroundColor(`url(${e.target?.result})`);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle new element creation
    const handleNewElementCreation = (newElement: Element) => {
        setAvailableElements(prev => [...prev, newElement]);
    };

    // Handle Map Submission
    const handleMapSubmit = async () => {
        if (!mapName || !canvasSize.width || !canvasSize.height) {
            alert("Please fill all required fields");
            return;
        }

        const formData = new FormData();
        formData.append("name", mapName);
        formData.append("width", canvasSize.width.toString());
        formData.append("height", canvasSize.height.toString());

        // Add thumbnail if selected
        if (backgroundInputRef.current?.files?.[0]) {
            formData.append("thumbnail", backgroundInputRef.current.files[0]);
        }

        setIsSubmitting(true);
        try {
            const response = await api.post("/admin/maps", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data.success) {
                const newMapId = response.data.data.map.id;
                // Navigate to the new map editor
                router.push(`/${newMapId}`);

                alert("Map created successfully!");
            }
        } catch (error) {
            console.error("Failed to create map", error);
            alert("Failed to create map");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const updateViewportSize = () => {
            setViewportSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        updateViewportSize();
        window.addEventListener('resize', updateViewportSize);
        return () => window.removeEventListener('resize', updateViewportSize);
    }, []);



    // Handle Drag Start for Elements
    const handleDragStart = (element: Element, e: React.DragEvent) => {
        try {
            const elementJson = JSON.stringify({
                id: element.id,
                name: element.name,
                imageUrl: element.imageUrl,
                width: element.width,
                height: element.height,
                static: element.static
            });
            console.log(elementJson)
            e.dataTransfer?.setData('application/json', elementJson);
        } catch (error) {
            console.error("Error during drag start", error);
        }
    };

    const snapToGrid = (coordinate: number): number => {
        return Math.round(coordinate / gridSize) * gridSize;
      };

    // Handle Drop on Canvas
    const handleCanvasDrop = (e: React.DragEvent) => {
        try {
          // Snap the x and y coordinates to the grid
          const snappedX = snapToGrid(e.clientX);
          const snappedY = snapToGrid(e.clientY);
      
          // Try parsing the dropped data
          const data = e.dataTransfer.getData('application/json');
          
          
          const parsedData = JSON.parse(data);
          console.log("after drop", parsedData)
          // Check if necessary properties exist

      
          // Process the element with snapped position
          const element = { ...parsedData,position:{ x: snappedX, y: snappedY}};
          console.log('Dropped element:', element);
          console.log("canvas elements",canvasItems);
          setCanvasItems((prev)=> ([...prev,element]));
        } catch (error:any) {
          // Log error details and alert the user
          console.error('Error processing drop:', error);
          alert(`An error occurred: ${error.message}. Please try again.`);
        }
      };

      

    // Remove last added canvas item
    const removeLastCanvasItem = () => {
        setCanvasItems(prev => prev.slice(0, -1));
    };

    const handleItemDelete = (position:Position) => {
        if(canvasItems.length==1){
            removeLastCanvasItem();
        }
        console.log('delete triggered for this element at this position ', position);
        setCanvasItems(prev => prev.filter(element => element?.position !== position));

    }


    return (
        <div
            className="h-screen w-screen bg-gray-100 overflow-hidden relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleCanvasDrop}
        >
            {/* Top Toolbar */}
            <MapEditorToolbar
                isToolbarOpen={isToolbarOpen}
                setIsToolbarOpen={setIsToolbarOpen}
                mapId={mapId}
                mapName={mapName}
                setMapName={setMapName}
                canvasSize={canvasSize}
                setCanvasSize={setCanvasSize}
                backgroundInputRef={backgroundInputRef}
                handleBackgroundUpload={handleBackgroundUpload}
                handleMapSubmit={handleMapSubmit}
                isSubmitting={isSubmitting}
                canvasItems={canvasItems}
                removeLastCanvasItem={removeLastCanvasItem}
                setShowGrid={() => (setShowGrid((prev) => (!prev)))}
                showGrid={showGrid}
            />

            {/* Draggable Canvas */}
            <DraggableCanvas
                width={canvasSize.width}
                height={canvasSize.height}
                backgroundColor={backgroundColor}
                gridSize={gridSize}
                showGrid={showGrid}
                position={position}
                setPosition={setPosition}
            >
                {canvasItems.map((item, index) => (
                    <DraggableItem
                        key={item.id+index}
                        id={item.canvasId}
                        initialPosition={item.position}
                        gridSize={gridSize}
                        onDelete={handleItemDelete}
                    >

                        <Image
                            src={`${objectBaseUrl}${item.imageUrl}`}
                            alt={item.name}
                            width={item.width}
                            height={item.height}
                            className="pointer-events-none"
                        />
                    </DraggableItem>
                ))}
            </DraggableCanvas>

            <Minimap
                canvasWidth={3000}
                canvasHeight={2000}
                viewportWidth={viewportSize.width}
                viewportHeight={viewportSize.height}
                position={position}
                elements={canvasItems.map((item) => ({ ...item, size: { width: 100, height: 100 } }))}
                onPositionChange={setPosition}
                backgroundColor={backgroundColor}
            />

            {/* Elements Sidebar */}
            <ElementsSidebar
                objectBaseUrl={objectBaseUrl}
                availableElements={availableElements}
                onElementCreate={handleNewElementCreation}
                onDragStart={handleDragStart}
            />

            {isSaving && 
            <IsSaving/>}
        </div>
    );
};

export default MapEditor;