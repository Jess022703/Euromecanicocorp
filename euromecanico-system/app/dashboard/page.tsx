import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  RECEIVED: "text-blue-400",
  DIAGNOSING: "text-yellow-400",
  WAITING_PARTS: "text-orange-400",
  IN_REPAIR: "text-purple-400",
  READY: "text-green-400",
  DELIVERED: "text-[#71717a]",
};

export default async function DashboardPage() {
  const [openOrders, todayOrders, vehicles, parts] = await Promise.all([
    prisma.repairOrder.findMany({
      where: { status: { not: "DELIVERED" } },
      include: { vehicle: { include: { client: true } }, lineItems: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.repairOrder.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.vehicle.count(),
    prisma.part.findMany({ where: { stock: { lte: 3 } } }),
  ]);

  const statusCounts = openOrders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <div className="text-[#71717a] text-xs tracking-widest uppercase">
          Panel de control
        </div>
        <h1 className="text-white text-2xl font-bold tracking-tight mt-1">
          EUROMECANICO CORP
        </h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Órdenes abiertas", value: openOrders.length, color: "text-white" },
          { label: "Hoy nuevas", value: todayOrders.length, color: "text-blue-400" },
          { label: "Vehículos total", value: vehicles, color: "text-[#71717a]" },
          { label: "Piezas bajo stock", value: parts.length, color: parts.length > 0 ? "text-orange-400" : "text-green-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1a1a1c] border border-[#2a2a2e] p-4">
            <div className="text-[#71717a] text-[10px] tracking-widest uppercase mb-2">
              {stat.label}
            </div>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {(["RECEIVED", "DIAGNOSING", "WAITING_PARTS", "IN_REPAIR", "READY"] as OrderStatus[]).map(
          (s) => (
            <div key={s} className="bg-[#1a1a1c] border border-[#2a2a2e] p-3 flex justify-between items-center">
              <span className="text-[#71717a] text-xs tracking-widest">
                {STATUS_LABELS[s]}
              </span>
              <span className={`font-bold text-lg ${STATUS_COLORS[s]}`}>
                {statusCounts[s] || 0}
              </span>
            </div>
          )
        )}
      </div>

      {/* Open orders table */}
      <div className="bg-[#1a1a1c] border border-[#2a2a2e]">
        <div className="px-4 py-3 border-b border-[#2a2a2e] flex justify-between items-center">
          <span className="text-xs tracking-widest text-[#71717a] uppercase">
            Órdenes activas
          </span>
          <Link
            href="/orders/new"
            className="bg-[#CC2229] text-white text-xs px-3 py-1 tracking-widest hover:bg-[#a81b21] transition-colors"
          >
            + NUEVA
          </Link>
        </div>
        <div className="divide-y divide-[#2a2a2e]">
          {openOrders.length === 0 && (
            <div className="px-4 py-8 text-center text-[#71717a] text-xs">
              No hay órdenes activas
            </div>
          )}
          {openOrders.map((order) => {
            const total = order.lineItems.reduce(
              (s, l) => s + l.quantity * l.unitPrice,
              0
            );
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center px-4 py-3 hover:bg-[#111112] transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
                  </div>
                  <div className="text-[#71717a] text-xs truncate mt-0.5">
                    {order.vehicle.client.name} · {order.vehicle.plate || order.vehicle.vin.slice(-6)}
                  </div>
                </div>
                <div className="ml-4 text-right shrink-0">
                  <div className={`text-xs tracking-widest ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status as OrderStatus]}
                  </div>
                  <div className="text-[#71717a] text-xs mt-0.5">
                    ${total.toFixed(2)}
                  </div>
                </div>
                <div className="ml-3 text-[#2a2a2e] group-hover:text-[#71717a] transition-colors">
                  →
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Low stock alert */}
      {parts.length > 0 && (
        <div className="mt-4 bg-[#1a1a1c] border border-orange-400/30 p-4">
          <div className="text-orange-400 text-xs tracking-widest uppercase mb-3">
            ⚠ Inventario bajo
          </div>
          <div className="space-y-1">
            {parts.map((p) => (
              <div key={p.id} className="flex justify-between text-xs">
                <span className="text-[#71717a]">{p.description}</span>
                <span className="text-orange-400 font-bold">{p.stock} uds</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
