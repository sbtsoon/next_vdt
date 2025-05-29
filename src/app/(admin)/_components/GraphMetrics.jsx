"use client";

import React from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@/icons";
import { useAtomValue } from "jotai";
import { metricMapAtom } from "@/store/graphAtoms";

const HistoryBarGraph = ({ data }) => {
  if (!Array.isArray(data)) return null;

  const max = Math.max(...data.map((v) => Math.abs(v)), 1);
  const normalizedData = data.map((v) => (v / max) * 15); // 기준선 기준 최대 15px

  return (
    <div className="flex items-end gap-[1px] h-[40px] relative">
      {normalizedData.map((value, i) => (
        <div
          key={i}
          style={{
            height: `${Math.abs(value)}px`,
            marginTop: value > 0 ? `${15 - value}px` : "15px",
            marginBottom: value < 0 ? `${15 + value}px` : "15px",
          }}
          className={`w-[4px] ${
            value > 0
              ? "bg-blue-600 cursor-pointer"
              : value < 0
              ? "bg-red-500 cursor-pointer"
              : "bg-transparent pointer-events-none"
          }`}
        />
      ))}
      {/* 중앙 기준선 */}
      <div className="absolute bottom-[20px] left-0 w-full h-[1px] bg-gray-500 z-[-1]" />
    </div>
  );
};

export const GraphMetrics = () => {
  const metricMap = useAtomValue(metricMapAtom);

  // key와 label만 정의해서 매핑
  const metrics = [
    { label: "Sales", key: "sales" },
    { label: "COGS", key: "cogs" },
    { label: "Profit", key: "profit" },
  ];

  return (
    <div className="flex gap-2 w-full mb-3 ">
      {/* 1/2 section: Metrics */}
      <div className="flex-[1] grid grid-cols-3 border border-gray-700 pt-3  bg-[#1e1d2b] ">
      {metrics.map((metric, idx) => {
        const { amount, percentage, scaledHistoryData } = metricMap[metric.key];

        const borderClass = idx > 0 ? "border-l" : "";

        return (
          <div
            key={idx}
            className={`text-white px-5 h-[60px] flex flex-col justify-between ${borderClass}`}
            style={{
              borderLeftWidth: idx > 0 ? "1px" : undefined,
              borderLeftColor: idx > 0 ? "#4f4f50" : undefined, // ← 여기에 색상 적용!
            }}
          >
              <div className="flex justify-between items-center">
                <div className="text-sm flex items-center gap-1">
                  <span className="text-gray-200 font-medium">
                    {metric.label}:
                  </span>
                  <span
                    className= {`${
                      percentage >= 0 ? "text-blue-400" : "text-red-400"
                    } flex items-center  px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-gray-100 dark:bg-white/5`}
                  >
                    {percentage >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    {Math.abs(percentage)}%
                  </span>
                </div>
                <div>
                  <HistoryBarGraph data={scaledHistoryData} />
                </div>
              </div>
              <div className="text-lg font-semibold text-white">
                ₩ {amount.toLocaleString()}<span className="text-sm text-gray-400 px-2">백만원</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 1/2 section: Label Summary */}
      <div className="flex-[1] border border-gray-700 bg-[#1e1d2b] text-white text-sm p-4 min-w-[240px] flex flex-col gap-4  w-1/2">
        <div className="flex flex-wrap  gap-2 items-center ">
          <div className="w-1/2">
            <h4 className="mb-2 font-semibold">Node labels</h4>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-orange-400/30 text-white px-2 py-1 rounded-full text-xs">*(140)</span>
              <span className="bg-pink-400/30 text-white px-2 py-1 rounded-full text-xs">Metric</span>
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Relationship types</h4>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs">*(34)</span>
              <span className="bg-blue-500/30 text-white px-2 py-1 rounded-full text-xs">345</span>
              <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs">contrib_to</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
