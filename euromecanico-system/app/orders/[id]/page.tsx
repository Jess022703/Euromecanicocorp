import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { STATUS_LABELS, ORDER_STATUSES, type OrderStatus, IVU_RATE } from "@/lib/constants";
import StatusUpdater from "@/components/StatusUpdater";
import QRCodeDisplay from "@/components/QRCodeDisplay";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  RECEIVED: "text-blue-400",
  DIAGNOSING: "text-yellow-400",
  WAITING_PARTS: "text-orange-400",
  IN_REPAIR: "text-purple-400",
  READY: "text-green-400",
  DELIVERED: "text-[#71717a]",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.repairOrder.findUnique({
    where: { id },
    include: {
      vehicle: { include: { client: true } },
      lineItems: true,
      messages: { orderBy: { sentAt: "desc" } },
    },
  });

  if (!order) notFound();

  const subtotal = order.lineItems.reduce(
    (s, l) => s + l.quantity * l.unitPrice,
    0
  );
  const tax = subtotal * IVU_RATE;
  const total = subtotal + tax;

  const statusIdx = ORDER_STATUSES.indexOf(order.status as OrderStatus);
  const trackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/track/${order.qrToken}`;

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/orders"
            className="text-[#71717a] text-xs tracking-widest hover:text-white transition-colors"
          >
            ← ÓRDENES
          </Link>
          <h1 className="text-white text-xl font-bold tracking-tight mt-2">
            {order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
          </h1>
          <div className="text-[#71717a] text-xs mt-1">
            {order.vehicle.client.name} · {order.vehicle.plate || order.vehicle.vin}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/estimate/${order.id}`}
            className="border border-[#2a2a2e] text-[#71717a] text-xs px-3 py-2 tracking-widest hover:border-[#71717a] hover:text-white transition-colors"
          >
            ESTIMADO
          </Link>
          <div className={`text-sm font-bold tracking-widest ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status as OrderStatus]}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Left column — main info */}
        <div className="col-span-2 space-y-4">
          {/* Progress bar */}
          <div className="bg-[#1a1a1c] border border-[#2a2a2e] p-4">
            <div className="text-[#71717a] text-[10px] tracking-widest uppercase mb-3">
              Estado del trabajo
            </div>
            <div className="flex gap-1 mb-3">
              {ORDER_STATUSES.map((s, i) => (
                <div
                  key={s}
                  className={`flex-1 h-1 transition-colors ${
                    i <= statusIdx ? "bg-[#CC2229]" : "bg-[#2a2a2e]"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-[#71717a] tracking-widest">
              {ORDER_STATUSES.map((s) => (
                <span key={s} className={s === order.status ? "text-[#CC2229]" : ""}>
                  {STATUS_LABELS[s as OrderStatus].split(" ")[0].toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Status updater */}
          <StatusUpdater orderId={order.id} currentStatus={order.status} />

          {/* Description */}
          <div className="bg-[#1a1a1c] border border-[#2a2a2e] p-4">
            <div className="text-[#71717a] text-[10px] tracking-widest uppercase mb-2">
              Descripción del trabajo
            </div>
            <div className="text-white text-sm">{order.description}</div>
            {order.notes && (
              <>
                <div className="text-[#71717a] text-[10px] tracking-widest uppercase mt-3 mb-2">
                  Notas internas
                </div>
                <div className="text-[#71717a] text-sm">{order.notes}</div>
              </>
            )}
          </div>

          {/* Line items */}
          <div className="bg-[#1a1a1c] border border-[#2a2a2e]">
            <div className="px-4 py-3 border-b border-[#2a2a2e] flex justify-between items-center">
              <span className="text-[#71717a] text-[10px] tracking-widest uppercase">
                Partidas del estimado
              </span>
              <Link
                href={`/estimate/${order.id}`}
                className="text-[#CC2229] text-[10px] tracking-widest hover:underline"
              >
                EDITAR
              </Link>
            </div>
            {order.lineItems.length === 0 ? (
              <div className="px-4 py-6 text-center text-[#71717a] text-xs">
                Sin partidas aún
              </div>
            ) : (
              <>
                <div className="divide-y divide-[#2a2a2e]">
                  {order.lineItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center px-4 py-2 text-xs gap-4"
                    >
                      <span
                        className={`text-[9px] tracking-widest px-1.5 py-0.5 border ${
                          item.type === "LABOR"
                            ? "border-blue-400/30 text-blue-400"
                            : "border-orange-400/30 text-orange-400"
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-white flex-1">{item.description}</span>
                      {item.partNumber && (
                        <span className="text-[#71717a] font-mono text-[10px]">
                          #{item.partNumber}
                        </span>
                      )}
                      <span className="text-[#71717a]">
                        {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </span>
                      <span className="text-white font-mono w-20 text-right">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#2a2a2e] px-4 py-3 space-y-1">
                  <div className="flex justify-between text-xs text-[#71717a]">
                    <span>Subtotal</span>
                    <span className="font-mono">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#71717a]">
                    <span>IVU (11.5%)</span>
                    <span className="font-mono">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-white font-bold">
                    <span>TOTAL</span>
                    <span className="font-mono">${total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Message log */}
          <div className="bg-[#1a1a1c] border border-[#2a2a2e]">
            <div className="px-4 py-3 border-b border-[#2a2a2e]">
              <span className="text-[#71717a] text-[10px] tracking-widest uppercase">
                Mensajes enviados
              </span>
            </div>
            {order.messages.length === 0 ? (
              <div className="px-4 py-6 text-center text-[#71717a] text-xs">
                Sin mensajes enviados
              </div>
            ) : (
              <div className="divide-y divide-[#2a2a2e]">
                {order.messages.map((msg) => (
                  <div key={msg.id} className="px-4 py-3">
                    <div className="flex justify-between text-[10px] text-[#71717a] mb-1">
                      <span className="tracking-widest uppercase">{msg.channel}</span>
                      <span>{new Date(msg.sentAt).toLocaleString("es-PR")}</span>
                    </div>
                    <div className="text-xs text-white">{msg.body}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Client card */}
          <div className="bg-[#1a1a1c] border border-[#2a2a2e] p-4">
            <div className="text-[#71717a] text-[10px] tracking-widest uppercase mb-3">
              Cliente
            </div>
            <div className="text-white text-sm font-medium">
              {order.vehicle.client.name}
            </div>
            <div className="text-[#71717a] text-xs mt-1">
              {order.vehicle.client.phone}
            </div>
            {order.vehicle.client.email && (
              <div className="text-[#71717a] text-xs mt-0.5">
                {order.vehicle.client.email}
              </div>
            )}
          </div>

          {/* Vehicle card */}
          <div className="bg-[#1a1a1c] border border-[#2a2a2e] p-4">
            <div className="text-[#71717a] text-[10px] tracking-widest uppercase mb-3">
              Vehículo
            </div>
            <div className="space-y-1.5 text-xs">
              {[
                ["Modelo", `${order.vehicle.year} ${order.vehicle.make} ${order.vehicle.model}`],
                ["Color", order.vehicle.color || "—"],
                ["Tablilla", order.vehicle.plate || "—"],
                ["VIN", order.vehicle.vin],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-[#71717a] shrink-0">{label}</span>
                  <span className="text-white font-mono text-right truncate">{value}</span>
                </div>
              ))}
            </div>
            <Link
              href={`/vehicles/${order.vehicle.id}`}
              className="mt-3 text-[10px] text-[#CC2229] tracking-widest hover:underline block"
            >
              VER HISTORIAL →
            </Link>
          </div>

          {/* QR Code */}
          <div className="bg-[#1a1a1c] border border-[#2a2a2e] p-4">
            <div className="text-[#71717a] text-[10px] tracking-widest uppercase mb-3">
              QR de rastreo
            </div>
            <QRCodeDisplay url={trackUrl} />
            <div className="mt-3 text-[10px] text-[#71717a] break-all font-mono">
              /track/{order.qrToken.slice(0, 12)}...
            </div>
            <a
              href={trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-[10px] text-[#CC2229] tracking-widest hover:underline block"
            >
              ABRIR PÁGINA →
            </a>
          </div>

          {/* Timestamps */}
          <div className="bg-[#1a1a1c] border border-[#2a2a2e] p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#71717a]">Creada</span>
              <span className="text-white text-[10px] font-mono">
                {new Date(order.createdAt).toLocaleDateString("es-PR")}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#71717a]">Actualizada</span>
              <span className="text-white text-[10px] font-mono">
                {new Date(order.updatedAt).toLocaleDateString("es-PR")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
