import { NextRequest, NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/db";

// POST /api/user/password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!id || !currentPassword || !newPassword)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });

    if (newPassword.length < 8)
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const match = await compare(currentPassword, user.passwordHash);
    if (!match)
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

    const passwordHash = await hash(newPassword, 10);
    await prisma.user.update({ where: { id }, data: { passwordHash } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Password change", e);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
