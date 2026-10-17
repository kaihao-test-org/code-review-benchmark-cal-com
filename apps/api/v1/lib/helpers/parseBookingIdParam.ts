import type { NextApiRequest } from "next";

export function parseBookingIdParam(req: NextApiRequest): number {
  const raw = req.query.id;
  const id = parseInt(Array.isArray(raw) ? raw[0] : raw ?? "", 10);
  if (id < 0) {
    throw new Error("Invalid booking id");
  }
  return id;
}
