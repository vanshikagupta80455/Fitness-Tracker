"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const payload =
      mode === "signup"
        ? {
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? "")
          }
        : {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? "")
          };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Server returned an invalid response. Please ensure your database is migrated.");
      }

      if (!response.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  }

  const Icon = mode === "signup" ? UserPlus : LogIn;

  return (
    <form action={handleSubmit} className="space-y-4">
      {mode === "signup" ? (
        <label className="block">
          <span className="text-sm font-medium text-ink">Name</span>
          <input
            className="focus-ring mt-2 w-full rounded-[8px] border-ink/15"
            name="name"
            placeholder="Alex Morgan"
            required
            type="text"
          />
        </label>
      ) : null}
      <label className="block">
        <span className="text-sm font-medium text-ink">Email</span>
        <input
          className="focus-ring mt-2 w-full rounded-[8px] border-ink/15"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">Password</span>
        <input
          className="focus-ring mt-2 w-full rounded-[8px] border-ink/15"
          minLength={8}
          name="password"
          placeholder="At least 8 characters"
          required
          type="password"
        />
      </label>
      {error ? <p className="rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <button
        className="focus-ring flex w-full items-center justify-center gap-2 rounded-[8px] bg-fern px-4 py-3 font-semibold text-white transition hover:bg-fern/90 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        <Icon aria-hidden size={18} />
        {loading ? "Working..." : mode === "signup" ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
