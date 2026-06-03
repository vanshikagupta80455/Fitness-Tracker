import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/response";

export async function GET(request: NextRequest) {
  const user = await getAuthUserFromRequest(request);

  if (!user) {
    return jsonError("Authentication required.", 401);
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

  return NextResponse.json({
    workoutCount,
    activeGoals,
    exerciseCount: workouts.reduce((total, workout) => total + workout.exercises.length, 0),
    calories: workouts.reduce(
      (total, workout) => total + workout.exercises.reduce((sum, exercise) => sum + (exercise.calories ?? 0), 0),
      0
    ),
    recentWorkouts: workouts
  });
}
