"use client";

import cytoscape from "@/lib/cytoscape/cytoscapeWithExtensions";
import { graphDataAtom, metricMapAtom } from "@/store/graphAtoms";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { formatAmountWithMajorUnits } from "@/helpers/formatAmountWithMajorUnitsHelper";
import { parseNeo4jInt } from "@/helpers/parseNeo4jIntHelper";
import {
  showNode,
  showEdge,
  hideNode,
  hideEdge,
} from "@/helpers/cytoscapeVisibilityHelper";
import { updateMetricDataHelper } from "@/helpers/metricHelper";
import { networkGraphStyle } from "@/lib/cytoscape/graphStyle";
import attackCtxMenu from "@/lib/cytoscape/ctxMenu";
import { applyNetworkGraphLayout } from "@/lib/cytoscape/graphLayout";

export default function NetworkGraph() {
  const cyRef = useRef(null);
  const cyInstanceRef = useRef(null);
  const [graphData] = useAtom(graphDataAtom);
  const [, setMetricData] = useAtom(metricMapAtom);

  useEffect(() => {
    if (!cyRef.current) return;

    if (cyInstanceRef.current) {
      cyInstanceRef.current.destroy();
      cyInstanceRef.current = null;
    }

    const panzoom = require("cytoscape-panzoom");
    panzoom(cytoscape);

    const cy = cytoscape({
      container: cyRef.current,
      style: networkGraphStyle,
    });

    // cxtmenu
    attackCtxMenu(cy);

    const deepCopyData = structuredClone(graphData);
    cy.add([...deepCopyData.nodes, ...deepCopyData.edges]);
    // cy.add([...graphData.nodes, ...graphData.edges]);

    const defaults = {};
    cy.panzoom(defaults);

    // metric card 정보 업데이트
    // cy.nodes().forEach((node) => {
    //   const name = node.data("name");
    //   const amount = Math.round(parseNeo4jInt(node.data("amount")) / 1_000_000);
    //   const percentage = 0;
    //   updateMetricDataHelper(name, amount, percentage, [], setMetricData);
    // });

    cyInstanceRef.current = cy;

    applyNetworkGraphLayout(cy);
  }, [graphData]);

  return (
    <div className="overflow-hidden  border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div id="cy" ref={cyRef} style={{ width: "100%", minHeight: "600px" }} />
    </div>
  );
}
