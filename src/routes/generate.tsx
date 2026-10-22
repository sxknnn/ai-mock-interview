import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/hooks/use-api";
import type { Role } from "@/lib/api";

const GeneratePage = () => {
  const { listRoles, startSession } = useApi();
  const navigate = useNavigate();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [startingRole, setStartingRole] = useState<Role | null>(null);

  useEffect(() => {
    listRoles()
      .then((data) => setRoles(data.roles))
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "Failed to load roles.")
      )
      .finally(() => setLoading(false));
  }, [listRoles]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roles
      .filter(
        (role) =>
          !q ||
          role.title.toLowerCase().includes(q) ||
          role.category.toLowerCase().includes(q)
      )
      .reduce<Record<string, Role[]>>((acc, role) => {
        (acc[role.category] ??= []).push(role);
        return acc;
      }, {});
  }, [roles, query]);

  const handleSelect = async (role: Role) => {
    setStartingRole(role);
    try {
      const session = await startSession(role.id);
      navigate(`/interview/${session.sessionId}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not start the interview."
      );
      setStartingRole(null);
    }
  };

  // Generating questions takes a few seconds — give it a dedicated screen.
  if (startingRole) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-fade-in-up text-center space-y-4 max-w-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold">Preparing your interview</h2>
          <p className="text-muted-foreground">
            Generating tailored questions for{" "}
            <span className="font-medium text-foreground">
              {startingRole.title}
            </span>
            . This usually takes a few seconds.
          </p>
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </Container>
    );
  }

  const categories = Object.entries(grouped);

  return (
    <Container className="py-10 space-y-8 animate-fade-in-up">
      <div className="space-y-3">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" /> AI-generated questions
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold">
          Pick a role to practice for
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          We&apos;ll generate a tailored set of interview questions for the role
          you choose, then grade every answer with detailed feedback.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search roles, e.g. frontend, data, product…"
          className="pl-9 h-11"
          aria-label="Search roles"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-9 w-28" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-muted-foreground">
            No roles match &ldquo;{query}&rdquo;.
          </p>
          <Button variant="link" onClick={() => setQuery("")}>
            Clear search
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map(([category, categoryRoles]) => (
            <Card key={category} className="transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base">{category}</CardTitle>
                <Badge variant="outline">{categoryRoles.length}</Badge>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {categoryRoles.map((role) => (
                  <Button
                    key={role.id}
                    variant="outline"
                    size="sm"
                    className="hover:border-primary hover:text-primary"
                    onClick={() => handleSelect(role)}
                  >
                    {role.title}
                  </Button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default GeneratePage;
