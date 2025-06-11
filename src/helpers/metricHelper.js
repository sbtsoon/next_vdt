export const metricNameMap = {
  매출이익: "profit",
  매출액: "sales",
  매출원가: "cogs",
};

export function updateMetricDataHelper(
  name,
  amount,
  percentage,
  scaledHistoryData,
  setMetricData
) {
  const key = metricNameMap[name];
  if (!key) return;

  if (amount === undefined || amount === null) return;
  if (percentage === undefined || percentage === null) return;

  setMetricData((prev) => ({
    ...prev,
    [key]: {
      ...prev[key],
      amount,
      percentage,
      scaledHistoryData,
    },
  }));
}
