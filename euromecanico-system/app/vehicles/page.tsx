import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const vehicles = await prisma.vehicle.findMany({
    where: q
      ? {
          OR: [
            { vin: { contains: q } },
            { plate: { contains: q } },
            { client: { name: { contains: q } } },
            { model: { contains: q } },
          ],
        }
      : {},
    include: {
      client: true,
      orders: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[#71717a] text-xs tracking-widest uppercase">
            Historial VIN
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight mt-1">
            VEHÍCULOS
          </h1>
        </div>
      </div>

      {/* Search */}
      <form className="mb-4">
        <div className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por VIN, tablilla, modelo o cliente..."
            className="flex-1 bg-[#1a1a1c] border border-[#2a2a2e] text-white px-3 py-2 text-sm focus:outline-none focus:border-[#CC2229] transition-colors"
          />
          <button
            type="submit"
            className="border border-[#2a2a2e] text-[#71717a] text-xs px-4 tracking-widest hover:border-[#71717a] hover:text-white transition-colors"
          >
            BUSCAR
          </button>
        </div>
      </form>

      <div className="bg-[#1a1a1c] border border-[#2a2a2e]">
        <div className="grid grid-cols-[1fr_1fr_auto_auto] text-[10px] tracking-widest text-[#71717a] uppercase px-4 py-2 border-b border-[#2a2a2e] gap-4">
          <span>Vehículo</span>
          <span>Cliente</span>
          <span>VIN / Tablilla</span>
          <span className="text-right">Órdenes</span>
        </div>
        {vehicles.length === 0 && (
          <div className="px-4 py-8 text-center text-[#71717a] text-xs">
            No se encontraron vehículos
          </div>
        )}
        {vehicles.map((v) => (
          <Link
            key={v.id}
            href={`/vehicles/${v.id}`}
            className="grid grid-cols-[1fr_1fr_auto_auto] items-center px-4 py-3 hover:bg-[#111112] transition-colors border-b border-[#2a2a2e] last:border-b-0 gap-4 group"
          >
            <div>
              <div className="text-white text-xs font-medium">
                {v.year} {v.make} {v.model}
              </div>
              {v.color && (
                <div className="text-[#71717a] text-[10px] mt-0.5">{v.color}</div>
              )}
            </div>
            <div className="text-[#71717a] text-xs">{v.client.name}</div>
            <div className="text-[10px] font-mono">
              <div className="text-white">{v.plate || "—"}</div>
              <div className="text-[#71717a]">{v.vin.slice(-8)}</div>
            </div>
            <div className="text-right text-xs text-[#71717a] group-hover:text-white transition-colors">
              {v.orders.length > 0 ? `${v.orders.length} órd.` : "—"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
