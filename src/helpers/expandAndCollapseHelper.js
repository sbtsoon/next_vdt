import {
  showNode,
  showEdge,
  hideNode,
  hideEdge,
} from "@/helpers/showAndHideHelper";

export function expandNode(cy, nodeRef, nodeId) {
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
}

export function collapseNode(cy, nodeRef, nodeId) {
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
}
