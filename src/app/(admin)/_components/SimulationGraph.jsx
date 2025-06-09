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
import styles from "./simulationGraph.css";
import { simulationGraphStyle } from "@/lib/cytoscape/graphStyle";
import { applySimulationGraphLayout } from "@/lib/cytoscape/graphLayout";
import { useSimulationGraphWindowHandler } from "@/hooks/useSimulationGraphWindowHandler";
import { SIMULATION_GRAPH_NODE_POSITIONS } from "@/constants/simulationGraphNodePositions";
import { generateSimulationGraphNodeLabel } from "@/lib/cytoscape/generateSimulationGraphNodeLabel";
import { collapseNode, expandNode } from "@/helpers/expandAndCollapseHelper";

export default function SimulationGraph({ isActive, graphData }) {
  const cyRef = useRef(null);
  const cyInstanceRef = useRef(null);
  const [, setMetricData] = useAtom(metricMapAtom);
  const nodeRef = useRef({});
  const didInitialize = useRef(false);

  useSimulationGraphWindowHandler(
    cyInstanceRef,
    nodeRef,
    setMetricData,
    (nodeId) => expandNode(cyInstanceRef.current, nodeRef, nodeId),
    (nodeId) => collapseNode(cyInstanceRef.current, nodeRef, nodeId)
  );

  useEffect(() => {
    if (!cyRef.current) return;
    if (!graphData) return; // !graphData 추가해주기

    if (cyInstanceRef.current) {
      cyInstanceRef.current.destroy();
      cyInstanceRef.current = null;
    }

    if (nodeRef.current) {
      nodeRef.current = {};
    }

    if (didInitialize.current) {
      didInitialize.current = false;
    }

    const panzoom = require("cytoscape-panzoom");
    panzoom(cytoscape);

    const cy = cytoscape({
      container: cyRef.current,
      style: simulationGraphStyle,
    });

    const deepCopyData = structuredClone(graphData);
    cy.add([...deepCopyData.nodes, ...deepCopyData.edges]);

    const defaults = {};
    cy.panzoom(defaults);

    applySimulationGraphLayout(cy);

    cy.nodeHtmlLabel([
      {
        query: "node",
        halign: "center",
        valign: "center",
        tpl: generateSimulationGraphNodeLabel(cy, nodeRef),
      },
    ]);

    cy.on("tap", "node", (event) => {
      const node = event.target;
      console.log("✅ 노드 위치:", node.position());
    });

    cy.nodes().forEach((node) => {
      const nodeId = node.id();
      if (!nodeRef.current[nodeId]) nodeRef.current[nodeId] = {};
      nodeRef.current[nodeId].isDisplay = false;

      hideNode(node, 2);
    });

    cy.edges().forEach((edge) => {
      hideEdge(edge, 2);
    });

    cyInstanceRef.current = cy;
  }, [graphData]);

  useEffect(() => {
    if (!isActive || didInitialize.current || !cyInstanceRef.current) return;
    const cy = cyInstanceRef.current;
    didInitialize.current = true; // 처음 한번만 실행

    requestAnimationFrame(() => {
      // isActive===true라고 해서, 바로 DOM이 렌더링 완료되는 것이 아니기 때문에, 의도적으로 지연하여 안정성 확보
      cy.resize(); // 탭이 비활성화 일 때, 잘못 계산된 size를 재계산
      const roots = cy
        .nodes()
        .filter((node) => node.outgoers("edge").length === 0);
      roots.forEach((root) => {
        showNode(root, 2);
        const rootId = root.id();
        nodeRef.current[rootId].isDisplay = true;
        nodeRef.current[rootId].expanded = false;
      });

      cy.zoom({
        level: 0.6,
      });
      cy.center(roots);
      const OFFSET_X = -50;

      cy.nodes().forEach((node) => {
        const name = node.data("name");
        const position = SIMULATION_GRAPH_NODE_POSITIONS[name];
        if (position) {
          node.position({
            x: position.x + OFFSET_X,
            y: position.y,
          });
        }
      });
    });
  }, [isActive]);

  const clickExpandAllBtn = () => {
    if (!cyInstanceRef.current) return;
    const cy = cyInstanceRef.current;
    const roots = cy
      .nodes()
      .filter((node) => node.incomers("node").length === 0);
    const visited = new Set();

    const queue = [...roots];
    while (queue.length > 0) {
      const current = queue.shift();
      const currentId = current.id();
      const ref = nodeRef.current[currentId];

      if (visited.has(currentId)) continue;
      visited.add(currentId);

      if (!ref.expanded) {
        expandNode(cy, nodeRef, currentId);
        ref.expanded = true;
        forceReRenderNode(currentId);
      }

      const children = current.outgoers("node");
      children.forEach((child) => {
        if (!visited.has(child.id())) {
          queue.push(child);
        }
      });
    }
  };

  return (
    <div
      style={{ position: "relative" }}
      className="overflow-hidden  border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
    >
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 9999, // 충분히 높은 값
        }}
      >
        <button
          style={{
            backgroundColor: "black",
            color: "white",
            borderRadius: "2px",
            padding: "6px 8px",
            cursor: "pointer",
            fontSize: "10px",
          }}
          onClick={clickExpandAllBtn}
        >
          Expand All
        </button>
      </div>

      <div id="cy" ref={cyRef} style={{ width: "100%", minHeight: "700px" }} />
      <div id="tooltip" className="graph-tool-tip" />
    </div>
  );
}
