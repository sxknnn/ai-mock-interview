import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import type { SessionDetail } from "@/lib/api";

const FeedbackPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { getSession } = useApi();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    getSession(sessionId)
      .then(setSession)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load feedback.")
      )
      .finally(() => setLoading(false));
  }, [sessionId, getSession]);

  if (loading) {
    return (
      <Container className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin" />
      </Container>
    );
  }

  if (error || !session) {
    return (
      <Container className="py-12">
        <p className="text-sm text-red-600">{error || "Session not found."}</p>
      </Container>
    );
  }

  if (session.status !== "completed") {
    return (
      <Container className="py-12 space-y-4">
        <p>This interview hasn&apos;t been graded yet.</p>
        <Link to={`/interview/${session.sessionId}`}>
          <Button>Resume interview</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-8 max-w-2xl space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">{session.roleTitle}</p>
        <h1 className="text-3xl font-bold mt-1">
          Overall score: {session.overallScore}/10
        </h1>
        <p className="text-muted-foreground mt-2">{session.overallSummary}</p>
      </div>

      <div className="space-y-6">
        {session.questions.map((q) => (
          <div key={q.questionIndex} className="rounded-md border p-4 space-y-2">
            <p className="font-semibold">
              Q{q.questionIndex}. {q.questionText}
            </p>
            <p className="text-sm text-muted-foreground">
              Your answer: {q.answerText || "(no answer)"}
            </p>
            <p className="text-sm font-medium">Score: {q.score}/10</p>

            {q.strengths && q.strengths.length > 0 && (
              <div>
                <p className="text-sm font-medium text-emerald-600">
                  Strengths
                </p>
                <ul className="list-disc list-inside text-sm">
                  {q.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {q.improvements && q.improvements.length > 0 && (
              <div>
                <p className="text-sm font-medium text-amber-600">
                  Improvements
                </p>
                <ul className="list-disc list-inside text-sm">
                  {q.improvements.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <Link to="/generate">
        <Button variant="outline">Practice another role</Button>
      </Link>
    </Container>
  );
};

export default FeedbackPage;
