"use client";

import cytoscape from "@/lib/cytoscape/cytoscapeWithExtensions";
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
  const didInitialize = useRef(false);

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
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      tooltip.style.left = `${mouseX + 10}px`;
      tooltip.style.top = `${mouseY + 10}px`;
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

    if (didInitialize.current) {
      didInitialize.current = false;
    }

    const panzoom = require("cytoscape-panzoom");
    panzoom(cytoscape);

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
              return ele.data("role") === "negative" ? "red" : "white";
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

    const deepCopyData = structuredClone(graphData);
    cy.add([...deepCopyData.nodes, ...deepCopyData.edges]);
    // cy.add([...graphData.nodes, ...graphData.edges]);

    const defaults = {};
    cy.panzoom(defaults);

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
                            <div class="node-name text-xl text-gray-300">${
                              data.name
                            }</div>
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

                    <div class="text-2xl">₩ ${amountValue.toLocaleString(
                      "ko-KR"
                    )}</div>

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
        가공비: { x: 2456.55923882003, y: -401.6180286126659 },
        FERT201: { x: 2011.91221064616, y: 1196.5029406541853 },
        FERT202: { x: 1986.6887174199474, y: 1427.2064964627455 },
        FERT203: { x: 1936.2417309675197, y: 1667.0822316262913 },
        부재료비: { x: 2487.364425998405, y: -216.56017066438633 },
        원재료비: { x: 2546.731658653151, y: -34.56237434227623 },
        생산입고: { x: 2463.3286336951332, y: 325.4501012670632 },
        공정출고: { x: 2466.6619670284667, y: 170.44829371390944 },
        액티비티수차합: { x: 2502.310186322719, y: 446.57359373876614 },
        액티비티단가합: { x: 2449.995481117116, y: 625.4181075762423 },
        비용계획합: { x: 2903.202914105695, y: -401.01035949159933 },
        FERT101: { x: 2946.6635023857293, y: 888.9510872451323 },
        FERT102: { x: 2870.3583398903847, y: 1115.7534849313272 },
        FERT103: { x: 2775.78644077191, y: 1352.4690521094726 },
        FERT104: { x: 2689.881831225508, y: 1581.7646718201397 },
        FERT105: { x: 2604.9951251342463, y: 1806.937392717706 },
        FERT106: { x: 2540.464402190489, y: 2015.3884534790848 },
        ROH0001누적: { x: 3473.87079917938, y: 2.6317058812969503 },
        ROH0002누적: { x: 3439.8521835017586, y: 214.00036899174603 },
        ROH0003누적: { x: 3386.574548317458, y: 435.4222352384621 },
        ROH2001누적: { x: 3429.372069069061, y: -617.4707944957579 },
        ROH2002누적: { x: 3470.3554648643294, y: -416.9836287512874 },
        ROH2003누적: { x: 3526.152592648285, y: -218.4055762519053 },
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
  }, [isActive]);

  const clickExpandBtn = () => {
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
        expandNode(currentId);
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
          onClick={clickExpandBtn}
        >
          Expand All
        </button>
      </div>

      <div id="cy" ref={cyRef} style={{ width: "100%", minHeight: "700px" }} />
      <div id="tooltip" className="graph-tool-tip" />
    </div>
  );
}
