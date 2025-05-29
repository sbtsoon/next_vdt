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

const iconMap = new Map([
  // 매출 관련
  ["매출이익", "profit.png"],
  ["매출액", "sales.png"],
  ["매출원가", "cogs.png"],

  // 제품군 / 재고
  ["FERT100s", "winebox.jpg"],
  ["FERT200s", "winebox.jpg"],
  ["기초재고", "bi.png"],
  ["기말재고", "ei.png"],
  ["당기제품제조원가", "cpmc.png"],

  // 제품 단위
  ["FERT101", "winebottle.jpg"],
  ["FERT102", "winebottle.jpg"],
  ["FERT103", "winebottle.jpg"],
  ["FERT104", "winebottle.jpg"],
  ["FERT105", "winebottle.jpg"],
  ["FERT106", "winebottle.jpg"],
  ["FERT201", "winebottle.jpg"],
  ["FERT202", "winebottle.jpg"],
  ["FERT203", "winebottle.jpg"],

  // 제조비용
  ["당기제조비용", "cmc.png"],
  ["재공품", "wip.png"],
  ["액티비티배부", "ad.png"],
  ["액티비티단수차", "aqd.png"],

  // 세부 원가
  ["원재료비", "rmc.png"],
  ["부재료비", "smc.png"],
  ["가공비", "pc.png"],
  ["생산입고", "pr.png"],
  ["공정출고", "fd.png"],
  ["액티비티단가합", "ps.png"],
  ["액티비티수차합", "ps.png"],

  // 포도 재료
  ["ROH0001누적", "grape.jpg"],
  ["ROH0002누적", "grape.jpg"],
  ["ROH0003누적", "grape.jpg"],
  ["ROH2001누적", "grape.jpg"],
  ["ROH2002누적", "grape.jpg"],
  ["ROH2003누적", "grape.jpg"],

  // 비용 계획
  ["비용계획합", "cp.png"],
]);

export default function NetworkGraph({ isActive }) {
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

    const cy = cytoscape({
      container: cyRef.current,
      style: [
        {
          selector: "node",
          style: {
            shape: (ele) => {
              const level = parseNeo4jInt(ele.data("level"));
              if (level === 0 || level === 1 || level === 2) return "eclipse";
              else return "rectangle";
            },
            label: (ele) => ele.data("name"),
            "text-valign": "top",
            "text-margin-y": -1.5,
            "text-halign": "center",
            "font-size": "4px",
            backgroundColor: "#FFF",
            "background-image": (ele) => {
              const name = ele.data("name");
              const icon = iconMap.get(name);
              return icon ? `/images/network-graph-node/${icon}` : undefined;
            },
            "background-fit": "cover",
            "border-color": (ele) => {
              const level = parseNeo4jInt(ele.data("level"));
              if (level === 0) return "#BF512C"; // Coach Red
              else if (level === 1) return "#DA9828"; // Orange
              else if (level === 2) return "#FBCFA1"; // Soft Yellow
              else if (level === 3) return "#277d5f"; // Mint
              else if (level === 4) return "#376f9f"; // Navy
              else return "#7A7A7A"; // fallback gray
            },
            // "border-color": "#2a9d8f",
            "border-width": 1,
            "border-style": "solid",
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
              const parsedAmount = Math.round(amount / 1_000_000);
              return `${type}\n${
                ele.data("role") === "negative" ? "(-)" : "(+)"
              } ₩ ${parsedAmount.toLocaleString("KO-KR")}`;
            },
            width: 0.1,
            "text-wrap": "wrap",
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
            "arrow-scale": "0.2",
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

    // metric card 정보 업데이트
    cy.nodes().forEach((node) => {
      const name = node.data("name");
      const amount = Math.round(parseNeo4jInt(node.data("amount")) / 1_000_000);
      const percentage = 0;
      updateMetricDataHelper(name, amount, percentage, [], setMetricData);
    });

    cyInstanceRef.current = cy;

    applyRadialLayout();
  }, [graphData]);

  const applyRadialLayout = () => {
    const cy = cyInstanceRef.current;
    cy.nodes().forEach((node) => showNode(node, 0));
    cy.edges().forEach((edge) => showEdge(edge, 0));
    cy.layout({ name: "cose", animate: true, padding: 30 }).run();

    cy.style().selector("node").style({ width: "20px", height: "20px" });
    cy.style().selector("edge").style({ "curve-style": "straight" }).update();
  };

  return (
    <div className="overflow-hidden  border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div id="cy" ref={cyRef} style={{ width: "100%", minHeight: "600px" }} />
    </div>
  );
}
