import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authCookieOptions, createAuthToken, SESSION_COOKIE } from "@/lib/auth";
import { jsonError } from "@/lib/response";

export async function POST(request: Request) {
  const body = await request.json();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return jsonError("Email and password are required.");
  }

  const userWithPassword = await prisma.user.findUnique({ where: { email } });

  if (!userWithPassword) {
    return jsonError("Invalid email or password.", 401);
  }

  const isValid = await bcrypt.compare(password, userWithPassword.passwordHash);

  if (!isValid) {
    return jsonError("Invalid email or password.", 401);
  }

  const user = {
    id: userWithPassword.id,
    name: userWithPassword.name,
    email: userWithPassword.email
  };
  const token = await createAuthToken(user.id);
  const response = NextResponse.json({ user });

  response.cookies.set(SESSION_COOKIE, token, authCookieOptions);
  return response;
}
