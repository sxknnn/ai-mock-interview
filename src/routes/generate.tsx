import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import type { Role } from "@/lib/api";

const GeneratePage = () => {
  const { listRoles, startSession } = useApi();
  const navigate = useNavigate();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingRoleId, setStartingRoleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listRoles()
      .then((data) => setRoles(data.roles))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load roles.")
      )
      .finally(() => setLoading(false));
  }, [listRoles]);

  const handleSelect = async (roleId: string) => {
    setStartingRoleId(roleId);
    setError(null);
    try {
      const session = await startSession(roleId);
      navigate(`/interview/${session.sessionId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not start the interview."
      );
      setStartingRoleId(null);
    }
  };

  if (loading) {
    return (
      <Container className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin" />
      </Container>
    );
  }

  const grouped = roles.reduce<Record<string, Role[]>>((acc, role) => {
    (acc[role.category] ??= []).push(role);
    return acc;
  }, {});

  return (
    <Container className="py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Pick a role to practice for</h1>
        <p className="text-muted-foreground mt-2">
          We&apos;ll generate a tailored set of interview questions for the
          role you choose.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, categoryRoles]) => (
          <div key={category}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {category}
            </h2>
            <div className="flex flex-wrap gap-2">
              {categoryRoles.map((role) => (
                <Button
                  key={role.id}
                  variant="outline"
                  disabled={startingRoleId !== null}
                  onClick={() => handleSelect(role.id)}
                >
                  {startingRoleId === role.id ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    role.title
                  )}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default GeneratePage;
