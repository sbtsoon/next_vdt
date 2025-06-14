"use client";

import React from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@/icons";
import Image from "next/image";

export const EcommerceMetrics = () => {
  const metrics = [
    { label: "Sales", value: "₩ 5,991백만원", change: 3.2 },
    { label: "COGS", value: "₩ 137,850백만원", change: 3.2 },
    { label: "Profit", value: "₩ 28,899백만원", change: -5.2 },
  ];

  return (
    <div className="flex gap-2 w-full">
      {/* 1/2 section: Metrics */}
      <div className="flex-[1] grid grid-cols-3 gap-2">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="border border-gray-600 bg-[#2b2d33] text-white p-3 w-full h-[100px] flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="text-sm flex items-center gap-1">
                <span className="text-gray-200 font-medium">{metric.label}:</span>
                <span
                  className={
                    metric.change >= 0
                      ? "text-green-400 flex items-center"
                      : "text-red-400 flex items-center"
                  }
                >
                  {metric.change >= 0 ? (
                    <ArrowUpIcon className="w-3 h-3" />
                  ) : (
                    <ArrowDownIcon className="w-3 h-3" />
                  )}
                  {Math.abs(metric.change)}%
                </span>
              </div>

            </div>
            <div className="text-lg font-semibold text-white">{metric.value}</div>
          </div>
        ))}
      </div>

      {/* 1/2 section: Label Summary */}
      <div className="flex-[1] border border-gray-700 bg-[#2b2d33] text-white text-sm p-4 min-w-[240px] flex flex-col gap-4  w-1/2">
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
