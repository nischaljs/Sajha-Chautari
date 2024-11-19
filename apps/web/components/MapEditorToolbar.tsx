import React, { useRef, ChangeEvent } from 'react';
import { ChevronDown, ChevronUp, X } from "lucide-react";

interface MapEditorToolbarProps {
    isToolbarOpen: boolean;
    setIsToolbarOpen: (open: boolean) => void;
    mapId: string | null;
    mapName: string;
    setMapName: (name: string) => void;
    canvasSize: { width: number; height: number };
    setCanvasSize: (size: { width: number; height: number }) => void;
    backgroundInputRef: React.RefObject<HTMLInputElement>;
    handleBackgroundUpload: (e: ChangeEvent<HTMLInputElement>) => void;
    handleMapSubmit: () => void;
    isSubmitting: boolean;
    canvasItems: any[];
    removeLastCanvasItem: () => void;
}

const MapEditorToolbar: React.FC<MapEditorToolbarProps> = ({
    isToolbarOpen,
    setIsToolbarOpen,
    mapId,
    mapName,
    setMapName,
    canvasSize,
    setCanvasSize,
    backgroundInputRef,
    handleBackgroundUpload,
    handleMapSubmit,
    isSubmitting,
    canvasItems,
    removeLastCanvasItem
}) => {
    return (
        <div
            className={`absolute top-0 left-0 right-0 bg-white shadow-lg rounded-b-lg transition-all duration-300 z-10 ${
                isToolbarOpen ? "h-auto" : "h-16"
            }`}
        >
            <div className="p-3">
                {/* Toolbar Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-base font-semibold text-gray-700">
                        Map Editor {mapId && mapId !== 'createMap' ? `- ${mapName}` : ''}
                    </h2>
                    <div className="flex items-center space-x-2">
                        {canvasItems.length > 0 && (
                            <button
                                onClick={removeLastCanvasItem}
                                className="p-1 hover:bg-red-100 rounded-full text-red-500"
                                title="Remove Last Item"
                            >
                                <X size={20} />
                            </button>
                        )}
                        <button
                            onClick={() => setIsToolbarOpen(!isToolbarOpen)}
                            className="p-1 hover:bg-gray-200 rounded-full"
                            title={isToolbarOpen ? "Collapse Toolbar" : "Expand Toolbar"}
                        >
                            {isToolbarOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>
                </div>

                {/* Toolbar Content */}
                {isToolbarOpen && (
                    <div className="mt-2 space-y-3">
                        {/* Form Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                                <label className="text-sm text-gray-600">Map Name</label>
                                <input
                                    type="text"
                                    placeholder="Map Name"
                                    value={mapName}
                                    onChange={(e) => setMapName(e.target.value)}
                                    className="border px-2 py-1 rounded text-sm w-full"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm text-gray-600">Width</label>
                                <input
                                    type="number"
                                    placeholder="Width"
                                    value={canvasSize.width || ""}
                                    onChange={(e) =>
                                        setCanvasSize({
                                            ...canvasSize,
                                            width: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    className="border px-2 py-1 rounded text-sm w-full"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm text-gray-600">Height</label>
                                <input
                                    type="number"
                                    placeholder="Height"
                                    value={canvasSize.height || ""}
                                    onChange={(e) =>
                                        setCanvasSize({
                                            ...canvasSize,
                                            height: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    className="border px-2 py-1 rounded text-sm w-full"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm text-gray-600">Background</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={backgroundInputRef}
                                    onChange={handleBackgroundUpload}
                                    className="text-sm w-full"
                                />
                            </div>
                        </div>

                        {/* Submit Row */}
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleMapSubmit}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 disabled:opacity-50 transition-colors"
                            >
                                {isSubmitting 
                                    ? "Submitting..." 
                                    : mapId && mapId !== 'createMap' 
                                        ? "Update" 
                                        : "Create"
                                }
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapEditorToolbar;