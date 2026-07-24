import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "@workspace/db";
import { reportsTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";

const router = Router();

router.get("/reports", async (_req: Request, res: Response) => {
  const reports = await db
    .select()
    .from(reportsTable)
    .orderBy(desc(reportsTable.createdAt))
    .limit(50);

  res.json(
    reports.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

router.post("/reports", async (req: Request, res: Response) => {
  const { scamType, city, state, description } = req.body as {
    scamType: string;
    city: string;
    state: string;
    description: string;
  };

  if (!scamType || !city || !state || !description) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  const [report] = await db
    .insert(reportsTable)
    .values({ scamType, city, state, description })
    .returning();

  res.status(201).json({
    ...report,
    createdAt: report.createdAt.toISOString(),
  });
});

router.get("/hotspots", async (_req: Request, res: Response) => {
  const hotspots = await db
    .select({
      city: reportsTable.city,
      state: reportsTable.state,
      count: sql<number>`cast(count(*) as int)`,
      topScamType: sql<string>`mode() within group (order by ${reportsTable.scamType})`,
    })
    .from(reportsTable)
    .groupBy(reportsTable.city, reportsTable.state)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  res.json(hotspots);
});

export default router;
