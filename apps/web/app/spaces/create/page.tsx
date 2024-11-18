"use client"

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import api from "@/utils/axiosInterceptor";
import { Globe, Layout, Loader2, Lock, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FormData {
  name: string;
  capacity: number;
  mapId: string;
  isPublic: boolean;
}

interface MapData {
  id: string;
  name: string;
  thumbnail: string;
  width: number;
  height: number;
  dropX: number;
  dropY: number;
}

export default function CreateSpacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [maps, setMaps] = useState<MapData[]>([]);
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    capacity: 25,
    mapId: "",
    isPublic: false
  });

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const { data } = await api.get("/spaces/maps");
        setMaps(data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch maps");
      }
    };
    fetchMaps();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/spaces", {
        name: formData.name,
        mapId: formData.mapId,
        capacity: formData.capacity,
        isPublic: formData.isPublic
      });
      router.push(`/spaces/${data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create space");
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "capacity"
          ? parseInt(value, 10)
          : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : type === "number"
              ? parseInt(value, 10)
              : value,
    }));
  };

  const handleMapSelect = (map: MapData) => {
    setSelectedMap(map);
    setFormData((prev) => ({
      ...prev,
      mapId: map.id,
      thumbnailUrl: map.thumbnail,
    }));
  };

  const handleVisibilityToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isPublic: checked,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Layout className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Space</h1>
            <p className="mt-2 text-sm text-gray-600">
              Set up your virtual space for collaboration and interaction
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Name Input with Icon */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Space Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
              placeholder="My Awesome Space"
            />
          </div>

          {/* Visibility Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Space Visibility</label>
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                {formData.isPublic ? (
                  <Globe className="h-5 w-5 text-green-500" />
                ) : (
                  <Lock className="h-5 w-5 text-orange-500" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {formData.isPublic ? "Public Space" : "Private Space"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formData.isPublic
                      ? "Anyone can find and join this space"
                      : "Only invited members can join this space"}
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.isPublic}
                onCheckedChange={handleVisibilityToggle}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>

          {/* Map Selection */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Select Map
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {maps.map((map) => (
                <Card
                  key={map.id}
                  className={`cursor-pointer transform transition-all duration-200 hover:scale-105 ${
                    selectedMap?.id === map.id
                      ? "ring-2 ring-blue-500 shadow-lg"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => handleMapSelect(map)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">{map.name || "Untitled Map"}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="relative">
                      <img
                        src={map.thumbnail || "/api/placeholder/200/150"}
                        alt={map.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {selectedMap?.id === map.id && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
                            Selected
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Capacity Selection */}
          <div className="space-y-2">
            <label htmlFor="capacity" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Capacity
            </label>
            <select
              name="capacity"
              id="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
            >
              <option value={10}>10 participants</option>
              <option value={25}>25 participants</option>
              <option value={50}>50 participants</option>
              <option value={100}>100 participants</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="hover:bg-gray-100"
            >
              Cancel
            </Button>
            <div className="space-x-4">
              <Button
                type="button"
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-50"
                onClick={() => setFormData({ name: "", capacity: 25, mapId: "", isPublic: true })}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.mapId || !formData.name}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  "Create Space"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}