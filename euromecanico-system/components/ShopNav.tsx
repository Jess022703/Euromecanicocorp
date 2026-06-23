"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "PANEL", icon: "▣" },
  { href: "/orders", label: "ÓRDENES", icon: "≡" },
  { href: "/vehicles", label: "VEHÍCULOS", icon: "◈" },
  { href: "/inventory", label: "INVENTARIO", icon: "◫" },
  { href: "/guides", label: "GUÍAS", icon: "◉" },
];

export default function ShopNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <nav className="w-52 bg-[#0d0d0e] border-r border-[#2a2a2e] flex flex-col shrink-0">
      <div className="px-4 py-5 border-b border-[#2a2a2e]">
        <div className="text-[#CC2229] text-[10px] tracking-widest font-bold">
          EUROMECANICO
        </div>
        <div className="text-white text-xs tracking-widest">CORP</div>
      </div>

      <div className="flex-1 py-4">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-xs tracking-widest transition-colors ${
                active
                  ? "text-white bg-[#1a1a1c] border-l-2 border-[#CC2229]"
                  : "text-[#71717a] hover:text-white hover:bg-[#1a1a1c]"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#2a2a2e]">
        <button
          onClick={handleLogout}
          className="w-full text-[#71717a] text-xs tracking-widest hover:text-[#CC2229] transition-colors text-left"
        >
          ⇤ SALIR
        </button>
      </div>
    </nav>
  );
}
