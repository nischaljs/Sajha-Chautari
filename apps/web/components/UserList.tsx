import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@/types/User";
import { ChevronRight, ChevronLeft, Users } from "lucide-react";

interface UserListProps {
    users: User[] | null;
    currentUserId: string | null;
}

const UserList: React.FC<UserListProps> = ({ users = [], currentUserId }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const DEFAULT_AVATAR_URL = "https://cdn.pixabay.com/photo/2024/02/15/14/57/animal-8575560_640.jpg";

    if (!users || users.length === 0) {
        return null;
    }

    return (
        <div
            className={`fixed right-4 top-4 transition-all duration-300 ease-in-out z-50 ${
                isCollapsed ? 'w-12' : 'w-64'
            }`}
        >
            <Card className="h-full relative">
                {/* Collapse toggle button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-primary text-white rounded-full p-1 hover:bg-primary/90 transition-colors"
                >
                    {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>

                {isCollapsed ? (
                    // Collapsed state
                    <div className="p-2 flex flex-col items-center">
                        <Users size={24} />
                        <div className="mt-2 text-sm font-bold">{users.length}</div>
                    </div>
                ) : (
                    // Expanded state
                    <div className="p-4">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Users size={18} className="mr-2" />
                            Users ({users.length})
                        </h3>
                        <ScrollArea className="h-[calc(100vh-200px)]">
                            <ul className="space-y-2">
                                {users.map((user) => (
                                    <li
                                        key={user.id}
                                        className={`flex items-center p-2 rounded-lg ${
                                            user.id === currentUserId ? "bg-primary/10" : "bg-gray-50"
                                        } transition-colors duration-200 hover:bg-gray-100`}
                                    >
                                        <img
                                            src={user.avatar?.imageUrl || DEFAULT_AVATAR_URL}
                                            alt={`${user.nickname || "User"}'s avatar`}
                                            className="w-8 h-8 rounded-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = DEFAULT_AVATAR_URL;
                                            }}
                                        />
                                        <div className="ml-2 flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">
                                                {user.nickname || "Unknown User"}
                                                {user.id === currentUserId && (
                                                    <span className="text-xs text-gray-500 ml-1">(You)</span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default UserList;