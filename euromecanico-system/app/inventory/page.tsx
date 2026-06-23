import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const parts = await prisma.part.findMany({
    where: q
      ? {
          OR: [
            { partNumber: { contains: q } },
            { description: { contains: q } },
            { brand: { contains: q } },
          ],
        }
      : {},
    orderBy: { stock: "asc" },
  });

  const lowStock = parts.filter((p) => p.stock <= 3);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[#71717a] text-xs tracking-widest uppercase">
            Almacén
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight mt-1">
            INVENTARIO DE PIEZAS
          </h1>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="mb-4 bg-orange-400/5 border border-orange-400/20 px-4 py-3 flex items-center gap-3">
          <span className="text-orange-400 text-xs tracking-widest">
            ⚠ {lowStock.length} pieza{lowStock.length !== 1 ? "s" : ""} con stock bajo (≤3 unidades)
          </span>
        </div>
      )}

      {/* Search */}
      <form className="mb-4">
        <div className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por número de pieza, descripción o marca..."
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
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] text-[10px] tracking-widest text-[#71717a] uppercase px-4 py-2 border-b border-[#2a2a2e] gap-4">
          <span>N° Pieza</span>
          <span>Descripción</span>
          <span>Marca</span>
          <span>Ubicación</span>
          <span className="text-right">Stock</span>
          <span className="text-right">Costo</span>
        </div>
        {parts.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#71717a] text-xs">
            No se encontraron piezas
          </div>
        ) : (
          <div className="divide-y divide-[#2a2a2e]">
            {parts.map((part) => (
              <div
                key={part.id}
                className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center px-4 py-3 gap-4"
              >
                <div className="text-[#CC2229] text-[10px] font-mono tracking-widest">
                  {part.partNumber}
                </div>
                <div>
                  <div className="text-white text-xs">{part.description}</div>
                  {part.compatibleWith && (
                    <div className="text-[#71717a] text-[10px] mt-0.5">{part.compatibleWith}</div>
                  )}
                </div>
                <div className="text-[#71717a] text-xs">{part.brand || "—"}</div>
                <div className="text-[#71717a] text-xs font-mono">{part.location || "—"}</div>
                <div
                  className={`text-right text-sm font-bold ${
                    part.stock === 0
                      ? "text-[#CC2229]"
                      : part.stock <= 3
                      ? "text-orange-400"
                      : "text-green-400"
                  }`}
                >
                  {part.stock}
                </div>
                <div className="text-right text-xs text-[#71717a] font-mono">
                  ${part.unitCost.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 text-[#71717a] text-[10px] tracking-widest">
        {parts.length} PIEZA{parts.length !== 1 ? "S" : ""} EN INVENTARIO
      </div>
    </div>
  );
}
