import { parseNeo4jInt } from "@/helpers/parseNeo4jIntHelper";
import { GRAPH_ICON_MAP } from "@/constants/graphConstant";

export const demo2GraphStyle = [
  {
    selector: "node",
    style: {
      width: "20px",
      height: "20px",
      label: (ele) => ele.data("id"),
      "text-valign": "center",
      "text-halign": "center",
      "font-size": "4px",
      "border-width": 1,
      "border-style": "solid",
      "text-wrap": "wrap",
      "text-max-width": "20px",
    },
  },
  {
    selector: "edge",
    style: {
      label: (ele) => {
        const type = ele.data("type") || "";
        return type;
      },
      width: 0.1,
      "text-wrap": "wrap",
      color: "#f00",
      "line-color": "#f00",
      "target-arrow-color": "#f00",
      "target-arrow-shape": "triangle",
      "arrow-scale": "0.2",
      "font-size": "4px",
      "edge-text-rotation": "autorotate",
      "text-background-shape": "rectangle",
      "text-background-opacity": 0.3,
      "text-background-color": "#222",
      "text-background-radius": "5px",
    },
  },
  {
    selector: ".highlighted",
    style: {
      "background-color": "#f00", // 빨간색 노드
      "line-color": "#f00", // 빨간색 엣지
      "target-arrow-color": "#f00", // 화살표도 빨간색
      "transition-property": "background-color, line-color, target-arrow-color",
      "line-style": "dashed",
      "z-index": 999, // 하이라이트된 요소가 다른 요소 위에 오도록
    },
  },
];

export const networkGraphStyle = [
  {
    selector: "node",
    style: {
      shape: (ele) => {
        const level = parseNeo4jInt(ele.data("level"));
        return level <= 2 ? "ellipse" : "rectangle";
      },

      width: "20px", // 노드 크기 키움
      height: "20px",
      "background-color": "#FFFfff23",

      // 🔽 아이콘 크기 조절 핵심
      "background-fit": "none",
      "background-width": "10px", // 아이콘 너비 직접 설정
      "background-height": "10px", // 아이콘 높이 직접 설정
      "background-position-x": "50%", // 중앙 정렬
      "background-position-y": "50%",

      "background-clip": "node",
      "background-image-opacity": 1,

      "background-image": (ele) => {
        const name = ele.data("name");
        const icon = GRAPH_ICON_MAP.get(name);
        return icon ? `/images/network-graph-node/${icon}` : undefined;
      },

      label: (ele) => ele.data("name"),
      "text-valign": "top",
      "text-halign": "center",
      "text-margin-y": -1.5,
      "font-size": "4px",
      backgroundColor: "#fff",

      "border-color": (ele) => {
        const level = parseNeo4jInt(ele.data("level"));
        if (level === 0) return "#BF512C";
        else if (level === 1) return "#DA9828";
        else if (level === 2) return "#FBCFA1";
        else if (level === 3) return "#277d5f";
        else if (level === 4) return "#376f9f";
        else return "#7A7A7A";
      },
      "border-width": 1,
      "border-style": "solid",
      "text-wrap": "wrap",
      "text-max-width": "20px",
      color: "#97b2d8",
    },
  },
  {
    selector: "edge",
    style: {
      label: (ele) => {
        const type = ele.data("type") || "";
        const amount = parseNeo4jInt(ele.data("amount"));
        const parsedAmount = Math.round(amount / 1_000_000);
        return `${type}\n${
          ele.data("role") === "negative" ? "(-)" : "(+)"
        } ₩ ${parsedAmount.toLocaleString("KO-KR")}`;
      },
      width: 0.1,
      "text-wrap": "wrap",
      "line-color": "#ccc",
      "target-arrow-color": "#ccc",
      "target-arrow-shape": "triangle",
      "arrow-scale": "0.2",
      "font-size": "4px",
      color: (ele) => (ele.data("role") === "negative" ? "#d62828" : "#2a9d8f"),
      "edge-text-rotation": "autorotate",
      "text-background-shape": "rectangle",
      "text-background-opacity": 0.3,
      "text-background-color": "#222",
      "text-background-radius": "5px",
    },
  },
];

export const simulationGraphStyle = [
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
];
