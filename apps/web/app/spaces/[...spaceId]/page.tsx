"use client"

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User } from "@/types/User";

const SpaceComponent = () => {
    const params = useParams();
    const spaceId = params.spaceId ? params.spaceId[0] : null;
    const token = localStorage.getItem("token");

    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [error, setError] = useState("");

    const handleMovement = (direction:string) => {
        const newPosition = { ...position };
        
        switch (direction) {
            case 'up':
                newPosition.y -= 1;
                break;
            case 'down':
                newPosition.y += 1;
                break;
            case 'left':
                newPosition.x -= 1;
                break;
            case 'right':
                newPosition.x += 1;
                break;
        }

        if (socket) {
            socket.emit('movement', newPosition);
        }
    };

    useEffect(() => {
        if (spaceId && token) {
            const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
            if (!socketUrl) {
                setError("Socket URL not found");
                return;
            }

            const ws = io(socketUrl, {
                auth: {
                    token: token,
                    spaceId: spaceId,
                },
            });

            ws.on("connection", (data) => {
                setConnected(true);
            });

            ws.on("initialize_space", (data) => {
                setConnected(true);
                if (data.success && data.users) {
                    setUsers(data.users);
                }
            });

            ws.on("join_space", (data) => {
                if (data.success) {
                    setUsers(prevUsers => [...prevUsers, data.users]);
                }
            });

            ws.on("leave_space", (data) => {
                if (data.success) {
                    setUsers(prevUsers => prevUsers.filter(user => user.id !== data.id));
                }
            });

            ws.on("movementResult", (data) => {
                if (data.success) {
                    setPosition(data.newCoordinates);

                } else {
                    setError(data.message);
                    setTimeout(() => setError(""), 3000);

                }
            });

            ws.on("disconnect", () => {
                setConnected(false);
            });

            setSocket(ws);

            return () => {
                ws.disconnect();
            };
        }
    }, [spaceId, token]);

    return (
        <Card className="p-6 max-w-xl mx-auto">
            {connected ? (
                <div className="space-y-4">
                    <div className="text-lg font-bold">
                        Connected to space {spaceId}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                        <div></div>
                        <Button onClick={() => handleMovement('up')}>Up</Button>
                        <div></div>
                        <Button onClick={() => handleMovement('left')}>Left</Button>
                        <div className="text-center py-2">
                            ({position.x}, {position.y})
                        </div>
                        <Button onClick={() => handleMovement('right')}>Right</Button>
                        <div></div>
                        <Button onClick={() => handleMovement('down')}>Down</Button>
                        <div></div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-center">
                            {error}
                        </div>
                    )}

                    <div className="mt-4">
                        <h3 className="font-bold mb-2">Users in Space:</h3>
                        <div className="space-y-2">
                            {users.map((user, index) => (
                                <div key={index} className="p-2 bg-gray-100 rounded">
                                    {user.nickname} at ({user?.position?.x}, {user?.position?.y})
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4">
                    Connecting...
                </div>
            )}
        </Card>
    );
};

export default SpaceComponent;