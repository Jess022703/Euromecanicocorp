import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STATUS_MESSAGES, SHOP_INFO, type OrderStatus } from "@/lib/constants";
import nodemailer from "nodemailer";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await req.json();

  const order = await prisma.repairOrder.findUnique({
    where: { id },
    include: { vehicle: { include: { client: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.repairOrder.update({
    where: { id },
    data: { status },
  });

  // Build message body
  const template = STATUS_MESSAGES[status as OrderStatus] || "";
  const body = template
    .replace("{make}", order.vehicle.make)
    .replace("{model}", order.vehicle.model);

  // Log message
  await prisma.messageLog.create({
    data: {
      orderId: id,
      channel: "EMAIL",
      body,
    },
  });

  // Send email if client has email
  if (order.vehicle.client.email) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const trackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/track/${order.qrToken}`;

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: order.vehicle.client.email,
        subject: `Actualización de su vehículo — ${SHOP_INFO.name}`,
        html: `
          <div style="font-family: monospace; max-width: 480px; margin: 0 auto; background: #111112; color: #fff; padding: 32px;">
            <div style="color: #CC2229; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 4px;">
              ${SHOP_INFO.name}
            </div>
            <div style="color: #71717a; font-size: 11px; margin-bottom: 24px;">
              ${order.vehicle.year} ${order.vehicle.make} ${order.vehicle.model}
            </div>
            <div style="font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
              ${body}
            </div>
            <a href="${trackUrl}" style="display: inline-block; background: #CC2229; color: #fff; padding: 10px 20px; text-decoration: none; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;">
              RASTREAR MI VEHÍCULO →
            </a>
            <div style="margin-top: 32px; color: #71717a; font-size: 10px; border-top: 1px solid #2a2a2e; padding-top: 16px;">
              ${SHOP_INFO.name} · ${SHOP_INFO.phone} · ${SHOP_INFO.hours}
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error("Email send failed:", err);
    }
  }

  return NextResponse.json({ ok: true, order: updated });
}
