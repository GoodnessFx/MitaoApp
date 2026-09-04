export type SourcingProviderKey = "cj_dropshipping_sandbox";

export type ProcurementStatus =
  | "submitted"
  | "purchased"
  | "warehouse_received"
  | "international_transit"
  | "customs_clearance"
  | "local_hub"
  | "out_for_delivery"
  | "delivered";

export type CustomerOrderStatus = "Processing" | "In Transit" | "Out for delivery" | "Delivered";

export interface SupplierProduct {
  id: string;
  publicProductId: number;
  provider: SourcingProviderKey;
  providerProductId: string;
  supplierId: string;
  supplierName: string;
  rawTitle: string;
  rawCurrency: "CNY";
  rawWholesalePrice: number;
  moq: number;
  tierPricing: Array<{ minQty: number; price: number }>;
  attributes: Record<string, string>;
  imageSet: string[];
  sourceUrl: string;
  categoryHint: string;
  lastSyncedAt: string;
}

export interface ProviderCartItem {
  productId: number;
  providerProductId: string;
  supplierId: string;
  supplierName: string;
  title: string;
  quantity: number;
  unitCost: number;
}

export interface ShippingAddress {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

export interface ProviderOrderReceipt {
  providerOrderId: string;
  providerTrackingId: string;
  status: ProcurementStatus;
  supplierId: string;
  supplierName: string;
  costPaid: number;
  estimatedDeliveryWindow: string;
  createdAt: string;
}

export interface ProcurementStatusSnapshot {
  status: ProcurementStatus;
  label: string;
  customerStatus: CustomerOrderStatus;
  progress: number;
  updatedAt: string;
}

export interface SourcingProvider {
  name: SourcingProviderKey;
  searchCatalog(query: string): Promise<SupplierProduct[]>;
  getProductDetail(providerId: string): Promise<SupplierProduct | undefined>;
  placeOrder(cartItems: ProviderCartItem[], shippingAddress: ShippingAddress): Promise<ProviderOrderReceipt>;
  getOrderStatus(providerOrderId: string): Promise<ProcurementStatusSnapshot>;
}

const PROCUREMENT_FLOW: Array<{
  status: ProcurementStatus;
  label: string;
  customerStatus: CustomerOrderStatus;
}> = [
  { status: "submitted", label: "Submitted to sourcing team", customerStatus: "Processing" },
  { status: "purchased", label: "Purchased from supplier", customerStatus: "Processing" },
  { status: "warehouse_received", label: "Received at consolidation warehouse", customerStatus: "In Transit" },
  { status: "international_transit", label: "In international transit", customerStatus: "In Transit" },
  { status: "customs_clearance", label: "Clearing customs", customerStatus: "In Transit" },
  { status: "local_hub", label: "At local delivery hub", customerStatus: "Out for delivery" },
  { status: "out_for_delivery", label: "Out for delivery", customerStatus: "Out for delivery" },
  { status: "delivered", label: "Delivered", customerStatus: "Delivered" },
];

const STATUS_STEP_MS = 45_000;

function seededNumber(seed: string, min: number, max: number) {
  const total = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return min + (total % (max - min + 1));
}

function safeSlug(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase() || "SUPPLIER";
}

function parseCreatedAtFromProviderOrderId(providerOrderId: string) {
  const [, createdAtPart] = providerOrderId.split("-");
  const createdAt = Number(createdAtPart);
  return Number.isFinite(createdAt) ? createdAt : Date.now();
}

export function getProcurementSnapshotFromCreatedAt(createdAtMs: number): ProcurementStatusSnapshot {
  const elapsed = Math.max(0, Date.now() - createdAtMs);
  const step = Math.min(PROCUREMENT_FLOW.length - 1, Math.floor(elapsed / STATUS_STEP_MS));
  const current = PROCUREMENT_FLOW[step];

  return {
    status: current.status,
    label: current.label,
    customerStatus: current.customerStatus,
    progress: Math.round(((step + 1) / PROCUREMENT_FLOW.length) * 100),
    updatedAt: new Date(createdAtMs + step * STATUS_STEP_MS).toISOString(),
  };
}

export function mapProcurementStatusToCustomerStatus(status: ProcurementStatus): CustomerOrderStatus {
  return PROCUREMENT_FLOW.find((entry) => entry.status === status)?.customerStatus ?? "Processing";
}

export class CJDropshippingSandboxProvider implements SourcingProvider {
  name: SourcingProviderKey = "cj_dropshipping_sandbox";

  constructor(private readonly readSupplierProducts: () => SupplierProduct[]) {}

  async searchCatalog(query: string) {
    const term = query.trim().toLowerCase();
    if (!term) return this.readSupplierProducts().slice(0, 24);

    return this.readSupplierProducts().filter((item) =>
      [item.rawTitle, item.supplierName, item.categoryHint].some((value) => value.toLowerCase().includes(term))
    );
  }

  async getProductDetail(providerId: string) {
    return this.readSupplierProducts().find((item) => item.providerProductId === providerId);
  }

  async placeOrder(cartItems: ProviderCartItem[], shippingAddress: ShippingAddress) {
    const firstItem = cartItems[0];
    const createdAtMs = Date.now();
    const providerOrderId = `CJ-${createdAtMs}-${safeSlug(firstItem.supplierId)}`;
    const providerTrackingId = `CN-${createdAtMs.toString().slice(-6)}-${safeSlug(shippingAddress.country)}`;
    const subtotal = cartItems.reduce((sum, item) => sum + item.unitCost * item.quantity, 0);
    const handling = subtotal * 0.06;
    const consolidation = Math.max(6, cartItems.length * 2.4);

    return {
      providerOrderId,
      providerTrackingId,
      status: "submitted",
      supplierId: firstItem.supplierId,
      supplierName: firstItem.supplierName,
      costPaid: Number((subtotal + handling + consolidation).toFixed(2)),
      estimatedDeliveryWindow: `${seededNumber(firstItem.supplierId, 7, 10)}-${seededNumber(firstItem.supplierName, 11, 16)} business days`,
      createdAt: new Date(createdAtMs).toISOString(),
    };
  }

  async getOrderStatus(providerOrderId: string) {
    return getProcurementSnapshotFromCreatedAt(parseCreatedAtFromProviderOrderId(providerOrderId));
  }
}
