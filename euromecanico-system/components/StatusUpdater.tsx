"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/constants";

export default function StatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(currentStatus);
  const router = useRouter();

  async function updateStatus() {
    if (selected === currentStatus) return;
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: selected }),
    });
    if (res.ok) {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="bg-[#1a1a1c] border border-[#2a2a2e] p-4">
      <div className="text-[#71717a] text-[10px] tracking-widest uppercase mb-3">
        Actualizar estado
      </div>
      <div className="flex gap-2 flex-wrap">
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setSelected(s)}
            className={`text-[10px] tracking-widest px-3 py-1.5 border transition-colors ${
              selected === s
                ? "border-[#CC2229] text-[#CC2229]"
                : "border-[#2a2a2e] text-[#71717a] hover:border-[#71717a] hover:text-white"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      {selected !== currentStatus && (
        <button
          onClick={updateStatus}
          disabled={loading}
          className="mt-3 bg-[#CC2229] text-white text-xs px-4 py-2 tracking-widest hover:bg-[#a81b21] transition-colors disabled:opacity-40"
        >
          {loading ? "GUARDANDO..." : "GUARDAR CAMBIO"}
        </button>
      )}
    </div>
  );
}
