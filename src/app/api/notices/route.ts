import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB

export async function GET() {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json(
      notices.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type,
        pdfUrl: n.pdfUrl,
        publishedAt: n.publishedAt.toISOString(),
      }))
    );
  } catch (e) {
    console.error("Notices GET", e);
    return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Must use formData — the client sends multipart/form-data with a PDF file
    const formData = await request.formData();

    const title = (formData.get("title") as string | null)?.trim() ?? "";
    const bodyText = (formData.get("body") as string | null)?.trim() || null;
    const type = (formData.get("type") as string | null)?.trim() || "announcement";
    const pdfFile = formData.get("pdf") as File | null;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (type.length > 50) {
      return NextResponse.json({ error: "Type must be 50 characters or less" }, { status: 400 });
    }
    if (!pdfFile || pdfFile.size === 0) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }
    if (pdfFile.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }
    if (pdfFile.size > MAX_PDF_SIZE) {
      return NextResponse.json({ error: "PDF must be 10 MB or smaller" }, { status: 400 });
    }

    // Save PDF to public/uploads/
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, fileName), Buffer.from(await pdfFile.arrayBuffer()));
    const pdfUrl = `/uploads/${fileName}`;

    // Persist to database
    const notice = await prisma.notice.create({
      data: {
        title,
        body: bodyText,
        type,
        pdfUrl,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "NOTICE_PUBLISHED",
        entityType: "notice",
        entityId: notice.id,
        metadata: { title: notice.title, type: notice.type },
      },
    }).catch(() => {});

    return NextResponse.json(
      {
        id: notice.id,
        title: notice.title,
        body: notice.body,
        type: notice.type,
        pdfUrl: notice.pdfUrl,
        publishedAt: notice.publishedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Notices POST", e);
    return NextResponse.json({ error: "Failed to create notice" }, { status: 500 });
  }
}
