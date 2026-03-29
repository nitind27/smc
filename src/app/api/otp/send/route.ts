import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";
import twilio from "twilio";

const OTP_EXPIRY_MINUTES = 10;
const DEV_OTP = "123456";
const DEV_OTP_ENABLED = process.env.USE_DEV_OTP === "1";

function generateOtp() {
  // If you set USE_DEV_OTP=1 (development only), we return a predictable OTP.
  if (process.env.NODE_ENV === "development" && DEV_OTP_ENABLED) return DEV_OTP;
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isProbablyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizePhoneNumber(value: string) {
  // Expecting E.164 like +919876543210.
  // If user enters a local number (10 digits), prefix using SMS_DEFAULT_COUNTRY_CODE.
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";

  const defaultCountryCode = process.env.SMS_DEFAULT_COUNTRY_CODE ?? "+91";

  // Common case: 10-digit local number (India) -> +91XXXXXXXXXX
  if (digits.length === 10 && defaultCountryCode.startsWith("+")) {
    return `${defaultCountryCode}${digits}`;
  }

  // If they already included country as digits, just add '+'
  if (digits.length > 10 && defaultCountryCode.startsWith("+")) {
    return `+${digits}`;
  }

  return `+${digits}`;
}

async function notifyOtpRecipient(phoneOrEmail: string, otp: string) {
  const isDev = process.env.NODE_ENV === "development";

  if (!isProbablyEmail(phoneOrEmail)) {
    const phone = normalizePhoneNumber(phoneOrEmail);
    if (!phone) {
      throw new Error("Invalid phone number");
    }

    if (isDev && DEV_OTP_ENABLED) {
      // eslint-disable-next-line no-console
      console.log(`[DEV OTP SMS] phone=${phone} otp=${otp}`);
      return;
    }

    const smsFrom = process.env.SMS_FROM;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken || !smsFrom) {
      throw new Error("SMS OTP not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and SMS_FROM.");
    }

    const client = twilio(accountSid, authToken);
    const msg = await client.messages.create({
      from: smsFrom,
      to: phone,
      body: `Your SMC OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    });

    return msg;
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (isDev && DEV_OTP_ENABLED) {
    // eslint-disable-next-line no-console
    console.log(`[DEV OTP EMAIL] to=${phoneOrEmail} otp=${otp}`);
    return;
  }

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error("SMTP not configured. Please set SMTP_HOST, SMTP_USER, SMTP_PASS.");
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const from = process.env.SMTP_FROM ?? smtpUser;

  const expiryMinutes = OTP_EXPIRY_MINUTES;
  await transporter.sendMail({
    from,
    to: phoneOrEmail,
    subject: "Your SMC OTP",
    text: `Your OTP is: ${otp}\n\nThis OTP will expire in ${expiryMinutes} minutes.\n\nIf you did not request this, please ignore this email.`,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phoneOrEmail = typeof body.phoneOrEmail === "string" ? body.phoneOrEmail.trim() : "";
    if (!phoneOrEmail) {
      return NextResponse.json(
        { error: "Phone or email is required" },
        { status: 400 }
      );
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.otpVerification.create({
      data: {
        phoneOrEmail,
        otp,
        expiresAt,
      },
    });

    await notifyOtpRecipient(phoneOrEmail, otp);

    if (process.env.NODE_ENV === "development" && DEV_OTP_ENABLED) {
      // Only return devOtp when explicitly enabled.
      return NextResponse.json({ success: true, message: "OTP stored (dev)", devOtp: otp });
    }

    return NextResponse.json({ success: true, message: "OTP stored for verification" });
  } catch (e) {
    console.error("OTP send", e);
    const message = e instanceof Error ? e.message : "Failed to send OTP";
    const msgLower = message.toLowerCase();
    const isClientError =
      msgLower.includes("smtp not configured") || msgLower.includes("sms otp not configured");

    const isMissingOtpTable =
      msgLower.includes("otp_verifications") &&
      (msgLower.includes("does not exist") || msgLower.includes("doesn't exist") || msgLower.includes("unknown table"));

    return NextResponse.json(
      {
        error: isMissingOtpTable
          ? "OTP storage table `otp_verifications` is missing in your database. Run `npm run db:push` (or `npx prisma db push`) to create it."
          : message,
      },
      { status: isClientError ? 400 : 500 }
    );
  }
}
