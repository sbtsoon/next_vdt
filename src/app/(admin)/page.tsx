"use client";

import { useRef, useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import DefaultInputs from "@/components/form/Form-elements/DefaultInputs";
import AIChatPanel from "@/components/AIChatPanel";
import MemoPanel from '@/components/MemoPanel'
import {
  BellIcon,
  ChartBarIcon,
  Squares2X2Icon,
  ChevronRightIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog8ToothIcon,
  WalletIcon,
  ArchiveBoxIcon,
  ExclamationCircleIcon,
  CubeIcon,
  MagnifyingGlassCircleIcon,
  ChartPieIcon,
  CubeTransparentIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";

import { useAtom } from "jotai";
import { aiQueryAtom, metricMapAtom } from "@/store/graphAtoms";
import NetworkGraph from "@/app/(admin)/_components/NetworkGraph";
import SimulationGraph from "@/app/(admin)/_components/SimulationGraph";
import GraphDataTable from "./_components/GraphDataTable";
import { GraphMetrics } from "./_components/GraphMetrics";
import TimeLineGraph from "./_components/TimeLineGraph";
import GeoMapGraph from "./_components/GeoMapGraph";
import { parseNeo4jInt } from "@/helpers/parseNeo4jIntHelper";
import { updateMetricDataHelper } from "@/helpers/metricHelper";
import Example3 from "./_components/Example3";
import Example4 from "./_components/Example4";
import MultiD from "./_components/MultiD";
import MultiDHeat from "./_components/MultiDHeat";
import { useGraphByQuery } from "@/hooks/useGraph";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function EcommerceTabs() {
  const [aiQuery, setAiQuery] = useAtom(aiQueryAtom);
  const { data } = useGraphByQuery(aiQuery.query, {
    onSuccess: (data) => {
      if (data?.data?.nodes.length !== 0) {
        setGraphData(data.data);
        // metric card 정보 업데이트
        data.data.nodes.forEach((node) => {
          const { name, amount } = node.data || {};
          const parsedAmount = Math.round(parseNeo4jInt(amount) / 1_000_000);
          const percentage = 0;
          if (name) {
            updateMetricDataHelper(
              name,
              parsedAmount,
              percentage,
              [],
              setMetricData
            );
          }
        });
      }
      setRawRecords(data?.rawRecords);
    },
  });
  const [graphData, setGraphData] = useState(null);
  const [, setMetricData] = useAtom(metricMapAtom);
  const [rawRecords, setRawRecords] = useState(null);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const [activePanel, setActivePanel] = useState<string | null>(null);

  const tabs = [
    { name: "Network Graph", icon: Squares2X2Icon },
    { name: "Simulation", icon: BellIcon },
    { name: "Timeline", icon: WalletIcon },
    { name: "3D Graph", icon: CubeTransparentIcon },
    { name: "Exmple2", icon: ChartBarIcon },
    { name: "Exmple3", icon: ExclamationCircleIcon },
    { name: "Exmple4", icon: MagnifyingGlassCircleIcon },
    { name: "MultiD", icon: ArchiveBoxIcon },
    { name: "MultiDHeat", icon: CubeIcon },
  ];

  const containerRef = useRef<HTMLDivElement>(null);

  const isDraggingHorizontal = useRef(false);
  const [setLeftWidth] = useState(100); // %

  const isDraggingVertical = useRef(false);
  const [topHeight, setTopHeight] = useState(65); // %

  const startHorizontalDrag = () => {
    isDraggingHorizontal.current = true;
    document.addEventListener("mousemove", handleHorizontalDrag);
    document.addEventListener("mouseup", stopHorizontalDrag);
  };

  const handleHorizontalDrag = (e: MouseEvent) => {
    if (!isDraggingHorizontal.current || !containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const offsetX =
      e.clientX - containerRef.current.getBoundingClientRect().left;
    const newLeftWidth = (offsetX / containerWidth) * 100;
    if (newLeftWidth > 25 && newLeftWidth < 80) setLeftWidth(newLeftWidth);
  };

  const stopHorizontalDrag = () => {
    isDraggingHorizontal.current = false;
    document.removeEventListener("mousemove", handleHorizontalDrag);
    document.removeEventListener("mouseup", stopHorizontalDrag);
  };

  const startVerticalDrag = () => {
    isDraggingVertical.current = true;
    document.addEventListener("mousemove", handleVerticalDrag);
    document.addEventListener("mouseup", stopVerticalDrag);
  };

  const handleVerticalDrag = (e: MouseEvent) => {
    if (!isDraggingVertical.current || !containerRef.current) return;
    const containerHeight = containerRef.current.offsetHeight;
    const offsetY =
      e.clientY - containerRef.current.getBoundingClientRect().top;
    const newTopHeight = (offsetY / containerHeight) * 100;
    if (newTopHeight > 10 && newTopHeight < 90) setTopHeight(newTopHeight);
  };

  const stopVerticalDrag = () => {
    isDraggingVertical.current = false;
    document.removeEventListener("mousemove", handleVerticalDrag);
    document.removeEventListener("mouseup", stopVerticalDrag);
  };

  useEffect(() => {
    setActivePanel(null);
  }, [selectedIndex]);

  const sidebarWidth = 350; // ✨ 변경: 각 사이드바 패널의 너비를 320px로 설정
  const totalOpenedSidebarWidth = activePanel ? sidebarWidth : 0;

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

      {/* AI Assistant 토글 버튼 (Network Graph (0) 또는 Simulation (1) 탭일 때만 표시) */}
      {selectedIndex >= 0 && selectedIndex <= 8 && (
        <button
          onClick={() =>
            setActivePanel(activePanel === "aiAssistant" ? null : "aiAssistant")
          }
          className={`fixed top-1/2 -translate-y-1/2    bg-gray-780 shadow-soon dark:text-white py-2 px-3 rounded-l-full hover:bg-gray-600 z-50 active:bg-blue-600 transition-all duration-300 ease-in-out flex items-center gap-2`}
          style={{
            right: activePanel ? `${sidebarWidth}px` : "0px",
            top: `calc(20% - 20px)`,
            borderRadius: "9999px 0 0 9999px",
          }}
          aria-label="Toggle AI Assistant Panel"
        >
          {activePanel === "aiAssistant" ? (
            <>
              <ChevronRightIcon className="h-5 w-5" />
              <span>AI닫기</span>
            </>
          ) : (
            <>
              <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
            </>
          )}
        </button>
      )}

      {/* Default Inputs 토글 버튼 (Network Graph (0) 또는 Simulation (1) 탭일 때만 표시) */}
      {selectedIndex >= 0 && selectedIndex <= 8 && (
        <button
          onClick={() =>
            setActivePanel(
              activePanel === "defaultInputs" ? null : "defaultInputs"
            )
          }
          className={`fixed top-1/2 -translate-y-1/2   bg-gray-780 shadow-soon dark:text-white py-2 px-3 rounded-l-full shadow-lg hover:bg-gray-600 z-50 transition-all duration-300 ease-in-out flex items-center gap-2`}
          style={{
            right: activePanel ? `${sidebarWidth}px` : "0px",
            top: `calc(20% + 30px)`,
            borderRadius: "9999px 0 0 9999px",
          }}
          aria-label="Toggle Default Inputs Panel"
        >
          {activePanel === "defaultInputs" ? (
            <>
              <ChevronRightIcon className="h-5 w-5" />
              <span>Fliter 닫기</span>
            </>
          ) : (
            <>
              <Cog8ToothIcon className="h-5 w-5" />
            </>
          )}
        </button>
      )}

      {/* Analysis 토글 버튼 (Network Graph (0) 또는 Simulation (7) 탭일 때만 표시) */}
      {selectedIndex >= 0 && selectedIndex <= 8 && (
        <button
          onClick={() =>
            setActivePanel(
              activePanel === "monthlyTarget" ? null : "monthlyTarget"
            )
          }
          className={`fixed top-1/2 -translate-y-1/2   bg-gray-780 shadow-soon dark:text-white py-2 px-3 rounded-l-full shadow-lg hover:bg-gray-600 z-50 transition-all duration-300 ease-in-out flex items-center gap-2`}
          style={{
            right: activePanel ? `${sidebarWidth}px` : "0px",
            top: `calc(20% + 80px)`,
            borderRadius: "9999px 0 0 9999px",
          }}
          aria-label="Toggle Analysis Panel"
        >
          {activePanel === "monthlyTarget" ? (
            <>
              <ChevronRightIcon className="h-5 w-5" />
              <span>Analysis 닫기</span>
            </>
          ) : (
            <>
              <ChartPieIcon className="h-5 w-5" />
            </>
          )}
        </button>
      )}
      {/* Memo Panel 토글 버튼 */}
            {selectedIndex >= 0 && selectedIndex <= 8 && (
              <button
                onClick={() =>
                  setActivePanel(activePanel === "memo" ? null : "memo")
                }
                className={`fixed top-1/2 -translate-y-1/2 bg-gray-780 shadow-soon dark:text-white py-2 px-3 rounded-l-full shadow-lg hover:bg-gray-600 z-50 transition-all duration-300 ease-in-out flex items-center gap-2`}
                style={{
                  right: activePanel ? `${sidebarWidth}px` : "0px",
                  top: `calc(20% + 130px)`, // 기존 버튼보다 아래로
                  borderRadius: "9999px 0 0 9999px",
                }}
                aria-label="Toggle Memo Panel"
              >
                {activePanel === "memo" ? (
                  <>
                    <ChevronRightIcon className="h-5 w-5" />
                    <span>메모 닫기</span>
                  </>
                ) : (
                  <>
                  <PaperClipIcon className="h-5 w-5" />
                </>
                )}
              </button>
            )}
      <Tab.Panels className="mt-2 h-[calc(100%-60px)] relative">
        {/* 1. Network Graph Tab Panel (팝업 사이드바) */}
        <Tab.Panel className="h-full" unmount={false}>
          <div
            ref={containerRef}
            className="flex flex-col h-full relative overflow-hidden  "
            style={{ width: `calc(100% - ${totalOpenedSidebarWidth}px)` }}
          >
            <div
              style={{ height: `${topHeight}%` }}
              className="transition-all duration-100  "
            >
              <div className="bg-white dark:bg-gray-900 rounded shadow h-full">
                <GraphMetrics />
                <NetworkGraph graphData={graphData} />
              </div>
            </div>

            {/* 수직 크기 조절 막대 */}
            <div
              onMouseDown={startVerticalDrag}
              className="h-1 cursor-row-resize bg-gray-100 dark:bg-gray-800 hover:bg-blue-500 "
              style={{ zIndex: 9990 }}
            />

            <div className="flex-grow w-full  h-full">
              <div className="bg-white dark:bg-gray-900 rounded shadow py-4 h-full overflow-x-hidden">
                <GraphDataTable rawRecords={rawRecords} />
              </div>
            </div>

            {/* 오른쪽 사이드바 - fixed 팝업 방식 (위치 동일) */}
            {activePanel === "aiAssistant" &&
              selectedIndex >= 0 &&
              selectedIndex <= 6 && (
                <div
                  className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-40 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "aiAssistant"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                  style={{ width: `${sidebarWidth}px` }}
                >
                  <AIChatPanel />
                </div>
              )}
            {activePanel === "defaultInputs" &&
              selectedIndex >= 0 &&
              selectedIndex <= 6 && (
                <div
                  className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-40 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "defaultInputs"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                  style={{ width: `${sidebarWidth}px` }}
                >
                  <DefaultInputs />
                </div>
              )}
            {activePanel === "monthlyTarget" &&
              selectedIndex >= 0 &&
              selectedIndex <= 6 && (
                <div
                  className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-40 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "monthlyTarget"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                  style={{ width: `${sidebarWidth}px` }}
                >
                  <MonthlyTarget />
                </div>
              )}
              {activePanel === "memo" && selectedIndex < 9 && (
                <div
                  className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-40 transform transition-transform duration-300 ease-in-out
                    ${activePanel === "memo" ? "translate-x-0" : "translate-x-full"}`}
                  style={{ width: `${sidebarWidth}px` }}
                >
                  <MemoPanel />
                </div>
              )}
          </div>
        </Tab.Panel>

        {/* 2. Simulation Tab Panel (메인 콘텐츠가 밀려나는 방식) */}
        <Tab.Panel className="h-full" unmount={false}>
          <div
            ref={containerRef}
            className="flex h-full relative overflow-hidden"
            style={{ width: `calc(100% - ${totalOpenedSidebarWidth}px)` }}
          >
            <div
              className={`flex flex-col h-full w-full transition-all duration-300 ease-in-out`}
            >
              <div className="transition-all">
                <div className="shadow  h-full">
                  <GraphMetrics />
                  <SimulationGraph
                    isActive={selectedIndex === 1}
                    graphData={graphData}
                  />
                </div>
              </div>
            </div>
            {/* 오른쪽 사이드바 - fixed 팝업 방식 (탭 0, 1에서만 활성화) */}
            {/* AIChatPanel 사이드바 */}
            {activePanel === "aiAssistant" &&
              (selectedIndex === 0 || selectedIndex === 1) && (
                <div
                  className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "aiAssistant"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                  style={{ width: `${sidebarWidth}px` }}
                >
                  <AIChatPanel />
                </div>
              )}
            {/* DefaultInputs 사이드바 */}
            {activePanel === "defaultInputs" &&
              (selectedIndex === 0 || selectedIndex === 1) && (
                <div
                  className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "defaultInputs"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                  style={{ width: `${sidebarWidth}px` }}
                >
                  <DefaultInputs />
                </div>
              )}
            {/* MonthlyTarget 사이드바 (탭 0, 1에서만 활성화) */}
            {activePanel === "monthlyTarget" &&
              (selectedIndex === 0 || selectedIndex === 1) && (
                <div
                  className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "monthlyTarget"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                  style={{ width: `${sidebarWidth}px` }}
                >
                  <MonthlyTarget />
                </div>
              )}
          </div>
        </Tab.Panel>

        {/* 3. Timeline Tab Panel (좌우/상하 리사이징 유지, 필터/AI 영역 포함) */}
        <Tab.Panel className="h-full">
          <div
            ref={containerRef}
            className="flex h-full relative overflow-hidden"
            style={{ width: `calc(100% - ${totalOpenedSidebarWidth}px)` }}
          >
            <div
              className={`flex flex-col h-full w-full transition-all duration-300 ease-in-out`}
            >
              <div
                style={{ height: `${topHeight}%` }}
                className="transition-all"
              >
                <div className="bg-white dark:bg-gray-900 rounded shadow  h-full">
                  {/* <GraphMetrics /> */}
                  <TimeLineGraph />
                </div>
              </div>
            </div>

            {/* 오른쪽 사이드바 - fixed 팝업 방식 (위치 동일) */}
            {activePanel === "aiAssistant" &&
              selectedIndex >= 0 &&
              selectedIndex <= 6 && (
                <div
                  className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-40 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "aiAssistant"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                  style={{ width: `${sidebarWidth}px` }}
                >
                  <AIChatPanel />
                </div>
              )}
            {activePanel === "defaultInputs" &&
              selectedIndex >= 0 &&
              selectedIndex <= 6 && (
                <div
                  className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-40 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "defaultInputs"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                  style={{ width: `${sidebarWidth}px` }}
                >
                  <DefaultInputs />
                </div>
              )}
            {activePanel === "monthlyTarget" &&
              selectedIndex >= 0 &&
              selectedIndex <= 6 && (
                <div
                  className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-40 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "monthlyTarget"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                  style={{ width: `${sidebarWidth}px` }}
                >
                  <MonthlyTarget />
                </div>
              )}
              {activePanel === "memo" && selectedIndex < 9 && (
                <div
                  className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-40 transform transition-transform duration-300 ease-in-out
                    ${activePanel === "memo" ? "translate-x-0" : "translate-x-full"}`}
                  style={{ width: `${sidebarWidth}px` }}
                >
                  <MemoPanel />
                </div>
              )}
          </div>
        </Tab.Panel>
        {/* 4. 프랑스 지도 */}
        <Tab.Panel className="h-full">
          <div
            ref={containerRef}
            className="flex h-full w-full relative overflow-hidden"
          >
            <div className="flex flex-col transition-all duration-100 w-full">
              <div
                style={{ height: `${topHeight}%` }}
                className="transition-all"
              >
                <div className="bg-white dark:bg-gray-900 rounded shadow  h-full">
                  {/* <GraphMetrics /> */}
                  <GeoMapGraph />
                </div>
              </div>
            </div>

            {/* 오른쪽 사이드바 - fixed 팝업 방식 (탭 0, 1에서만 활성화) */}
            {/* AIChatPanel 사이드바 */}
            {activePanel === "aiAssistant" && selectedIndex < 7 && (
              <div
                className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "aiAssistant"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                style={{ width: `${sidebarWidth}px` }}
              >
                <AIChatPanel />
              </div>
            )}
            {/* DefaultInputs 사이드바 */}
            {activePanel === "defaultInputs" && selectedIndex < 7 && (
              <div
                className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "defaultInputs"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                style={{ width: `${sidebarWidth}px` }}
              >
                <DefaultInputs />
              </div>
            )}
            {/* MonthlyTarget 사이드바 (탭 0, 1에서만 활성화) */}
            {activePanel === "monthlyTarget" && selectedIndex < 7 && (
              <div
                className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "monthlyTarget"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                style={{ width: `${sidebarWidth}px` }}
              >
                <MonthlyTarget />
              </div>
            )}
          </div>
        </Tab.Panel>

        {/* 5. Exmple2 Tab Panel (좌우/상하 리사이징 유지, 필터/AI 영역 포함) */}
        <Tab.Panel className="h-full">
          <div
            ref={containerRef}
            className="flex h-full  w-full relative overflow-hidden"
          >
            <div className="flex flex-col transition-all duration-100">
              <div style={{ height: `60%` }} className="transition-all">
                <div className="bg-white dark:bg-gray-900 rounded shadow  h-full">
                  <MonthlySalesChart graphData={graphData} />
                </div>
                {/* 여기에 수직 크기 조절 막대를 배치합니다. 상단 div의 바깥, 하단 div의 바로 위입니다. */}
                <div
                  onMouseDown={startVerticalDrag}
                  className="h-1 cursor-row-resize bg-gray-100 dark:bg-gray-800 hover:bg-blue-500"
                  style={{ zIndex: 9990 }}
                />{" "}
                {/* <--- 이 부분이 위로 이동했습니다. */}
                <div
                  style={{ height: `${100 - topHeight}%` }}
                  className="transition-all h-full"
                >
                  <div className="bg-white dark:bg-gray-900 rounded shadow py-4  h-full">
                    <GraphDataTable rawRecords={rawRecords} />
                  </div>
                </div>
              </div>

              {/* 오른쪽 사이드바 - fixed 팝업 방식 (탭 0, 1에서만 활성화) */}
              {/* AIChatPanel 사이드바 */}
              {activePanel === "aiAssistant" && selectedIndex < 7 && (
                <div
                  className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "aiAssistant"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                  style={{ width: `${sidebarWidth}px` }}
                >
                  <AIChatPanel />
                </div>
              )}
              {/* DefaultInputs 사이드바 */}
              {activePanel === "defaultInputs" && selectedIndex < 7 && (
                <div
                  className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "defaultInputs"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                  style={{ width: `${sidebarWidth}px` }}
                >
                  <DefaultInputs />
                </div>
              )}
              {/* MonthlyTarget 사이드바 (탭 0, 1에서만 활성화) */}
              {activePanel === "monthlyTarget" && selectedIndex < 7 && (
                <div
                  className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "monthlyTarget"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                  style={{ width: `${sidebarWidth}px` }}
                >
                  <MonthlyTarget />
                </div>
              )}
            </div>
          </div>
        </Tab.Panel>
        {/* 6. Exmple3 Tab Panel (좌우/상하 리사이징 유지, 필터/AI 영역 포함) */}
        <Tab.Panel className="h-full">
          <div
            ref={containerRef}
            className="flex flex-col h-full relative overflow-hidden  "
            style={{ width: `calc(100% - ${totalOpenedSidebarWidth}px)` }}
          >
            <div className="flex flex-col transition-all duration-100">
              <div style={{ height: `80%` }} className="transition-all">
                <div className="bg-white dark:bg-gray-900 rounded shadow  h-full">
                  {/* <GraphMetrics /> */}
                  <Example3 graphData={graphData} />
                </div>
              </div>
              {/* 여기에 수직 크기 조절 막대를 배치합니다. 상단 div의 바깥, 하단 div의 바로 위입니다. */}
              <div
                onMouseDown={startVerticalDrag}
                className="h-1 cursor-row-resize bg-gray-100 dark:bg-gray-800 hover:bg-blue-500"
                style={{ zIndex: 9990 }}
              />{" "}
              {/* <--- 이 부분이 위로 이동했습니다. */}
              <div
                style={{ height: `${100 - topHeight}%` }}
                className="transition-all h-full"
              >
                <div className="bg-white dark:bg-gray-900 rounded shadow py-4 h-full">
                  <GraphDataTable rawRecords={rawRecords} />
                </div>
              </div>
            </div>

            <div
              onMouseDown={startHorizontalDrag}
              className="w-1 cursor-col-resize bg-gray-100 dark:bg-gray-800 hover:bg-blue-500 transition-colors duration-150"
              style={{ zIndex: 50 }}
            />

            {/* 오른쪽 사이드바 - fixed 팝업 방식 (탭 0, 1에서만 활성화) */}
            {/* AIChatPanel 사이드바 */}
            {activePanel === "aiAssistant" && selectedIndex < 7 && (
              <div
                className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "aiAssistant"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                style={{ width: `${sidebarWidth}px` }}
              >
                <AIChatPanel />
              </div>
            )}
            {/* DefaultInputs 사이드바 */}
            {activePanel === "defaultInputs" && selectedIndex < 7 && (
              <div
                className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "defaultInputs"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                style={{ width: `${sidebarWidth}px` }}
              >
                <DefaultInputs />
              </div>
            )}
            {/* 오른쪽 사이드바 - fixed 팝업 방식 (탭 0, 1에서만 활성화) */}
            {/* AIChatPanel 사이드바 */}
            {activePanel === "aiAssistant" && selectedIndex < 7 && (
              <div
                className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "aiAssistant"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                style={{ width: `${sidebarWidth}px` }}
              >
                <AIChatPanel />
              </div>
            )}
            {/* DefaultInputs 사이드바 */}
            {activePanel === "defaultInputs" && selectedIndex < 7 && (
              <div
                className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "defaultInputs"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                style={{ width: `${sidebarWidth}px` }}
              >
                <DefaultInputs />
              </div>
            )}
            {/* MonthlyTarget 사이드바 (탭 0, 1에서만 활성화) */}
            {activePanel === "monthlyTarget" && selectedIndex < 7 && (
              <div
                className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "monthlyTarget"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                style={{ width: `${sidebarWidth}px` }}
              >
                <MonthlyTarget />
              </div>
            )}
          </div>
        </Tab.Panel>

        {/* 7. Exmple4 Tab Panel (좌우/상하 리사이징 유지, 필터/AI 영역 포함) */}
        <Tab.Panel className="h-full">
          <div
            ref={containerRef}
            className="flex h-full relative overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-900 rounded shadow  h-full w-full">
              {/* <GraphMetrics /> */}
              <Example4 />
            </div>

            {/* 오른쪽 사이드바 - fixed 팝업 방식 (탭 0, 1에서만 활성화) */}
            {/* AIChatPanel 사이드바 */}
            {activePanel === "aiAssistant" && selectedIndex < 7 && (
              <div
                className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "aiAssistant"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                style={{ width: `${sidebarWidth}px` }}
              >
                <AIChatPanel />
              </div>
            )}
            {/* DefaultInputs 사이드바 */}
            {activePanel === "defaultInputs" && selectedIndex < 7 && (
              <div
                className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "defaultInputs"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                style={{ width: `${sidebarWidth}px` }}
              >
                <DefaultInputs />
              </div>
            )}
            {/* MonthlyTarget 사이드바 (탭 0, 1에서만 활성화) */}
            {activePanel === "monthlyTarget" && selectedIndex < 7 && (
              <div
                className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                  ${
                    activePanel === "monthlyTarget"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                style={{ width: `${sidebarWidth}px` }}
              >
                <MonthlyTarget />
              </div>
            )}
          </div>
        </Tab.Panel>

        {/* 8. MultiD */}

        <Tab.Panel className="h-full">
          <div
            ref={containerRef}
            className="flex h-full  w-full relative overflow-hidden"
          >
            <div className="flex flex-col  transition-all duration-100 ">
              <div
                className="transition-all"
                style={{ height: `${topHeight}%` }}
              >
                <div className="bg-white dark:bg-gray-900 rounded shadow  h-full ">
                  {/* <GraphMetrics /> */}
                  <MultiD />
                </div>
              </div>
              {/* 여기에 수직 크기 조절 막대를 배치합니다. 상단 div의 바깥, 하단 div의 바로 위입니다. */}
              <div
                onMouseDown={startVerticalDrag}
                className="h-1 cursor-row-resize bg-gray-100 dark:bg-gray-800 hover:bg-blue-500"
                style={{ zIndex: 9990 }}
              />{" "}
              {/* <--- 이 부분이 위로 이동했습니다. */}
              <div
                style={{ height: `${100 - topHeight}%` }}
                className="transition-all h-full "
              >
                <div className="bg-white dark:bg-gray-900 rounded shadow p-4 h-full w-full">
                  <GraphDataTable rawRecords={rawRecords} />
                </div>
              </div>
            </div>

            {/* 오른쪽 사이드바 - fixed 팝업 방식 (탭 0, 1에서만 활성화) */}
            {/* AIChatPanel 사이드바 */}
            {activePanel === "aiAssistant" && selectedIndex < 9 && (
              <div
                className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                        ${
                          activePanel === "aiAssistant"
                            ? "translate-x-0"
                            : "translate-x-full"
                        }`}
                style={{ width: `${sidebarWidth}px` }}
              >
                <AIChatPanel />
              </div>
            )}
            {/* DefaultInputs 사이드바 */}
            {activePanel === "defaultInputs" && selectedIndex < 9 && (
              <div
                className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                        ${
                          activePanel === "defaultInputs"
                            ? "translate-x-0"
                            : "translate-x-full"
                        }`}
                style={{ width: `${sidebarWidth}px` }}
              >
                <DefaultInputs />
              </div>
            )}
            {/* MonthlyTarget 사이드바 (탭 0, 1에서만 활성화) */}
            {activePanel === "monthlyTarget" && selectedIndex < 9 && (
              <div
                className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                        ${
                          activePanel === "monthlyTarget"
                            ? "translate-x-0"
                            : "translate-x-full"
                        }`}
                style={{ width: `${sidebarWidth}px` }}
              >
                <MonthlyTarget />
              </div>
            )}
          </div>
        </Tab.Panel>
        {/* 9. MultiD Heat */}
        <Tab.Panel className="h-full">
          <div
            ref={containerRef}
            className="flex h-full  w-full relative overflow-hidden"
          >
            <div className="flex flex-col  transition-all duration-100  w-full">
              <div className="transition-all">
                <div className="bg-white dark:bg-gray-900 rounded shadow  h-full">
                  {/* <GraphMetrics /> */}
                  <MultiDHeat />
                </div>
              </div>
            </div>
            {/* 오른쪽 사이드바 - fixed 팝업 방식 (탭 0, 1에서만 활성화) */}
            {/* AIChatPanel 사이드바 */}
            {activePanel === "aiAssistant" && selectedIndex < 9 && (
              <div
                className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                        ${
                          activePanel === "aiAssistant"
                            ? "translate-x-0"
                            : "translate-x-full"
                        }`}
                style={{ width: `${sidebarWidth}px` }}
              >
                <AIChatPanel />
              </div>
            )}
            {/* DefaultInputs 사이드바 */}
            {activePanel === "defaultInputs" && selectedIndex < 9 && (
              <div
                className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                        ${
                          activePanel === "defaultInputs"
                            ? "translate-x-0"
                            : "translate-x-full"
                        }`}
                style={{ width: `${sidebarWidth}px` }}
              >
                <DefaultInputs />
              </div>
            )}
            {/* MonthlyTarget 사이드바 (탭 0, 1에서만 활성화) */}
            {activePanel === "monthlyTarget" && selectedIndex < 9 && (
              <div
                className={`fixed right-0 top-[var(--header-height)] h-[calc(100vh - var(--header-height))] bg-white dark:bg-gray-900 shadow-xl p-2 z-20 transform transition-transform duration-300 ease-in-out
                        ${
                          activePanel === "monthlyTarget"
                            ? "translate-x-0"
                            : "translate-x-full"
                        }`}
                style={{ width: `${sidebarWidth}px` }}
              >
                <MonthlyTarget />
              </div>
            )}
          </div>
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
}
