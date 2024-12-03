import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MapDetails, MapElement } from "@/types/Space";
import { ChevronDown, ChevronUp, Upload, X } from 'lucide-react';
import React from "react";

interface MapEditorToolbarProps {
  isToolbarOpen: boolean;
  setIsToolbarOpen: (open: boolean) => void;
  mapId: string | null;
  mapDetails: MapDetails | null;
  setMapDetails: React.Dispatch<React.SetStateAction<MapDetails | null>>;
  backgroundInputRef: React.RefObject<HTMLInputElement>;
  handleBackgroundUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMapSubmit: () => void;
  isSubmitting: boolean;
  mapElements: MapElement[];
  removeLastMapElement: () => void;
  setShowGrid: () => void;
  showGrid: boolean;
}

const MapEditorToolbar: React.FC<MapEditorToolbarProps> = ({
  isToolbarOpen,
  setIsToolbarOpen,
  mapId,
  mapDetails,
  setMapDetails,
  backgroundInputRef,
  handleBackgroundUpload,
  handleMapSubmit,
  isSubmitting,
  mapElements,
  removeLastMapElement,
  setShowGrid,
  showGrid,
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mapDetails) {
      setMapDetails({ ...mapDetails, name: e.target.value });
    }
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    if (mapDetails) {
      setMapDetails({ ...mapDetails, [dimension]: value });
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 bg-background shadow-lg rounded-b-lg transition-all duration-300 z-10 border-b ${
        isToolbarOpen ? "h-auto" : "h-16"
      }`}
    >
      <div className="p-4">
        {/* Toolbar Header */}
        <div className="flex justify-between items-center pb-3">
          <h2 className="text-lg font-semibold">
            Map Editor {mapDetails?.name && `- ${mapDetails.name}`}
          </h2>
          <div className="flex items-center space-x-3">
            {mapElements.length > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={removeLastMapElement}
                title="Remove Last Item"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsToolbarOpen(!isToolbarOpen)}
              title={isToolbarOpen ? "Collapse Toolbar" : "Expand Toolbar"}
            >
              {isToolbarOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Toolbar Content */}
        {isToolbarOpen && (
          <div className="mt-4 space-y-6">
            {/* Form Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="mapName">Map Name</Label>
                <Input
                  id="mapName"
                  placeholder="Map Name"
                  value={mapDetails?.name || ""}
                  onChange={handleNameChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mapWidth">Width</Label>
                <Input
                  id="mapWidth"
                  type="number"
                  placeholder="Width"
                  value={mapDetails?.width || ""}
                  onChange={(e) => handleSizeChange('width', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mapHeight">Height</Label>
                <Input
                  id="mapHeight"
                  type="number"
                  placeholder="Height"
                  value={mapDetails?.height || ""}
                  onChange={(e) => handleSizeChange('height', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mapBackground">Background</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="mapBackground"
                    type="file"
                    accept="image/*"
                    ref={backgroundInputRef}
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => backgroundInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              </div>
            </div>

            {/* Toggle Grid */}
            <div className="flex items-center space-x-2">
              <Switch
                id="show-grid"
                checked={showGrid}
                onCheckedChange={setShowGrid}
              />
              <Label htmlFor="show-grid">
                {showGrid ? "Hide Grid" : "Show Grid"}
              </Label>
            </div>

            {/* Submit Row */}
            <div className="flex justify-end">
              <Button
                onClick={handleMapSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Submitting..."
                  : mapId && mapId !== "createMap"
                  ? "Update Map"
                  : "Create Map"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapEditorToolbar;
