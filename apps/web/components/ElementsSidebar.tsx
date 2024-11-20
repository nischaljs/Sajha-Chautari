
import React, { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { Plus, Upload, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/utils/axiosInterceptor';

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
    const [isOpen, setIsOpen] = useState(true);
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
        <>
            {/* Collapse toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute right-72 top-1/3 transform -translate-y-1/2 bg-white shadow-lg rounded-l-lg p-2  hover:bg-gray-100"
                style={{ right: isOpen ? '18rem' : '0' }}
            >
                {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            {/* Sidebar */}
            <div
                className={`absolute right-0 pt-20 top-0 h-auto max-h-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                style={{ width: '18rem' }}
            >
                <Card className="h-full border-0 rounded-none">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Elements</h3>
                            <button
                                onClick={() => setIsCreateMode(!isCreateMode)}
                                className={`p-2 rounded-lg ${isCreateMode
                                        ? 'bg-red-100 text-red-500 hover:bg-red-200'
                                        : 'bg-green-100 text-green-500 hover:bg-green-200'
                                    }`}
                            >
                                {isCreateMode ? <X size={20} /> : <Plus size={20} />}
                            </button>
                        </div>

                        {/* Create Element Form */}
                        {isCreateMode && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-4 border space-y-3">
                                <h4 className="text-md font-medium">Create New Element</h4>

                                <input
                                    type="text"
                                    placeholder="Element Name"
                                    value={newElementName}
                                    onChange={(e) => setNewElementName(e.target.value)}
                                    className="w-full border p-2 rounded-lg bg-white"
                                />

                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        placeholder="Width"
                                        value={newElementWidth || ''}
                                        onChange={(e) => setNewElementWidth(parseInt(e.target.value))}
                                        className="w-full border p-2 rounded-lg bg-white"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Height"
                                        value={newElementHeight || ''}
                                        onChange={(e) => setNewElementHeight(parseInt(e.target.value))}
                                        className="w-full border p-2 rounded-lg bg-white"
                                    />
                                </div>

                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={isStatic}
                                        onChange={(e) => setIsStatic(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">Static Element</span>
                                </label>

                                <div className="relative">
                                    <input
                                        type="file"
                                        ref={elementFileInputRef}
                                        onChange={handleNewElementUpload}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    <button
                                        onClick={() => elementFileInputRef.current?.click()}
                                        className="w-full p-2 border-2 border-dashed rounded-lg text-gray-500 hover:bg-gray-100 flex items-center justify-center gap-2"
                                    >
                                        <Upload size={20} />
                                        {newElementFile ? newElementFile.name : 'Choose Image'}
                                    </button>
                                </div>

                                <button
                                    onClick={submitNewElement}
                                    className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Create Element
                                </button>
                            </div>
                        )}

                        {/* Elements Grid */}
                        <div className="grid grid-cols-2 gap-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                            {availableElements.map((element) => (
                                <div
                                    key={element.id}
                                    draggable
                                    onDragStart={(e) => onDragStart(element, e)}
                                    className="group relative bg-white border rounded-lg p-2 cursor-move hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                                >
                                    <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-md">
                                        <Image
                                            src={`${objectBaseUrl}${element.imageUrl}`}
                                            alt={element.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-contain group-hover:scale-110 transition-transform duration-200"
                                        />
                                    </div>
                                    <p className="text-xs font-medium text-center truncate px-1">
                                        {element.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};