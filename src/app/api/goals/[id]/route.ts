import { GoalStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, toDate, toNumber } from "@/lib/response";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const user = await getAuthUserFromRequest(request);

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  const { id } = await params;
  const existingGoal = await prisma.goal.findFirst({ where: { id, userId: user.id } });

  if (!existingGoal) {
    return jsonError("Goal not found.", 404);
  }

  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim() : "";
  const unit = typeof body.unit === "string" ? body.unit.trim() : "";
  const targetValue = toNumber(body.targetValue);
  const currentValue = toNumber(body.currentValue);
  const deadline = toDate(body.deadline);
  const status = Object.values(GoalStatus).includes(body.status) ? body.status : existingGoal.status;

  if (!title || !type || !unit || targetValue === null || Number.isNaN(targetValue)) {
    return jsonError("Goal title, type, target value, and unit are required.");
  }

  if (currentValue === null || Number.isNaN(currentValue)) {
    return jsonError("Current value must be a valid number.");
  }

  const goal = await prisma.goal.update({
    where: { id },
    data: { title, type, unit, targetValue, currentValue, deadline, status }
  });

  return NextResponse.json({ goal });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await getAuthUserFromRequest(request);

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  const { id } = await params;
  const existingGoal = await prisma.goal.findFirst({ where: { id, userId: user.id } });

  if (!existingGoal) {
    return jsonError("Goal not found.", 404);
  }

  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
