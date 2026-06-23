import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { items } = await req.json();

  // Delete all existing line items and recreate
  await prisma.lineItem.deleteMany({ where: { orderId: id } });

  for (const item of items) {
    await prisma.lineItem.create({
      data: {
        orderId: id,
        type: item.type,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        partNumber: item.partNumber || null,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
