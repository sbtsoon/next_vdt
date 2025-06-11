"use client";

import React, { useEffect, useState, useRef } from "react";
import { PaperAirplaneIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import { useAtom } from "jotai";
import { aiQueryAtom } from "@/store/graphAtoms";
import { useAiAssistantChatMutation } from "@/hooks/useAiAssistant";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [, setAiQuery] = useAtom(aiQueryAtom);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { mutate: sendAiQuery, isPending } = useAiAssistantChatMutation();

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;
    setInput(""); // 입력창 비우기

    sendAiQuery(currentInput, {
      onSuccess: (data) => {
        const cypher = data?.response?.cypher;
        const reply = data?.response?.response || "(No response)";

        setAiQuery({ query: cypher });

        const assistantMessage: Message = { role: "assistant", content: reply };
        setMessages((prev) => [...prev, assistantMessage]);
      },
      onError: () => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "⚠️ 서버 응답에 문제가 있습니다." },
        ]);
      },
    });
  };

  const handleVoiceInput = () => {
    alert("Voice input not implemented yet.");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      <div className="h-[350px] overflow-y-auto p-4 custom-scrollbar space-y-3 border dark:border-gray-700">
        {messages.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Start a conversation...
          </p>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg w-[80%]  whitespace-pre-wrap text-sm ${
                  msg.role === "user"
                    ? "ml-auto bg-brand-500/50 text-gray-200"
                    : "bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-white"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isPending && (
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 w-fit">
                <span className="animate-pulse">Assistant is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default AIChatPanel;
