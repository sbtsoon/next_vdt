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
import { demo2GraphStyle, networkGraphStyle } from "@/lib/cytoscape/graphStyle";
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

    const cy = cytoscape({
      container: cyRef.current,
      style: demo2GraphStyle,
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
      console.log("Node tapped:", nodeId);
    });

    cy.on("tap", "edge", (event) => {
      const edge = event.target;
      const edgeId = edge.id();
      console.log("Edge tapped:", edgeId);
    });
  }, [graphData]);

  useEffect(() => {
    if (!pathData || !cyInstanceRef.current) return;

    // 기존 하이라이트 제거
    cyInstanceRef.current.nodes().removeClass("highlighted");
    cyInstanceRef.current.edges().removeClass("highlighted");

    // // 새로운 하이라이트 적용
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

  return (
    <div className="overflow-hidden  border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <button
        style={{ backgroundColor: "white" }}
        onClick={() =>
          setAiQuery({ query: "MATCH path = (n)-[*]->(m) RETURN path" })
        }
      >
        Change to path cypher query1
      </button>
      <button
        style={{ backgroundColor: "white" }}
        onClick={() =>
          setAiQuery({
            query:
              "MATCH path = (n)-[*]->(m) WHERE id(n) = 16 AND id(m) = 26 RETURN path",
          })
        }
      >
        Change to path cypher query2
      </button>
      <div id="cy" ref={cyRef} style={{ width: "100%", minHeight: "600px" }} />
    </div>
  );
}
