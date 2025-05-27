"use client";

import React, { useState } from "react";
import { PaperAirplaneIcon, MicrophoneIcon } from "@heroicons/react/24/outline";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assistant: "text2cypher",
          query: input,
        }),
      });

      const data = await res.json();
      const reply = data?.response?.response || "(No response)";
      const assistantMessage: Message = { role: "assistant", content: reply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ 서버 응답에 문제가 있습니다.",
        },
      ]);
    }
  };

  const handleVoiceInput = () => {
    alert("Voice input not implemented yet.");
  };

  return (
    <div className="w-auto h-full rounded-b-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-900  shadow-2xl p-2  flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 text-lg font-semibold text-gray-900 dark:text-white">
        AI Assistant
      </div>
      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="p-2 rounded-full bg-gray-700 text-white hover:bg-brand-600 transition"
            onClick={handleVoiceInput}
            aria-label="Voice Chat"
          >
            <MicrophoneIcon className="h-5 w-5" />
          </button>
          <button
            className={`p-2 rounded-full transition text-white ${
              input.trim()
                ? "bg-brand-500 hover:bg-brand-600"
                : "bg-gray-700 cursor-not-allowed"
            }`}
            onClick={handleSend}
            aria-label="Send Message"
            disabled={!input.trim()}
          >
            <PaperAirplaneIcon className="h-5 w-5 rotate-45" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3 max-h-[350px] border dark:border-gray-700">
        {messages.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Start a conversation...
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg max-w-[80%] w-fit whitespace-pre-wrap text-sm ${
                msg.role === "user"
                  ? "ml-auto bg-brand-500/50 text-gray-200"
                  : "bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-white"
              }`}
            >
              {msg.content}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AIChatPanel;
