const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generatePublicComplaintId() {
  let letters = "";
  let digits = "";

  for (let i = 0; i < 5; i++) {
    letters += LETTERS[Math.floor(Math.random() * LETTERS.length)];
    digits += String(Math.floor(Math.random() * 10));
  }

  return letters + digits; // 10 chars: 5 alpha + 5 numeric
}

async function isUniquePublicId(publicId) {
  const found = await prisma.complaint.findUnique({
    where: { publicId },
    select: { id: true },
  });
  return !found;
}

async function generateUniquePublicId() {
  for (let attempt = 0; attempt < 30; attempt++) {
    const candidate = generatePublicComplaintId();
    if (await isUniquePublicId(candidate)) return candidate;
  }
  throw new Error("Failed to generate a unique publicId for complaint.");
}

async function main() {
  const toUpdate = await prisma.complaint.findMany({
    where: { publicId: null },
    select: { id: true },
  });

  console.log(`Found ${toUpdate.length} complaints missing publicId.`);

  let updated = 0;
  for (const c of toUpdate) {
    const newPublicId = await generateUniquePublicId();
    await prisma.complaint.update({
      where: { id: c.id },
      data: { publicId: newPublicId },
    });
    updated += 1;

    if (updated % 20 === 0) {
      console.log(`Updated ${updated}/${toUpdate.length}...`);
    }
  }

  console.log(`Backfill complete. Updated ${updated} complaints.`);

  const remaining = await prisma.complaint.count({
    where: { publicId: null },
  });
  console.log(`Remaining missing publicId: ${remaining}`);
}

main()
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

