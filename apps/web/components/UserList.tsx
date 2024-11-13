// components/UserList.tsx
import React from "react";
import { User } from "@/types/Space";

interface UserListProps {
  users: User[];
  currentUserId: string;
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId }) => {
  return (
    <div className="mt-4">
      <h3 className="font-bold mb-2">Users in Space:</h3>
      <div className="grid grid-cols-2 gap-2">
        {users.map((user, index) => (
          <div
            key={index}
            className="p-2 bg-gray-100 rounded flex justify-between items-center"
          >
            <span className={user.id === currentUserId ? "font-bold" : ""}>
              {user.nickname} {user.id === currentUserId && "(You)"}
            </span>
            <span className="text-sm text-gray-500">
              ({user.position?.x || 0}, {user.position?.y || 0})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;