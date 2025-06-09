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
} from "@/helpers/showAndHideHelper";
import { updateMetricDataHelper } from "@/helpers/metricHelper";

const iconMap = new Map([
  // 매출 관련
  ["매출이익", "매출이익.png"],
  ["매출액", "매출액.png"],
  ["매출원가", "매출원가.png"],

  // 제품군 / 재고
  ["FERT100s", "와인박스.png"],
  ["FERT200s", "와인박스.png"],
  ["기초재고", "기초재고.png"],
  ["기말재고", "기말재고.png"],
  ["당기제품제조원가", "비용2.png"],

  // 제품 단위
  ["FERT101", "와인.png"],
  ["FERT102", "와인.png"],
  ["FERT103", "와인.png"],
  ["FERT104", "와인.png"],
  ["FERT105", "와인.png"],
  ["FERT106", "와인.png"],
  ["FERT201", "와인.png"],
  ["FERT202", "와인.png"],
  ["FERT203", "와인.png"],

  // 제조비용
  ["당기제조비용", "비용.png"],
  ["재공품", "재공품.png"],
  ["액티비티배부", "비용2.png"],
  ["액티비티단수차", "비용2.png"],

  // 세부 원가
  ["원재료비", "비용.png"],
  ["부재료비", "비용.png"],
  ["가공비", "비용.png"],
  ["생산입고", "생산입고.png"],
  ["공정출고", "공정출고.png"],
  ["액티비티단가합", "비용2.png"],
  ["액티비티수차합", "비용2.png"],

  // 포도 재료
  ["ROH0001누적", "포도.png"],
  ["ROH0002누적", "포도.png"],
  ["ROH0003누적", "포도.png"],
  ["ROH2001누적", "포도.png"],
  ["ROH2002누적", "포도.png"],
  ["ROH2003누적", "포도.png"],

  // 비용 계획
  ["비용계획합", "비용.png"],
]);

export default function Example3({ graphData }) {
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

    const cy = cytoscape({
      container: cyRef.current,
      style: [
        {
          selector: "node",
          style: {
            shape: (ele) => {
              const level = parseNeo4jInt(ele.data("level"));
              return level <= 2 ? "ellipse" : "rectangle";
            },

            width: "20px", // 노드 크기 키움
            height: "20px",
            "background-color": "#FFFfff23",

            // 🔽 아이콘 크기 조절 핵심
            "background-fit": "none",
            "background-width": "10px", // 아이콘 너비 직접 설정
            "background-height": "10px", // 아이콘 높이 직접 설정
            "background-position-x": "50%", // 중앙 정렬
            "background-position-y": "50%",

            "background-clip": "node",
            "background-image-opacity": 1,

            "background-image": (ele) => {
              const name = ele.data("name");
              const icon = iconMap.get(name);
              return icon ? `/images/network-graph-node/${icon}` : undefined;
            },

            label: (ele) => ele.data("name"),
            "text-valign": "top",
            "text-halign": "center",
            "text-margin-y": -1.5,
            "font-size": "4px",
            backgroundColor: "#fff",

            "border-color": (ele) => {
              const level = parseNeo4jInt(ele.data("level"));
              if (level === 0) return "#BF512C";
              else if (level === 1) return "#DA9828";
              else if (level === 2) return "#FBCFA1";
              else if (level === 3) return "#277d5f";
              else if (level === 4) return "#376f9f";
              else return "#7A7A7A";
            },
            "border-width": 1,
            "border-style": "solid",
            "text-wrap": "wrap",
            "text-max-width": "20px",
            color: "#97b2d8",
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
            "text-background-opacity": 0.3,
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
            hideNode(ele, 1);
            ele.connectedEdges().forEach((edge) => {
              hideEdge(edge, 1);
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
                  showEdge(edge, 1);
                  showNode(next, 1);
                  queue.push({ node: next, from: nodeId });
                } else {
                  const prev = source;
                  if (target.id() !== rootId && prev.data("isHidden")) return;
                  showEdge(edge, 1);
                  showNode(prev, 1);
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
                hideEdge(edge, 1);
                hideNode(source, 1);
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

    // cy.add([...graphData.nodes, ...graphData.edges]);
    const deepCopyData = structuredClone(graphData);
    cy.add([...deepCopyData.nodes, ...deepCopyData.edges]);

    // metric card 정보 업데이트
    // cy.nodes().forEach((node) => {
    //   const name = node.data("name");
    //   const amount = Math.round(parseNeo4jInt(node.data("amount")) / 1_000_000);
    //   const percentage = 0;
    //   updateMetricDataHelper(name, amount, percentage, [], setMetricData);
    // });

    cyInstanceRef.current = cy;

    applyDagreLayout();
  }, [graphData]);

  const applyDagreLayout = () => {
    const cy = cyInstanceRef.current;
    cy.nodes().forEach((node) => {
      showNode(node, 1);
    });
    cy.edges().forEach((edge) => {
      showEdge(edge, 1);
    });

    const layout = cy
      .layout({
        name: "random", // 또는 'preset'
        animate: false, // 초기 위치는 즉시 적용
      })
      .run();

    cy.layout({
      name: "dagre",
      rankDir: "RL",
      nodeSep: 5, // 같은 레벨에서 노드 간 간격
      rankSep: 40, // 레벨 간 edge 길이
      edgeSep: 30, // 동일 레벨에서의 edge 길이
      padding: 20,
      animate: true,
    }).run();

    cy.style().selector("node").style({
      shape: "ellipse",
      width: "20px",
      height: "20px",
    });

    cy.style().selector("edge").style({ "curve-style": "round-taxi" }).update(); // "straight"
  };

  return (
    <div className="overflow-hidden  border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div id="cy" ref={cyRef} style={{ width: "100%", minHeight: "700px" }} />
    </div>
  );
}
