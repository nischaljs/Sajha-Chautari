import React, { ChangeEvent } from "react";
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
  setShowGrid: () => void;
  showGrid: boolean;
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
  removeLastCanvasItem,
  setShowGrid,
  showGrid,
}) => {
  return (
    <div
      className={`absolute top-0 left-0 right-0 bg-white shadow-lg rounded-b-lg transition-all duration-300 z-10 border ${
        isToolbarOpen ? "h-auto" : "h-16"
      }`}
    >
      <div className="p-4">
        {/* Toolbar Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Map Editor {mapId && mapId !== "createMap" ? `- ${mapName}` : ""}
          </h2>
          <div className="flex items-center space-x-3">
            {canvasItems.length > 0 && (
              <button
                onClick={removeLastCanvasItem}
                className="p-2 bg-red-100 hover:bg-red-200 rounded-full text-red-500"
                title="Remove Last Item"
              >
                <X size={20} />
              </button>
            )}
            <button
              onClick={() => setIsToolbarOpen(!isToolbarOpen)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
              title={isToolbarOpen ? "Collapse Toolbar" : "Expand Toolbar"}
            >
              {isToolbarOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>

        {/* Toolbar Content */}
        {isToolbarOpen && (
          <div className="mt-4 space-y-6">
            {/* Form Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Map Name
                </label>
                <input
                  type="text"
                  placeholder="Map Name"
                  value={mapName}
                  onChange={(e) => setMapName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Width
                </label>
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
                  className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Height
                </label>
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
                  className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Background
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={backgroundInputRef}
                  onChange={handleBackgroundUpload}
                  className="w-full text-gray-600"
                />
              </div>
            </div>

            {/* Toggle Grid */}
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={() => setShowGrid()}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {showGrid ? "Show Grid" : "Hide Grid"}
                </span>
              </label>
            </div>

            {/* Submit Row */}
            <div className="flex justify-end">
              <button
                onClick={handleMapSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg shadow-md hover:bg-blue-600 disabled:opacity-50 transition"
              >
                {isSubmitting
                  ? "Submitting..."
                  : mapId && mapId !== "createMap"
                  ? "Update"
                  : "Create"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapEditorToolbar;
