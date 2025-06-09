export async function getGraphData() {
  const response = await fetch("/api/graph");
  if (!response.ok) throw new Error("Failed to fetch graph data");
  return response.json(); // {data, rawRecords}
}

export async function postGraphQuery(query) {
  const response = await fetch("/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) throw new Error("Failed to post graph query");
  return response.json(); // {data, rawRecords}
}
