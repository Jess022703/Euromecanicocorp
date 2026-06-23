import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    mode,
    selectedVehicleId,
    clientName,
    clientPhone,
    clientEmail,
    vin,
    plate,
    make,
    model,
    year,
    color,
    description,
    notes,
  } = body;

  try {
    let vehicleId = selectedVehicleId;

    if (mode === "new") {
      const client = await prisma.client.create({
        data: {
          name: clientName,
          phone: clientPhone,
          email: clientEmail || null,
        },
      });

      const vehicle = await prisma.vehicle.create({
        data: {
          vin,
          plate: plate || null,
          make,
          model,
          year,
          color: color || null,
          clientId: client.id,
        },
      });

      vehicleId = vehicle.id;
    }

    const order = await prisma.repairOrder.create({
      data: {
        vehicleId,
        description,
        notes: notes || null,
        status: "RECEIVED",
      },
    });

    return NextResponse.json({ id: order.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
