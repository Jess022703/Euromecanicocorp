import { prisma } from "@/lib/prisma";
import NewOrderForm from "@/components/NewOrderForm";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const clients = await prisma.client.findMany({
    include: { vehicles: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <div className="text-[#71717a] text-xs tracking-widest uppercase">
          Nueva orden
        </div>
        <h1 className="text-white text-xl font-bold tracking-tight mt-1">
          CREAR ORDEN DE REPARACIÓN
        </h1>
      </div>
      <NewOrderForm clients={clients} />
    </div>
  );
}
