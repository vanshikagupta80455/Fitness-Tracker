import { GoalStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, toDate, toNumber } from "@/lib/response";

export async function GET(request: NextRequest) {
  const user = await getAuthUserFromRequest(request);

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });

  return NextResponse.json({ goals });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUserFromRequest(request);

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim() : "";
  const unit = typeof body.unit === "string" ? body.unit.trim() : "";
  const targetValue = toNumber(body.targetValue);
  const currentValue = toNumber(body.currentValue) ?? 0;
  const deadline = toDate(body.deadline);
  const status = Object.values(GoalStatus).includes(body.status) ? body.status : GoalStatus.ACTIVE;

  if (!title || !type || !unit || targetValue === null || Number.isNaN(targetValue)) {
    return jsonError("Goal title, type, target value, and unit are required.");
  }

  if (Number.isNaN(currentValue)) {
    return jsonError("Current value must be a valid number.");
  }

  const goal = await prisma.goal.create({
    data: { title, type, unit, targetValue, currentValue, deadline, status, userId: user.id }
  });

  return NextResponse.json({ goal }, { status: 201 });
}
