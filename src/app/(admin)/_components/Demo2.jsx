"use client";

import cytoscape from "@/lib/cytoscapeWithExtensions";
import { graphDataAtom, metricMapAtom } from "@/store/graphAtoms";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { formatAmountWithMajorUnits } from "@/utils/formatUtils";
import { parseNeo4jInt } from "@/utils/neo4jUtils";
import {
  showNode,
  showEdge,
  hideNode,
  hideEdge,
} from "@/helpers/cytoscapeVisibility";
import { updateMetricDataHelper } from "@/helpers/metricHelper";

export default function Demo2() {
  const cyRef = useRef(null);
  const cyInstanceRef = useRef(null);
  const [graphData] = useAtom(graphDataAtom);

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
      style: [
        {
          selector: "node",
          style: {
            width: "20px",
            height: "20px",
            label: (ele) => ele.data("id"),
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "4px",
            "border-width": 1,
            "border-style": "solid",
            "text-wrap": "wrap",
            "text-max-width": "20px",
          },
        },
        {
          selector: "edge",
          style: {
            label: (ele) => {
              const type = ele.data("type") || "";
              return type;
            },
            color: "white",
            width: 0.1,
            "text-wrap": "wrap",
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
            "arrow-scale": "0.2",
            "font-size": "4px",
            "edge-text-rotation": "autorotate",
            "text-background-shape": "rectangle",
            "text-background-opacity": 0.3,
            "text-background-color": "#222",
            "text-background-radius": "5px",
          },
        },
      ],
    });

    const deepCopyData = structuredClone(graphData);

    cy.add([...deepCopyData.nodes, ...deepCopyData.edges]);

    const defaults = {};
    cy.panzoom(defaults);

    cyInstanceRef.current = cy;

    applyRadialLayout();
  }, [graphData]);

  const applyRadialLayout = () => {
    const cy = cyInstanceRef.current;
    cy.nodes().forEach((node) => showNode(node, 0));
    cy.edges().forEach((edge) => showEdge(edge, 0));
    const layout = cy
      .layout({
        name: "dagre",
        rankDir: "TB", // Top-Bottom, BOM 구조에 적합
        nodeSep: 50,
        edgeSep: 10,
        rankSep: 80,
        animate: true,
        animationDuration: 300,
      })
      .run();

    cy.style().selector("node").style({ width: "20px", height: "20px" });
    cy.style()
      .selector("edge")
      .style({
        "curve-style": "taxi",
        "taxi-direction": "downward",
        "taxi-turn": 20, // 수평 이동 거리
        "line-color": "#ccc",
        "target-arrow-shape": "triangle",
        "target-arrow-color": "#ccc",
        width: 1,
      })
      .update();

    layout.on("layoutstop", () => {
      cy.center();
    });
  };

  return (
    <div className="overflow-hidden  border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div id="cy" ref={cyRef} style={{ width: "100%", minHeight: "600px" }} />
    </div>
  );
}
