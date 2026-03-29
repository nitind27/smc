import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const STAFF_ROLES = ["admin", "department_head", "staff", "auditor"] as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: { department: { select: { name: true } } },
    });
    if (!user) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }
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
    console.error("Staff GET [id]", e);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, role, departmentId } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    const updates: { name?: string; email?: string; role?: string; departmentId?: string | null } = {};

    if (name != null) {
      const trimmed = typeof name === "string" ? name.trim() : "";
      if (!trimmed) {
        return NextResponse.json(
          { error: "Name is required" },
          { status: 400 }
        );
      }
      updates.name = trimmed;
    }

    if (email != null) {
      const emailTrimmed = typeof email === "string" ? email.trim().toLowerCase() : "";
      if (!emailTrimmed) {
        return NextResponse.json(
          { error: "Email is required" },
          { status: 400 }
        );
      }
      const emailConflict = await prisma.user.findFirst({
        where: {
          email: emailTrimmed,
          id: { not: id },
        },
      });
      if (emailConflict) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 400 }
        );
      }
      updates.email = emailTrimmed;
    }

    if (role != null) {
      const validRole = role && STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number])
        ? (role as (typeof STAFF_ROLES)[number])
        : existingUser.role;
      updates.role = validRole;
    }

    if (departmentId !== undefined) {
      updates.departmentId =
        departmentId && String(departmentId).trim()
          ? String(departmentId).trim()
          : null;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updates,
      include: { department: { select: { name: true } } },
    });

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
    console.error("Staff PATCH [id]", e);
    return NextResponse.json(
      { error: "Failed to update staff member" },
      { status: 500 }
    );
  }
}
