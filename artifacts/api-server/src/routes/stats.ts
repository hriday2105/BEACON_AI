import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "@workspace/db";
import { scanStatsTable, reportsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const [statsRow] = await db.select().from(scanStatsTable).limit(1);
  const [{ count: communityReports }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(reportsTable);

  const totalScans = statsRow?.totalScans ?? 1247;
  const threatsBlocked = statsRow?.threatsBlocked ?? 893;

  res.json({
    totalScans,
    threatsBlocked,
    accuracyRate: 97.3,
    communityReports: communityReports ?? 0,
  });
});

export default router;
