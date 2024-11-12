"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, Settings2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import api from "@/utils/axiosInterceptor";
import Image from "next/image";

interface Map {
    id: string;
    name: string;
    thumbnail: string;
    width: number;
    height: number;
}

const AdminDashboard: React.FC = () => {
    const [availableMaps, setAvailableMaps] = useState<Map[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newMap, setNewMap] = useState({ name: "", thumbnail: "", width: 0, height: 0, dropX: 0, dropY: 0 });

    useEffect(() => {
        const fetchMaps = async () => {
            try {
                setLoading(true);
                const response = await api.get("/spaces/maps");
                setAvailableMaps(response.data.data || []);
                setError(null);
            } catch (err) {
                setError("Failed to load maps. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchMaps();
    }, []);

    const handleDialogOpen = () => setIsDialogOpen(true);
    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setNewMap({ name: "", thumbnail: "", width: 0, height: 0, dropX: 0, dropY: 0 });
    };

    const handleAddMap = async () => {
        try {
            const response = await api.post("/admin/maps", newMap);
            setAvailableMaps((prev) => [...prev, response.data.data]);
            handleDialogClose();
        } catch (err) {
            setError("Failed to add map. Please try again.");
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedValue =
            name === "width" || name === "height" || name === "dropX" || name === "dropY"
                ? parseInt(value) || 0
                : value;
        setNewMap((prev) => ({ ...prev, [name]: updatedValue }));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Card className="max-w-6xl mx-auto shadow-lg">
                <CardHeader className="space-y-1 bg-gradient-to-r from-blue-600 to-blue-700">
                    <div className="flex items-center justify-between px-2">
                        <CardTitle className="text-2xl font-bold text-white">Map Management Dashboard</CardTitle>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    onClick={handleDialogOpen}
                                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                                >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Add New Map
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogTitle className="text-xl font-semibold mb-4">Add New Map</DialogTitle>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Map Name</Label>
                                        <Input
                                            name="name"
                                            value={newMap.name}
                                            onChange={handleInputChange}
                                            className="focus:ring-blue-500"
                                            placeholder="Enter map name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Thumbnail URL</Label>
                                        <Input
                                            name="thumbnail"
                                            value={newMap.thumbnail}
                                            onChange={handleInputChange}
                                            className="focus:ring-blue-500"
                                            placeholder="Enter thumbnail URL"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Width</Label>
                                            <Input
                                                type="number"
                                                name="width"
                                                value={newMap.width}
                                                onChange={handleInputChange}
                                                className="focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Height</Label>
                                            <Input
                                                type="number"
                                                name="height"
                                                value={newMap.height}
                                                onChange={handleInputChange}
                                                className="focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Default Drop Location</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                type="number"
                                                name="dropX"
                                                value={newMap.dropX}
                                                onChange={handleInputChange}
                                                placeholder="X Position"
                                                className="focus:ring-blue-500"
                                            />
                                            <Input
                                                type="number"
                                                name="dropY"
                                                value={newMap.dropY}
                                                onChange={handleInputChange}
                                                placeholder="Y Position"
                                                className="focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="mt-6">
                                    <Button onClick={handleDialogClose} variant="outline">
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleAddMap}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Save Map
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {availableMaps.length > 0 ? (
                                availableMaps.map((map) => (
                                    <div
                                        key={map.id}
                                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                                    >
                                        <div className="flex items-center justify-between p-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="relative w-20 h-20 rounded-md overflow-hidden">
                                                    <Image
                                                        src={map.thumbnail || '/api/placeholder/80/80'}
                                                        alt={map.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{map.name || 'Untitled Map'}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {map.width}x{map.height} pixels
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
                                                <Settings2 className="w-4 h-4 mr-1" />
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 px-4">
                                    <div className="text-gray-400 mb-4">No maps available</div>
                                    <Button
                                        onClick={handleDialogOpen}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Add Your First Map
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;