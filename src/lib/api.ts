export interface Role {
  id: string;
  title: string;
  category: string;
}

export interface Question {
  questionIndex: number;
  questionText: string;
  answerText: string | null;
  score: number | null;
  strengths: string[] | null;
  improvements: string[] | null;
}

export interface SessionSummary {
  sessionId: string;
  roleId: string;
  roleTitle: string;
  status: "in_progress" | "completed";
  questionCount: number;
  overallScore: number | null;
  overallSummary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionDetail extends SessionSummary {
  questions: Question[];
}

export interface AnswerInput {
  questionIndex: number;
  text: string;
}

// Function URLs are printed with a trailing slash; every path below starts with one.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string).replace(/\/+$/, "");

async function request<T>(
  path: string,
  token: string | null,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // response had no JSON body — fall back to statusText
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export const api = {
  listRoles: (token: string | null) =>
    request<{ roles: Role[] }>("/api/roles/", token),

  listSessions: (token: string | null) =>
    request<{ sessions: SessionSummary[] }>("/api/sessions/", token),

  startSession: (token: string | null, roleId: string) =>
    request<SessionDetail>("/api/sessions/", token, {
      method: "POST",
      body: JSON.stringify({ roleId }),
    }),

  getSession: (token: string | null, sessionId: string) =>
    request<SessionDetail>(`/api/sessions/${sessionId}/`, token),

  submitSession: (
    token: string | null,
    sessionId: string,
    answers: AnswerInput[]
  ) =>
    request<SessionDetail>(`/api/sessions/${sessionId}/submit/`, token, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
};
