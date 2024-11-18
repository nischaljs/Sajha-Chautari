"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { DraggableCanvas } from "@/components/DraggableCanvas";
import { DraggableItem } from "@/components/DraggableItem";
import api from "@/utils/axiosInterceptor";
import { ChevronDown, ChevronUp, Plus, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapId = searchParams.get('mapId');
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
  const elementFileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Element Upload States
  const [newElementName, setNewElementName] = useState("");
  const [newElementFile, setNewElementFile] = useState<File | null>(null);
  const [newElementWidth, setNewElementWidth] = useState(0);
  const [newElementHeight, setNewElementHeight] = useState(0);
  const [isStatic, setIsStatic] = useState(false);

  useEffect(() => {
    const fetchMapDetails = async () => {
      if (mapId) {
        try {
          const response = await api.get(`/admin/maps/${mapId}`);
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
              setBackgroundColor(`url(${map.thumbnail})`);
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
        console.log(response.data);
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

  // Handle New Element Upload
  const handleNewElementUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewElementFile(file);
    }
  };

  // Submit New Element
  const submitNewElement = async () => {
    if (!newElementName || !newElementFile) {
      alert("Please provide element name and image");
      return;
    }

    const formData = new FormData();
    formData.append("name", newElementName);
    formData.append("imageFile", newElementFile);
    formData.append("width", newElementWidth.toString());
    formData.append("height", newElementHeight.toString());
    formData.append("static", isStatic.toString());

    try {
      const response = await api.post("/admin/elements", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        // Add new element to available elements
        setAvailableElements(prev => [...prev, response.data.data]);
        // Reset form
        setNewElementName("");
        setNewElementFile(null);
        setNewElementWidth(0);
        setNewElementHeight(0);
        setIsStatic(false);
        alert("Element created successfully!");
      }
    } catch (error) {
      console.error("Failed to create element", error);
      alert("Failed to create element");
    }
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
        alert("Map created successfully!");
        router.push(`/map-editor?mapId=${newMapId}`);
      }
    } catch (error) {
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
      // Ensure we're stringifying the entire element
      const elementJson = JSON.stringify({
        id: element.id,
        name: element.name,
        imageUrl: element.imageUrl,
        width: element.width,
        height: element.height,
        static: element.static
      });

      // Use setData with the stringified element
      e.dataTransfer?.setData('application/json', elementJson);
    } catch (error) {
      console.error("Error during drag start", error);
    }
  };

  // Handle Drop on Canvas
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();

    try {
      // Try to parse the data from 'application/json' first
      const jsonData = e.dataTransfer?.getData('application/json');

      // Fallback to 'text/plain' if json is not available
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

  return (
    <div
      className="h-screen w-screen bg-gray-100 overflow-hidden relative"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleCanvasDrop}
    >
      {/* Top Toolbar */}
      {/* Toolbar */}
      <div
        className={`absolute top-0 left-0 right-0 bg-white shadow-lg rounded-b-lg transition-all duration-300 z-10 ${isToolbarOpen ? "h-auto" : "h-16"
          }`}
      >
        <div className="p-3">
          {/* Toolbar Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-gray-700">
              Map Editor
            </h2>
            <button
              onClick={() => setIsToolbarOpen(!isToolbarOpen)}
              className="p-1 hover:bg-gray-200 rounded-full"
              title={isToolbarOpen ? "Collapse Toolbar" : "Expand Toolbar"}
            >
              {isToolbarOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          {/* Toolbar Content */}
          {isToolbarOpen && (
            <div className="mt-2 space-y-3">
              {/* Form Row */}
              <div className="flex flex-wrap items-center space-x-4">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Map Name</label>
                  <input
                    type="text"
                    placeholder="Map Name"
                    value={mapName}
                    onChange={(e) => setMapName(e.target.value)}
                    className="border px-2 py-1 rounded text-sm"
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
                    className="border px-2 py-1 rounded text-sm"
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
                    className="border px-2 py-1 rounded text-sm"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Background</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={backgroundInputRef}
                    onChange={handleBackgroundUpload}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Submit Row */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleMapSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


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
              src={item.imageUrl}
              alt={item.name}
              width={item.width}
              height={item.height}
            />
          </DraggableItem>
        ))}
      </DraggableCanvas>

      {/* Elements Sidebar */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-64 bg-white shadow-lg p-4 overflow-y-auto max-h-[70vh]">
        <h3 className="text-lg font-semibold mb-4">Available Elements</h3>

        {/* New Element Upload Section */}
        <div className="mb-4 border-b pb-4">
          <h4 className="text-md font-medium mb-2">Create New Element</h4>
          <input
            type="text"
            placeholder="Element Name"
            value={newElementName}
            onChange={(e) => setNewElementName(e.target.value)}
            className="w-full border p-1 mb-2"
          />
          <input
            type="number"
            placeholder="Width"
            value={newElementWidth || ''}
            onChange={(e) => setNewElementWidth(parseInt(e.target.value))}
            className="w-full border p-1 mb-2"
          />
          <input
            type="number"
            placeholder="Height"
            value={newElementHeight || ''}
            onChange={(e) => setNewElementHeight(parseInt(e.target.value))}
            className="w-full border p-1 mb-2"
          />
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={isStatic}
              onChange={(e) => setIsStatic(e.target.checked)}
              className="mr-2"
            />
            Static Element
          </label>
          <input
            type="file"
            ref={elementFileInputRef}
            onChange={handleNewElementUpload}
            className="w-full mb-2"
          />
          <button
            onClick={submitNewElement}
            className="w-full bg-green-500 text-white p-2 rounded"
          >
            Create Element
          </button>
        </div>

        {/* Existing Elements List */}
        <div className="grid grid-cols-2 gap-2">
          {availableElements.map((element) => (
            <div
              key={element.id}
              draggable
              onDragStart={(e) => handleDragStart(element, e)}
              className="border p-2 cursor-move hover:bg-gray-100 text-center"
            >
              <Image
                src={element.imageUrl}
                alt={element.name}
                width={64}
                height={64}
                className="mx-auto mb-2"
              />
              <p className="text-xs">{element.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapEditor;