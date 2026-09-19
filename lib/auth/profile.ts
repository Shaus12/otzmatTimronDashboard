import type { AppRole } from "@/lib/data/types";

export type Profile = {
  id: string;
  fullName: string;
  role: AppRole;
  email: string | null;
};

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return {
      id: user.id,
      fullName: user.email ?? "משתמש",
      role: "viewer",
      email: user.email ?? null,
    };
  }

  return {
    id: data.id as string,
    fullName: (data.full_name as string) || user.email || "משתמש",
    role: normalizeRole(data.role as string),
    email: user.email ?? null,
  };
}

function normalizeRole(value: string): AppRole {
  if (
    value === "admin" ||
    value === "operations" ||
    value === "accounting" ||
    value === "viewer"
  ) {
    return value;
  }
  return "viewer";
}
