import { useFetch } from "@/_services/api";
import { useMutation } from "@tanstack/react-query";

export const useGetChatKitSession = () => {
  const fetchApi = useFetch();

  return useMutation<
    { client_secret: string },
    unknown,
    { currentClientSecret: string } | undefined
  >({
    mutationFn: (body) =>
      fetchApi("conversation", "openai/chatkit/session", {
        method: "POST",
        body: body,
      }),
  });
};
