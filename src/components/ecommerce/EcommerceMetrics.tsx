"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon,   ListIcon, PlusIcon } from "@/icons";

export const EcommerceMetrics = () => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-3">

    {/* Metric 1 */}
    <div className=" border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-white/[0.03] w-full">
        <div className="flex  items-center gap-2 justify-between" >
            <div className="text-base text-gray-700 dark:text-white font-medium">Net Profit</div>
            <div className="text-xl font-bold text-gray-800 dark:text-white">$18.6m</div>
        </div>
        <div>
        <div className="flex  items-center gap-2 justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Sim. Impact</div>
          <div className= "text-gray-500 dark:text-gray-400" >-</div>
        </div>
        <div className="text-sm flex items-end justify-between mt-3">
          <span className="text-red-600 font-semibold">($3.3m)</span>{' '}
          <span className="text-red-600 font-semibold px-1">
          <Badge color="error">
            <ArrowDownIcon className="inline w-4 h-4" /> (14.9%)</Badge>
          </span>
        </div>
      </div>
  </div>


    {/* Metric 2 */}
    <div className=" border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-white/[0.03] w-full">
    <div className="flex  items-center gap-2 justify-between" >
        <div className="text-base text-gray-700 dark:text-white font-medium">Gross Profit</div>
        <div className="text-xl font-bold text-gray-800 dark:text-white">418.6m</div>
    </div>
    <div className="flex  items-center gap-2 justify-between">
      <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Sim. Impact</div>
       <div className= "text-gray-500 dark:text-gray-400" >-</div>
    </div>

    <div className="text-sm flex items-end justify-between mt-3">
      <span className="text-green-600 font-semibold">($3.3m)</span>{' '}
      <span className="text-green-600 font-semibold px-1">
      <Badge color="Success">
        <ArrowDownIcon className="inline w-4 h-4" /> (14.9%)</Badge>
      </span>
    </div>
  </div>
    {/* Metric 3 */}
    <div className=" border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-white/[0.03] w-full">
  <div className="flex  items-center gap-2 justify-between">
        <div className="text-base text-gray-700 dark:text-white font-medium">Income Taxes</div>
        <div className="text-xl font-bold text-gray-800 dark:text-white">$18.6m</div>
    </div>
    <div className="flex  items-center gap-2 justify-between">
      <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Sim. Impact</div>
       <div className= "text-gray-500 dark:text-gray-400" >-</div>
    </div>
    <div className="text-sm flex items-end justify-between mt-3">
      <span className="text-orange-600 font-semibold">($3.3m)</span>{' '}
      <span className="text-orange-600 font-semibold px-1">
      <Badge color="warning">
        <ArrowUpIcon className="inline w-4 h-4" /> (14.9%)</Badge>
      </span>
    </div>
  </div>
    {/* Metric 4 */}
    <div className=" border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]">
      <div >
        <h4  className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
        Node labels
        </h4>
         <div className="flex items-center gap-2">
        <Badge color="dark">
       Metric(105)
        </Badge>
        <Badge color="info">
          <PlusIcon  className="text-gray-800 size-6 dark:text-blue-500/90" />
       8895
        </Badge>
        </div>
        <h4  className=" mt-2text-sm text-gray-500 dark:text-gray-400 font-semibold">
        Relationship types
        </h4>
        <div className="flex items-center gap-2">
        <Badge color="dark">
          <PlusIcon  className="text-gray-800 size-6 dark:text-white/90" />
        (105)
        </Badge>
        <Badge color="dark">
          <PlusIcon  className="text-gray-800 size-6 dark:text-white/90" />
        (105)
        </Badge>
        </div>
      </div>
    </div>

  </div>

  );
};
