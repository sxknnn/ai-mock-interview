import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useApi } from "@/hooks/use-api";
import type { SessionDetail } from "@/lib/api";
import { cn } from "@/lib/utils";

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
      <Container className="py-10 max-w-3xl space-y-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </Container>
    );
  }

  if (error || !session) {
    return (
      <Container className="py-16 max-w-md text-center space-y-4">
        <h2 className="text-xl font-semibold">We couldn&apos;t load this interview</h2>
        <p className="text-sm text-muted-foreground">{error || "Session not found."}</p>
        <Link to="/generate">
          <Button variant="outline">Back to roles</Button>
        </Link>
      </Container>
    );
  }

  if (submitting) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-fade-in-up text-center space-y-4 max-w-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold">Grading your answers</h2>
          <p className="text-muted-foreground">
            Our AI is reviewing every response and writing feedback. Hang
            tight — this takes a few seconds.
          </p>
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </Container>
    );
  }

  const questions = session.questions;
  const question = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const currentAnswer = answers[question.questionIndex] ?? "";
  const answeredCount = questions.filter(
    (q) => (answers[q.questionIndex] ?? "").trim().length > 0
  ).length;
  const unanswered = questions.length - answeredCount;

  const handleAnswerChange = (text: string) => {
    setAnswers((prev) => ({ ...prev, [question.questionIndex]: text }));
  };

  const handleNext = async () => {
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    setSubmitting(true);
    try {
      const payload = questions.map((q) => ({
        questionIndex: q.questionIndex,
        text: answers[q.questionIndex] ?? "",
      }));
      await submitSession(session.sessionId, payload);
      navigate(`/interview/${session.sessionId}/feedback`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit your answers."
      );
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-10 max-w-3xl space-y-6">
      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 text-sm">
          <Badge variant="secondary">{session.roleTitle}</Badge>
          <span className="text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />
      </div>

      {/* Question */}
      <Card key={currentIndex} className="animate-fade-in-up shadow-sm">
        <CardContent className="p-6 md:p-8 space-y-5">
          <h1 className="text-xl md:text-2xl font-semibold leading-snug">
            {question.questionText}
          </h1>
          <Textarea
            autoFocus
            className="min-h-[200px] text-base leading-relaxed resize-y"
            placeholder="Type your answer… Aim for a structured response, e.g. Situation → Task → Action → Result."
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleNext();
              }
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">Ctrl</kbd>{" "}
              + <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">Enter</kbd>{" "}
              to continue
            </span>
            <span>{currentAnswer.length} characters</span>
          </div>
        </CardContent>
      </Card>

      {/* Question jump dots */}
      <div className="flex flex-wrap justify-center gap-2" aria-label="Jump to question">
        {questions.map((q, i) => {
          const answered = (answers[q.questionIndex] ?? "").trim().length > 0;
          return (
            <button
              key={q.questionIndex}
              type="button"
              onClick={() => setCurrentIndex(i)}
              aria-label={`Question ${i + 1}${answered ? " (answered)" : ""}`}
              aria-current={i === currentIndex ? "step" : undefined}
              className={cn(
                "h-8 w-8 rounded-full border text-xs font-medium transition-colors",
                i === currentIndex
                  ? "border-primary bg-primary text-primary-foreground"
                  : answered
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {isLast && unanswered > 0 && (
        <p className="text-center text-sm text-amber-600 dark:text-amber-400">
          {unanswered} question{unanswered > 1 ? "s are" : " is"} still unanswered
          — blank answers will score low.
        </p>
      )}

      {/* Navigation */}
      <div className="flex justify-between gap-2">
        <Button
          variant="ghost"
          onClick={() => setCurrentIndex((i) => i - 1)}
          disabled={isFirst}
        >
          <ArrowLeft /> Back
        </Button>
        <Button onClick={handleNext} size="lg">
          {isLast ? (
            <>
              Submit for feedback <Send />
            </>
          ) : (
            <>
              Next question <ArrowRight />
            </>
          )}
        </Button>
      </div>
    </Container>
  );
};

export default InterviewPage;
