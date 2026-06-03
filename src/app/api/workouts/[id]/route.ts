import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, toDate } from "@/lib/response";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const user = await getAuthUserFromRequest(request);

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  const { id } = await params;
  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const date = toDate(body.date);
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";

  if (!title || !date) {
    return jsonError("Workout title and date are required.");
  }

  const existingWorkout = await prisma.workout.findFirst({ where: { id, userId: user.id } });

  if (!existingWorkout) {
    return jsonError("Workout not found.", 404);
  }

  const workout = await prisma.workout.update({
    where: { id },
    data: { title, date, notes: notes || null },
    include: { exercises: { orderBy: { createdAt: "asc" } } }
  });

  return NextResponse.json({ workout });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await getAuthUserFromRequest(request);

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  const { id } = await params;
  const existingWorkout = await prisma.workout.findFirst({ where: { id, userId: user.id } });

  if (!existingWorkout) {
    return jsonError("Workout not found.", 404);
  }

  await prisma.workout.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
