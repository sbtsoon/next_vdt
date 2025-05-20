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

export default function MonthlySalesChart({ onReady, selectedIndex }) {
  const cyRef = useRef(null);
  const cyInstanceRef = useRef(null);
  const [graphData] = useAtom(graphDataAtom);

  const hideNode = (node, layoutMode) => {
    node.hide();
    if (layoutMode === LAYOUT_MODES.MINDMAP) {
      node.style("opacity", 0);
    }
    node.data("isHidden", true);
  };

  const showNode = (node, layoutMode, duration = 800) => {
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

  const hideEdge = (edge, layoutMode) => {
    edge.hide();
    if (layoutMode === LAYOUT_MODES.MINDMAP) {
      edge.style("opacity", 0);
    }
  };

  const showEdge = (edge, layoutMode, duration = 800) => {
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
              if (level === 0) return "#e57373";
              else if (level === 1) return "#90a4ce";
              else if (level === 2) return "#26A69A";
              else if (level === 3) return "#64b5f6";
              else if (level === 4) return "#B2DFDB";
              else return "#ddd";
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

    // cxtmenu
    cy.cxtmenu({
      selector: "node",
      commands: [
        {
          content: "숨김",
          select: function (ele) {
            hideNode(ele, selectedIndex);
            ele.connectedEdges().forEach((edge) => {
              hideEdge(edge, selectedIndex);
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
                  showEdge(edge, selectedIndex);
                  showNode(next, selectedIndex);
                  queue.push({ node: next, from: nodeId });
                } else {
                  const prev = source;
                  if (target.id() !== rootId && prev.data("isHidden")) return;
                  showEdge(edge, selectedIndex);
                  showNode(prev, selectedIndex);
                  queue.push({ node: prev, from: nodeId });
                }
              });
            }
          },
        },
        {
          content: "닫기",
          select: function () {},
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
                hideEdge(edge, selectedIndex);
                hideNode(source, selectedIndex);
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
            console.log("연결된 노드:", connectedNodes.map((n) => n.data()));
            console.log("연결된 엣지:", connectedEdges.map((e) => e.data()));
          },
        },
      ],
      openMenuEvents: "tap",
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

    applyLayoutByIndex(selectedIndex);
    onReady?.(cy);
  }, [graphData]);

  useEffect(() => {
    if (cyInstanceRef.current) {
      applyLayoutByIndex(selectedIndex);
    }
  }, [selectedIndex]);

  const applyLayoutByIndex = (index) => {
    switch (index) {
      case LAYOUT_MODES.RADIAL:
        applyRadialLayout();
        break;
      case LAYOUT_MODES.DAGRE:
        applyDagreLayout();
        break;
      case LAYOUT_MODES.MINDMAP:
        applyMindmapLayout();
        break;
      default:
        applyRadialLayout();
        break;
    }
  };

  const applyRadialLayout = () => {
    const cy = cyInstanceRef.current;
    cy.nodes().forEach((node) => showNode(node, selectedIndex));
    cy.edges().forEach((edge) => showEdge(edge, selectedIndex));
    cy.layout({ name: "cose", animate: true, padding: 30 }).run();

    cy.style().selector("node").style({ shape: "ellipse", width: "20px", height: "20px" });
    cy.style().selector("edge").style({ "curve-style": "straight" }).update();
  };

  const applyDagreLayout = () => {
    const cy = cyInstanceRef.current;
    cy.nodes().forEach((node) => showNode(node, selectedIndex));
    cy.edges().forEach((edge) => showEdge(edge, selectedIndex));
    cy.layout({
      name: "dagre",
      rankDir: "RL",
      nodeSep: 40,
      rankSep: 100,
      edgeSep: 20,
      padding: 20,
      animate: true,
    }).run();

    cy.style().selector("node").style({ shape: "ellipse", width: "20px", height: "20px" });
    cy.style().selector("edge").style({ "curve-style": "round-taxi" }).update();
  };

  const applyMindmapLayout = () => {
    const cy = cyInstanceRef.current;
    if (!cy) return;

    cy.nodes().forEach((node) => hideNode(node, selectedIndex));
    cy.edges().forEach((edge) => hideEdge(edge, selectedIndex));

    const roots = cy.nodes().filter((node) => node.outgoers("edge").length === 0);
    if (roots.length === 0) {
      console.log("루트 노드를 찾을 수 없습니다.");
      return;
    }

    cy.style().selector("node").style({ shape: "rectangle", width: "30px", height: "20px" });
    cy.style()
      .selector("edge")
      .style({
        "curve-style": "round-taxi",
        "taxi-direction": "horizontal",
        "taxi-turn": 20,
        "taxi-turn-min-distance": 15,
        "edge-distances": "node-position",
      })
      .update();

    const layout = cy.layout({
      name: "dagre",
      rankDir: "RL",
      nodeSep: 40,
      rankSep: 100,
      edgeSep: 20,
      padding: 20,
      animate: true,
    });

    layout.run();

    layout.on("layoutstop", () => {
      roots.forEach((root) => {
        root.show();
        root.data("isHidden", false);
        root.animate({ style: { opacity: 1 }, duration: 500 });
      });
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div id="cy" ref={cyRef} style={{ width: "900px", minHeight: "600px" }} />
    </div>
  );
}
