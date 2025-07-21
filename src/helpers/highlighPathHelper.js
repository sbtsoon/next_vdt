export function highlightPath(cy, nodeIds, edgeIds) {
  if (!cy) return;

  cy.nodes().removeClass("highlight");
  cy.edges().removeClass("highlight");

  nodeIds.forEach((id) => {
    const node = cy.getElementById(id);
    if (node?.nonempty()) node.addClass("highlight");
  });

  edgeIds.forEach((id) => {
    const edge = cy.getElementById(id);
    if (edge?.nonempty()) edge.addClass("highlight");
  });
}
