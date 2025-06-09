import { parseNeo4jInt } from "@/helpers/parseNeo4jIntHelper";
import { showNode, showEdge } from "@/helpers/cytoscapeVisibilityHelper";

export function applyNetworkGraphLayout(cy) {
  cy.nodes().forEach((node) => showNode(node, 0));
  cy.edges().forEach((edge) => showEdge(edge, 0));
  const layout = cy.layout({ name: "cose", padding: 30 }).run();

  cy.style().selector("node").style({ width: "20px", height: "20px" });
  cy.style().selector("edge").style({ "curve-style": "straight" }).update();

  layout.on("layoutstop", () => {
    const rootNodes = cy
      .nodes()
      .filter((node) => parseNeo4jInt(node.data("level")) === 0);

    cy.animate(
      {
        center: { eles: rootNodes },
        zoom: 4,
      },
      {
        duration: 800, // 서서히 줌 (ms)
        easing: "ease-in-out",
      }
    );
  });
}

export function applySimulationGraphLayout(cy) {
  cy.layout({
    name: "dagre",
    rankDir: "RL", // 방향: 오른쪽 → 왼쪽
    nodeSep: 3, // 같은 레벨 노드 간 거리
    rankSep: 300, // 부모, 자식 노드 간 거리
    edgeSep: 100,
    padding: 200,
    animate: true,
    animationDuration: 400,
    animationEasing: "ease-in-out",
  }).run();
}
