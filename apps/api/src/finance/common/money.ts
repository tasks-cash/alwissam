export function generateClinicNumber(prefix: string): string {
  const now = new Date();
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  const stamp = `${String(now.getFullYear()).slice(2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const rand = String(100 + Math.floor(Math.random() * 900));
  return `${prefix}-${stamp}-${rand}`;
}

/** Fixed 2-decimal money strings — never use float for ledger math. */
export function moneyToFixed2(value: number | string): string {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("INVALID_MONEY");
    const scaled = Math.round(value * 100);
    const neg = scaled < 0;
    const abs = Math.abs(scaled).toString().padStart(3, "0");
    return `${neg ? "-" : ""}${abs.slice(0, -2)}.${abs.slice(-2)}`;
  }
  const raw = String(value).trim();
  if (!/^-?\d+(\.\d{1,2})?$/.test(raw)) throw new Error("INVALID_MONEY");
  const neg = raw.startsWith("-");
  const unsigned = neg ? raw.slice(1) : raw;
  const [whole, frac = ""] = unsigned.split(".");
  return `${neg ? "-" : ""}${whole}.${frac.padEnd(2, "0").slice(0, 2)}`;
}

function toCents(value: string): bigint {
  const neg = value.startsWith("-");
  const [w, f] = (neg ? value.slice(1) : value).split(".");
  const cents = BigInt(w) * 100n + BigInt((f || "00").padEnd(2, "0").slice(0, 2));
  return neg ? -cents : cents;
}

function fromCents(cents: bigint): string {
  const neg = cents < 0n;
  const abs = neg ? -cents : cents;
  const s = abs.toString().padStart(3, "0");
  return `${neg ? "-" : ""}${s.slice(0, -2)}.${s.slice(-2)}`;
}

export function moneyAdd(a: string, b: string): string {
  return fromCents(toCents(a) + toCents(b));
}

export function moneySub(a: string, b: string): string {
  return fromCents(toCents(a) - toCents(b));
}

export function moneyMax0(value: string): string {
  return toCents(value) < 0n ? "0.00" : value;
}

export function moneyLteZero(value: string): boolean {
  return toCents(value) <= 0n;
}
