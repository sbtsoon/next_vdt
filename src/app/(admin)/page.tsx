// EcommerceTabs.tsx 파일에서 수정할 부분만 발췌

"use client";

import { useRef, useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import DefaultInputs from "@/components/form/Form-elements/DefaultInputs";
import AIChatPanel from "@/components/AIChatPanel";

import {
  BellIcon,
  ChartBarIcon,
  UserGroupIcon,
  Squares2X2Icon,
  ChevronLeftIcon, // 추가: 사이드바 토글 버튼용 아이콘
  ChevronRightIcon, // 추가: 사이드바 토글 버튼용 아이콘
} from "@heroicons/react/24/outline";

import { useAtom } from "jotai";
import { graphDataAtom } from "@/store/graphAtoms";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function EcommerceTabs() {
  const [cy, setCy] = useState(null);
  const [graphData, setGraphData] = useAtom(graphDataAtom);
  const [rawRecords, setRawRecords] = useState(null);
  const [isSimple, setIsSimple] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(0);

  // 새 상태: 사이드바 표시/숨김 여부
  const [showRightSidebar, setShowRightSidebar] = useState(false);

  const tabs = [
    { name: "Network Graph", icon: Squares2X2Icon },
    { name: "Simulation", icon: BellIcon },
    { name: "Timeline", icon: UserGroupIcon },
    { name: "Exmple2", icon: ChartBarIcon },
  ];

  const containerRef = useRef<HTMLDivElement>(null);

  const [leftWidth, setLeftWidth] = useState(75); // %
  const [topHeight, setTopHeight] = useState(50); // %

  // drag 관련 함수들은 Network Graph 탭에서는 더 이상 필요 없지만,
  // 다른 탭에서 사용한다면 그대로 유지해야 합니다.
  const startHorizontalDrag = () => { /* ... */ };
  const handleHorizontalDrag = (e: MouseEvent) => { /* ... */ };
  const stopHorizontalDrag = () => { /* ... */ };
  const startVerticalDrag = () => { /* ... */ };
  const handleVerticalDrag = (e: MouseEvent) => { /* ... */ };
  const stopVerticalDrag = () => { /* ... */ };


  const loadGraph = async (query = null) => {
    const res = await fetch(query ? "/api/query" : "/api/graph", {
      method: query ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
      body: query ? JSON.stringify({ query }) : null,
    });
    const { data, rawRecords } = await res.json();
    setGraphData(data);
    setRawRecords(rawRecords);
    setIsSimple(isSimpleTable(rawRecords));

    cy?.elements().remove();
  };

  useEffect(() => {
    // 'Network Graph' 탭이 선택될 때만 데이터 로딩
    if (selectedIndex === 0) {
        loadGraph(null);
    }
  }, [selectedIndex]);


  function isSimpleTable(records) {
    if (!records?.length) return true;
    return records.every((record) =>
      record._fields.every((field) => {
        const isNeoInt =
          typeof field === "object" &&
          field !== null &&
          Object.keys(field).length === 2 &&
          typeof field.low === "number" &&
          typeof field.high === "number";
        const isPrimitive =
          typeof field === "number" || typeof field === "string";
        return isNeoInt || isPrimitive;
      })
    );
  }

  return (
    <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
      <Tab.List className="flex space-x-8 border-b border-gray-200 dark:border-gray-600">
        {tabs.map((tab) => (
          <Tab key={tab.name} as="button">
            {({ selected }) => (
              <div
                className={classNames(
                  "inline-flex items-center px-1 pb-2 border-b-2 text-sm font-medium transition-all",
                  selected
                    ? "border-[var(--color-brand-500)] text-[var(--color-brand-500)]"
                    : "border-transparent text-gray-400 hover:text-white hover:border-gray-400"
                )}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </div>
            )}
          </Tab>
        ))}
      </Tab.List>

      {/* Tab Panels 시작 */}
      <Tab.Panels className="mt-4 h-[calc(100%-60px)]">

        {/* 1. Network Graph Tab Panel */}
        <Tab.Panel className="h-full">
          <div
            ref={containerRef}
            className="flex h-full relative overflow-hidden"
          >
            {/* 왼쪽: 상하 분할 (메인 콘텐츠) */}
            <div
                className={`flex flex-col h-full transition-all duration-300 ease-in-out ${
                  showRightSidebar ? 'w-[calc(100%-280px)]' : 'w-full'
                }`}
            >
              {/* 상단 그래프 영역 */}
              <div style={{ height: `${topHeight}%` }} className="transition-all">
                <div className="bg-white dark:bg-gray-900 rounded shadow p-4 h-full">
                  <EcommerceMetrics />
                  <MonthlySalesChart onReady={setCy} selectedIndex={selectedIndex} />
                </div>
              </div>

              {/* 상하 리사이즈 핸들 (필요에 따라 유지/제거) */}
              <div
                onMouseDown={startVerticalDrag}
                className="h-1 cursor-row-resize bg-gray-100 dark:bg-gray-800 hover:bg-blue-500"
                style={{ zIndex: 9990 }}
              />

              {/* 하단 데이터 테이블 영역 */}
              <div style={{ height: `${100 - topHeight}%` }} className="transition-all h-full">
                <div className="bg-white dark:bg-gray-900 rounded shadow p-4 overflow-y-auto h-full">
                  <RecentOrders rawRecords={rawRecords} isSimple={isSimple} />
                </div>
              </div>
            </div>

            {/* 사이드바 토글 버튼 */}
            <button
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              className={`absolute top-1/2 -translate-y-1/2 bg-gray-700 text-white p-1 rounded-full shadow-lg hover:bg-gray-600 z-30 transition-all duration-300 ease-in-out
                ${showRightSidebar ? 'right-[270px]' : 'right-4'}`}
              aria-label="Toggle Right Sidebar"
            >
              {showRightSidebar ? (
                <ChevronRightIcon className="h-5 w-5" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5" />
              )}
            </button>

            {/* 오른쪽 사이드바 */}
            <div
              className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                ${showRightSidebar ? 'translate-x-0' : 'translate-x-full'}`}
              style={{ width: "280px" }}
            >
              <DefaultInputs />
              <AIChatPanel />
            </div>
          </div>
        </Tab.Panel>

        {/* 2. Simulation Tab Panel (수정 없음) */}
        <Tab.Panel className="h-full">
          <div
            ref={containerRef}
            className="flex w-[100%-90px] h-[100%-76px] relative overflow-hidden"
          >
            <div
              style={{ width: `${leftWidth}%` }}
              className="flex flex-col transition-all duration-100"
            >
              <div style={{ height: `${topHeight}%` }} className="transition-all">
                <div className="shadow p-4 h-full">
                  <EcommerceMetrics />
                  <MonthlySalesChart onReady={setCy} selectedIndex={selectedIndex} />
                </div>
              </div>
              <div
                onMouseDown={startVerticalDrag}
                className="h-1 cursor-row-resize bg-gray-100 dark:bg-gray-800"
              />
              <div style={{ height: `${100 - topHeight}%` }} className="transition-all">
                <div className="bg-white dark:bg-gray-900 rounded shadow p-4 h-full">
                  <RecentOrders rawRecords={rawRecords} isSimple={isSimple} />
                </div>
              </div>
            </div>
            <div
              onMouseDown={startHorizontalDrag}
              className="w-1 cursor-col-resize bg-gray-200 dark:bg-gray-800"
            />
            <div
              style={{ width: `${100 - leftWidth}%` }}
              className="bg-white dark:bg-gray-900 rounded shadow p-4 h-full"
            >
              {" "}
              <DefaultInputs />
              <MonthlyTarget />
            </div>
          </div>
        </Tab.Panel>

        {/* 3. Timeline Tab Panel (수정 없음) */}
        <Tab.Panel className="h-full">
          <div
            ref={containerRef}
            className="flex w-[100%-90px] h-[100%-76px] relative overflow-hidden"
          >
            <div
              style={{ width: `${leftWidth}%` }}
              className="flex flex-col w-[75%] transition-all duration-100"
            >
              <div style={{ height: `${topHeight}%` }} className="transition-all">
                <div className="bg-white dark:bg-gray-900 rounded shadow p-4 h-[100%-400px]">
                  <EcommerceMetrics />
                  <MonthlySalesChart onReady={setCy} selectedIndex={selectedIndex} />
                </div>
              </div>
              <div
                onMouseDown={startVerticalDrag}
                className="h-1 cursor-row-resize bg-gray-100 dark:bg-gray-800 hover:bg-blue-500"
                style={{ zIndex: 9990 }}
              />
              <div style={{ height: `${100 - topHeight}%` }} className="transition-all h-full">
                <div className="bg-white dark:bg-gray-900 rounded shadow p-4 overflow-y-auto">
                  <RecentOrders rawRecords={rawRecords} isSimple={isSimple} />
                </div>
              </div>
            </div>
            <div
              onMouseDown={startHorizontalDrag}
              className="w-1 cursor-col-resize bg-gray-100 dark:bg-gray-800 hover:bg-blue-500 transition-colors duration-150"
              style={{ zIndex: 50 }}
            />
            <div
              style={{ width: `${100 - leftWidth}%`, minWidth: "280px" }}
              className="bg-white dark:bg-gray-900 rounded shadow p-2 h-full"
            >
              <DefaultInputs />
              <AIChatPanel />
            </div>
          </div>
        </Tab.Panel>

        {/* 4. Exmple2 Tab Panel (수정 없음) */}
        <Tab.Panel className="h-full">
          <div
            ref={containerRef}
            className="flex w-[100%-90px] h-[100%-76px] relative overflow-hidden"
          >
            <div
              style={{ width: `${leftWidth}%` }}
              className="flex flex-col w-[75%] transition-all duration-100"
            >
              <div style={{ height: `${topHeight}%` }} className="transition-all">
                <div className="bg-white dark:bg-gray-900 rounded shadow p-4 h-[100%-400px]">
                  <EcommerceMetrics />
                  <MonthlySalesChart onReady={setCy} selectedIndex={selectedIndex} />
                </div>
              </div>
              <div
                onMouseDown={startVerticalDrag}
                className="h-1 cursor-row-resize bg-gray-100 dark:bg-gray-800 hover:bg-blue-500"
                style={{ zIndex: 9990 }}
              />
              <div style={{ height: `${100 - topHeight}%` }} className="transition-all h-full">
                <div className="bg-white dark:bg-gray-900 rounded shadow p-4 overflow-y-auto">
                  <RecentOrders rawRecords={rawRecords} isSimple={isSimple} />
                </div>
              </div>
            </div>
            <div
              onMouseDown={startHorizontalDrag}
              className="w-1 cursor-col-resize bg-gray-100 dark:bg-gray-800 hover:bg-blue-500 transition-colors duration-150"
              style={{ zIndex: 50 }}
            />
            <div
              style={{ width: `${100 - leftWidth}%`, minWidth: "280px" }}
              className="bg-white dark:bg-gray-900 rounded shadow p-2 h-full"
            >
              <AIChatPanel />
              <MonthlyTarget />
            </div>
          </div>
        </Tab.Panel>

      </Tab.Panels>
    </Tab.Group>
  );
}