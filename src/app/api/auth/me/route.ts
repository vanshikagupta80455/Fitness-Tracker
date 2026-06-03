import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { jsonError } from "@/lib/response";

export async function GET(request: NextRequest) {
  const user = await getAuthUserFromRequest(request);

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  return NextResponse.json({ user });
}
