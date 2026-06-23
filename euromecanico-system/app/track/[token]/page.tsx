import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { STATUS_LABELS, ORDER_STATUSES, type OrderStatus, SHOP_INFO } from "@/lib/constants";

export const dynamic = "force-dynamic";

const STATUS_ICONS: Record<string, string> = {
  RECEIVED: "📋",
  DIAGNOSING: "🔍",
  WAITING_PARTS: "⏳",
  IN_REPAIR: "🔧",
  READY: "✅",
  DELIVERED: "🎉",
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  RECEIVED: "Su vehículo fue recibido en el taller y está siendo registrado.",
  DIAGNOSING: "Nuestros técnicos están evaluando su vehículo para identificar el problema.",
  WAITING_PARTS: "El diagnóstico está completo. Estamos esperando la llegada de las piezas necesarias.",
  IN_REPAIR: "Su vehículo está siendo reparado por nuestro equipo de especialistas.",
  READY: "¡Su vehículo está listo! Puede pasar a recogerlo durante nuestro horario de servicio.",
  DELIVERED: "Vehículo entregado. ¡Gracias por confiar en Euromecanico Corp!",
};

export default async function TrackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const order = await prisma.repairOrder.findUnique({
    where: { qrToken: token },
    include: { vehicle: { include: { client: true } } },
  });

  if (!order) notFound();

  const statusIdx = ORDER_STATUSES.indexOf(order.status as OrderStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <div className="text-[#CC2229] text-xs font-bold tracking-widest">
              EUROMECANICO CORP
            </div>
            <div className="text-gray-400 text-[10px]">
              Porsche Specialists · Puerto Rico
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-[10px]">{SHOP_INFO.hours}</div>
            <div className="text-gray-600 text-[10px]">{SHOP_INFO.phone}</div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        {/* Vehicle card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="text-gray-400 text-[10px] tracking-widest uppercase mb-1">
            Su vehículo
          </div>
          <div className="text-gray-900 text-xl font-bold">
            {order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
          </div>
          {order.vehicle.color && (
            <div className="text-gray-500 text-sm mt-1">{order.vehicle.color}</div>
          )}
          {order.vehicle.plate && (
            <div className="text-gray-400 text-xs mt-1 font-mono">
              {order.vehicle.plate}
            </div>
          )}
        </div>

        {/* Status card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="text-gray-400 text-[10px] tracking-widest uppercase mb-4">
            Estado actual
          </div>

          {/* Big status */}
          <div className="text-center mb-5">
            <div className="text-5xl mb-3">{STATUS_ICONS[order.status]}</div>
            <div className="text-gray-900 text-2xl font-bold">
              {STATUS_LABELS[order.status as OrderStatus]}
            </div>
            <div className="text-gray-500 text-sm mt-2 leading-relaxed">
              {STATUS_DESCRIPTIONS[order.status]}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex gap-1">
              {ORDER_STATUSES.filter((s) => s !== "DELIVERED").map((s, i) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    i <= Math.min(statusIdx, ORDER_STATUSES.filter(s => s !== "DELIVERED").length - 1)
                      ? "bg-[#CC2229]"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-gray-400">
              <span>Recibido</span>
              <span>En Reparación</span>
              <span>Listo</span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="text-gray-400 text-[10px] tracking-widest uppercase mb-4">
            Proceso
          </div>
          <div className="space-y-3">
            {ORDER_STATUSES.map((s, i) => {
              const done = i < statusIdx;
              const current = i === statusIdx;
              return (
                <div key={s} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      done
                        ? "bg-[#CC2229] text-white"
                        : current
                        ? "border-2 border-[#CC2229] text-[#CC2229]"
                        : "border-2 border-gray-200 text-gray-300"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-sm ${
                      current
                        ? "text-gray-900 font-semibold"
                        : done
                        ? "text-gray-400 line-through"
                        : "text-gray-300"
                    }`}
                  >
                    {STATUS_LABELS[s as OrderStatus]}
                  </span>
                  {current && (
                    <span className="text-[10px] bg-[#CC2229]/10 text-[#CC2229] px-2 py-0.5 rounded-full">
                      Actual
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="text-gray-400 text-[10px] tracking-widest uppercase mb-2">
              Notas
            </div>
            <div className="text-gray-600 text-sm leading-relaxed">{order.notes}</div>
          </div>
        )}

        {/* Last update */}
        <div className="text-center text-gray-400 text-xs">
          Última actualización:{" "}
          {new Date(order.updatedAt).toLocaleString("es-PR", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </div>

        {/* Contact */}
        <div className="bg-[#CC2229] rounded-lg p-4 text-white text-center">
          <div className="text-sm font-bold mb-1">{SHOP_INFO.name}</div>
          <div className="text-[10px] opacity-80 mb-3">{SHOP_INFO.hours}</div>
          <a
            href={`tel:${SHOP_INFO.phone}`}
            className="inline-block bg-white text-[#CC2229] text-xs font-bold px-4 py-2 rounded"
          >
            {SHOP_INFO.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
