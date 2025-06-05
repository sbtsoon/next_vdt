"use client";

import cytoscape from "@/lib/cytoscapeWithExtensions";

export default function Example4() {
  return (
    <div className="overflow-hidden  border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
   >
      <iframe
        src="/html/example4/index.html"
        width="100%"
        height="800px"
        frameBorder="0"
      />
    </div>
  );
}
