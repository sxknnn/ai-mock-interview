import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import type { SessionDetail } from "@/lib/api";

const InterviewPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { getSession, submitSession } = useApi();
  const navigate = useNavigate();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    getSession(sessionId)
      .then(setSession)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load session.")
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

  const questions = session.questions;
  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleAnswerChange = (text: string) => {
    setAnswers((prev) => ({ ...prev, [question.questionIndex]: text }));
  };

  const handleNext = async () => {
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = questions.map((q) => ({
        questionIndex: q.questionIndex,
        text: answers[q.questionIndex] ?? "",
      }));
      await submitSession(session.sessionId, payload);
      navigate(`/interview/${session.sessionId}/feedback`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit your answers."
      );
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-8 max-w-2xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {session.roleTitle} — Question {currentIndex + 1} of{" "}
          {questions.length}
        </p>
        <h1 className="text-2xl font-semibold mt-2">
          {question.questionText}
        </h1>
      </div>

      <textarea
        className="w-full min-h-[160px] rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        placeholder="Type your answer..."
        value={answers[question.questionIndex] ?? ""}
        onChange={(e) => handleAnswerChange(e.target.value)}
        disabled={submitting}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button onClick={handleNext} disabled={submitting}>
          {submitting ? (
            <Loader2 className="animate-spin" />
          ) : isLast ? (
            "Submit for feedback"
          ) : (
            "Next question"
          )}
        </Button>
      </div>
    </Container>
  );
};

export default InterviewPage;
