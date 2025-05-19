"use client";

import { useRef, useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import  DefaultInputs  from "@/components/form/Form-elements/DefaultInputs";

import {
  BellIcon,
  ChartBarIcon,
  UserGroupIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

import { useAtom } from "jotai";
import { graphDataAtom } from "@/store/graphAtoms";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function EcommerceTabs() {
  const [cy, setCy] = useState(null);
  const [graphData, setGraphData] = useAtom(graphDataAtom);

  const tabs = [
    { name: "Plotly Chart", icon: Squares2X2Icon },
    { name: "Spotify Chart", icon: BellIcon },
    { name: "Line Chart", icon: UserGroupIcon },
    { name: "Bar Chart", icon: ChartBarIcon },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingHorizontal = useRef(false);
  const isDraggingVertical = useRef(false);

  const [leftWidth, setLeftWidth] = useState(75); // %
  const [topHeight, setTopHeight] = useState(50); // %

  const startHorizontalDrag = () => {
    isDraggingHorizontal.current = true;
    document.addEventListener("mousemove", handleHorizontalDrag);
    document.addEventListener("mouseup", stopHorizontalDrag);
  };

  const handleHorizontalDrag = (e: MouseEvent) => {
    if (!isDraggingHorizontal.current || !containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const offsetX = e.clientX - containerRef.current.getBoundingClientRect().left;
    const newLeftWidth = (offsetX / containerWidth) * 100;
    if (newLeftWidth > 20 && newLeftWidth < 80) setLeftWidth(newLeftWidth);
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
    const offsetY = e.clientY - containerRef.current.getBoundingClientRect().top;
    const newTopHeight = (offsetY / containerHeight) * 100;
    if (newTopHeight > 20 && newTopHeight < 80) setTopHeight(newTopHeight);
  };

  const stopVerticalDrag = () => {
    isDraggingVertical.current = false;
    document.removeEventListener("mousemove", handleVerticalDrag);
    document.removeEventListener("mouseup", stopVerticalDrag);
  };

  const loadGraph = async (query = null) => {
    const res = await fetch(query ? "/api/query" : "/api/graph", {
      method: query ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
      body: query ? JSON.stringify({ query }) : null,
    });
    const { data, rawRecords } = await res.json();
    setGraphData(data);
    // setRawRecords(rawRecords);
    // setIsSimple(isSimpleTable(rawRecords));

    cy?.elements().remove();
  };

  useEffect(() => {
    loadGraph(null); // 또는 loadGraph() 로 초기 데이터 로딩
  }, []);

  return (
    <Tab.Group>
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

      <Tab.Panels className="mt-4">
        <Tab.Panel>
          <div
            ref={containerRef}
            className="flex w-[100%-90px] h-[100%-76px] relative   overflow-hidden"
          >
            {/* 왼쪽 전체 영역 */}
            <div
              style={{ width: `${leftWidth}%` }}
              className="flex flex-col transition-all duration-100"
            >
              {/* 상단: MonthlySalesChart */}
              <div style={{ height: `${topHeight}%` }} className="transition-all">
                <div className="shadow p-4 h-full">
                <EcommerceMetrics />
                  <MonthlySalesChart onReady={setCy}/>
                </div>
              </div>

              {/* 상하 리사이즈 핸들 */}
              <div
                onMouseDown={startVerticalDrag}
                className="h-1 cursor-row-resize bg-gray-100 dark:bg-gray-800"
              />

              {/* 하단: RecentOrders */}
              <div style={{ height: `${100 - topHeight}%` }} className="transition-all">
                <div className="bg-white dark:bg-gray-900 rounded shadow p-4 h-full">
                  <RecentOrders />
                </div>
              </div>
            </div>

            {/* 좌우 리사이즈 핸들 */}
            <div
              onMouseDown={startHorizontalDrag}
              className="w-1 cursor-col-resize bg-gray-200 dark:bg-gray-800"
            />

            {/* 오른쪽: MonthlyTarget */}
            <div
              style={{ width: `${100 - leftWidth}%` }}
              className="bg-white dark:bg-gray-900 rounded shadow p-4 h-full"
            > < DefaultInputs />
              <MonthlyTarget />
            </div>
          </div>
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
}
