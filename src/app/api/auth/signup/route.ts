import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authCookieOptions, createAuthToken, SESSION_COOKIE } from "@/lib/auth";
import { jsonError } from "@/lib/response";

export async function POST(request: Request) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    return jsonError("Name, email, and password are required.");
  }

  if (password.length < 8) {
    return jsonError("Password must be at least 8 characters.");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return jsonError("An account with this email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true }
  });
  const token = await createAuthToken(user.id);
  const response = NextResponse.json({ user }, { status: 201 });

  response.cookies.set(SESSION_COOKIE, token, authCookieOptions);
  return response;
}
