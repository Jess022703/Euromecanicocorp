"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IVU_RATE } from "@/lib/constants";

type LineItem = {
  id: string;
  type: string;
  description: string;
  quantity: number;
  unitPrice: number;
  partNumber: string | null;
};

type Order = {
  id: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    plate: string | null;
    vin: string;
    client: { name: string; phone: string; email: string | null };
  };
  lineItems: LineItem[];
  description: string;
};

export default function EstimateBuilder({ order }: { order: Order }) {
  const router = useRouter();
  const [items, setItems] = useState<Omit<LineItem, "id">[]>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    order.lineItems.map(({ id, ...rest }) => rest)
  );
  const [saving, setSaving] = useState(false);
  const [newType, setNewType] = useState<"LABOR" | "PART">("LABOR");
  const [newDesc, setNewDesc] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [newPrice, setNewPrice] = useState("");
  const [newPart, setNewPart] = useState("");

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = subtotal * IVU_RATE;
  const total = subtotal + tax;

  function addItem() {
    if (!newDesc || !newPrice) return;
    setItems([
      ...items,
      {
        type: newType,
        description: newDesc,
        quantity: parseFloat(newQty) || 1,
        unitPrice: parseFloat(newPrice) || 0,
        partNumber: newPart || null,
      },
    ]);
    setNewDesc("");
    setNewQty("1");
    setNewPrice("");
    setNewPart("");
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  async function saveEstimate() {
    setSaving(true);
    await fetch(`/api/estimate/${order.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    router.refresh();
    setSaving(false);
  }

  async function printPDF() {
    window.open(`/api/estimate/${order.id}/pdf`, "_blank");
  }

  const inputClass =
    "bg-[#111112] border border-[#2a2a2e] text-white px-3 py-2 text-xs focus:outline-none focus:border-[#CC2229] transition-colors";

  return (
    <div className="space-y-4">
      {/* Add item form */}
      <div className="bg-[#1a1a1c] border border-[#2a2a2e] p-4">
        <div className="text-[#71717a] text-[10px] tracking-widest uppercase mb-3">
          Agregar partida
        </div>
        <div className="flex gap-2 flex-wrap items-end">
          <div>
            <div className="text-[#71717a] text-[9px] tracking-widest uppercase mb-1">Tipo</div>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as "LABOR" | "PART")}
              className={`${inputClass} w-24`}
            >
              <option value="LABOR">MANO DE OBRA</option>
              <option value="PART">PIEZA</option>
            </select>
          </div>
          <div className="flex-1 min-w-40">
            <div className="text-[#71717a] text-[9px] tracking-widest uppercase mb-1">Descripción</div>
            <input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className={`${inputClass} w-full`}
              placeholder="Descripción del trabajo o pieza"
            />
          </div>
          {newType === "PART" && (
            <div className="w-32">
              <div className="text-[#71717a] text-[9px] tracking-widest uppercase mb-1">No. Pieza</div>
              <input
                value={newPart}
                onChange={(e) => setNewPart(e.target.value)}
                className={`${inputClass} w-full`}
                placeholder="Opcional"
              />
            </div>
          )}
          <div className="w-20">
            <div className="text-[#71717a] text-[9px] tracking-widest uppercase mb-1">
              {newType === "LABOR" ? "Horas" : "Cant."}
            </div>
            <input
              type="number"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              className={`${inputClass} w-full`}
              min="0.5"
              step="0.5"
            />
          </div>
          <div className="w-28">
            <div className="text-[#71717a] text-[9px] tracking-widest uppercase mb-1">
              {newType === "LABOR" ? "Tarifa/hr" : "P. unitario"}
            </div>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className={`${inputClass} w-full`}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <button
            type="button"
            onClick={addItem}
            disabled={!newDesc || !newPrice}
            className="bg-[#CC2229] text-white text-[10px] tracking-widest px-4 py-2 hover:bg-[#a81b21] transition-colors disabled:opacity-40"
          >
            AGREGAR
          </button>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-[#1a1a1c] border border-[#2a2a2e]">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] text-[9px] tracking-widest text-[#71717a] uppercase px-4 py-2 border-b border-[#2a2a2e] gap-3">
          <span>Tipo</span>
          <span>Descripción</span>
          <span>N° Pieza</span>
          <span>Cant.</span>
          <span>Precio</span>
          <span className="text-right">Total</span>
        </div>
        {items.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#71717a] text-xs">
            Sin partidas — agrega trabajo o piezas arriba
          </div>
        ) : (
          <div className="divide-y divide-[#2a2a2e]">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center px-4 py-2.5 gap-3 group"
              >
                <span
                  className={`text-[9px] tracking-widest px-1.5 py-0.5 border ${
                    item.type === "LABOR"
                      ? "border-blue-400/30 text-blue-400"
                      : "border-orange-400/30 text-orange-400"
                  }`}
                >
                  {item.type === "LABOR" ? "M.O." : "PIEZA"}
                </span>
                <span className="text-white text-xs">{item.description}</span>
                <span className="text-[#71717a] text-[10px] font-mono">
                  {item.partNumber || "—"}
                </span>
                <span className="text-[#71717a] text-xs">{item.quantity}</span>
                <span className="text-[#71717a] text-xs font-mono">
                  ${item.unitPrice.toFixed(2)}
                </span>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-white text-xs font-mono">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(idx)}
                    className="text-[#71717a] hover:text-[#CC2229] transition-colors opacity-0 group-hover:opacity-100 text-xs ml-1"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Totals */}
        <div className="border-t border-[#2a2a2e] px-4 py-4 space-y-2">
          <div className="flex justify-between text-xs text-[#71717a]">
            <span>Subtotal</span>
            <span className="font-mono">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-[#71717a]">
            <span>IVU (11.5%)</span>
            <span className="font-mono">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-white font-bold border-t border-[#2a2a2e] pt-2">
            <span>TOTAL</span>
            <span className="font-mono">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={saveEstimate}
          disabled={saving}
          className="bg-[#CC2229] text-white text-xs px-5 py-2.5 tracking-widest hover:bg-[#a81b21] transition-colors disabled:opacity-40"
        >
          {saving ? "GUARDANDO..." : "GUARDAR ESTIMADO"}
        </button>
        <button
          onClick={printPDF}
          className="border border-[#2a2a2e] text-[#71717a] text-xs px-5 py-2.5 tracking-widest hover:border-[#71717a] hover:text-white transition-colors"
        >
          EXPORTAR PDF
        </button>
      </div>
    </div>
  );
}
