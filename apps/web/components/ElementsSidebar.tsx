import React, { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import api from "@/utils/axiosInterceptor";
import { Plus, Upload, X } from 'lucide-react';

interface Element {
    id: string;
    name: string;
    imageUrl: string;
    width: number;
    height: number;
    static: boolean;
}

interface ElementsSidebarProps {
    objectBaseUrl: string | undefined;
    availableElements: Element[];
    onElementCreate: (newElement: Element) => void;
    onDragStart: (element: Element, e: React.DragEvent) => void;
}

export const ElementsSidebar: React.FC<ElementsSidebarProps> = ({
    objectBaseUrl,
    availableElements,
    onElementCreate,
    onDragStart
}) => {
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [newElementName, setNewElementName] = useState("");
    const [newElementFile, setNewElementFile] = useState<File | null>(null);
    const [newElementWidth, setNewElementWidth] = useState(0);
    const [newElementHeight, setNewElementHeight] = useState(0);
    const [isStatic, setIsStatic] = useState(false);

    const elementFileInputRef = useRef<HTMLInputElement>(null);

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
                // Notify parent component of new element
                onElementCreate(response.data.data);

                // Reset form
                setNewElementName("");
                setNewElementFile(null);
                setNewElementWidth(0);
                setNewElementHeight(0);
                setIsStatic(false);

                // Clear file input
                if (elementFileInputRef.current) {
                    elementFileInputRef.current.value = '';
                }

                // Exit create mode
                setIsCreateMode(false);

                alert("Element created successfully!");
            }
        } catch (error) {
            console.error("Failed to create element", error);
            alert("Failed to create element");
        }
    };

    return (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-72 bg-white shadow-lg rounded-l-xl p-4 overflow-y-auto max-h-[70vh] transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Elements</h3>
                <button
                    onClick={() => setIsCreateMode(!isCreateMode)}
                    className={`p-1 rounded-full ${isCreateMode ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}
                    title={isCreateMode ? "Cancel" : "Create New Element"}
                >
                    {isCreateMode ? <X size={20} /> : <Plus size={20} />}
                </button>
            </div>

            {isCreateMode && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4 border">
                    <h4 className="text-md font-medium mb-3">Create New Element</h4>
                    <input
                        type="text"
                        placeholder="Element Name"
                        value={newElementName}
                        onChange={(e) => setNewElementName(e.target.value)}
                        className="w-full border p-2 mb-2 rounded"
                    />
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                            type="number"
                            placeholder="Width"
                            value={newElementWidth || ''}
                            onChange={(e) => setNewElementWidth(parseInt(e.target.value))}
                            className="w-full border p-2"
                        />
                        <input
                            type="number"
                            placeholder="Height"
                            value={newElementHeight || ''}
                            onChange={(e) => setNewElementHeight(parseInt(e.target.value))}
                            className="w-full border p-2"
                        />
                    </div>
                    <label className="flex items-center mb-2 text-sm">
                        <input
                            type="checkbox"
                            checked={isStatic}
                            onChange={(e) => setIsStatic(e.target.checked)}
                            className="mr-2"
                        />
                        Static Element
                    </label>
                    <div className="flex items-center mb-2">
                        <input
                            type="file"
                            ref={elementFileInputRef}
                            onChange={handleNewElementUpload}
                            className="w-full"
                        />
                    </div>
                    <button
                        onClick={submitNewElement}
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        Create Element
                    </button>
                </div>
            )}

            {/* Existing Elements List */}
            <div className="grid grid-cols-2 gap-2">
                {availableElements.map((element) => (
                    <div
                        key={element.id}
                        draggable
                        onDragStart={(e) => onDragStart(element, e)}
                        className="border p-2 cursor-move hover:bg-gray-100 text-center rounded-lg transition-colors group"
                    >
                        <div className="relative w-full aspect-square mb-2">
                            <Image
                                src={`${objectBaseUrl}${element.imageUrl}`}
                                alt={element.name}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-contain group-hover:scale-110 transition-transform"
                            />
                        </div>
                        <p className="text-xs truncate">{element.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};