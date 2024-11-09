"use client"

import { useEffect, useState } from "react";
import { useSocket } from "./context/SocketProvider";

export default function Home() {
  const [message, setMessage] = useState('');
  const { messages, sendMessage } = useSocket();

  const handleSubmit = () => {
    if (message === "") return;
    setMessage('');
    sendMessage(message);
  };

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  return (
    <div className="m-10 h-[600px] flex flex-col border-2 rounded-md border-white p-2 bg-gray-900">
      <div className="h-full overflow-y-auto flex flex-col p-2 overflow-x-hidden gap-2">
        {/* Display each message */}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-md text-white max-w-xs ${
              index % 2 === 0 ? "bg-blue-600 self-start" : "bg-green-600 self-end"
            }`}
          >
            {msg}
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        <input
          onChange={(e) => setMessage(e.target.value)}
          type="text"
          value={message}
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
          className="bg-zinc-700 w-full px-6 py-2 rounded-md text-white placeholder-gray-400"
        />
        <button
          onClick={() => handleSubmit()}
          className="ml-2 px-6 py-2 border-2 border-white rounded-md text-white hover:bg-white hover:text-black transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
