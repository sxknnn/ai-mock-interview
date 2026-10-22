import { Link } from "react-router-dom";
import {
  ArrowRight,
  HeartHandshake,
  Lock,
  MousePointerClick,
  PenLine,
  Sparkles,
  Target,
} from "lucide-react";

import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: MousePointerClick,
    title: "Choose a role",
    text: "Select the job you're preparing for from 70+ roles.",
  },
  {
    icon: PenLine,
    title: "Answer the questions",
    text: "Work through AI-generated questions at your own pace.",
  },
  {
    icon: Sparkles,
    title: "Get feedback",
    text: "Receive a score, strengths and improvement tips for every answer.",
  },
];

const values = [
  {
    icon: Target,
    title: "Practice that's relevant",
    text: "Generic question lists don't prepare you for a specific job. Every session is tailored to the role you choose.",
  },
  {
    icon: HeartHandshake,
    title: "Feedback that's actionable",
    text: "A number alone doesn't help you improve. We pair every score with specific strengths and next steps.",
  },
  {
    icon: Lock,
    title: "Your data stays yours",
    text: "Sign-in is handled by Clerk. Your answers are stored only so you can see your feedback, and are sent to Google Gemini solely to grade them.",
  },
];

const AboutPage = () => {
  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <Container className="py-16 md:py-24 grid gap-10 md:grid-cols-2 md:items-center animate-fade-in-up">
          <div className="space-y-5">
            <Badge variant="secondary">About us</Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold">
              Interview confidence, built through practice
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Interviewly is an AI mock-interview coach. We believe the best way
              to get better at interviews is to do more of them — and to get
              honest, specific feedback every time.
            </p>
          </div>
          <img
            src="/assets/img/office.jpg"
            alt="People collaborating in an office"
            className="w-full h-72 md:h-80 rounded-2xl object-cover shadow-xl"
          />
        </Container>
      </section>

      {/* How it works */}
      <Container className="py-16 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">How it works</h2>
          <p className="text-muted-foreground">Three steps from nervous to prepared.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="relative text-center space-y-3 p-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Step {i + 1}
              </p>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* Values */}
      <section className="bg-muted/40 border-y">
        <Container className="py-16 space-y-10">
          <h2 className="text-3xl font-bold text-center">What we care about</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <Card key={title} className="bg-card">
                <CardContent className="p-6 space-y-3">
                  <Icon className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <Container className="pt-16 text-center space-y-4">
        <h2 className="text-3xl font-bold">Questions or ideas?</h2>
        <p className="text-muted-foreground">We&apos;d love to hear from you.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/generate">
            <Button size="lg" className="w-full sm:w-auto">
              Try a mock interview <ArrowRight />
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Contact us
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default AboutPage;
