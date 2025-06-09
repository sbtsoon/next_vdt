export async function postAiAssistantChatQuery(query) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assistant: "text2cypher",
      query: query,
    }),
  });
  if (!response.ok) throw new Error("Failed to post ai query");
  return response.json();
}
