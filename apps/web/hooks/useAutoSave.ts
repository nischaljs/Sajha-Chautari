import { CanvasItem, MapElement } from "@/types/Space";
import api from "@/utils/axiosInterceptor";
import { useCallback, useEffect, useState } from "react";

export const useAutoSave = (
    mapId: string | null,
    canvasItems: MapElement[],
    saveInterval: number = 10000
) => {
    const [isSaving, setIsSaving] = useState(false);

    const saveToBackend = useCallback(async (items: MapElement[]) => {
        if (!mapId || mapId === "createMap") return;

        try {
            setIsSaving(true);

            const elementPositions = items.map(item => ({
                elementId: item.elementId || item.element.id,
                x: Math.round(item.x),
                y: Math.round(item.y)
            }));

            await api.post(`/admin/map/element`, {
                mapId,
                defaultElements: elementPositions
            });

            setIsSaving(false);
        } catch (error) {
            console.error("Auto-save failed:", error);
            setIsSaving(false);
        }
    }, [mapId]);

    useEffect(() => {
        if (!mapId || mapId === "createMap") return;

        const save = () => {
            if (canvasItems.length > 0) {
                saveToBackend(canvasItems);
            }
        };

        const intervalId = setInterval(save, saveInterval);
        return () => clearInterval(intervalId);
    }, [canvasItems, saveInterval, saveToBackend, mapId]);

    return { isSaving };
};


