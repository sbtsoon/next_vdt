import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import cxtmenu from "cytoscape-cxtmenu";
import nodeHtmlLabel from "cytoscape-node-html-label";

let registered = false;

if (!registered) {
  cytoscape.use(dagre);
  cytoscape.use(cxtmenu);
  cytoscape.use(nodeHtmlLabel);

  if (typeof window !== "undefined") {
    const tidytree = require("cytoscape-tidytree");
    cytoscape.use(tidytree.default ?? tidytree); // 💡 핵심
  }

  registered = true;
}

export default cytoscape;
