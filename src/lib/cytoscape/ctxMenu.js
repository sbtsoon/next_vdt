import {
  showNode,
  showEdge,
  hideNode,
  hideEdge,
} from "@/helpers/cytoscapeVisibility";

export default function attackCtxMenu(cy) {
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
}
