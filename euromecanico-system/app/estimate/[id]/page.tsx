import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import EstimateBuilder from "@/components/EstimateBuilder";
import ShopNav from "@/components/ShopNav";

export const dynamic = "force-dynamic";

export default async function EstimatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/login");

  const { id } = await params;
  const order = await prisma.repairOrder.findUnique({
    where: { id },
    include: {
      vehicle: { include: { client: true } },
      lineItems: true,
    },
  });

  if (!order) notFound();

  return (
    <div className="flex h-screen bg-[#111112] text-white overflow-hidden">
      <ShopNav />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href={`/orders/${order.id}`}
              className="text-[#71717a] text-xs tracking-widest hover:text-white transition-colors"
            >
              ← ORDEN
            </Link>
            <div>
              <div className="text-[#71717a] text-xs tracking-widest uppercase">
                Estimado
              </div>
              <h1 className="text-white text-xl font-bold tracking-tight mt-1">
                {order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
              </h1>
            </div>
          </div>
          <EstimateBuilder order={order} />
        </div>
      </main>
    </div>
  );
}
