// Client-side cart kept per vendor, since checkout is per-vendor (the
// spec requires a separate cart/checkout flow for each supplier).
export interface CartLine {
  productId: string;
  name: string;
  quantity: number;
}

export interface VendorCart {
  vendorId: string;
  lines: CartLine[];
}

const STORAGE_KEY = "nexar_carts";

function readAll(): VendorCart[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeAll(carts: VendorCart[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carts));
}

export function getCarts(): VendorCart[] {
  return readAll();
}

export function getCart(vendorId: string): VendorCart | undefined {
  return readAll().find((c) => c.vendorId === vendorId);
}

export function addToCart(vendorId: string, productId: string, name: string, quantity: number) {
  const carts = readAll();
  let cart = carts.find((c) => c.vendorId === vendorId);
  if (!cart) {
    cart = { vendorId, lines: [] };
    carts.push(cart);
  }
  const line = cart.lines.find((l) => l.productId === productId);
  if (line) {
    line.quantity += quantity;
  } else {
    cart.lines.push({ productId, name, quantity });
  }
  writeAll(carts);
}

export function removeFromCart(vendorId: string, productId: string) {
  const carts = readAll()
    .map((c) => (c.vendorId === vendorId ? { ...c, lines: c.lines.filter((l) => l.productId !== productId) } : c))
    .filter((c) => c.lines.length > 0);
  writeAll(carts);
}

export function clearCart(vendorId: string) {
  writeAll(readAll().filter((c) => c.vendorId !== vendorId));
}
