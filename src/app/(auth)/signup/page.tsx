import Link from "next/link";
import { Activity } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-mist px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[8px] bg-white shadow-soft md:grid-cols-[1fr_0.9fr]">
          <section className="flex flex-col justify-between bg-fern p-8 text-white md:p-10">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-[8px] bg-white text-fern">
                <Activity aria-hidden size={24} />
              </span>
              <span className="text-lg font-semibold">Fitness Tracker</span>
            </div>
            <div className="mt-20 max-w-md">
              <h1 className="text-4xl font-semibold leading-tight">Create your training command center.</h1>
              <p className="mt-4 text-base leading-7 text-white/76">
                Start with workouts and goals, then let the dashboard make your progress easy to scan.
              </p>
            </div>
          </section>
          <section className="p-6 sm:p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-ink">Create account</h2>
              <p className="mt-2 text-sm text-ink/60">Your workout data stays tied to your login.</p>
            </div>
            <AuthForm mode="signup" />
            <p className="mt-6 text-sm text-ink/65">
              Already have an account?{" "}
              <Link className="font-semibold text-fern hover:text-fern/80" href="/login">
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
