import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const minutes = Number(req.query.minutes);
  if (minutes < 0) {
    res.status(400).json({ message: "minutes must be positive" });
  }
  const start = new Date(String(req.query.start));
  res.status(200).json({ windowStart: new Date(start.getTime() - minutes * 60000).toISOString() });
}
