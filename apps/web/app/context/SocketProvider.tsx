"use client"

import React, { 
    createContext, 
    useCallback, 
    useContext, 
    useEffect, 
    useState } from 'react'
    import { Socket, io } from 'socket.io-client'
    
    // Interface defining the structure of the SocketContext
    interface ISocketContext {
      messages: string[]
      socket: any
      sendMessage: (msg: string) => void
    }
    
    
    const SocketContext = createContext<ISocketContext | null>(null)
    
    // Custom hook for easily accessing the socket context
    export const useSocket = () => {
      const state = useContext(SocketContext);
      if (!state) throw new Error(`state is undefined`);
      return state;
    }
    
    export const SocketProvider: React.FC<{ 
        children: React.ReactNode 
    }> = ({ children }) => {
    
      // State to hold the socket instance 
      const [socket, setSocket] = useState<Socket>()
      // To hold all messages in socket connection
      const [messages, setMessages] = useState<string[]>([])
    
      // function to send a message from chat
      const sendMessage: ISocketContext["sendMessage"] = useCallback(
        (msg: string) => {
            console.log("sending msg...", msg)
            if (!socket) throw new Error("socket not ready")
            // emit event to send message from socket
            socket?.emit("event:message", { message: msg })
      }, [socket])
    
    
      const onMessageReceived = useCallback((msg: string) => {
        const { message } = JSON.parse(msg) as { message: string }
        // Set the msg received in the messages state
        setMessages((prev) => [...prev, message])
      }, [])
    
      // Effect to set up the socket connection when the component mounts
      useEffect(() => {
        // Create a new socket instance
        const _socket = io("http://localhost:8000")
    
        // Set up an event listener for the "message" event
        // This function if fired when the `message` is received from the backend
        _socket.on("message", onMessageReceived)
    
        // Set the socket instance in the state
        setSocket(_socket)
    
        // Cleanup function to disconnect the socket when the component unmounts 
        // for better performace
        return () => {
          setSocket(undefined)
          _socket.disconnect();
          _socket.off("message", onMessageReceived)
        }
      }, [])
    
      // Provide the socket context to the wrapped components
      return (
        <SocketContext.Provider value={{ socket, messages, sendMessage }}>
          {children}
        </SocketContext.Provider>
      )
    }
    