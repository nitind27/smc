import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedOtp = typeof otp === "string" ? otp.trim() : "";
    const pwd = typeof newPassword === "string" ? newPassword : "";

    if (!trimmedEmail || !trimmedOtp || !pwd) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (pwd.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Dev bypass
    const isDevBypass =
      process.env.NODE_ENV === "development" &&
      process.env.USE_DEV_OTP === "1" &&
      trimmedOtp === "123456";

    if (!isDevBypass) {
      const record = await prisma.otpVerification.findFirst({
        where: { phoneOrEmail: trimmedEmail, otp: trimmedOtp },
        orderBy: { createdAt: "desc" },
      });

      if (!record || record.expiresAt < new Date()) {
        return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
      }

      // Invalidate used OTP
      await prisma.otpVerification.delete({ where: { id: record.id } });
    }

    const user = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const passwordHash = await hash(pwd, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Reset password", e);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
