"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError("PIN incorrecto");
      setPin("");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#111112] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="border border-[#2a2a2e] bg-[#1a1a1c] p-8">
          <div className="mb-8">
            <div className="text-[#CC2229] text-xs tracking-widest uppercase mb-1">
              EUROMECANICO CORP
            </div>
            <div className="text-white text-xl font-bold tracking-tight">
              ACCESO AL TALLER
            </div>
            <div className="text-[#71717a] text-xs mt-1">
              Sistema de gestión interno
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[#71717a] text-xs tracking-widest uppercase block mb-2">
                PIN de acceso
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-[#111112] border border-[#2a2a2e] text-white px-3 py-2 text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-[#CC2229] transition-colors"
                maxLength={6}
                autoFocus
                placeholder="••••"
              />
            </div>

            {error && (
              <div className="text-[#CC2229] text-xs text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || pin.length === 0}
              className="w-full bg-[#CC2229] text-white py-2 text-sm tracking-widest uppercase font-bold disabled:opacity-40 hover:bg-[#a81b21] transition-colors"
            >
              {loading ? "VERIFICANDO..." : "ENTRAR"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
