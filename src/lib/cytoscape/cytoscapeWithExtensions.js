import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import cxtmenu from "cytoscape-cxtmenu";
import nodeHtmlLabel from "cytoscape-node-html-label";
import popper from "cytoscape-popper";

let registered = false;

if (!registered) {
  cytoscape.use(dagre);
  cytoscape.use(cxtmenu);
  cytoscape.use(nodeHtmlLabel);

  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const tidytree = require("cytoscape-tidytree");
    cytoscape.use(tidytree.default ?? tidytree);
  }

  cytoscape.use(popper);

  registered = true;
}

export default cytoscape;
