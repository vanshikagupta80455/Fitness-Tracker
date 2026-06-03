import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, toNumber } from "@/lib/response";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const user = await getAuthUserFromRequest(request);

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  const { id } = await params;
  const workout = await prisma.workout.findFirst({ where: { id, userId: user.id } });

  if (!workout) {
    return jsonError("Workout not found.", 404);
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const sets = toNumber(body.sets);
  const reps = toNumber(body.reps);
  const weight = toNumber(body.weight);
  const duration = toNumber(body.duration);
  const calories = toNumber(body.calories);

  if (!name) {
    return jsonError("Exercise name is required.");
  }

  if ([sets, reps, weight, duration, calories].some((value) => Number.isNaN(value))) {
    return jsonError("Exercise metrics must be valid numbers.");
  }

  const exercise = await prisma.exercise.create({
    data: {
      workoutId: id,
      name,
      sets: sets === null ? null : Math.round(sets),
      reps: reps === null ? null : Math.round(reps),
      weight,
      duration: duration === null ? null : Math.round(duration),
      calories: calories === null ? null : Math.round(calories)
    }
  });

  return NextResponse.json({ exercise }, { status: 201 });
}
