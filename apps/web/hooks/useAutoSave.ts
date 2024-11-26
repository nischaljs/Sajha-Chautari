import api from "@/utils/axiosInterceptor";
import { useCallback, useEffect, useState } from "react";

export const useAutoSave = (
    mapId: string | null,
    canvasItems: any[],
    saveInterval: number = 10000
) => {
    const [isSaving, setIsSaving] = useState(false);

    const saveToBackend = useCallback(async (data: any[]) => {
        if (!mapId || mapId === "createMap") return;

        try {
            setIsSaving(true);
            const elementPositions = data.map(item => ({
                elementId: item.id, // Ensure `id` exists on each item
                x: item.position.x,
                y: item.position.y,
                width: item.size?.width || 0,
                height: item.size?.height || 0,
            }));

            const response = await api.post("/admin/map/element", {
                mapId,
                defaultElements: elementPositions,
            });

            setIsSaving(false);
        } catch (error) {
            console.error("Auto-save failed:", error);
            setIsSaving(false);
        }
    }, [mapId]);

    useEffect(() => {
        const save = () => {
            if (canvasItems.length > 0) {
                saveToBackend(canvasItems); // Send the full list of canvas items
            }
        };

        const intervalId = setInterval(save, saveInterval);

        return () => clearInterval(intervalId); // Clean up on unmount
    }, [canvasItems, saveInterval, saveToBackend]);

    return { isSaving };
};
