'use client'

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings2, 
  PlusIcon, 
  ImageIcon, 
  MapIcon, 
  LoaderIcon, 
  XCircleIcon 
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/utils/axiosInterceptor";
import AddAvatarPopup from "@/components/add-avatar-popup";
import { avatarsBaseUrl } from "@/utils/Links";

interface Map {
  id: string;
  name: string;
  thumbnail: string;
  width: number;
  height: number;
}

interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
}

const AdminDashboard: React.FC = () => {
  const mapBaseUrl = process.env.NEXT_PUBLIC_HTTP_MAP;
  const [availableMaps, setAvailableMaps] = useState<Map[]>([]);
  const [availableAvatars, setAvailableAvatars] = useState<Avatar[]>([]);
  const [showAddAvatarsPopup, setShowAddAvatarsPopup] = useState(false);
  const [loading, setLoading] = useState({
    maps: true,
    avatars: true
  });
  const [error, setError] = useState<{
    maps?: string | null;
    avatars?: string | null;
  }>({});

  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading({ maps: true, avatars: true });
      
      // Parallel data fetching
      const [mapsResponse, avatarsResponse] = await Promise.all([
        api.get("/spaces/maps"),
        api.get("/user/avatars")
      ]);

      setAvailableMaps(mapsResponse.data.data || []);
      setAvailableAvatars(avatarsResponse.data.data || []);
      
      setError({});
    } catch (err: any) {
      setError({
        maps: err.response?.data?.message || "Failed to load maps",
        avatars: err.response?.data?.message || "Failed to load avatars"
      });
    } finally {
      setLoading({ maps: false, avatars: false });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddAvatars = () => {
    setShowAddAvatarsPopup(!showAddAvatarsPopup);
  };

  const renderMapsContent = () => {
    if (loading.maps) {
      return (
        <div className="flex items-center justify-center h-64">
          <LoaderIcon className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (error.maps) {
      return (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
          <XCircleIcon className="mr-2" />
          <p>{error.maps}</p>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableMaps.length > 0 ? (
          availableMaps.map((map) => (
            <div
              key={map.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="p-4 flex items-center space-x-4">
                <div className="relative w-20 h-20 rounded-md overflow-hidden">
                  <Image
                    src={mapBaseUrl + map.thumbnail || '/api/placeholder/80/80'}
                    alt={map.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-800">{map.name || 'Untitled Map'}</h3>
                  <p className="text-sm text-gray-500">
                    {map.width}x{map.height} pixels
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-600 hover:bg-blue-50"
                  onClick={() => router.push(`/admindash/${map.id}`)}
                >
                  <Settings2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 px-4">
            <div className="text-gray-400 mb-4">No maps available</div>
            <Button
              onClick={() => router.push('/admindash/createMap')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create First Map
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderAvatarsContent = () => {
    if (loading.avatars) {
      return (
        <div className="flex items-center justify-center h-64">
          <LoaderIcon className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (error.avatars) {
      return (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
          <XCircleIcon className="mr-2" />
          <p>{error.avatars}</p>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableAvatars.length > 0 ? (
          availableAvatars.map((avatar) => (
            <div
              key={avatar.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="p-4 flex items-center space-x-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden">
                  <Image
                    src={avatarsBaseUrl+avatar.imageUrl || '/api/placeholder/80/80'}
                    alt={avatar.name}
                    width={200}
                    height={200}
                    className="object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-800">{avatar.name || 'Unnamed Avatar'}</h3>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Settings2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 px-4">
            <div className="text-gray-400 mb-4">No avatars available</div>
            <Button
              onClick={handleAddAvatars}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add First Avatar
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <Card className="max-w-6xl mx-auto shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
          <div className="flex items-center justify-between px-2">
            <CardTitle className="text-2xl font-bold text-white">
              Admin Dashboard
            </CardTitle>
            <Button 
              onClick={() => router.push('/admindash/createMap')} 
              variant="secondary"
              className="text-blue-700 hover:text-blue-800"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs defaultValue="maps" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="maps" className="flex items-center">
                <MapIcon className="w-4 h-4 mr-2" />
                Maps
              </TabsTrigger>
              <TabsTrigger value="avatars" className="flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Avatars
              </TabsTrigger>
            </TabsList>
            <TabsContent value="maps">
              {renderMapsContent()}
            </TabsContent>
            <TabsContent value="avatars">
              {renderAvatarsContent()}
              <div className="mt-4 text-center">
                <Button 
                  onClick={handleAddAvatars} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Avatar
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {showAddAvatarsPopup && (
        <AddAvatarPopup onclose={handleAddAvatars} />
      )}
    </div>
  );
};

export default AdminDashboard;