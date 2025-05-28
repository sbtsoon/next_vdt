export const LAYOUT_MODES = Object.freeze({
  RADIAL: 0,
  DAGRE: 1,
  MINDMAP: 2,
});

export const showNode = (node, layoutMode, duration = 800) => {
  node.show();
  node.data("isHidden", false);
  if (layoutMode === LAYOUT_MODES.MINDMAP) {
    requestAnimationFrame(() => {
      node.animate({ style: { opacity: 1 }, duration });
    });
  } else {
    node.style("opacity", 1);
  }
};

export const hideNode = (node, layoutMode) => {
  node.hide();
  if (layoutMode === LAYOUT_MODES.MINDMAP) {
    node.style("opacity", 0);
  }
  node.data("isHidden", true);
};

export const showEdge = (edge, layoutMode, duration = 800) => {
  if (edge.data("isHidden")) {
    edge.show();
    edge.data("isHidden", false);
    if (layoutMode === LAYOUT_MODES.MINDMAP) {
      requestAnimationFrame(() => {
        edge.animate({ style: { opacity: 1 }, duration });
      });
    } else {
      edge.style("opacity", 1);
    }
  }
};

export const hideEdge = (edge, layoutMode) => {
  edge.hide();
  if (layoutMode === LAYOUT_MODES.MINDMAP) {
    edge.style("opacity", 0);
  }
  edge.data("isHidden", true);
};
