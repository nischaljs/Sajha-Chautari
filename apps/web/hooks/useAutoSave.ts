"use state"

import { CanvasItem } from "@/app/admindash/[...mapId]/page";
import api from "@/utils/axiosInterceptor";
import { useCallback, useEffect, useState } from "react";

export const useAutoSave = (
    mapId: string | null,
    canvasItems: CanvasItem[],
    saveInterval: number = 10000
) => {
    const [isSaving, setIsSaving] = useState(false);

    const saveToBackend = useCallback(async (data: CanvasItem[]) => {
        if (!mapId || mapId === "createMap") return;
        console.log(data);

        try {
            setIsSaving(true);

            // Create unique positions for elements with the same elementId
            const elementPositions = data.map((item, index) => ({
                elementId: item.id,
                x: Math.round(item.position.x + (index * 0.1)), // Add tiny offset to prevent exact overlaps
                y: Math.round(item.position.y + (index * 0.1)),
                ...(item.canvasId && { id: item.canvasId })
            }));

            await api.post(`/admin/maps/${mapId}/elements`, {
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

        save();
        const intervalId = setInterval(save, saveInterval);
        return () => clearInterval(intervalId);
    }, [canvasItems, saveInterval, saveToBackend, mapId]);

    return { isSaving };
};