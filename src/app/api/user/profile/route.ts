import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/user/profile?id=xxx
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
    avatar: user.avatar,
    createdAt: user.createdAt.toISOString(),
  });
}

// PATCH /api/user/profile  — update name / avatar
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const avatar = typeof body.avatar === "string" ? body.avatar.trim() : undefined;

    if (name !== undefined && name.length === 0)
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(avatar !== undefined ? { avatar: avatar || null } : {}),
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      departmentId: updated.departmentId,
      avatar: updated.avatar,
    });
  } catch (e) {
    console.error("Profile PATCH", e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
