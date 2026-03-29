import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";

const STAFF_ROLES = ["admin", "department_head", "staff", "auditor"] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");
    const role = searchParams.get("role");

    const users = await prisma.user.findMany({
      where: {
        role: { not: "public" },
        ...(departmentId ? { departmentId } : {}),
        ...(role ? { role } : {}),
      },
      orderBy: { name: "asc" },
      include: {
        department: { select: { name: true } },
      },
    });

    const data = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      departmentId: u.departmentId,
      departmentName: u.department?.name,
      avatar: u.avatar,
    }));

    return NextResponse.json(data);
  } catch (e) {
    console.error("Staff GET", e);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, departmentId } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    if (!email || typeof email !== "string" || email.trim() === "") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    const emailTrimmed = email.trim().toLowerCase();
    const validRole = role && STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number])
      ? (role as (typeof STAFF_ROLES)[number])
      : "staff";

    const existing = await prisma.user.findUnique({
      where: { email: emailTrimmed },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(
      typeof body.password === "string" && body.password.trim()
        ? body.password.trim()
        : "password123",
      10
    );

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: emailTrimmed,
        passwordHash,
        role: validRole,
        departmentId: departmentId && String(departmentId).trim() ? String(departmentId).trim() : null,
      },
      include: {
        department: { select: { name: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "USER_CREATED",
        userEmail: user.email,
        entityType: "user",
        entityId: user.id,
        metadata: { name: user.name, role: user.role, departmentId: user.departmentId },
      },
    }).catch(() => {});

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      departmentName: user.department?.name,
      avatar: user.avatar,
    });
  } catch (e) {
    console.error("Staff POST", e);
    return NextResponse.json(
      { error: "Failed to create staff member" },
      { status: 500 }
    );
  }
}
