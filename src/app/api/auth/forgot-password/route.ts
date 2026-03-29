import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";

const OTP_EXPIRY_MINUTES = 10;

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(to: string, otp: string) {
  const isDev = process.env.NODE_ENV === "development";
  const devEnabled = process.env.USE_DEV_OTP === "1";

  if (isDev && devEnabled) {
    console.log(`[DEV FORGOT-PASSWORD OTP] to=${to} otp=${otp}`);
    return;
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env");
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? user,
    to,
    subject: "SMC Portal — Password Reset OTP",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#1e40af;margin-bottom:8px;">Password Reset</h2>
        <p style="color:#475569;margin-bottom:24px;">Use the OTP below to reset your SMC Portal password. It expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
        <div style="background:#1e40af;color:#fff;font-size:32px;font-weight:700;letter-spacing:12px;text-align:center;padding:20px 32px;border-radius:8px;">${otp}</div>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
    text: `Your SMC Portal password reset OTP is: ${otp}\n\nExpires in ${OTP_EXPIRY_MINUTES} minutes.`,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const trimmed = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!trimmed) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Always return success to avoid email enumeration
    const user = await prisma.user.findUnique({ where: { email: trimmed } });
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.otpVerification.create({
      data: { phoneOrEmail: trimmed, otp, expiresAt },
    });

    await sendOtpEmail(trimmed, otp);

    const devOtp =
      process.env.NODE_ENV === "development" && process.env.USE_DEV_OTP === "1"
        ? otp
        : undefined;

    return NextResponse.json({ success: true, ...(devOtp ? { devOtp } : {}) });
  } catch (e) {
    console.error("Forgot password", e);
    const msg = e instanceof Error ? e.message : "Failed to send OTP";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
