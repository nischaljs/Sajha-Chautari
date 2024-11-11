"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
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
                console.log(response.data.data)
                /*
                outpuuuuuuuuuuuuuuuuts like this for reference Array [ {…}, {…} ]
        ​
        0: Object { id: "cm3d633kx0000hr66dxu2dmer", width: 600, height: 600, … }
         ​
        dropX: 20
         ​
        dropY: 20
         ​
        height: 600
         ​
        id: "cm3d633kx0000hr66dxu2dmer"
         ​
        name: ""
         ​
        thumbnail: "https://png.pngtree.com/thumb_back/fh260/background/20230825/pngtree-landscape-with-mountains-forest-and-clouds-2d-game-background-image_13246432.jpg"
         ​
        width: 600
         ​
        <prototype>: Object { … }
        ​
        1: Object { id: "cm3d634yd0001hr669sxlx8o6", width: 0, height: 0, … }
         ​
        dropX: 0
         ​
        dropY: 0
         ​
        height: 0
         ​
        id: "cm3d634yd0001hr669sxlx8o6"
         ​
        name: ""
         ​
        thumbnail: ""
         ​
        width: 0
         ​
        <prototype>: Object { … }
        ​
        length: 2
        ​
        <prototype>: Array []*/
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
            console.log(response.data.data)
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
        <div className="w-full h-full flex items-center justify-center">
            <Card className="w-full max-w-4xl">
                <CardHeader className="bg-gradient-to-r from-[#2196E0] to-[#2196F3] text-white px-8 py-6 rounded-t-md">
                    <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <h3 className="text-lg font-medium mb-4 text-gray-700">Current Available Maps</h3>
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <ul className="space-y-4">
                            {availableMaps.length > 0 ? (
                                availableMaps.map((map) => (
                                    <li key={map.id} className="bg-white p-4 rounded-md shadow-md flex items-center justify-between">
                                        <span className="text-gray-800 font-medium">{map.name}</span>
                                        <Image src={`${map.thumbnail}`} height={800} width={1200} alt="map thumbnail" />
                                        <Button variant="secondary" size="sm" className="text-[#2196F3] hover:bg-[#2196F31A]">
                                            Edit
                                        </Button>
                                    </li>
                                ))
                            ) : (
                                <p className="text-gray-500">No maps available.</p>
                            )}
                        </ul>
                    )}
                </CardContent>
                <CardFooter className="bg-gray-100 px-8 py-6 rounded-b-md flex justify-end">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={handleDialogOpen}
                                variant="ghost"
                                className="bg-[#4CAF50] hover:bg-[#43a047] text-white flex items-center space-x-2"
                            >
                                <PlusIcon className="w-5 h-5" />
                                <span>Add Map</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle>Add New Map</DialogTitle>
                            <div className="space-y-4">
                                <div>
                                    <Label>Name</Label>
                                    <Input
                                        name="name"
                                        value={newMap.name}
                                        onChange={handleInputChange}
                                        placeholder="Map Name"
                                    />
                                </div>
                                <div>
                                    <Label>Thumbnail URL</Label>
                                    <Input
                                        name="thumbnail"
                                        value={newMap.thumbnail}
                                        onChange={handleInputChange}
                                        placeholder="Thumbnail URL"
                                    />
                                </div>
                                <div>
                                    <Label>Width</Label>
                                    <Input
                                        type="number"
                                        name="width"
                                        value={newMap.width}
                                        onChange={handleInputChange}
                                        placeholder="Width"
                                    />
                                </div>
                                <div>
                                    <Label>Height</Label>
                                    <Input
                                        type="number"
                                        name="height"
                                        value={newMap.height}
                                        onChange={handleInputChange}
                                        placeholder="Height"
                                    />
                                </div>
                                <div>
                                    <Label>Default Drop location</Label>
                                    <Input
                                        type="number"
                                        name="dropX"
                                        value={newMap.dropX}
                                        onChange={handleInputChange}
                                        placeholder="postitionx"
                                    />
                                    <Input
                                        type="number"
                                        name="dropY"
                                        value={newMap.dropY}
                                        onChange={handleInputChange}
                                        placeholder="postitiony"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleDialogClose} variant="secondary">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddMap}
                                    variant="ghost"
                                    className="bg-[#4CAF50] hover:bg-[#43a047] text-white"
                                >
                                    Save Map
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>
        </div>
    );
};

export default AdminDashboard;
