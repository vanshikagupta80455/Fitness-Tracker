import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-mist px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[8px] bg-white shadow-soft md:grid-cols-[1fr_0.9fr]">
          <section className="flex flex-col justify-between bg-ink p-8 text-white md:p-10">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-[8px] bg-coral text-white">
                <Dumbbell aria-hidden size={24} />
              </span>
              <span className="text-lg font-semibold">Fitness Tracker</span>
            </div>
            <div className="mt-20 max-w-md">
              <h1 className="text-4xl font-semibold leading-tight">Log training, measure progress, stay honest.</h1>
              <p className="mt-4 text-base leading-7 text-white/72">
                A focused dashboard for workouts, exercises, goals, and the steady small wins that compound.
              </p>
            </div>
          </section>
          <section className="p-6 sm:p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-ink">Welcome back</h2>
              <p className="mt-2 text-sm text-ink/60">Sign in to your fitness dashboard.</p>
            </div>
            <AuthForm mode="login" />
            <p className="mt-6 text-sm text-ink/65">
              New here?{" "}
              <Link className="font-semibold text-fern hover:text-fern/80" href="/signup">
                Create an account
              </Link>
            </p>
            <div className="mt-6 rounded-[8px] border border-ink/10 bg-wheat/60 p-4 text-sm text-ink/70">
              Demo login after seeding: <span className="font-semibold">demo@fitness.local</span> /{" "}
              <span className="font-semibold">demo1234</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
