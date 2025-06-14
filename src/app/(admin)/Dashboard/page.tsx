"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link"; // Link 컴포넌트 임포트
import {
  ChatBubbleLeftEllipsisIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import AIChatPanel from "@/components/AIChatPanel";

const DashboardPage: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const router = useRouter();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // 프로젝트 데이터 (이미지 파일과 연결될 링크를 포함하도록 수정)

  const projects = [
    {
      src: "project1.png",
      link: "/",
      title: "프로젝트 A",
      description: "데이터 분석 시각화"
    },
    {
      src: "project2.png",
      link: "/DataImport",
      title: "데이터 가져오기",
      description: "외부 데이터 소스를 연결합니다"
    },
    {
      src: "project3.png",
      link: "/",
       title: "프로젝트C",
      description: "Netgrap 생성"
    },
    {
      src: "project4.png",
      link: "/DataImport",
         title: "프로젝트C01",
      description: "지역별생산량"
    },
    {
      src: "project5.png",
      link: "/",
        title: "프로젝트5",
      description: "시각화BI"
    },
    {
      src: "project6.png",
      link: "/DataImport",
      title: "데이터 가져오기",
      description: "외부 데이터 소스를 연결합니다"
    },
    {
      src: "project5.png",
      link: "/DataImport",
      title: "프로젝트C",
      description: "Netgrap 생성"
    },
    {
      src: "project4.png",
      link: "/DataImport",
      title: "데이터 가져오기",
      description: "외부 데이터 소스를 연결합니다"
    },

    // 나머지도 동일하게 추가
  ];

  const ITEM_WIDTH = 240;
  const ITEM_GAP = 16;
  const ITEMS_PER_VIEW = 6;

  useEffect(() => {
    if (scrollContainerRef.current) {
      const offset = currentSlideIndex * (ITEM_WIDTH + ITEM_GAP);
      scrollContainerRef.current.style.transform = `translateX(-${offset}px)`;
    }
  }, [currentSlideIndex]);

  const scrollNext = () => {
    const maxSlideIndex = projects.length - ITEMS_PER_VIEW;
    setCurrentSlideIndex((prevIndex) => Math.min(prevIndex + 1, maxSlideIndex));
  };

  const scrollPrev = () => {
    setCurrentSlideIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const isLeftButtonDisabled = currentSlideIndex === 0;
  const isRightButtonDisabled = currentSlideIndex >= projects.length - ITEMS_PER_VIEW;

  return (
    <div className="relative h-full w-full bg-gray-50 dark:bg-gray-900 p-4 overflow-hidden">
      {/* AI Toggle Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed top-30 right-6 z-50 bg-gray-780 shadow-soon2 text-white p-2 rounded-full shadow-lg hover:bg-brand-600"
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
      <div className="mt-20 text-center text-gray-800 dark:text-white h-[calc(100%-80px)] flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-4">Welcome to NetGraph Dashboard</h1>
          <p className="text-lg mb-10">Select an action or interact with the AI Assistant.</p>

          {/* Action Buttons */}
          <div className="flex justify-center flex-wrap gap-6 mb-10">
            <button
              onClick={() => router.push("/DataImport")}
              className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white  shadow-soon2 hover:shadow-lg transition"
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
        </div>

        {/* Recent Activity Slider */}
        <div className="px-4 relative mb-4">
          <h2 className="text-xl font-semibold mb-4 text-left">Recent Activity / Favorites</h2>
          <div
            className="relative overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 mx-auto"
            style={{ width: `${ITEMS_PER_VIEW * (ITEM_WIDTH + ITEM_GAP) - ITEM_GAP}px` }}
          >
            <div
              className="flex gap-4 transition-transform duration-300 ease-in-out"
              ref={scrollContainerRef}
              style={{ width: `${projects.length * (ITEM_WIDTH + ITEM_GAP) - ITEM_GAP}px` }}
            >
              {/* 각 프로젝트 항목에 Link 컴포넌트와 호버 효과 추가 */}
              {projects.map((project, i) => (
                <Link
                key={i}
                href={project.link}
                className="w-60 shrink-0 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800
                           transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer flex flex-col justify-between"
              >
                <Image
                  src={`/images/thumbs/${project.src}`}
                  alt={`Thumbnail ${i + 1}`}
                  width={300}
                  height={200}
                  className="w-full h-36 object-cover"
                />
                <div className="p-2 text-left flex flex-col gap-1">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                    {project.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {project.description}
                  </p>
                  {/* 삭제/편집 버튼 영역 */}
                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault(); // Link 클릭 방지
                        console.log("편집:", project.title);
                      }}
                      className="text-xs text-gray-600 hover:underline"
                    >편집
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault(); // Link 클릭 방지
                        console.log("삭제:", project.title);
                      }}
                      className="text-xs text-gray-600 hover:underline"
                    >삭제
                    </button>
                  </div>
                </div>
              </Link>
              ))}
            </div>
            {/* 좌우 스크롤 버튼 */}
            <button
              onClick={scrollPrev}
              disabled={isLeftButtonDisabled}
              className={`absolute left-0 top-1/2 -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full shadow-lg hover:bg-gray-600 z-20 ${
                isLeftButtonDisabled ? 'opacity-30 cursor-not-allowed' : 'opacity-70'
              }`}
              aria-label="Previous project"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
              onClick={scrollNext}
              disabled={isRightButtonDisabled}
              className={`absolute right-0 top-1/2 -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full shadow-lg hover:bg-gray-600 z-20 ${
                isRightButtonDisabled ? 'opacity-30 cursor-not-allowed' : 'opacity-70'
              }`}
              aria-label="Next project"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;