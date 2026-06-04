import { Activity, Flame, Target, Timer } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

interface ExerciseType {
  id: string;
  name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  duration: number | null;
  calories: number | null;
  workoutId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkoutType {
  id: string;
  title: string;
  date: Date;
  notes: string | null;
  userId: string;
  exercises: ExerciseType[];
  createdAt: Date;
  updatedAt: Date;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [workoutCount, activeGoals, workouts] = await Promise.all([
    prisma.workout.count({ where: { userId: user.id } }),
    prisma.goal.count({ where: { userId: user.id, status: "ACTIVE" } }),
    prisma.workout.findMany({
      where: { userId: user.id },
      include: { exercises: true },
      orderBy: { date: "desc" },
      take: 5
    })
  ]);

  const typedWorkouts = workouts as unknown as WorkoutType[];

  const exerciseCount = typedWorkouts.reduce((total: number, workout) => total + workout.exercises.length, 0);
  const calories = typedWorkouts.reduce(
    (total: number, workout) => total + workout.exercises.reduce((sum: number, exercise) => sum + (exercise.calories ?? 0), 0),
    0
  );

  const cards = [
    { label: "Workouts", value: workoutCount, icon: Activity, tone: "bg-fern/10 text-fern" },
    { label: "Exercises", value: exerciseCount, icon: Timer, tone: "bg-coral/10 text-coral" },
    { label: "Calories", value: calories, icon: Flame, tone: "bg-amber-100 text-amber-700" },
    { label: "Active Goals", value: activeGoals, icon: Target, tone: "bg-sky-100 text-sky-700" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-fern">Dashboard</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Today&apos;s training snapshot</h1>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-[8px] border border-ink/10 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-ink/60">{card.label}</span>
                <span className={`grid h-10 w-10 place-items-center rounded-[8px] ${card.tone}`}>
                  <Icon aria-hidden size={20} />
                </span>
              </div>
              <p className="mt-5 text-3xl font-semibold text-ink">{card.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[8px] border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-ink">Recent workouts</h2>
            <span className="text-sm text-ink/50">{typedWorkouts.length} shown</span>
          </div>
          <div className="mt-4 divide-y divide-ink/10">
            {typedWorkouts.length === 0 ? (
              <p className="py-8 text-sm text-ink/60">No workouts yet. Add your first session from Workouts.</p>
            ) : (
              typedWorkouts.map((workout) => (
                <div key={workout.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-ink">{workout.title}</p>
                    <p className="mt-1 text-sm text-ink/55">{formatDate(workout.date)}</p>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span className="rounded-[8px] bg-mist px-3 py-1 text-ink/70">
                      {workout.exercises.length} exercises
                    </span>
                    <span className="rounded-[8px] bg-wheat px-3 py-1 text-ink/70">
                      {workout.exercises.reduce((sum: number, exercise) => sum + (exercise.calories ?? 0), 0)} cal
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[8px] border border-ink/10 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Training rhythm</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            Keep the log current after every session. Workouts, exercises, and goals update the dashboard automatically.
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-ink">Workout consistency</span>
                <span className="text-ink/55">{Math.min(workoutCount * 8, 100)}%</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-mist">
                <div className="h-3 rounded-full bg-fern" style={{ width: `${Math.min(workoutCount * 8, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-ink">Goal focus</span>
                <span className="text-ink/55">{Math.min(activeGoals * 25, 100)}%</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-mist">
                <div className="h-3 rounded-full bg-coral" style={{ width: `${Math.min(activeGoals * 25, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
