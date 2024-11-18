"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/utils/axiosInterceptor";
import { Loader2, PlusIcon, Settings2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

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
    const router = useRouter();

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



    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Card className="max-w-6xl mx-auto shadow-lg">
                <CardHeader className="space-y-1 bg-gradient-to-r from-blue-600 to-blue-700">
                    <div className="flex items-center justify-between px-2">
                        <CardTitle className="text-2xl font-bold text-white">Map Management Dashboard</CardTitle>
                       <button onClick={()=>(router.push('/admindash/createMap'))} > create map</button>
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
                                        onClick={()=>(router.push('/admindash/createMap'))}
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