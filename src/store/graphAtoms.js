import { atom } from "jotai";

export const metricMapAtom = atom({
  profit: {
    amount: 0,
    percentage: 0,
    scaledHistoryData: [],
  },
  sales: {
    amount: 0,
    percentage: 0,
    scaledHistoryData: [],
  },
  cogs: {
    amount: 0,
    percentage: 0,
    scaledHistoryData: [],
  },
});

export const aiQueryAtom = atom({
  query: "MATCH (n)-[r]->(m) RETURN n, r, m",
});
