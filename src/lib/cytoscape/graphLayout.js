import { parseNeo4jInt } from "@/utils/neo4jUtils";
import { showNode, showEdge } from "@/helpers/cytoscapeVisibility";

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
