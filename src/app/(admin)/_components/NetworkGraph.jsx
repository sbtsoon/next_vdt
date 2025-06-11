"use client";

import cytoscape from "@/lib/cytoscape/cytoscapeWithExtensions";
import { metricMapAtom } from "@/store/graphAtoms";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { formatAmountWithMajorUnits } from "@/helpers/formatAmountWithMajorUnitsHelper";
import { parseNeo4jInt } from "@/helpers/parseNeo4jIntHelper";
import {
  showNode,
  showEdge,
  hideNode,
  hideEdge,
} from "@/helpers/showAndHideHelper";
import { updateMetricDataHelper } from "@/helpers/metricHelper";
import { networkGraphStyle } from "@/lib/cytoscape/graphStyle";
import attachCtxMenu from "@/lib/cytoscape/ctxMenu";
import { applyNetworkGraphLayout } from "@/lib/cytoscape/graphLayout";

export default function NetworkGraph({ graphData }) {
  const cyRef = useRef(null);
  const cyInstanceRef = useRef(null);
  const [, setMetricData] = useAtom(metricMapAtom);

  useEffect(() => {
    if (!cyRef.current) return;
    if (!graphData) return; // !graphData 추가해주기

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
    attachCtxMenu(cy);

    const deepCopyData = structuredClone(graphData);
    cy.add([...deepCopyData.nodes, ...deepCopyData.edges]);

    const defaults = {};
    cy.panzoom(defaults);

    cyInstanceRef.current = cy;

    applyNetworkGraphLayout(cy);
  }, [graphData]);

  return (
    <div className="overflow-hidden  border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div id="cy" ref={cyRef} style={{ width: "100%", minHeight: "600px" }} />
    </div>
  );
}
