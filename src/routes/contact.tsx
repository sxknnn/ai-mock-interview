import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Clock, HelpCircle, Mail, Send } from "lucide-react";
import { toast } from "sonner";

import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Where contact messages are delivered. Set VITE_CONTACT_EMAIL in .env.local.
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;

const topics = ["General question", "Feedback", "Bug report", "Partnership"];

interface FormState {
  name: string;
  email: string;
  topic: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const validate = (form: FormState): FormErrors => {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = "Please enter a valid email address.";
  if (form.message.trim().length < 10)
    errors.message = "Please write at least 10 characters.";
  return errors;
};

const Field = ({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-sm font-medium">
      {label}
    </label>
    {children}
    {error && (
      <p id={`${id}-error`} className="text-xs text-destructive">
        {error}
      </p>
    )}
  </div>
);

const ContactPage = () => {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    topic: topics[0],
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    if (!CONTACT_EMAIL) {
      toast.error("The contact form isn't set up yet. Please try again later.");
      return;
    }

    const subject = `[Interviewly] ${form.topic} from ${form.name.trim()}`;
    const body = `${form.message.trim()}\n\n— ${form.name.trim()} (${form.email.trim()})`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    toast.success("Opening your email app — just hit send!");
  };

  return (
    <div className="pb-20">
      <section className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <Container className="py-16 md:py-20 text-center space-y-4 animate-fade-in-up">
          <Badge variant="secondary">Contact us</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold">Get in touch</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Questions, feedback or found a bug? Send us a message and we&apos;ll
            get back to you.
          </p>
        </Container>
      </section>

      <Container className="py-16 grid gap-8 lg:grid-cols-3">
        {/* Info column */}
        <div className="space-y-4">
          <Card>
            <CardContent className="flex gap-4 p-6">
              <Mail className="h-6 w-6 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold">Email</h3>
                {CONTACT_EMAIL ? (
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-muted-foreground hover:text-primary break-all">
                    {CONTACT_EMAIL}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">Use the form to reach us.</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex gap-4 p-6">
              <Clock className="h-6 w-6 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold">Response time</h3>
                <p className="text-sm text-muted-foreground">We aim to reply within a few business days.</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex gap-4 p-6">
              <HelpCircle className="h-6 w-6 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold">Quick answers</h3>
                <p className="text-sm text-muted-foreground">
                  Check the{" "}
                  <Link to="/services" className="text-primary hover:underline">
                    FAQ on our Services page
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Send a message</CardTitle>
            <CardDescription>All fields are required.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="name" label="Name" error={errors.name}>
                  <Input
                    id="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={cn(errors.name && "border-destructive")}
                  />
                </Field>
                <Field id="email" label="Email" error={errors.email}>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={cn(errors.email && "border-destructive")}
                  />
                </Field>
              </div>

              <fieldset className="space-y-1.5">
                <legend className="text-sm font-medium">Topic</legend>
                <div className="flex flex-wrap gap-2 pt-1">
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => update("topic", topic)}
                      aria-pressed={form.topic === topic}
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-sm transition-colors",
                        form.topic === topic
                          ? "border-primary bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </fieldset>

              <Field id="message" label="Message" error={errors.message}>
                <Textarea
                  id="message"
                  rows={6}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="How can we help?"
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  className={cn("resize-y", errors.message && "border-destructive")}
                />
              </Field>

              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Send message <Send />
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default ContactPage;
