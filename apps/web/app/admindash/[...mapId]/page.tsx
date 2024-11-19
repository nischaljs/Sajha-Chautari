"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { DraggableCanvas } from "@/components/DraggableCanvas";
import { DraggableItem } from "@/components/DraggableItem";
import { ElementsSidebar } from "@/components/ElementsSidebar";
import MapEditorToolbar from "@/components/MapEditorToolbar";
import api from "@/utils/axiosInterceptor";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

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

    // Elements States
    const [availableElements, setAvailableElements] = useState<Element[]>([]);
    const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);

    // File and Submission States
    const backgroundInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use effect to get mapId from URL
    useEffect(() => {
        const id = params.mapId ? String(params.mapId):null
        setMapId(id);
    }, []);

    // Fetch map details
    useEffect(() => {
        const fetchMapDetails = async () => {
            console.log('mapId is present',mapId);
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
                // Optionally save map elements
                await saveMapElements(newMapId);

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

    // Save Map Elements
    const saveMapElements = async (mapId: string) => {
        try {
            const elementPositions = canvasItems.map(item => ({
                elementId: item.id,
                x: item.position.x,
                y: item.position.y
            }));

            await api.post("/admin/map/element", {
                mapId,
                defaultElements: elementPositions
            });
        } catch (error) {
            console.error("Failed to save map elements", error);
        }
    };

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

            e.dataTransfer?.setData('application/json', elementJson);
        } catch (error) {
            console.error("Error during drag start", error);
        }
    };

    // Handle Drop on Canvas
    const handleCanvasDrop = (e: React.DragEvent) => {
        e.preventDefault();

        try {
            const jsonData = e.dataTransfer?.getData('application/json');
            const elementData = jsonData
                ? JSON.parse(jsonData)
                : JSON.parse(e.dataTransfer?.getData('text/plain') || '{}');

            if (elementData.id) {
                const canvasItem: CanvasItem = {
                    ...elementData,
                    canvasId: Date.now(),
                    position: {
                        x: Math.round(e.clientX / gridSize) * gridSize,
                        y: Math.round(e.clientY / gridSize) * gridSize
                    }
                };

                setCanvasItems(prev => [...prev, canvasItem]);
            }
        } catch (error) {
            console.error("Error parsing drag data", error);
        }
    };

    // Remove last added canvas item
    const removeLastCanvasItem = () => {
        setCanvasItems(prev => prev.slice(0, -1));
    };

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
            />

            {/* Draggable Canvas */}
            <DraggableCanvas
                width={canvasSize.width}
                height={canvasSize.height}
                backgroundColor={backgroundColor}
                gridSize={gridSize}
                showGrid={showGrid}
            >
                {canvasItems.map((item) => (
                    <DraggableItem
                        key={item.canvasId}
                        id={item.canvasId}
                        initialPosition={item.position}
                        gridSize={gridSize}
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

            {/* Elements Sidebar */}
            <ElementsSidebar
                objectBaseUrl={objectBaseUrl}
                availableElements={availableElements}
                onElementCreate={handleNewElementCreation}
                onDragStart={handleDragStart}
            />
        </div>
    );
};

export default MapEditor;