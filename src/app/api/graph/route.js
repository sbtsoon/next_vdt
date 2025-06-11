import { NextResponse } from "next/server";
import { driver, formatDataForCytoscape } from "@/lib/neo4j/neo4j";

export async function GET() {
  const session = driver.session({ database: process.env.NEO4J_DATABASE });

  try {
    const result = await session.run("MATCH (n)-[r]->(m) RETURN n, r, m");
    // const result = await session.run("MATCH (n:Metric) RETURN MIN(n.amount) AS minAmount, MAX(n.amount) AS maxAmount, AVG(n.amount) AS avgAmount");
    const data = formatDataForCytoscape(result.records);
    return NextResponse.json({
      data,
      rawRecords: result.records,
    });
  } catch (err) {
    console.error("Graph API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await session.close();
  }
}
