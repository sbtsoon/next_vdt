"use client";

import cytoscape from "@/lib/cytoscape/cytoscapeWithExtensions";
import { metricMapAtom } from "@/store/graphAtoms";
import { aiQueryAtom } from "@/store/graphAtoms";
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
import {
  demo2GraphStyle,
  getDemo2GraphStyle,
  networkGraphStyle,
} from "@/lib/cytoscape/graphStyle";
import attachCtxMenu from "@/lib/cytoscape/ctxMenu";
import {
  applyDemo2GraphLayout,
  applyNetworkGraphLayout,
} from "@/lib/cytoscape/graphLayout";

export default function Demo2({ graphData, pathData }) {
  const cyRef = useRef(null);
  const cyInstanceRef = useRef(null);
  const [, setMetricData] = useAtom(metricMapAtom);
  const [, setAiQuery] = useAtom(aiQueryAtom);

  useEffect(() => {
    if (!cyRef.current) return;
    if (!graphData) return; // !graphData 추가해주기

    if (cyInstanceRef.current) {
      cyInstanceRef.current.destroy();
      cyInstanceRef.current = null;
    }

    const panzoom = require("cytoscape-panzoom");
    panzoom(cytoscape);

    // labelSet → labelColorMap 만들기
    const labelSet = new Set();
    graphData.nodes.forEach((node) => {
      const labels = node.data.labels;
      if (labels?.[0]) labelSet.add(labels[0]);
    });

    const colorPalette = [
      "#60a5fa",
      "#34d399",
      "#facc15",
      "#f87171",
      "#a78bfa",
      "#fb923c",
      "#f472b6",
    ];

    const labelColorMap = new Map();
    Array.from(labelSet).forEach((label, idx) => {
      labelColorMap.set(label, colorPalette[idx % colorPalette.length]);
    });

    const cy = cytoscape({
      container: cyRef.current,
      style: getDemo2GraphStyle(labelColorMap),
    });

    const deepCopyData = structuredClone(graphData);
    cy.add([...deepCopyData.nodes, ...deepCopyData.edges]);

    const defaults = {};
    cy.panzoom(defaults);

    cyInstanceRef.current = cy;

    applyDemo2GraphLayout(cy);

    cy.on("tap", "node", (event) => {
      const node = event.target;
      const nodeId = node.id();
      console.log("Node tapped:", node);
    });

    cy.on("tap", "edge", (event) => {
      const edge = event.target;
      const edgeId = edge.id();
      console.log("Edge tapped:", edge);
    });
  }, [graphData]);

  useEffect(() => {
    if (!cyInstanceRef.current) return;

    if (pathData == null) {
      cyInstanceRef.current.nodes().removeClass("highlighted");
      cyInstanceRef.current.edges().removeClass("highlighted");
      return;
    }

    // 기존 하이라이트 제거
    cyInstanceRef.current.nodes().removeClass("highlighted");
    cyInstanceRef.current.edges().removeClass("highlighted");

    // 새로운 하이라이트 적용
    pathData.nodeIds.forEach((id) => {
      const node = cyInstanceRef.current.getElementById(id);
      if (node) node.addClass("highlighted");
    });

    pathData.edgeIds.forEach((id) => {
      const edge = cyInstanceRef.current.getElementById(id);
      if (edge) edge.addClass("highlighted");
    });
  }, [pathData]);

  useEffect(() => {
    let offset = 0;
    const interval = setInterval(() => {
      if (cyInstanceRef.current) {
        cyInstanceRef.current.edges(".highlighted").forEach((edge) => {
          edge.style("line-dash-offset", offset);
        });

        offset = (offset - 1 + 100) % 100; // 천천히 흐르게 조정
      }
    }, 50); // 50ms마다 업데이트 (애니메이션 속도 조절 가능)

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 정리
  }, []);

  const queryArr = [
    "MATCH (n)-[r]->(m) RETURN n, r, m",
    "MATCH path = (n)-[*]->(m) RETURN path",
    "MATCH path = (n)-[*]->(m) WHERE id(n) = 203 AND id(m) = 360 RETURN path",
  ];

  return (
    <div className="overflow-hidden  border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      {queryArr.map((query, idx) => (
        <button
          key={idx}
          style={{
            backgroundColor: "white",
            marginRight: "8px",
            marginBottom: "8px",
          }}
          onClick={() => setAiQuery({ query })}
        >
          {query}
        </button>
      ))}

      <div id="cy" ref={cyRef} style={{ width: "100%", minHeight: "600px" }} />
    </div>
  );
}
