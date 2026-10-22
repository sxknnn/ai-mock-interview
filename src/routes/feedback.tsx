import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Lightbulb, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Container } from "@/components/container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/hooks/use-api";
import type { SessionDetail } from "@/lib/api";
import { scoreTone, toneBadge, toneLabel, toneText } from "@/lib/score";
import { cn } from "@/lib/utils";

const ScoreRing = ({ score }: { score: number }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(score, 0), 10) / 10);
  const tone = scoreTone(score);

  return (
    <div className={cn("relative h-36 w-36 shrink-0", toneText[tone])}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" className="stroke-muted" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-4xl font-extrabold">{score}</span>
        <span className="text-xs text-muted-foreground">out of 10</span>
      </div>
    </div>
  );
};

const FeedbackPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { getSession, startSession } = useApi();
  const navigate = useNavigate();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

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
      <Container className="py-10 max-w-3xl space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </Container>
    );
  }

  if (error || !session) {
    return (
      <Container className="py-16 max-w-md text-center space-y-4">
        <h2 className="text-xl font-semibold">We couldn&apos;t load this feedback</h2>
        <p className="text-sm text-muted-foreground">{error || "Session not found."}</p>
        <Link to="/generate">
          <Button variant="outline">Back to roles</Button>
        </Link>
      </Container>
    );
  }

  if (session.status !== "completed") {
    return (
      <Container className="py-16 max-w-md text-center space-y-4">
        <h2 className="text-xl font-semibold">This interview hasn&apos;t been graded yet</h2>
        <p className="text-sm text-muted-foreground">
          Finish answering the questions and submit to see your feedback.
        </p>
        <Link to={`/interview/${session.sessionId}`}>
          <Button>Resume interview</Button>
        </Link>
      </Container>
    );
  }

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const next = await startSession(session.roleId);
      navigate(`/interview/${next.sessionId}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not start a new interview."
      );
      setRetrying(false);
    }
  };

  const overall = session.overallScore ?? 0;
  const overallTone = scoreTone(overall);

  return (
    <Container className="py-10 max-w-3xl space-y-8 animate-fade-in-up">
      {/* Summary */}
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-6 p-6 md:flex-row md:p-8">
          <ScoreRing score={overall} />
          <div className="space-y-3 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <Badge variant="secondary">{session.roleTitle}</Badge>
              <Badge variant="outline" className={toneBadge[overallTone]}>
                {toneLabel[overallTone]}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Your interview feedback</h1>
            <p className="text-muted-foreground leading-relaxed">{session.overallSummary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Per-question breakdown */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Question breakdown</h2>
        <Accordion
          type="multiple"
          defaultValue={[String(session.questions[0]?.questionIndex)]}
          className="space-y-3"
        >
          {session.questions.map((q, i) => {
            const tone = scoreTone(q.score);
            return (
              <AccordionItem
                key={q.questionIndex}
                value={String(q.questionIndex)}
                className="rounded-xl border bg-card px-4 md:px-5"
              >
                <AccordionTrigger className="gap-4 text-left hover:no-underline">
                  <span className="flex items-start gap-3">
                    <span className="mt-0.5 text-sm text-muted-foreground">Q{i + 1}</span>
                    <span className="font-medium leading-snug">{q.questionText}</span>
                  </span>
                  <Badge variant="outline" className={cn("ml-auto shrink-0", toneBadge[tone])}>
                    {q.score ?? 0}/10
                  </Badge>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="rounded-lg border-l-4 border-muted-foreground/30 bg-muted/50 p-3 text-sm">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Your answer
                    </p>
                    <p className="whitespace-pre-wrap">
                      {q.answerText || <span className="italic text-muted-foreground">No answer given</span>}
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {q.strengths && q.strengths.length > 0 && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/40">
                        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="h-4 w-4" /> What went well
                        </p>
                        <ul className="list-disc space-y-1 pl-5 text-sm">
                          {q.strengths.map((s, j) => (
                            <li key={j}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {q.improvements && q.improvements.length > 0 && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/40">
                        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-300">
                          <Lightbulb className="h-4 w-4" /> How to improve
                        </p>
                        <ul className="list-disc space-y-1 pl-5 text-sm">
                          {q.improvements.map((s, j) => (
                            <li key={j}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Next steps */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/generate">
          <Button size="lg" className="w-full sm:w-auto">
            <Sparkles /> Practice another role
          </Button>
        </Link>
        <Button
          size="lg"
          variant="outline"
          onClick={handleRetry}
          disabled={retrying}
          className="w-full sm:w-auto"
        >
          {retrying ? <Loader2 className="animate-spin" /> : <RotateCcw />}
          {retrying ? "Generating questions…" : "Try this role again"}
        </Button>
      </div>
    </Container>
  );
};

export default FeedbackPage;
