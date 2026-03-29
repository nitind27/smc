import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";

function formatOtp(otp: string) {
  const trimmed = otp.trim();
  // Ensure OTP is shown as a 6-digit code (if it isn't already).
  return /^\d+$/.test(trimmed) ? trimmed.padStart(6, "0") : trimmed;
}

// Generate complaint ID: 5 alphabets + 5 numbers
function generateComplaintId(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let alphaPart = "";
  let numberPart = "";

  for (let i = 0; i < 5; i++) {
    alphaPart += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  for (let i = 0; i < 5; i++) {
    numberPart += Math.floor(Math.random() * 10).toString();
  }

  return alphaPart + numberPart;
}

// Ensure complaint ID is unique in DB
async function generateUniqueComplaintId(): Promise<string> {
  let complaintId = "";
  let exists = true;

  while (exists) {
    complaintId = generateComplaintId();

    const existingComplaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      select: { id: true },
    });

    exists = !!existingComplaint;
  }

  return complaintId;
}

async function notifyComplaintRecipient(
  submittedBy: string,
  complaintId: string,
  title: string,
  otp?: string
) {
  const isDev = process.env.NODE_ENV === "development";
  const isEmail = submittedBy.includes("@");
  const channel = isEmail ? "email" : "phone";

  // Only implement email sending for now.
  if (!isEmail) {
    return {
      sent: false,
      channel,
      message: "Complaint submitted successfully.",
    };
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(`[DEV COMPLAINT NOTIFY] Email=${submittedBy} id=${complaintId}`);
      return {
        sent: true,
        channel,
        message: `Complaint submitted. Track ID sent to your email: ${complaintId}`,
      };
    }

    return {
      sent: false,
      channel,
      message: "Complaint submitted successfully, but email notification isn't configured.",
    };
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

  await transporter.sendMail({
    from,
    to: submittedBy,
    subject: "SMC Complaint Submitted - Track Your ID",
    text:
      `Hello,\n\n` +
      `Your complaint has been submitted successfully.\n\n` +
      `Complaint ID: ${complaintId}\n` +
      `Title: ${title}\n` +
      (otp ? `Verified OTP: ${formatOtp(otp)}\n` : ``) +
      `\nTo track your complaint, open: /track and enter your Complaint ID.\n\n` +
      `Thank you,\nSMC Portal`,
  });

  return {
    sent: true,
    channel,
    message: `Complaint submitted. Track ID sent to your email: ${complaintId}`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, description, category, priority,
      submittedBy, location, attachmentUrls,
      latitude, longitude,
    } = body;

    // Generate custom complaint ID
    const customComplaintId = await generateUniqueComplaintId();

    const complaint = await prisma.complaint.create({
      data: {
        id: customComplaintId, // Custom 10-character ID
        title: title ?? "Untitled",
        description: description ?? "",
        category: category ?? "Other",
        priority: priority ?? "medium",
        submittedBy: submittedBy ?? "guest",
        location: location ?? undefined,
      },
    });

    if (Array.isArray(attachmentUrls) && attachmentUrls.length > 0) {
      await prisma.complaintAttachment.createMany({
        data: attachmentUrls.slice(0, 5).map((url: string) => ({
          complaintId: complaint.id,
          fileUrl: url,
        })),
      });
    }

    const emailOtpRecord =
      submittedBy && String(submittedBy).includes("@")
        ? await prisma.otpVerification.findFirst({
            where: {
              phoneOrEmail: String(submittedBy).trim(),
              expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
            select: { otp: true },
          })
        : null;

    const notification = await notifyComplaintRecipient(
      String(submittedBy ?? ""),
      complaint.id,
      complaint.title,
      emailOtpRecord?.otp
    ).catch(() => ({
      sent: false,
      channel: "unknown",
      message: "Failed to notify recipient.",
    }));

    return NextResponse.json({
      id: complaint.id,
      title: complaint.title,
      status: complaint.status,
      message: "Complaint submitted. Save this ID to track: " + complaint.id,
      notification,
    });
  } catch (e) {
    console.error("Public complaint POST", e);
    return NextResponse.json(
      { error: "Failed to submit complaint" },
      { status: 500 }
    );
  }
}