import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Euromecanico Corp — Sistema de Gestión",
  description: "Sistema de gestión para Euromecanico Corp, especialistas en Porsche",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
