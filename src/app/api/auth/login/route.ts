import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import type { UserRole } from "@/types";

const ROLES: UserRole[] = ["admin", "department_head", "staff", "auditor", "public", "po", "collector", "dc"];

function isUserRole(r: string): r is UserRole {
  return ROLES.includes(r as UserRole);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const match = await compare(password, user.passwordHash);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!isUserRole(user.role)) {
      return NextResponse.json(
        { error: "Invalid user role" },
        { status: 403 }
      );
    }

    // Audit log login
    await prisma.auditLog.create({
      data: {
        action: "USER_LOGIN",
        userId: user.id,
        userEmail: user.email,
        entityType: "user",
        entityId: user.id,
        metadata: { role: user.role },
      },
    }).catch(() => {});

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId ?? undefined,
        avatar: user.avatar ?? undefined,
      },
    });
  } catch (e) {
    console.error("Login", e);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
