import { atom } from "jotai";

export const graphDataAtom = atom({ nodes: [], edges: [] });

export const metricMapAtom = atom({
  profit: {
    amount: 0,
    scaledHistoryData: [],
  },
  sales: {
    amount: 0,
    scaledHistoryData: [],
  },
  cogs: {
    amount: 0,
    scaledHistoryData: [],
  },
});

export const aiQueryAtom = atom({
  query: "",
});
