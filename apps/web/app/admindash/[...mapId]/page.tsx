"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { Element, MapDetails, MapElement, GameMap as MapType } from "@/types/Space";

const MapEditor: React.FC = () => {
    const mapBaseUrl = process.env.NEXT_PUBLIC_HTTP_MAP;
    const objectBaseUrl = process.env.NEXT_PUBLIC_HTTP_OBJECT;
    const router = useRouter();
    const params = useParams();

    const [mapId, setMapId] = useState<string | null>(null);
    const [isToolbarOpen, setIsToolbarOpen] = useState(true);
    const [mapDetails, setMapDetails] = useState<MapDetails | null>(null);
    const [mapElements, setMapElements] = useState<MapElement[]>([]);
    const [showGrid, setShowGrid] = useState(true);
    const [gridSize, setGridSize] = useState(32);
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dropNewElem, setDropNewElem] = useState(false);

    const [availableElements, setAvailableElements] = useState<Element[]>([]);

    const { isSaving } = useAutoSave(mapId, mapElements, 10000);

    const backgroundInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const id = params.mapId ? String(params.mapId) : null;
        setMapId(id);
    }, [params.mapId]);

    const fetchMapDetails = useCallback(async () => {
        if (mapId && mapId !== 'createMap') {
            try {
                const response = await api.get(`/admin/maps/${mapId}`);
                console.log(response.data.data);
                if (response.data.success) {
                    const { map, elements } = response.data.data;
                    setMapDetails(map);
                    setMapElements(elements);
                }
            } catch (error) {
                console.error("Failed to load map details:", error);
                alert("Failed to load map details");
            }
        }
    }, [mapId]);

    useEffect(() => {
        fetchMapDetails();
    }, [fetchMapDetails]);

    useEffect(() => {
        const fetchElements = async () => {
            try {
                const response = await api.get("/spaces/elements");
                if (response.data.success) {
                    setAvailableElements(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch elements:", error);
            }
        };

        fetchElements();
    }, []);

    const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && mapId) {
            const formData = new FormData();
            formData.append("thumbnail", file);
            try {
                await api.put(`/admin/maps/${mapId}/thumbnail`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                fetchMapDetails(); // Refresh map details to get the new thumbnail
            } catch (error) {
                console.error("Failed to update map thumbnail:", error);
                alert("Failed to update map thumbnail");
            }
        }
    };

    const handleNewElementCreation = (newElement: Element) => {
        setAvailableElements(prev => [...prev, newElement]);
    };

    const handleMapSubmit = async () => {
        if (!mapDetails) {
            alert("Map details are missing");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.post("/admin/maps", mapDetails);
            if (response.data.success) {
                const newMapId = response.data.data.id;
                router.push(`/admindash/${newMapId}`);
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

    const handleDragStart = (element: Element, e: React.DragEvent) => {
        setDropNewElem(true);
        const elementJson = JSON.stringify(element);
        e.dataTransfer.setData('application/json', elementJson);
    };

    const snapToGrid = (coordinate: number): number => {
        return Math.round(coordinate / gridSize) * gridSize;
    };

    const handleCanvasDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (dropNewElem && mapDetails) {
            try {
                const data = e.dataTransfer.getData('application/json');
                const element: Element = JSON.parse(data);
                const snappedX = snapToGrid(e.clientX - position.x);
                const snappedY = snapToGrid(e.clientY - position.y);

                if (snappedX >= 0 && snappedX <= mapDetails.width && snappedY >= 0 && snappedY <= mapDetails.height) {
                    const newMapElement: MapElement = {
                        id: Date.now().toString(), // Temporary ID, will be replaced by backend
                        mapId: mapDetails.id,
                        elementId: element.id,
                        x: snappedX,
                        y: snappedY,
                        element: element,
                        name: element.name,
                        width: element.width,
                        height: element.height,
                        imageUrl: element.imageUrl,
                        static: element.static
                    };
                    setMapElements(prev => [...prev, newMapElement]);
                }
            } catch (error) {
                console.error("Error adding new element:", error);
            }
        }
        setDropNewElem(false);
    };

    const removeLastMapElement = () => {
        setMapElements(prev => prev.slice(0, -1));
    };

    const handleItemDelete = useCallback((id: string) => {
        setMapElements(prev => prev.filter(item => item.id !== id));
    }, []);

    const updateMapElement = useCallback((id: string, newX: number, newY: number) => {
        setMapElements(prev => prev.map(item => 
            item.id === id ? { ...item, x: newX, y: newY } : item
        ));
    }, []);

    return (
        <div
            className="h-screen w-screen bg-gray-100 overflow-hidden relative select-none"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleCanvasDrop}
        >
            <MapEditorToolbar
                isToolbarOpen={isToolbarOpen}
                setIsToolbarOpen={setIsToolbarOpen}
                mapId={mapId}
                mapDetails={mapDetails}
                setMapDetails={setMapDetails}
                backgroundInputRef={backgroundInputRef}
                handleBackgroundUpload={handleBackgroundUpload}
                handleMapSubmit={handleMapSubmit}
                isSubmitting={isSubmitting}
                mapElements={mapElements}
                removeLastMapElement={removeLastMapElement}
                setShowGrid={() => setShowGrid(prev => !prev)}
                showGrid={showGrid}
            />

            {mapDetails && (
                <DraggableCanvas
                    width={mapDetails.width}
                    height={mapDetails.height}
                    backgroundColor={mapDetails.thumbnail ? `url(${mapBaseUrl}${mapDetails.thumbnail})` : "#ffffff"}
                    gridSize={gridSize}
                    showGrid={showGrid}
                    position={position}
                    setPosition={setPosition}
                >
                    {mapElements.map((mapElement) => (
                        <DraggableItem
                            key={mapElement.id}
                            mapElement={mapElement}
                            updateMapElement={updateMapElement}
                            gridSize={gridSize}
                            onDelete={handleItemDelete}
                        >
                            <Image
                                src={`${objectBaseUrl}${mapElement.element.imageUrl}`}
                                alt={mapElement.element.name}
                                width={mapElement.element.width}
                                height={mapElement.element.height}
                                className="pointer-events-none"
                            />
                        </DraggableItem>
                    ))}
                </DraggableCanvas>
            )}

            <ElementsSidebar
                objectBaseUrl={objectBaseUrl}
                availableElements={availableElements}
                onElementCreate={handleNewElementCreation}
                onDragStart={handleDragStart}
            />

            {isSaving && <IsSaving />}
        </div>
    );
};

export default MapEditor;
