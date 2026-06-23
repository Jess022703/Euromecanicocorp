import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  RECEIVED: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  DIAGNOSING: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  WAITING_PARTS: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  IN_REPAIR: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  READY: "bg-green-400/10 text-green-400 border-green-400/20",
  DELIVERED: "bg-[#2a2a2e] text-[#71717a] border-[#2a2a2e]",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;

  const orders = await prisma.repairOrder.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { vehicle: { vin: { contains: q } } },
              { vehicle: { plate: { contains: q } } },
              { vehicle: { client: { name: { contains: q } } } },
            ],
          }
        : {}),
    },
    include: {
      vehicle: { include: { client: true } },
      lineItems: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[#71717a] text-xs tracking-widest uppercase">
            Gestión
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight mt-1">
            ÓRDENES DE REPARACIÓN
          </h1>
        </div>
        <Link
          href="/orders/new"
          className="bg-[#CC2229] text-white text-xs px-4 py-2 tracking-widest hover:bg-[#a81b21] transition-colors"
        >
          + NUEVA ORDEN
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { value: "", label: "TODAS" },
          { value: "RECEIVED", label: "RECIBIDAS" },
          { value: "DIAGNOSING", label: "DIAGNÓSTICO" },
          { value: "WAITING_PARTS", label: "ESP. PIEZAS" },
          { value: "IN_REPAIR", label: "EN REPARACIÓN" },
          { value: "READY", label: "LISTAS" },
          { value: "DELIVERED", label: "ENTREGADAS" },
        ].map((f) => (
          <Link
            key={f.value}
            href={`/orders${f.value ? `?status=${f.value}` : ""}`}
            className={`text-[10px] tracking-widest px-3 py-1 border transition-colors ${
              status === f.value || (!status && f.value === "")
                ? "border-[#CC2229] text-[#CC2229]"
                : "border-[#2a2a2e] text-[#71717a] hover:border-[#71717a] hover:text-white"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-[#1a1a1c] border border-[#2a2a2e]">
        <div className="grid grid-cols-[1fr_1.5fr_1fr_auto_auto] text-[10px] tracking-widest text-[#71717a] uppercase px-4 py-2 border-b border-[#2a2a2e]">
          <span>Vehículo</span>
          <span>Descripción</span>
          <span>Cliente</span>
          <span>Estado</span>
          <span className="text-right">Total</span>
        </div>
        <div className="divide-y divide-[#2a2a2e]">
          {orders.length === 0 && (
            <div className="px-4 py-8 text-center text-[#71717a] text-xs">
              No se encontraron órdenes
            </div>
          )}
          {orders.map((order) => {
            const total = order.lineItems.reduce(
              (s, l) => s + l.quantity * l.unitPrice,
              0
            );
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="grid grid-cols-[1fr_1.5fr_1fr_auto_auto] items-center px-4 py-3 hover:bg-[#111112] transition-colors group gap-4"
              >
                <div>
                  <div className="text-white text-xs font-medium">
                    {order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
                  </div>
                  <div className="text-[#71717a] text-[10px] mt-0.5">
                    {order.vehicle.plate || order.vehicle.vin.slice(-8)}
                  </div>
                </div>
                <div className="text-[#71717a] text-xs truncate">
                  {order.description}
                </div>
                <div className="text-[#71717a] text-xs">
                  {order.vehicle.client.name}
                </div>
                <div>
                  <span
                    className={`text-[10px] tracking-widest px-2 py-0.5 border ${
                      STATUS_COLORS[order.status]
                    }`}
                  >
                    {STATUS_LABELS[order.status as OrderStatus]}
                  </span>
                </div>
                <div className="text-right text-xs text-white font-mono">
                  ${total.toFixed(2)}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-[#71717a] text-[10px] tracking-widest">
        {orders.length} ORDEN{orders.length !== 1 ? "ES" : ""}
      </div>
    </div>
  );
}
