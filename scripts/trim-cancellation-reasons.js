#!/usr/bin/env node
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const BATCH_SIZE = 500;

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  let cursor;
  let trimmedCount = 0;

  for (;;) {
    const bookings = await prisma.booking.findMany({
      where: { cancellationReason: { not: null } },
      select: { id: true, cancellationReason: true },
      orderBy: { id: "asc" },
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    if (bookings.length === 0) break;

    for (const booking of bookings) {
      const trimmedReason = booking.cancellationReason.trim();
      if (trimmedReason === booking.cancellationReason) continue;

      if (!dryRun) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { cancellationReason: trimmedReason || null },
        });
      }
      trimmedCount++;
    }

    cursor = bookings[bookings.length - 1].id;
    console.log(`Processed bookings up to id ${cursor}, ${trimmedCount} reasons trimmed so far`);
  }

  console.log(`${dryRun ? "Would trim" : "Trimmed"} ${trimmedCount} cancellation reasons`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
