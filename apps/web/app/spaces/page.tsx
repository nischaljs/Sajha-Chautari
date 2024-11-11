
"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/utils/axiosInterceptor";

interface Space {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isOwner: boolean;
  thumbnailUrl: string;
  lastVisited: string;
}

export default function SpacesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"joined" | "created">("joined");
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSpaces();
  }, []);

  async function fetchSpaces() {
    setLoading(true);
    try {
      const response = await api.get("/spaces/");
      if (!response?.data?.success) {
        throw new Error("Failed to fetch spaces");
      }
      const data = response?.data?.data;
      setSpaces(data);
        console.log("response",data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load spaces");
    } finally {
      setLoading(false);
    }
  }

  function handleCreateSpace() {
    router.push("/spaces/create");
  }

  function handleJoinSpace(spaceId: string) {
    router.push(`/spaces/${spaceId}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Spaces</h1>
        <button
          onClick={handleCreateSpace}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New Space
        </button>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("joined")}
            className={`${
              activeTab === "joined"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            Joined Spaces
          </button>
          <button
            onClick={() => setActiveTab("created")}
            className={`${
              activeTab === "created"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            Created Spaces
          </button>
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : spaces.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === "joined"
              ? "No joined spaces yet"
              : "No created spaces yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {activeTab === "joined"
              ? "Join a space to collaborate with others"
              : "Create your first space to get started"}
          </p>
          {activeTab === "joined" ? (
            <button
              onClick={() => router.push("/spaces/browse")}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse Spaces
            </button>
          ) : (
            <button
              onClick={handleCreateSpace}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Space
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <div
              key={space.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="h-48 bg-gray-200 relative">
                <img
                  src={space.thumbnailUrl || "/api/placeholder/400/320"}
                  alt={space.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {space.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {space.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Users className="h-4 w-4 mr-1" />
                    {space.memberCount} members
                  </div>
                  <div className="flex space-x-2">
                    {space.isOwner && (
                      <button
                        onClick={() =>
                          router.push(`/spaces/${space.id}/settings`)
                        }
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                      >
                        <Settings className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleJoinSpace(space.id)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                    >
                      {space.isOwner ? "Enter" : "Join"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
