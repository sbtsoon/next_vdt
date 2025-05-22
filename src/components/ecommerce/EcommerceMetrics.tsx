"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon,  GroupIcon } from "@/icons";

export const EcommerceMetrics = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 md:gap-6 mb-3">

    {/* Metric 1 */}
    <div className=" border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      {/* Metric 3 */}
        <div className=" border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Revenue</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                $12.5K
              </h4>
            </div>
            <Badge color="success">
              <ArrowUpIcon />
              3.21%
            </Badge>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Visitors</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                21.3K
              </h4>
            </div>
            <Badge color="warning">
              <ArrowDownIcon />
              1.78%
            </Badge>
          </div>
        </div>
    </div>

    {/* Metric 2 */}
    <div className=" border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100  dark:bg-gray-800">
        <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
      </div>
      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Orders</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            5,359
          </h4>
        </div>
        <Badge color="error">
          <ArrowDownIcon className="text-error-500" />
          9.05%
        </Badge>
      </div>
    </div>


  </div>

  );
};
