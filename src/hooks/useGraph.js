import { useQuery } from "@tanstack/react-query";
import { getGraphData, postGraphQuery } from "./graph";
import { useEffect } from "react";

export function useGraph() {
  return useQuery({
    queryKey: useGraph.getKey(),
    queryFn: getGraphData,
    staleTime: 0,
  });
}
useGraph.getKey = () => ["graph"];

export function useGraphByQuery(query, { onSuccess }) {
  const { data, isLoading, isSuccess, ...params } = useQuery({
    enabled: !!query,
    queryKey: useGraphByQuery.getKey(query),
    queryFn: () => postGraphQuery(query),
    staleTime: 0,
  });

  useEffect(() => {
    if (data !== null && isLoading === false && isSuccess === true) {
      onSuccess(data);
    }
  }, [data, isLoading, isSuccess]);

  return { data, isSuccess, ...params };
}
useGraphByQuery.getKey = (query) => ["query", query];
