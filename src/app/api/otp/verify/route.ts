import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEV_OTP = "123456";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phoneOrEmail = typeof body.phoneOrEmail === "string" ? body.phoneOrEmail.trim() : "";
    const otp = typeof body.otp === "string" ? body.otp.trim() : "";

    if (!phoneOrEmail || !otp) {
      return NextResponse.json(
        { error: "Phone/email and OTP are required" },
        { status: 400 }
      );
    }

    if (process.env.NODE_ENV === "development" && process.env.USE_DEV_OTP === "1" && otp === DEV_OTP) {
      return NextResponse.json({ success: true, verified: true });
    }

    const record = await prisma.otpVerification.findFirst({
      where: { phoneOrEmail, otp },
      orderBy: { createdAt: "desc" },
    });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, verified: true });
  } catch (e) {
    console.error("OTP verify", e);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
