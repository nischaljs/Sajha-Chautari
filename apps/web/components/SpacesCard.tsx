import { Space } from "@/types/Space";
import { User } from "@/types/User";
import { Settings, Users } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Button } from "./ui/button";
import { Card, CardFooter, CardHeader } from "./ui/card";
import Image from "next/image";

interface SpacesCardProps {
    filteredSpaces: Space[],
    user: User,
    router:AppRouterInstance
}


export default function SpacesCard({ filteredSpaces, user, router }: SpacesCardProps) {

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSpaces.map((space: Space) => (
            <Card key={space.id} className="overflow-hidden hover:shadow-lg transition-all">
                <div className="aspect-video relative overflow-hidden">
                    <Image
                        src={space.map.thumbnail || "/api/placeholder/400/320"}
                        alt={space.name}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                        width={400}
                        height={320}
                    />
                    {space.map.thumbnail}
                    {space.creator.id === user?.id && (
                        <div className="absolute top-3 right-3">
                            <Button
                                variant="secondary"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/spaces/${space.id}/settings`);
                                }}
                            >
                                <Settings className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                <CardHeader>
                    <h3 className="text-xl font-semibold text-gray-900">
                        {space.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                        Created by {space.creator.nickname}
                    </p>
                </CardHeader>
                <CardFooter className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                            {space.users.length}/{space.capacity} members
                        </span>
                    </div>
                    <Button
                        onClick={() => router.push(`/spaces/${space.id}`)}
                        variant={space.creator.id === user?.id ? "default" : "secondary"}
                    >
                        {space.creator.id === user?.id ? "Enter" : "Join"}
                    </Button>
                </CardFooter>
            </Card>
        ))}
        </div >

    )

}