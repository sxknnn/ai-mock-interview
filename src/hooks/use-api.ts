import { useAuth } from "@clerk/clerk-react";
import { useCallback } from "react";
import { api, type AnswerInput } from "@/lib/api";

export function useApi() {
  const { getToken } = useAuth();

  const listRoles = useCallback(async () => {
    const token = await getToken();
    return api.listRoles(token);
  }, [getToken]);

  const listSessions = useCallback(async () => {
    const token = await getToken();
    return api.listSessions(token);
  }, [getToken]);

  const startSession = useCallback(
    async (roleId: string) => {
      const token = await getToken();
      return api.startSession(token, roleId);
    },
    [getToken]
  );

  const getSession = useCallback(
    async (sessionId: string) => {
      const token = await getToken();
      return api.getSession(token, sessionId);
    },
    [getToken]
  );

  const submitSession = useCallback(
    async (sessionId: string, answers: AnswerInput[]) => {
      const token = await getToken();
      return api.submitSession(token, sessionId, answers);
    },
    [getToken]
  );

  return { listRoles, listSessions, startSession, getSession, submitSession };
}
