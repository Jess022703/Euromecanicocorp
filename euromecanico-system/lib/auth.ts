import { cookies } from "next/headers";

const PIN = process.env.SHOP_PIN || "1234";
const SESSION_COOKIE = "shop_session";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === "authenticated";
}

export function verifyPin(pin: string): boolean {
  return pin === PIN;
}

export { SESSION_COOKIE };
