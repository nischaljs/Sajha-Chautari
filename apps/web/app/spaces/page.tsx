"use client";

import SpacesCard from "@/components/SpacesCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserContext } from "@/context/UserContext";
import { Space } from "@/types/Space";
import api from "@/utils/axiosInterceptor";
import { Loader2, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SpacesPage() {
  const user = useUserContext();
  const [activeTab, setActiveTab] = useState<string>("public");
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [publicSpaces, setPublicSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    handleTabChange(activeTab);
  }, [activeTab]);

  const handleTabChange = async (tab: string) => {
    setLoading(true);
    setError("");
    try {
      if (tab === "public") {
        await fetchPublicSpaces();
      } else {
        await fetchSpaces();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load spaces");
    } finally {
      setLoading(false);
    }
  };

  async function fetchPublicSpaces() {
    try {
      const response = await api.get("/spaces/public");
      if (!response?.data?.success) {
        throw new Error("Failed to fetch public spaces");
      }
      // Ensure we're setting an array
      setPublicSpaces(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load public spaces");
      setPublicSpaces([]); // Set empty array on error
    }
  }

  async function fetchSpaces() {
    try {
      const response = await api.get("/spaces/");
      if (!response?.data?.success) {
        throw new Error("Failed to fetch spaces");
      }
      // Ensure we're setting an array
      setSpaces(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load spaces");
      setSpaces([]); // Set empty array on error
    }
  }

  const getDisplaySpaces = (): Space[] => {
    if (activeTab === "public") {
      return publicSpaces;
    }
    if (activeTab === "joined") {
      return spaces.filter(space => space.creator.id !== user?.id);
    }
    return spaces.filter(space => space.creator.id === user?.id);
  };

  const getEmptyStateContent = () => {
    switch (activeTab) {
      case "public":
        return {
          title: "No Public Spaces Available",
          description: "Currently there are no public spaces available to join. Why not create one?",
          actionText: "Create Public Space",
          actionPath: "/spaces/create"
        };
      case "joined":
        return {
          title: "No Joined Spaces",
          description: "You haven't joined any spaces yet. Browse public spaces to find communities to join!",
          actionText: "Browse Public Spaces",
          actionPath: "/spaces/browse"
        };
      default:
        return {
          title: "No Created Spaces",
          description: "You haven't created any spaces yet. Create your first space to start collaborating!",
          actionText: "Create Space",
          actionPath: "/spaces/create"
        };
    }
  };

  const displaySpaces = getDisplaySpaces();
  const emptyState = getEmptyStateContent();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Spaces</h1>
              <p className="text-gray-500 mt-2">
                {user ? `Welcome back, ${user.nickname}!` : "Loading user..."}
              </p>
            </div>
            <Button onClick={() => router.push("/spaces/create")} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Space
            </Button>
          </div>

          <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="public">Public Spaces</TabsTrigger>
              <TabsTrigger value="joined">Joined Spaces</TabsTrigger>
              <TabsTrigger value="created">Created Spaces</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  <p className="font-medium">Error loading spaces</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : !displaySpaces || displaySpaces.length === 0 ? (
                <Card className="bg-white">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-blue-50 p-3 mb-4">
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {emptyState.title}
                    </h3>
                    <p className="text-gray-500 text-center max-w-sm mb-6">
                      {emptyState.description}
                    </p>
                    <Button onClick={() => router.push(emptyState.actionPath)}>
                      {emptyState.actionText}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <SpacesCard 
                  user={user} 
                  filteredSpaces={displaySpaces} 
                  router={router} 
                />
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}