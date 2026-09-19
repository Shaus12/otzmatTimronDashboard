"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError("ההתחברות נכשלה. בדקו אימייל וסיסמה.");
        return;
      }
      router.replace(next.startsWith("/") ? next : "/");
      router.refresh();
    } catch {
      setError("לא הצלחנו להתחבר. נסו שוב.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="login-form">
      <label>
        אימייל
        <Input
          type="email"
          autoComplete="email"
          required
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        סיסמה
        <Input
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={busy} className="primary-action">
        {busy ? "מתחבר…" : "כניסה"}
      </Button>
    </form>
  );
}
