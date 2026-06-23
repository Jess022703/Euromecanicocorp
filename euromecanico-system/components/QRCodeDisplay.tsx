"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QRCodeDisplay({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 160,
        color: {
          dark: "#ffffff",
          light: "#1a1a1c",
        },
      });
    }
  }, [url]);

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
}
