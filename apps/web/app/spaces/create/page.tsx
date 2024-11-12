"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import api from "@/utils/axiosInterceptor";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FormData {
  name: string;
  capacity: number;
  mapId: string;
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
    mapId: ""
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
        capacity: formData.capacity
      });
      router.push(`/spaces/${data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create space");
      setLoading(false);
    } finally {
      setLoading(false)
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "capacity"
          ? parseInt(value, 10) // Explicitly convert capacity to a number
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Space</h1>
        <p className="mt-2 text-sm text-gray-600">
          Set up your virtual space for collaboration and interaction
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Space Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="My Awesome Space"
          />
        </div>

        {/* Map Selection */}
        <div>
          <label
            htmlFor="mapId"
            className="block text-sm font-medium text-gray-700"
          >
            Select Map
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {maps.map((map) => (
              <Card
                key={map.id}
                className={`cursor-pointer ${selectedMap?.id === map.id ? "border-2 border-blue-500" : ""
                  }`}
                onClick={() => handleMapSelect(map)}
              >
                <CardHeader>
                  <CardTitle>{map.name || "Untitled Map"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={map.thumbnail || "/api/placeholder/200/150"}
                    alt={map.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Capacity */}
        <div>
          <label
            htmlFor="capacity"
            className="block text-sm font-medium text-gray-700"
          >
            Capacity
          </label>
          <select
            name="capacity"
            id="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value={10}>10 participants</option>
            <option value={25}>25 participants</option>
            <option value={50}>50 participants</option>
            <option value={100}>100 participants</option>
          </select>
        </div>


        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
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
      </form>
    </div>
  );
}