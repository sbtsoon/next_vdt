"use client";

import cytoscape from "@/lib/cytoscapeWithExtensions";
import { graphDataAtom } from "@/store/graphAtoms";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { formatAmountWithMajorUnits } from "@/utils/formatUtils";
import { parseNeo4jInt } from "@/utils/neo4jUtils";

// Layout mode constants
export const LAYOUT_MODES = Object.freeze({
  RADIAL: 0,
  DAGRE: 1,
  MINDMAP: 2,
});

export default function MonthlySalesChart() {
  const cyRef = useRef(null);
  const cyInstanceRef = useRef(null);
  const [graphData] = useAtom(graphDataAtom);

  const hideNode = (node, layoutMode = 0) => {
    node.hide();
    if (layoutMode === LAYOUT_MODES.MINDMAP) {
      node.style("opacity", 0);
    }
    node.data("isHidden", true);
  };

  const showNode = (node, layoutMode = 0, duration = 800) => {
    node.show();
    node.data("isHidden", false);
    if (layoutMode === LAYOUT_MODES.MINDMAP) {
      requestAnimationFrame(() => {
        node.animate({ style: { opacity: 1 }, duration });
      });
    } else {
      node.style("opacity", 1);
    }
  };

  const hideEdge = (edge, layoutMode = 0) => {
    edge.hide();
    if (layoutMode === LAYOUT_MODES.MINDMAP) {
      edge.style("opacity", 0);
    }
  };

  const showEdge = (edge, layoutMode = 0, duration = 800) => {
    edge.show();
    if (layoutMode === LAYOUT_MODES.MINDMAP) {
      requestAnimationFrame(() => {
        edge.animate({ style: { opacity: 1 }, duration });
      });
    } else {
      edge.style("opacity", 1);
    }
  };

  useEffect(() => {
    if (!cyRef.current) return;
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
              if (level === 0) return "#BF512C"; // Coach Red
              else if (level === 1) return "#DA9828"; // Orange
              else if (level === 2) return "#FBCFA1"; // Soft Yellow
              else if (level === 3) return "#277d5f"; // Mint
              else if (level === 4) return "#376f9f"; // Navy
              else return "#7A7A7A"; // fallback gray
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
            "text-background-opacity": 0.1,
            "text-background-color": "#222",
            "text-background-radius": "5px",
          },
        },
      ],
    });

    // cxtmenu
    cy.cxtmenu({
      selector: "node",
      commands: [
        {
          content: "숨김",
          select: function (ele) {
            hideNode(ele, 0);
            ele.connectedEdges().forEach((edge) => {
              hideEdge(edge, 0);
            });
          },
        },
        {
          content: "확장",
          select: function (ele) {
            const visited = new Set();
            const queue = [{ node: ele, from: null }];
            const rootId = ele.id();

            while (queue.length > 0) {
              const { node, from } = queue.shift();
              const nodeId = node.id();
              if (visited.has(nodeId)) continue;
              visited.add(nodeId);

              const edges = node.connectedEdges();
              edges.forEach((edge) => {
                const source = edge.source();
                const target = edge.target();
                const isOutgoing = source.id() === nodeId;

                if (isOutgoing) {
                  const next = target;
                  if (nodeId !== rootId) return;
                  showEdge(edge, 0);
                  showNode(next, 0);
                  queue.push({ node: next, from: nodeId });
                } else {
                  const prev = source;
                  if (target.id() !== rootId && prev.data("isHidden")) return;
                  showEdge(edge, 0);
                  showNode(prev, 0);
                  queue.push({ node: prev, from: nodeId });
                }
              });
            }
          },
        },
        {
          content: "통합",
          select: function (ele) {
            const visited = new Set();
            const queue = [ele];
            while (queue.length > 0) {
              const node = queue.shift();
              const nodeId = node.id();
              if (visited.has(nodeId)) continue;
              visited.add(nodeId);

              const incomingEdges = node
                .connectedEdges()
                .filter((edge) => edge.target().id() === nodeId);

              incomingEdges.forEach((edge) => {
                const source = edge.source();
                hideEdge(edge, 0);
                hideNode(source, 0);
                queue.push(source);
              });
            }
          },
        },
        {
          content: "정보",
          select: function (ele) {
            const connectedEdges = ele.connectedEdges();
            const connectedNodes = connectedEdges
              .connectedNodes()
              .filter((n) => n.id() !== ele.id());
            console.log(
              "연결된 노드:",
              connectedNodes.map((n) => n.data())
            );
            console.log(
              "연결된 엣지:",
              connectedEdges.map((e) => e.data())
            );
          },
        },
      ],
      openMenuEvents: "tap",
      outsideMenuCancel: 1,
      fillColor: "#eaeaea",
      activeFillColor: "#ccc",
      activePadding: 5,
      indicatorSize: 8,
      separatorWidth: 2,
      spotlightPadding: 4,
      menuRadius: 48,
      spotlightRadius: 22,
      minSpotlightRadius: 22,
      maxSpotlightRadius: 22,
      itemColor: "#444",
      itemTextShadowColor: "transparent",
    });

    cy.add([...graphData.nodes, ...graphData.edges]);
    cyInstanceRef.current = cy;

    applyRadialLayout();
  }, [graphData]);

  const applyRadialLayout = () => {
    const cy = cyInstanceRef.current;
    cy.nodes().forEach((node) => showNode(node, 0));
    cy.edges().forEach((edge) => showEdge(edge, 0));
    cy.layout({ name: "cose", animate: true, padding: 30 }).run();

    cy.style()
      .selector("node")
      .style({ shape: "ellipse", width: "20px", height: "20px" });
    cy.style().selector("edge").style({ "curve-style": "straight" }).update();
  };

  return (
    <div className="overflow-hidden  border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div id="cy" ref={cyRef} style={{ width: "100%", minHeight: "600px" }} />
    </div>
  );
}
