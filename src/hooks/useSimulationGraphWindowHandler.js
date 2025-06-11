import { useEffect } from "react";
import { updateMetricDataHelper } from "@/helpers/metricHelper";

export function useSimulationGraphWindowHandler(
  cyInstanceRef,
  nodeRef,
  setMetricData,
  expandNode,
  collapseNode
) {
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
      // TODO: 부모가 여러개
      const parentNodes = node.outgoers("node");

      parentNodes.forEach((parentNode) => {
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
      });
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

    return () => {
      delete window.forceReRenderNode;
      delete window.handleToggleClick;
      delete window.showInput;
      delete window.hideInput;
      delete window.handleInputChange;
      delete window.updateParentNodes;
      delete window.clickHistoryData;
    };
  }, []);
}
