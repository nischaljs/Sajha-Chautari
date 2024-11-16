import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import{User} from "@/types/User"

interface UserListProps {
  users: User[] | null;
  currentUserId: string | null;
}

const UserList: React.FC<UserListProps> = ({ users = [], currentUserId }) => {
  const DEFAULT_AVATAR_URL =
    "https://cdn.pixabay.com/photo/2024/02/15/14/57/animal-8575560_640.jpg";
    console.log('users in the space',users);

  // Error handling for invalid or null `users` input
  if (!users || users.length === 0) {
    return (
      <Card className="mt-4 p-4">
        <h3 className="text-lg font-semibold mb-4">Users in Space</h3>
        <div className="text-center text-gray-500">No users found in this space.</div>
      </Card>
    );
  }

  return (
    <Card className="mt-4 p-4">
      <h3 className="text-lg font-semibold mb-4">Users in Space</h3>
      <ScrollArea className="h-[250px]">
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user.id}
              className={`flex items-center p-3 rounded-lg ${
                user.id === currentUserId ? "bg-primary/10" : "bg-gray-50"
              } transition-colors duration-200 hover:bg-gray-100`}
            >
              {/* Avatar */}
              <img
                src={user.avatar?.imageUrl || DEFAULT_AVATAR_URL}
                alt={`${user.nickname || "User"}'s avatar`}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  // Fallback to default avatar if the image fails to load
                  (e.target as HTMLImageElement).src = DEFAULT_AVATAR_URL;
                }}
              />

              {/* User Details */}
              <div className="ml-3 flex flex-col">
                <span className="font-medium text-sm text-gray-800">
                  {user.nickname || "Unknown User"}
                  {user.id === currentUserId && (
                    <span className="text-xs text-gray-500 ml-1">(You)</span>
                  )}
                </span>
                <span className="text-xs text-gray-500">
                  Position: ({user.position?.x ?? "N/A"}, {user.position?.y ?? "N/A"})
                </span>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </Card>
  );
};

export default UserList;
