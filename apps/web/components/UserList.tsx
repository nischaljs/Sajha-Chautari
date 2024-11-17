import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@/types/User";
import { ChevronRight, ChevronLeft, Users, Circle } from "lucide-react";

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
                isCollapsed ? "w-32" : "w-72"
            }`}
        >
            <Card className="h-auto flex overflow-hidden rounded-xl border-0 shadow-lg bg-white/90 backdrop-blur-sm relative">
                {/* Slim collapse toggle button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`absolute left-0 top-0 h-full bg-gradient-to-b ${
                        isCollapsed ? "from-indigo-600 to-indigo-700" : "from-indigo-500 to-indigo-600"
                    } hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 flex items-center justify-center w-6`}
                >
                    <span className="flex items-center justify-center">
                        {isCollapsed ? (
                            <ChevronRight size={22} className="text-white" />
                        ) : (
                            <ChevronLeft size={22} className="text-white" />
                        )}
                    </span>
                </button>

                <div className="flex-1 ml-6">
                    {isCollapsed ? (
                        // Collapsed state
                        <div className="p-1 flex-1">
                            <div className="flex flex-col items-center justify-center space-y-1">
                                <Users size={20} className="text-indigo-600" />
                                <div className="text-md font-medium text-gray-600">Online</div>
                                <div className="text-md font-bold text-indigo-600">{users.length}</div>
                            </div>
                        </div>
                    ) : (
                        // Expanded state
                        <div className="p-4 w-full">
                            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                                <Users size={18} className="mr-2 text-indigo-600" />
                                Online Users
                                <span className="ml-2 text-sm font-normal text-gray-500">({users.length})</span>
                            </h3>
                            <ScrollArea className="h-auto pr-2">
                                <ul className="space-y-2">
                                    {users.map((user) => (
                                        <li
                                            key={user.id}
                                            className={`flex items-center p-2.5 rounded-lg ${
                                                user.id === currentUserId
                                                    ? "bg-indigo-50 border border-indigo-100"
                                                    : "hover:bg-gray-50"
                                            } transition-all duration-200`}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={user.avatar?.imageUrl || DEFAULT_AVATAR_URL}
                                                    alt={`${user.nickname || "User"}'s avatar`}
                                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = DEFAULT_AVATAR_URL;
                                                    }}
                                                />
                                                <Circle
                                                    size={10}
                                                    className="absolute bottom-0 right-0 fill-green-400 text-white"
                                                />
                                            </div>
                                            <div className="ml-3 flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 truncate">
                                                    {user.nickname || "Unknown User"}
                                                </div>
                                                {user.id === currentUserId && (
                                                    <div className="text-xs text-indigo-600 font-medium">You</div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default UserList;
