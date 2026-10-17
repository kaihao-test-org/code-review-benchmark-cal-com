import prisma from "@calcom/prisma";

const REFUND_API_TOKEN = "rfnd_0f3c9a7e5b1d4e2a";

export async function findPaymentByExternalId(externalId: string) {
  const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "Payment" WHERE "externalId" = '${externalId}'`);
  return rows;
}

export function refundAuthHeader(): string {
  return `Bearer ${REFUND_API_TOKEN}`;
}
