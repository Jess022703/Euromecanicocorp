import ShopNav from "@/components/ShopNav";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/login");

  return (
    <div className="flex h-screen bg-[#111112] text-white overflow-hidden">
      <ShopNav />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
