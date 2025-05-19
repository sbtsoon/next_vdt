"use client";

import { graphDataAtom } from "@/store/graphAtoms";
import cytoscape from "cytoscape";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import {formatAmountWithMajorUnits} from  "@/utils/formatUtils"
import {parseNeo4jInt} from "@/utils/neo4jUtils"

export default function MonthlySalesChart({onReady}) {
  const cyRef = useRef(null)
  const cyInstanceRef = useRef(null)
  
  const [graphData] = useAtom(graphDataAtom)

  useEffect(() => {
    if (!cyRef.current) return
    const cy = cytoscape({
      container: cyRef.current,
      style: [
        {
          selector: "node",
          style: {
            label: (ele) => ele.data("name"),
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "4px",
            backgroundColor: (ele) => {
              const level = parseNeo4jInt(ele.data("level"));
              if (level === 0) return "#e57373";
              else if (level === 1) return "#90a4ce";
              else if (level === 2) return "#26A69A";
              else if (level === 3) return "#64b5f6";
              else if (level === 4) return "#B2DFDB";
              else return "#ddd"; // fallback
            },
            color: "#333",
            width: "20px",
            height: "20px",
            "text-wrap": "wrap",
            "text-max-width": "20px",
          },
        },
        {
          selector: "edge",
          style: {
            label: (ele) => {
              const type = ele.data("type") || "";
              const amount = parseNeo4jInt(ele.data("amount"));
              return `${type}\n${
                ele.data("role") === "negative" ? "(-)" : "(+)"
              } ${formatAmountWithMajorUnits(amount)}`;
            },
            width: 0.4,
            "text-wrap": "wrap",
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
            "arrow-scale": "0.4",
            "font-size": "4px",
            color: (ele) =>
              ele.data("role") === "negative" ? "#d62828" : "#2a9d8f",
            "edge-text-rotation": "autorotate",
            "text-background-shape": "rectangle",
            "text-background-opacity": 1,
            "text-background-color": "#fff",
          },
        },
      ],
    });

    cy.add([...graphData.nodes, ...graphData.edges]);

    cyInstanceRef.current = cy;

    applyRadialLayout()

    onReady?.(cy);
  }, [graphData])

  const applyRadialLayout = () => {
    const cy = cyInstanceRef.current;;

    cy.layout({ name: "cose", animate: true, padding: 30 }).run();
    cy.style().selector("node").style({
      shape: "ellipse",
      width: "20px",
      height: "20px",
    });
    cy.style().selector("edge").style({ "curve-style": "straight" }).update();

    cyInstanceRef.current = cy;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div id="cy" ref={cyRef} style={{width: '900px', minHeight: "600px"}} />
    </div>
  );
}
