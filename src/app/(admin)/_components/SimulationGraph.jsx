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
import styles from "./simulationGraph.css";

export default function SimulationGraph({ isActive }) {
  const cyRef = useRef(null);
  const cyInstanceRef = useRef(null);
  const [graphData] = useAtom(graphDataAtom);
  const [, setMetricData] = useAtom(metricMapAtom);
  const nodeRef = useRef({});

  const expandNode = (nodeId) => {
    const cy = cyInstanceRef.current;
    if (!cy || !nodeId) return;

    const node = cy.getElementById(nodeId);
    const visited = new Set();
    const queue = [{ node: node, from: null }];
    const rootId = node.id();

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
          const isRootNode = nodeId === rootId;
          if (!isRootNode) return;

          showEdge(edge, 2);
          showNode(next, 2);
          const nextId = next.id();
          if (!nodeRef.current[nextId]) nodeRef.current[nextId] = {};
          nodeRef.current[nextId].isDisplay = true;

          queue.push({ node: next, from: nodeId });
        } else {
          const prev = source;
          const isRootTarget = target.id() === rootId;
          if (!isRootTarget && prev.data("isHidden")) return;

          showEdge(edge, 2);
          showNode(prev, 2);
          const prevId = prev.id();
          if (!nodeRef.current[prevId]) nodeRef.current[prevId] = {};
          nodeRef.current[prevId].isDisplay = true;

          queue.push({ node: prev, from: nodeId });
        }
      });
    }
  };

  const collapseNode = (nodeId) => {
    const cy = cyInstanceRef.current;
    if (!cy || !nodeId) return;

    const node = cy.getElementById(nodeId);
    const visited = new Set();
    const queue = [node];

    while (queue.length > 0) {
      const node = queue.shift();
      const nodeId = node.id();
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const incomers = node.incomers("edge");

      incomers.forEach((edge) => {
        const source = edge.source();

        hideEdge(edge, 2);
        hideNode(source, 2);
        if (!nodeRef.current[source.id()]) nodeRef.current[source.id()] = {};
        nodeRef.current[source.id()].isDisplay = false;
        nodeRef.current[source.id()].expanded = false;

        queue.push(source);
      });
    }
  };

  useEffect(() => {
    window.forceReRenderNode = (nodeId) => {
      const cy = cyInstanceRef.current;
      const node = cy.getElementById(nodeId);
      node.addClass("force-re-render");
      node.removeClass("force-re-render");

      // metric card 정보 업데이트
      const name = node.data("name");
      const amount = nodeRef.current[nodeId].amount;
      const percentage = nodeRef.current[nodeId].percentage;
      const scaledHistoryData = nodeRef.current[nodeId].scaledHistoryData;
      updateMetricDataHelper(
        name,
        amount,
        percentage,
        scaledHistoryData,
        setMetricData
      );
    };

    window.handleToggleClick = (nodeId) => {
      const cy = cyInstanceRef.current;
      const ref = nodeRef.current[nodeId];
      if (!ref) return;

      if (ref.expanded) {
        collapseNode(nodeId);
      } else {
        expandNode(nodeId);
        cy.animate({
          panBy: { x: -60, y: 0 },
          duration: 400,
          easing: "ease-in-out",
        });
      }
      ref.expanded = !ref.expanded;

      forceReRenderNode(nodeId);
    };

    window.showInput = (nodeId) => {
      const html = document.querySelector(
        `.cy-node-label-html[data-node-id="${nodeId}"]`
      );
      if (html) {
        const input = html.querySelector(".range-input-container");
        if (input) input.style.display = "inline-block";
      }
    };

    window.hideInput = (nodeId) => {
      const html = document.querySelector(
        `.cy-node-label-html[data-node-id="${nodeId}"]`
      );
      if (html) {
        const input = html.querySelector(".range-input-container");
        if (input) input.style.display = "none";
      }
    };

    window.updateHistoryData = (nodeId) => {
      const ref = nodeRef.current[nodeId];
      const percentage = ref.percentage;
      if (ref.historyData.length < 10) {
        ref.historyData.push(percentage);
      } else {
        ref.historyData.shift();
        ref.historyData.push(percentage);
      }

      const maxAbs = Math.max(...ref.historyData.map((h) => Math.abs(h)));
      const isNeedAutoScale = 19 < maxAbs;
      const scale = isNeedAutoScale ? 19 / maxAbs : 1;

      ref.scaledHistoryData = ref.historyData.map((h) => {
        if (h === 0) return 0;
        const height = Math.max(Math.abs(h) * scale, 1);
        return h > 0 ? height : -height;
      });
    };

    window.handleInputChange = (nodeId, initialAmount, percentageValue) => {
      const cy = cyInstanceRef.current;
      if (!cy || !nodeId) return;

      if (!nodeRef.current[nodeId]) {
        nodeRef.current[nodeId] = {};
      }

      // 현재 값 계산 및 저장
      const calculatedAmount =
        initialAmount * (1 + Number(percentageValue) / 100);

      nodeRef.current[nodeId].amount = Math.round(calculatedAmount); // TODO: Math.round()
      nodeRef.current[nodeId].percentage = Number(percentageValue);

      // 자식 node 비활성화
      const node = cy.getElementById(nodeId);
      if (!node || node.empty()) return;
      const allChildNodes = node.predecessors("node");
      allChildNodes.forEach((childNode) => {
        const childId = childNode.id();
        if (!nodeRef.current[childId]) {
          nodeRef.current[childId] = {};
        }
        nodeRef.current[childId].disabled = true;
        const html = document.querySelector(
          `.cy-node-label-html[data-node-id="${childId}"]`
        );
        if (html) {
          const input = html.querySelector("input");
          if (input) input.disabled = true;
        }
      });

      // historyData 추가
      updateHistoryData(nodeId);
    };

    window.updateParentNodes = (nodeId) => {
      const cy = cyInstanceRef.current;
      const node = cy.getElementById(nodeId);

      // TODO: 부모가 여러개라면?
      const parentNode = node.outgoers("node");
      const parentNodeId = parentNode.id();
      if (!parentNode.data("name")) return;

      const childrenEdges = parentNode.incomers("edge");
      let parentNodeAmount = 0;
      childrenEdges.forEach((childrenEdge) => {
        const role = childrenEdge.data("role");
        const childNodeId = childrenEdge.source().id();
        const childNodeAmount = nodeRef.current[childNodeId].amount;
        if (role === "negative") {
          parentNodeAmount -= childNodeAmount;
        } else {
          parentNodeAmount += childNodeAmount;
        }
      });

      const parentPercentage = Math.round(
        (parentNodeAmount / nodeRef.current[parentNodeId].initialAmount - 1) *
          100
      ); // TODO: Math.round()
      nodeRef.current[parentNodeId].amount = parentNodeAmount;
      nodeRef.current[parentNodeId].percentage = parentPercentage;

      // historyData 추가
      updateHistoryData(parentNodeId);

      forceReRenderNode(parentNodeId);
      updateParentNodes(parentNodeId);
    };

    window.clickHistoryData = (nodeId, index, event) => {
      const percentage = nodeRef.current[nodeId].historyData[index];

      const barElement = document.querySelectorAll(
        `.cy-node-label-html[data-node-id="${nodeId}"] .history-graph div`
      )[index];
      const tooltip = document.getElementById("tooltip");

      if (!barElement || !tooltip) return;

      const rect = barElement.getBoundingClientRect();

      tooltip.textContent = `${percentage}%`;
      const mouseX = event.clientX + window.scrollX;
      const mouseY = event.clientY + window.scrollY;

      // tooltip.style.left = `${mouseX + 2}px`; // 약간 오른쪽
      //tooltip.style.top = `${mouseY - 2}px`; // 약간 위쪽
      tooltip.style.display = "block";

      setTimeout(() => {
        tooltip.style.display = "none";
      }, 500);
    };
  }, []);

  useEffect(() => {
    if (!cyRef.current) return;

    if (cyInstanceRef.current) {
      cyInstanceRef.current.destroy();
      cyInstanceRef.current = null;
    }

    if (nodeRef.current) {
      nodeRef.current = {};
    }

    const cy = cytoscape({
      container: cyRef.current,
      style: [
        {
          selector: "node",
          style: {
            width: 300,
            height: 74,
            shape: "rectangle",
          },
        },
        {
          selector: "edge",
          style: {
            label: (ele) => {
              return `${ele.data("role") === "negative" ? "-" : "+"}`;
            },
            color: (ele) => {
              return ele.data("role") === "negative" ? "red" : "black";
            },
            width: 0.3,
            "font-size": "30px",
            "line-color": "#CCC",
            "curve-style": "round-taxi",
            "taxi-direction": "leftward",
            "taxi-turn": 100,
            "taxi-turn-min-distance": 10,
          },
        },
      ],
    });

    cy.add([...graphData.nodes, ...graphData.edges]);

    const layout = cy
      .layout({
        name: "dagre",
        rankDir: "RL", // 방향: 오른쪽 → 왼쪽
        nodeSep: 3, // 같은 레벨 노드 간 거리
        rankSep: 300, // 부모, 자식 노드 간 거리
        edgeSep: 100,
        padding: 200,
        animate: true,
        animationDuration: 400,
        animationEasing: "ease-in-out",
      })
      .run();

    cy.nodeHtmlLabel([
      {
        query: "node",
        halign: "center",
        valign: "center",
        tpl: (data) => {
          const ref = nodeRef.current?.[data.id] || {};
          if (ref.isDisplay === false) return "";

          const node = cy.getElementById(data.id);

          const initialAmount = Math.round(
            parseNeo4jInt(data.amount) / 1_000_000
          ); // TODO: 백만원 단위
          if (ref.initialAmount === undefined) {
            ref.initialAmount = initialAmount;
          }
          const amountValue =
            ref.amount === undefined ? initialAmount : ref.amount;
          ref.amount = amountValue;

          if (!ref.percentage) {
            ref.percentage = 0;
          }
          const percentageValue = ref.percentage;
          const disabled = ref.disabled ? "disabled" : "";

          const expanded = ref.expanded === true;
          const toggleSymbol = expanded
          ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
             </svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
             </svg>`;


          const allChildNodes = node.predecessors("node");
          const isLeaf = allChildNodes.length === 0;

          const excludedNames = [
            "액티비티수차합",
            "액티비티단가합",
            "생산입고",
            "공정출고",
            "비용계획합",
          ];

          if (!ref.historyData) {
            ref.historyData = [];
          }
          const scaledHistoryData = ref.scaledHistoryData
            ? ref.scaledHistoryData
            : [];

          return `
                <div
                    class="cy-node-label-html"
                    data-node-id="${data.id}"
                    onmouseover="showInput('${data.id}');"
                    onmouseout="hideInput('${data.id}');"
                >
                    ${
                      isLeaf
                        ? ""
                        : `<div
                            class="toggle-symbol"
                            onclick="handleToggleClick('${data.id}')">
                            ${toggleSymbol}
                          </div>`
                    }

                    <div class="node-header-container">
                        <div class="node-header-info">
                            <div class="node-name text-xl text-gray-300">${data.name}</div>
                            ${
                              !excludedNames.includes(data.name)
                                ? `<div class="percentage text-xl ${
                                    percentageValue > 0
                                      ? "text-green-500"
                                      : percentageValue < 0
                                      ? "text-red-500"
                                      : "text-gray-400"
                                  }">${percentageValue}%</div>`
                                : ""
                            }
                        </div>
                        <div class="text-sm text-gray-400">Unit: 백만원</div>
                    </div>

                    <div class="text-2xl">₩ ${amountValue.toLocaleString("ko-KR")}</div>

                            ${
                              excludedNames.includes(data.name)
                                ? ""
                                : `
                                        <div class="node-content-container mt-1.5 border-t border-gray-600 p-2">
                                            <div class="amt-container"">
                                                <div class="old-amt-container">
                                                    <div class="text-sm text-gray-400">Old Amt:</div>
                                                    <div class="amt-value text-gray-200">₩ ${initialAmount.toLocaleString(
                                                      "ko-KR"
                                                    )}</div>
                                                </div>
                                                <div class="chg-amt-container">
                                                    <div  class="text-sm text-gray-400">Chg Amt:</div>
                                                    <div  class="amt-value text-gray-200">₩ ${(
                                                      amountValue -
                                                      initialAmount
                                                    ).toLocaleString(
                                                      "ko-KR"
                                                    )}</div>
                                                </div>
                                            </div>
                                            <div>
                                              <div  class="text-sm text-gray-400">Last 10 records</div>
                                                <div class="history-graph">
                                                    <div class="positive-history-data-container">
                                                        ${scaledHistoryData
                                                          .map((h, i) => {
                                                            const color =
                                                              h >= 0
                                                                ? "orange"
                                                                : "transparent";
                                                            const height =
                                                              h > 0 ? h : 0;
                                                            return `<div
                                                                    class="history-bar ${
                                                                      h >= 0
                                                                        ? "bar-positive"
                                                                        : "bar-empty"
                                                                    }"
                                                                    style="height: ${height}px;"
                                                                    onmousedown="event.stopPropagation();
                                                                    clickHistoryData('${
                                                                      data.id
                                                                    }', ${i}, event);"></div>`;
                                                          })
                                                          .join("")}
                                                    </div>
                                                    <div class="history-graph-divider"></div>
                                                    <div class="negative-history-data-container">
                                                        ${scaledHistoryData
                                                          .map((h, i) => {
                                                            const color =
                                                              h < 0
                                                                ? "red"
                                                                : "transparent";
                                                            const height =
                                                              h < 0 ? -h : 0;
                                                            return `<div
                                                                    class="history-bar ${
                                                                      h < 0
                                                                        ? "bar-negative"
                                                                        : "bar-empty"
                                                                    }"
                                                                    style="height: ${height}px;"
                                                                    onmousedown="event.stopPropagation();
                                                                    clickHistoryData('${
                                                                      data.id
                                                                    }', ${i}, event);"></div>`;
                                                          })
                                                          .join("")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="range-input-container bg-blue-light-950/10">
                                            <div class="range-input-display-box">
                                                <div class="keep-button-container">
                                                    <button class="keep-button">KEEP</button>
                                                </div>
                                                <input
                                                  class="range-input"
                                                  type="range"
                                                  ${disabled}
                                                  value="${percentageValue}"
                                                  min="-15"
                                                  max="15"
                                                  oninput="
                                                    const percentageDivs = this.closest('.cy-node-label-html')?.querySelectorAll('.percentage');
                                                    if (percentageDivs) {
                                                      percentageDivs.forEach(div => {
                                                      div.textContent = this.value + '%';
                                                  })}"
                                                  onmouseup="
                                                    handleInputChange('${
                                                      data.id
                                                    }', ${initialAmount}, this.value);
                                                    forceReRenderNode('${
                                                      data.id
                                                    }');
                                                    updateParentNodes('${
                                                      data.id
                                                    }');
                                                  "
                                                  onmousedown="event.stopPropagation();"
                                                  onmousemove="event.stopPropagation();"
                                                />
                                                <div class="percentage">${percentageValue}%</div>
                                            </div>
                                        </div>
                                    `
                            }
                </div>
                `;
        },
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

    const roots = cy
      .nodes()
      .filter((node) => node.outgoers("edge").length === 0);

    layout.on("layoutstop", () => {
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
      const nodePositions = {
        매출원가: { x: 798.3342288998895, y: 704.8898453135909 },
        매출액: { x: 798.3342288998895, y: 968.24288111116 },
        당기제품제조원가: { x: 1347.24006, y: 347.0353200556658 },
        기초재고: { x: 1374.8861906279813, y: 525.3371253720223 },
        기말재고: { x: 1401.164721046636, y: 705.6113923763377 },
        FERT100s: { x: 1404.4980606279814, y: 880.7656582299755 },
        FERT200s: { x: 1402.8313908373088, y: 1058.8715207419013 },
        당기제조비용: { x: 1948.7291706279816, y: 64.39271855322282 },
        재공품: { x: 1987.308, y: 247.7019956226425 },
        액티비티단수차: { x: 1987.3079999999993, y: 435.6673726920622 },
        액티비티배부: { x: 1948.7291706279816, y: 625.0334101801366 },
        가공비: { x: 2561.788617629735, y: -123.62142290129071 },
        부재료비: { x: 2562.5938048081102, y: 63.04208671492896 },
        원재료비: { x: 2565.064991986484, y: 247.10429232439049 },
      };

      cy.nodes().forEach((node) => {
        const name = node.data("name");
        const position = nodePositions[name];
        if (position) {
          node.position({
            x: position.x + OFFSET_X,
            y: position.y,
          });
        }
      });
    });

    cyInstanceRef.current = cy;
  }, [graphData]);

  return (
    <div className="overflow-hidden  border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div id="cy" ref={cyRef} style={{ width: "100%", minHeight: "800px" }} />
      <div id="tooltip" className="graph-tool-tip" />
    </div>
  );
}
