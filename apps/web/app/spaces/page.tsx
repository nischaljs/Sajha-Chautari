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
  const [activeTab, setActiveTab] = useState<string>("joined");
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

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
      setSpaces(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load spaces");
    } finally {
      setLoading(false);
    }
  }

  const createdSpaces = spaces.filter(space => space.creator.id === user?.id);
  const joinedSpaces = spaces.filter(space => space.creator.id !== user?.id);

  const isJoinedTab = activeTab === "joined";
  const filteredSpaces = isJoinedTab ? joinedSpaces : createdSpaces;

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

          <Tabs defaultValue="joined" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="joined">Joined Spaces</TabsTrigger>
              <TabsTrigger value="created">Created Spaces</TabsTrigger>
            </TabsList>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-6">
                {error}
              </div>
            )}
            <div className="mt-6">
              {loading || !user ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : filteredSpaces.length === 0 ? (
                <Card className="bg-white">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-blue-50 p-3 mb-4">
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {isJoinedTab ? "No joined spaces yet" : "No created spaces yet"}
                    </h3>
                    <p className="text-gray-500 text-center max-w-sm mb-6">
                      {isJoinedTab
                        ? "Join others space as well to start collaborating with others"
                        : "Create your first space to begin your journey"}
                    </p>
                    <Button
                      onClick={() =>
                        isJoinedTab
                          ? router.push("/spaces/browse")
                          : router.push("/spaces/create")
                      }
                    >
                      {isJoinedTab ? "Browse Spaces" : "Create Space"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <SpacesCard user={user} filteredSpaces={filteredSpaces} router={router} />
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
