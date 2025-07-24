import { parseNeo4jInt } from "@/helpers/parseNeo4jIntHelper";
import { GRAPH_ICON_MAP } from "@/constants/graphConstant";

export const getDemo2GraphStyle = (labelColorMap) => [
  {
    selector: "node",
    style: {
      width: "24px",
      height: "24px",
      shape: "ellipse",
      label: (ele) => ele.data("id"),
      "background-color": "#1f2937", // 다크 그레이
      "border-color": (ele) => {
        // const labels = ele.data("labels");
        // const label = labels?.[0];
        // return labelColorMap.get(label) || "#999";
        return "#60a5fa";
      },
      "border-width": 1,
      "text-valign": "center",
      "text-halign": "center",
      color: "#d1d5db", // 밝은 텍스트
      "font-size": "5px",
      "text-wrap": "wrap",
      "text-max-width": "26px",
      "overlay-padding": "3px",
      "z-index": 10,
    },
  },
  {
    selector: "edge",
    style: {
      width: 0.4,
      label: (ele) => {
        // const type = ele.data("type");
        const menge = ele.data("MENGE");
        return `${menge}`;
      },
      "font-size": "4px",
      color: "#93c5fd", // 연한 블루
      // "text-rotation": "autorotate",
      // "text-margin-y": -5,
      "text-wrap": "wrap",
      "text-background-shape": "roundrectangle",
      "text-background-opacity": 0.4,
      "text-background-color": "#1e40af", // 네이비 계열
      "text-background-padding": "1px",
      "text-background-radius": "3px",

      "line-color": "#374151", // 어두운 중간선
      "target-arrow-color": "#60a5fa", // 밝은 화살표
      "target-arrow-shape": "triangle",
      "arrow-scale": "0.25",

      "curve-style": "bezier",
      "taxi-direction": "downward",
      "taxi-turn": 20,
    },
  },
  {
    selector: "node.highlighted",
    style: {
      "background-color": "#22d3ee", // 시안색
      "border-color": "#67e8f9",
      color: "black", // 🔥 노드 라벨 텍스트만 검정색
      "transition-property": "background-color, border-color, color",
      "transition-duration": "0.3s",
      "z-index": 999,

      // Glow 효과
      "shadow-blur": 6,
      "shadow-color": "#67e8f9",
      "shadow-opacity": 0.6,
      "shadow-offset-x": 0,
      "shadow-offset-y": 0,
    },
  },
  {
    selector: "edge.highlighted",
    style: {
      "line-color": "#67e8f9",
      "target-arrow-color": "#67e8f9",
      "line-style": "dashed",
      color: "#67e8f9", // 엣지 라벨 색상 (노드와 분리됨)
      "transition-property": "line-color, target-arrow-color, color",
      "transition-duration": "0.3s",
      "z-index": 998,
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
