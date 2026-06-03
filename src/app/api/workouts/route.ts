import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, toDate } from "@/lib/response";

export async function GET(request: NextRequest) {
  const user = await getAuthUserFromRequest(request);

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  const workouts = await prisma.workout.findMany({
    where: { userId: user.id },
    include: { exercises: { orderBy: { createdAt: "asc" } } },
    orderBy: { date: "desc" }
  });

  return NextResponse.json({ workouts });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUserFromRequest(request);

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const date = toDate(body.date);
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";

  if (!title || !date) {
    return jsonError("Workout title and date are required.");
  }

  const workout = await prisma.workout.create({
    data: { title, date, notes: notes || null, userId: user.id },
    include: { exercises: true }
  });

  return NextResponse.json({ workout }, { status: 201 });
}
