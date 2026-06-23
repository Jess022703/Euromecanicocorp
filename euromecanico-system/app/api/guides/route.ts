import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { title, model, year, category, notes, steps } = await req.json();

  const guide = await prisma.repairGuide.create({
    data: {
      title,
      model,
      year: year || null,
      category,
      notes: notes || null,
      steps: JSON.stringify(
        steps.map((s: { title: string; description: string; warning: string }) => ({
          title: s.title,
          description: s.description,
          ...(s.warning ? { warning: s.warning } : {}),
        }))
      ),
    },
  });

  return NextResponse.json({ id: guide.id });
}
