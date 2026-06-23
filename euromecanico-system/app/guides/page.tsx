import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "Mantenimiento",
  "Frenos",
  "Suspensión",
  "Motor",
  "Eléctrico",
  "Transmisión",
  "Carrocería",
];

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; model?: string }>;
}) {
  const { q, category, model } = await searchParams;

  const guides = await prisma.repairGuide.findMany({
    where: {
      ...(q ? { OR: [{ title: { contains: q } }, { model: { contains: q } }] } : {}),
      ...(category ? { category } : {}),
      ...(model ? { model: { contains: model } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[#71717a] text-xs tracking-widest uppercase">
            Biblioteca técnica
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight mt-1">
            GUÍAS DE REPARACIÓN
          </h1>
        </div>
        <Link
          href="/guides/new"
          className="bg-[#CC2229] text-white text-xs px-4 py-2 tracking-widest hover:bg-[#a81b21] transition-colors"
        >
          + NUEVA GUÍA
        </Link>
      </div>

      {/* Search and filters */}
      <form className="mb-4 flex gap-2 flex-wrap">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar guías..."
          className="flex-1 min-w-48 bg-[#1a1a1c] border border-[#2a2a2e] text-white px-3 py-2 text-sm focus:outline-none focus:border-[#CC2229] transition-colors"
        />
        <select
          name="category"
          defaultValue={category}
          className="bg-[#1a1a1c] border border-[#2a2a2e] text-white px-3 py-2 text-sm focus:outline-none focus:border-[#CC2229]"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          type="submit"
          className="border border-[#2a2a2e] text-[#71717a] text-xs px-4 tracking-widest hover:border-[#71717a] hover:text-white transition-colors"
        >
          BUSCAR
        </button>
      </form>

      {/* Category pills */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Link
          href="/guides"
          className={`text-[10px] tracking-widest px-3 py-1 border transition-colors ${
            !category
              ? "border-[#CC2229] text-[#CC2229]"
              : "border-[#2a2a2e] text-[#71717a] hover:border-[#71717a]"
          }`}
        >
          TODAS
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/guides?category=${c}`}
            className={`text-[10px] tracking-widest px-3 py-1 border transition-colors ${
              category === c
                ? "border-[#CC2229] text-[#CC2229]"
                : "border-[#2a2a2e] text-[#71717a] hover:border-[#71717a]"
            }`}
          >
            {c.toUpperCase()}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {guides.length === 0 && (
          <div className="bg-[#1a1a1c] border border-[#2a2a2e] px-4 py-8 text-center text-[#71717a] text-xs">
            No se encontraron guías
          </div>
        )}
        {guides.map((guide) => {
          const steps = JSON.parse(guide.steps) as { title: string }[];
          return (
            <Link
              key={guide.id}
              href={`/guides/${guide.id}`}
              className="bg-[#1a1a1c] border border-[#2a2a2e] p-4 hover:border-[#CC2229]/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium group-hover:text-[#CC2229] transition-colors">
                    {guide.title}
                  </div>
                  <div className="flex gap-3 mt-1.5 text-[10px] text-[#71717a]">
                    <span>{guide.model}</span>
                    {guide.year && <span>{guide.year}</span>}
                    <span className="text-[#CC2229]">{guide.category}</span>
                    <span>{steps.length} pasos</span>
                  </div>
                  {guide.notes && (
                    <div className="text-[#71717a] text-xs mt-1 truncate">{guide.notes}</div>
                  )}
                </div>
                <div className="text-[#2a2a2e] group-hover:text-[#71717a] transition-colors shrink-0">
                  →
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
