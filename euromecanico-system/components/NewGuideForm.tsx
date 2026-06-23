"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = { title: string; description: string; warning: string };

const CATEGORIES = ["Mantenimiento", "Frenos", "Suspensión", "Motor", "Eléctrico", "Transmisión", "Carrocería"];

export default function NewGuideForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("Mantenimiento");
  const [notes, setNotes] = useState("");
  const [steps, setSteps] = useState<Step[]>([
    { title: "", description: "", warning: "" },
  ]);

  function addStep() {
    setSteps([...steps, { title: "", description: "", warning: "" }]);
  }

  function removeStep(i: number) {
    setSteps(steps.filter((_, idx) => idx !== i));
  }

  function updateStep(i: number, field: keyof Step, value: string) {
    setSteps(steps.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/guides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, model, year, category, notes, steps }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/guides/${data.id}`);
    }
    setLoading(false);
  }

  const inputClass =
    "w-full bg-[#111112] border border-[#2a2a2e] text-white px-3 py-2 text-sm focus:outline-none focus:border-[#CC2229] transition-colors";
  const labelClass = "text-[#71717a] text-[10px] tracking-widest uppercase block mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-[#1a1a1c] border border-[#2a2a2e] p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelClass}>Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Modelo Porsche</label>
            <input value={model} onChange={(e) => setModel(e.target.value)} className={inputClass} required placeholder="ej. 911, Cayenne, Boxster" />
          </div>
          <div>
            <label className={labelClass}>Año (rango)</label>
            <input value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} placeholder="ej. 2018-2023" />
          </div>
          <div>
            <label className={labelClass}>Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Notas (opcional)</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="bg-[#1a1a1c] border border-[#2a2a2e] p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[#CC2229] text-[10px] tracking-widest font-bold">PASO {i + 1}</span>
              {steps.length > 1 && (
                <button type="button" onClick={() => removeStep(i)} className="text-[#71717a] text-xs hover:text-[#CC2229]">
                  × ELIMINAR
                </button>
              )}
            </div>
            <div className="space-y-2">
              <div>
                <label className={labelClass}>Título del paso</label>
                <input value={step.title} onChange={(e) => updateStep(i, "title", e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Descripción</label>
                <textarea value={step.description} onChange={(e) => updateStep(i, "description", e.target.value)} className={`${inputClass} resize-none`} rows={2} required />
              </div>
              <div>
                <label className={labelClass}>Advertencia (opcional)</label>
                <input value={step.warning} onChange={(e) => updateStep(i, "warning", e.target.value)} className={inputClass} placeholder="⚠ Precaución..." />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addStep}
        className="w-full border border-dashed border-[#2a2a2e] text-[#71717a] text-xs py-3 tracking-widest hover:border-[#71717a] hover:text-white transition-colors"
      >
        + AGREGAR PASO
      </button>

      <button
        type="submit"
        disabled={loading}
        className="bg-[#CC2229] text-white text-xs px-6 py-3 tracking-widest hover:bg-[#a81b21] transition-colors disabled:opacity-40"
      >
        {loading ? "GUARDANDO..." : "CREAR GUÍA"}
      </button>
    </form>
  );
}
