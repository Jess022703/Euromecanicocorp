import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Step = {
  title: string;
  description: string;
  warning?: string;
};

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = await prisma.repairGuide.findUnique({ where: { id } });
  if (!guide) notFound();

  const steps = JSON.parse(guide.steps) as Step[];

  return (
    <div className="p-6 max-w-3xl">
      <Link
        href="/guides"
        className="text-[#71717a] text-xs tracking-widest hover:text-white transition-colors"
      >
        ← GUÍAS
      </Link>

      <div className="mt-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] tracking-widest px-2 py-0.5 border border-[#CC2229]/30 text-[#CC2229]">
            {guide.category.toUpperCase()}
          </span>
          <span className="text-[#71717a] text-xs">{guide.model}</span>
          {guide.year && <span className="text-[#71717a] text-xs">{guide.year}</span>}
        </div>
        <h1 className="text-white text-xl font-bold tracking-tight">{guide.title}</h1>
        {guide.notes && (
          <div className="mt-2 text-[#71717a] text-sm border-l-2 border-[#CC2229]/30 pl-3">
            {guide.notes}
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="bg-[#1a1a1c] border border-[#2a2a2e] p-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-[#CC2229]/10 border border-[#CC2229]/30 flex items-center justify-center text-[#CC2229] text-xs font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-medium mb-1">{step.title}</div>
                <div className="text-[#71717a] text-xs leading-relaxed">{step.description}</div>
                {step.warning && (
                  <div className="mt-2 flex items-start gap-2 bg-orange-400/5 border border-orange-400/20 px-3 py-2">
                    <span className="text-orange-400 text-xs shrink-0">⚠</span>
                    <span className="text-orange-400 text-xs">{step.warning}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-[#71717a] text-[10px] tracking-widest">
        {steps.length} PASOS · EUROMECANICO CORP
      </div>
    </div>
  );
}
