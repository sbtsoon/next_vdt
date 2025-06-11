import { useMutation } from "@tanstack/react-query";
import { postAiAssistantChatQuery } from "./aiAssistant";

export function useAiAssistantChatMutation() {
  return useMutation({
    mutationFn: postAiAssistantChatQuery,
  });
}
