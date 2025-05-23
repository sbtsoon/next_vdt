"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  PaperAirplaneIcon,
  MicrophoneIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import AIChatPanel from "@/components/AIChatPanel";

const DashboardPage: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const router = useRouter();

  return (
    <div className="relative h-[calc(100%-90px)] w-full bg-gray-50 dark:bg-gray-900 p-4">
      {/* AI Toggle Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed top-30 right-6 z-50 bg-brand-500 text-white p-2 rounded-full shadow-lg hover:bg-brand-600"
        aria-label="Toggle AI Chat"
      >
        <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
      </button>

      {/* AI Chat Panel */}
      {showChat && (
        <div className="fixed top-35 right-6 z-40 w-[350px] h-[480px]">
          <AIChatPanel />
        </div>
      )}

      {/* Main Content */}
      <div className="mt-20 text-center text-gray-800 dark:text-white">
        <h1 className="text-2xl font-bold mb-4">Welcome to NetGraph Dashboard</h1>
        <p className="text-lg mb-10">Select an action or interact with the AI Assistant.</p>

        {/* Action Buttons */}
        <div className="flex justify-center flex-wrap gap-6 mb-10">
          <button
            onClick={() => router.push("/DataImport")}
            className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow hover:shadow-lg transition"
          >
            New Project
          </button>
          <button className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow hover:shadow-lg transition">
            Open Project
          </button>
          <button className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow hover:shadow-lg transition">
            Quick Tutorial
          </button>
        </div>

        {/* Recent Activity Slider */}
        <div className="overflow-x-auto whitespace-nowrap px-4">
          <h2 className="text-xl font-semibold mb-4 text-left">Recent Activity / Favorites</h2>
          <div className="flex gap-4">
            {["project1.png", "project2.png", "project3.png", "project4.png", "project5.png", "project6.png"].map(
              (file, i) => (
                <div
                  key={i}
                  className="w-60 h-36 shrink-0 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <Image
                    src={`/images/thumbs/${file}`}
                    alt={`Thumbnail ${i + 1}`}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
