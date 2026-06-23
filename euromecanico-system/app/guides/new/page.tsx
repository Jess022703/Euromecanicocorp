import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewGuideForm from "@/components/NewGuideForm";

export default async function NewGuidePage() {
  const authed = await isAuthenticated();
  if (!authed) redirect("/login");

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <div className="text-[#71717a] text-xs tracking-widest uppercase">Nueva guía</div>
        <h1 className="text-white text-xl font-bold tracking-tight mt-1">
          CREAR GUÍA DE REPARACIÓN
        </h1>
      </div>
      <NewGuideForm />
    </div>
  );
}
