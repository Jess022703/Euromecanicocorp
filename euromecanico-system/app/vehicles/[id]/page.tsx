import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { STATUS_LABELS, type OrderStatus, IVU_RATE } from "@/lib/constants";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  RECEIVED: "text-blue-400 border-blue-400/30",
  DIAGNOSING: "text-yellow-400 border-yellow-400/30",
  WAITING_PARTS: "text-orange-400 border-orange-400/30",
  IN_REPAIR: "text-purple-400 border-purple-400/30",
  READY: "text-green-400 border-green-400/30",
  DELIVERED: "text-[#71717a] border-[#2a2a2e]",
};

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      client: true,
      orders: {
        include: { lineItems: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!vehicle) notFound();

  const totalSpent = vehicle.orders
    .flatMap((o) => o.lineItems)
    .reduce((s, l) => s + l.quantity * l.unitPrice, 0);

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/vehicles"
          className="text-[#71717a] text-xs tracking-widest hover:text-white transition-colors"
        >
          ← VEHÍCULOS
        </Link>
        <h1 className="text-white text-xl font-bold tracking-tight mt-2">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h1>
        <div className="text-[#71717a] text-xs mt-1">
          {vehicle.client.name} · VIN: {vehicle.vin}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Vehicle info */}
        <div className="bg-[#1a1a1c] border border-[#2a2a2e] p-4">
          <div className="text-[#71717a] text-[10px] tracking-widest uppercase mb-3">
            Vehículo
          </div>
          <div className="space-y-1.5 text-xs">
            {[
              ["Marca", vehicle.make],
              ["Modelo", vehicle.model],
              ["Año", vehicle.year.toString()],
              ["Color", vehicle.color || "—"],
              ["Tablilla", vehicle.plate || "—"],
              ["VIN", vehicle.vin],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-2">
                <span className="text-[#71717a] shrink-0">{label}</span>
                <span className="text-white font-mono text-right text-[10px] truncate">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Client info */}
        <div className="bg-[#1a1a1c] border border-[#2a2a2e] p-4">
          <div className="text-[#71717a] text-[10px] tracking-widest uppercase mb-3">
            Propietario
          </div>
          <div className="text-white text-sm font-medium mb-1">
            {vehicle.client.name}
          </div>
          <div className="text-[#71717a] text-xs">{vehicle.client.phone}</div>
          {vehicle.client.email && (
            <div className="text-[#71717a] text-xs mt-0.5">{vehicle.client.email}</div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-[#1a1a1c] border border-[#2a2a2e] p-4">
          <div className="text-[#71717a] text-[10px] tracking-widest uppercase mb-3">
            Resumen
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-[#71717a] text-[9px] tracking-widest uppercase">Servicios</div>
              <div className="text-white text-2xl font-bold">{vehicle.orders.length}</div>
            </div>
            <div>
              <div className="text-[#71717a] text-[9px] tracking-widest uppercase">Total facturado</div>
              <div className="text-[#CC2229] text-lg font-bold font-mono">
                ${(totalSpent * (1 + IVU_RATE)).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service timeline */}
      <div className="bg-[#1a1a1c] border border-[#2a2a2e]">
        <div className="px-4 py-3 border-b border-[#2a2a2e] flex justify-between items-center">
          <span className="text-[#71717a] text-[10px] tracking-widest uppercase">
            Historial de servicios
          </span>
          <Link
            href={`/orders/new`}
            className="text-[#CC2229] text-[10px] tracking-widest hover:underline"
          >
            + NUEVA ORDEN
          </Link>
        </div>
        {vehicle.orders.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#71717a] text-xs">
            Sin servicios registrados
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-[#2a2a2e]" />
            <div className="divide-y divide-[#2a2a2e]">
              {vehicle.orders.map((order) => {
                const subtotal = order.lineItems.reduce(
                  (s, l) => s + l.quantity * l.unitPrice,
                  0
                );
                const total = subtotal * (1 + IVU_RATE);
                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex gap-4 px-4 py-4 hover:bg-[#111112] transition-colors group"
                  >
                    {/* Dot */}
                    <div className="w-8 flex justify-center pt-1 z-10 shrink-0">
                      <div
                        className={`w-2.5 h-2.5 rounded-full border-2 ${
                          order.status === "DELIVERED"
                            ? "bg-[#2a2a2e] border-[#71717a]"
                            : "bg-[#CC2229] border-[#CC2229]"
                        }`}
                      />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-white text-xs font-medium">
                          {order.description}
                        </div>
                        <span
                          className={`text-[9px] tracking-widest px-1.5 py-0.5 border shrink-0 ${
                            STATUS_COLORS[order.status]
                          }`}
                        >
                          {STATUS_LABELS[order.status as OrderStatus]}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[#71717a] text-[10px]">
                          {new Date(order.createdAt).toLocaleDateString("es-PR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-[#71717a] text-[10px] font-mono">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                      {order.lineItems.length > 0 && (
                        <div className="text-[#71717a] text-[10px] mt-1">
                          {order.lineItems.map((l) => l.description).join(" · ")}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
