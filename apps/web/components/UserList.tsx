import React from "react";
import { User } from "@/types/Space";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserContext } from "@/context/UserContext";

interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  const DEFAULT_AVATAR_URL = 'https://cdn.pixabay.com/photo/2024/02/15/14/57/animal-8575560_640.jpg';
  const user = useUserContext();
  const currentUserId = user?.id;

  return (
    <Card className="mt-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Users in Space</h3>
        <span className="text-sm text-gray-500">
          {users.length} {users.length === 1 ? 'user' : 'users'} online
        </span>
      </div>

      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className={`
                flex items-center p-3 rounded-lg
                ${user.id === currentUserId ? 'bg-primary/10' : 'bg-gray-50'}
                transition-colors duration-200 hover:bg-gray-100
              `}
            >
              <div className="relative">
                <img
                  src={user.avatar?.imageUrl || DEFAULT_AVATAR_URL}
                  alt={`${user.nickname}'s avatar`}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span 
                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white
                    ${user.id === currentUserId ? 'bg-green-500' : 'bg-blue-500'}
                  `}
                />
              </div>

              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${user.id === currentUserId ? 'text-primary' : ''}`}>
                    {user.nickname}
                    {user.id === currentUserId && (
                      <span className="ml-2 text-xs text-gray-500">(You)</span>
                    )}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Position: ({user.position?.x || 0}, {user.position?.y || 0})
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default UserList;