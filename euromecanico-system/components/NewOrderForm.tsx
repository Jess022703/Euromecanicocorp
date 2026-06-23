"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Client = {
  id: string;
  name: string;
  phone: string;
  vehicles: { id: string; make: string; model: string; year: number; plate: string | null; vin: string }[];
};

export default function NewOrderForm({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  // New client/vehicle fields
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [vin, setVin] = useState("");
  const [plate, setPlate] = useState("");
  const [make, setMake] = useState("Porsche");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [color, setColor] = useState("");

  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        selectedClientId,
        selectedVehicleId,
        clientName,
        clientPhone,
        clientEmail,
        vin,
        plate,
        make,
        model,
        year: parseInt(year),
        color,
        description,
        notes,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/orders/${data.id}`);
    } else {
      const data = await res.json();
      setError(data.error || "Error al crear orden");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-[#111112] border border-[#2a2a2e] text-white px-3 py-2 text-sm focus:outline-none focus:border-[#CC2229] transition-colors";
  const labelClass =
    "text-[#71717a] text-[10px] tracking-widest uppercase block mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2">
        {(["existing", "new"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`text-[10px] tracking-widest px-4 py-2 border transition-colors ${
              mode === m
                ? "border-[#CC2229] text-[#CC2229]"
                : "border-[#2a2a2e] text-[#71717a] hover:border-[#71717a]"
            }`}
          >
            {m === "existing" ? "CLIENTE EXISTENTE" : "NUEVO CLIENTE"}
          </button>
        ))}
      </div>

      {mode === "existing" ? (
        <div className="bg-[#1a1a1c] border border-[#2a2a2e] p-4 space-y-3">
          <div>
            <label className={labelClass}>Cliente</label>
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                setSelectedVehicleId("");
              }}
              className={inputClass}
              required
            >
              <option value="">Seleccionar cliente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {selectedClient && (
            <div>
              <label className={labelClass}>Vehículo</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">Seleccionar vehículo...</option>
                {selectedClient.vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.year} {v.make} {v.model}{v.plate ? ` — ${v.plate}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#1a1a1c] border border-[#2a2a2e] p-4 space-y-3">
          <div className="text-[#71717a] text-[10px] tracking-widest uppercase border-b border-[#2a2a2e] pb-2 mb-3">
            Datos del cliente
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nombre</label>
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className={inputClass} required />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email (opcional)</label>
            <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className={inputClass} />
          </div>

          <div className="text-[#71717a] text-[10px] tracking-widest uppercase border-b border-[#2a2a2e] pb-2 mt-4 mb-3">
            Datos del vehículo
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Marca</label>
              <input value={make} onChange={(e) => setMake(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Modelo</label>
              <input value={model} onChange={(e) => setModel(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Año</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>VIN</label>
              <input value={vin} onChange={(e) => setVin(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Tablilla</label>
              <input value={plate} onChange={(e) => setPlate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Color</label>
              <input value={color} onChange={(e) => setColor(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>
      )}

      {/* Work description */}
      <div className="bg-[#1a1a1c] border border-[#2a2a2e] p-4 space-y-3">
        <div>
          <label className={labelClass}>Descripción del trabajo</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-none`}
            rows={3}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Notas internas (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClass} resize-none`}
            rows={2}
          />
        </div>
      </div>

      {error && (
        <div className="text-[#CC2229] text-xs">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-[#CC2229] text-white text-xs px-6 py-3 tracking-widest hover:bg-[#a81b21] transition-colors disabled:opacity-40"
      >
        {loading ? "CREANDO..." : "CREAR ORDEN"}
      </button>
    </form>
  );
}
