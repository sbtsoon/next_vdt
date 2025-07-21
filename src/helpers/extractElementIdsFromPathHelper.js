import { parseNeo4jInt } from "./parseNeo4jIntHelper";

export function extractElementIdsFromPaths(rawRecords) {
  const nodeIds = new Set();
  const edgeIds = new Set();

  rawRecords?.forEach((record) => {
    const path = record._fields[0]; // path 객체
    const segments = path?.segments || [];
    segments.forEach((segment) => {
      nodeIds.add(parseNeo4jInt(segment.start.identity));
      nodeIds.add(parseNeo4jInt(segment.end.identity));
      edgeIds.add(parseNeo4jInt(segment.relationship.identity));
    });
  });

  return { nodeIds, edgeIds };
}
