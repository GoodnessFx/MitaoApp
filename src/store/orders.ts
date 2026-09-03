import type { CartItem } from "./cart";
import { catalogStore } from "./catalog";
import {
  getProcurementSnapshotFromCreatedAt,
  sourcingProviderRegistry,
  type CustomerOrderStatus,
  type ShippingAddress,
} from "./sourcingProvider";

type Listener = () => void;

export interface CustomerOrderLineItem {
  productId: number;
  title: string;
  image: string;
  unitPrice: number;
  quantity: number;
  sellerLabel: string;
  shipmentKey: string;
}

export interface ProcurementOrderRecord {
  id: string;
  customerOrderId: string;
  provider: "dsfulfill_sandbox" | "mitao_catalog";
  providerOrderId: string;
  providerTrackingId: string;
  publicTrackingRef: string | null;
  supplierId: string;
  supplierName: string;
  shipmentLabel: string;
  status: string;
  customerStatus: CustomerOrderStatus;
  progress: number;
  costPaid: number;
  estimatedDeliveryWindow: string;
  createdAt: string;
  updatedAt: string;
  itemProductIds: number[];
}

export interface CustomerOrderRecord {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: CustomerOrderStatus;
  subtotal: number;
  total: number;
  currency: "USD";
  paymentLabel: string;
  shippingAddress: ShippingAddress;
  items: CustomerOrderLineItem[];
  procurementOrderIds: string[];
  shipmentCount: number;
}

const CUSTOMER_ORDERS_KEY = "mitao.orders.customer.v2";
const PROCUREMENT_ORDERS_KEY = "mitao.orders.procurement.v2";

const STATUS_RANK: Record<CustomerOrderStatus, number> = {
  Processing: 0,
  "In Transit": 1,
  "Out for delivery": 2,
  Delivered: 3,
};

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures in restricted environments.
  }
}

function publicTrackingRef(seed: string, shipmentNumber: number) {
  return `MT-TRK-${seed.slice(-6)}-${shipmentNumber}`;
}

function formatSeedOrderNumber(seed: number) {
  const year = new Date().getFullYear();
  return `MT-${year}-${String(seed).slice(-4)}`;
}

function buildDomesticReceipt(groupLabel: string) {
  const createdAtMs = Date.now();
  return {
    providerOrderId: `MITAO-${createdAtMs}-LOCAL`,
    providerTrackingId: `MITAO-INT-${String(createdAtMs).slice(-6)}`,
    status: "warehouse_received",
    supplierId: "mitao-local",
    supplierName: groupLabel,
    costPaid: 0,
    estimatedDeliveryWindow: "3-6 business days",
    createdAt: new Date(createdAtMs).toISOString(),
  };
}

function hydrateOrders(
  customerOrders: CustomerOrderRecord[],
  procurementOrders: ProcurementOrderRecord[]
) {
  const refreshedProcurement = procurementOrders.map((shipment) => {
    const snapshot = getProcurementSnapshotFromCreatedAt(new Date(shipment.createdAt).getTime());
    return {
      ...shipment,
      status: snapshot.status,
      customerStatus: snapshot.customerStatus,
      progress: snapshot.progress,
      updatedAt: snapshot.updatedAt,
    };
  });

  const refreshedCustomer = customerOrders.map((order) => {
    const shipments = refreshedProcurement.filter((shipment) => order.procurementOrderIds.includes(shipment.id));
    const lowestRank = shipments.reduce((min, shipment) => Math.min(min, STATUS_RANK[shipment.customerStatus]), 99);
    const status =
      (Object.entries(STATUS_RANK).find(([, rank]) => rank === lowestRank)?.[0] as CustomerOrderStatus | undefined) ??
      "Processing";

    return {
      ...order,
      status,
      shipmentCount: shipments.length,
    };
  });

  return {
    customerOrders: refreshedCustomer.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    procurementOrders: refreshedProcurement,
  };
}

function createSeedState() {
  const seeds = [
    {
      createdAt: new Date(Date.now() - 25_000).toISOString(),
      items: [
        { productId: 3, quantity: 1 },
        { productId: 6, quantity: 2 },
      ],
      paymentLabel: "Visa •••• 3456",
      shippingAddress: {
        name: "Jamie Chen",
        email: "jamie@email.com",
        address: "17 Admiralty Way",
        city: "Lekki",
        zip: "106104",
        country: "Nigeria",
      },
    },
    {
      createdAt: new Date(Date.now() - 150_000).toISOString(),
      items: [{ productId: 1, quantity: 1 }],
      paymentLabel: "PayPal",
      shippingAddress: {
        name: "Jamie Chen",
        email: "jamie@email.com",
        address: "17 Admiralty Way",
        city: "Lekki",
        zip: "106104",
        country: "Nigeria",
      },
    },
    {
      createdAt: new Date(Date.now() - 390_000).toISOString(),
      items: [
        { productId: 5, quantity: 1 },
        { productId: 14, quantity: 3 },
      ],
      paymentLabel: "Apple Pay",
      shippingAddress: {
        name: "Jamie Chen",
        email: "jamie@email.com",
        address: "17 Admiralty Way",
        city: "Lekki",
        zip: "106104",
        country: "Nigeria",
      },
    },
  ];

  const customerOrders: CustomerOrderRecord[] = [];
  const procurementOrders: ProcurementOrderRecord[] = [];

  seeds.forEach((seed, orderIndex) => {
    const items = seed.items.flatMap((entry) => {
      const product = catalogStore.getById(entry.productId);
      if (!product) return [];
      return [
        {
          productId: product.id,
          title: product.title,
          image: product.image,
          unitPrice: product.price,
          quantity: entry.quantity,
          sellerLabel: product.seller.name,
          shipmentKey: `${orderIndex + 1}-1`,
        },
      ];
    });
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const orderId = `customer-order-${orderIndex + 1}`;
    const shipmentId = `shipment-${orderIndex + 1}`;
    const seedCreatedAt = seed.createdAt;
    const snapshot = getProcurementSnapshotFromCreatedAt(new Date(seedCreatedAt).getTime());

    customerOrders.push({
      id: orderId,
      orderNumber: formatSeedOrderNumber(Date.now() + orderIndex * 73),
      createdAt: seedCreatedAt,
      status: snapshot.customerStatus,
      subtotal,
      total: subtotal,
      currency: "USD",
      paymentLabel: seed.paymentLabel,
      shippingAddress: seed.shippingAddress,
      items,
      procurementOrderIds: [shipmentId],
      shipmentCount: 1,
    });

    procurementOrders.push({
      id: shipmentId,
      customerOrderId: orderId,
      provider: "mitao_catalog",
      providerOrderId: `MITAO-${new Date(seedCreatedAt).getTime()}-LOCAL`,
      providerTrackingId: `MITAO-INT-${String(orderIndex + 1).padStart(3, "0")}`,
      publicTrackingRef: snapshot.customerStatus === "Processing" ? null : publicTrackingRef(String(Date.now() + orderIndex * 39), 1),
      supplierId: "mitao-local",
      supplierName: "Mitao Local Fulfillment",
      shipmentLabel: "Shipment 1",
      status: snapshot.status,
      customerStatus: snapshot.customerStatus,
      progress: snapshot.progress,
      costPaid: Number((subtotal * 0.58).toFixed(2)),
      estimatedDeliveryWindow: "3-6 business days",
      createdAt: seedCreatedAt,
      updatedAt: snapshot.updatedAt,
      itemProductIds: items.map((item) => item.productId),
    });
  });

  return { customerOrders, procurementOrders };
}

let seedState = createSeedState();
let customerOrders: CustomerOrderRecord[] = safeParse(
  typeof window !== "undefined" ? localStorage.getItem(CUSTOMER_ORDERS_KEY) : null,
  seedState.customerOrders
);
let procurementOrders: ProcurementOrderRecord[] = safeParse(
  typeof window !== "undefined" ? localStorage.getItem(PROCUREMENT_ORDERS_KEY) : null,
  seedState.procurementOrders
);

const listeners: Set<Listener> = new Set();

function persist() {
  safeWrite(CUSTOMER_ORDERS_KEY, customerOrders);
  safeWrite(PROCUREMENT_ORDERS_KEY, procurementOrders);
}

function notify() {
  listeners.forEach((listener) => listener());
}

function refreshState() {
  const hydrated = hydrateOrders(customerOrders, procurementOrders);
  customerOrders = hydrated.customerOrders;
  procurementOrders = hydrated.procurementOrders;
  persist();
  return hydrated;
}

export const ordersStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getAll() {
    return refreshState().customerOrders;
  },
  getProcurementOrders(orderId: string) {
    refreshState();
    return procurementOrders.filter((shipment) => shipment.customerOrderId === orderId);
  },
  refresh() {
    const hydrated = refreshState();
    notify();
    return hydrated.customerOrders;
  },
  async placeOrder(input: {
    cartItems: CartItem[];
    shippingAddress: ShippingAddress;
    paymentLabel: string;
  }) {
    const items = input.cartItems.flatMap((cartItem) => {
      const product = catalogStore.getById(cartItem.productId);
      if (!product) return [];

      const supplierRecord = catalogStore.getSupplierProductByPublicId(product.id);
      return [
        {
          productId: product.id,
          title: product.title,
          image: product.image,
          unitPrice: product.price,
          quantity: cartItem.quantity,
          sellerLabel: product.seller.name,
          provider: supplierRecord ? "dsfulfill_sandbox" : ("mitao_catalog" as const),
          supplierId: supplierRecord?.supplierId ?? "mitao-local",
          supplierName: supplierRecord?.supplierName ?? "Mitao Local Fulfillment",
          providerProductId: supplierRecord?.providerProductId ?? `local-${product.id}`,
        },
      ];
    });

    if (items.length === 0) {
      throw new Error("Your cart is empty.");
    }

    const orderSeed = Date.now();
    const orderId = `customer-order-${orderSeed}`;
    const groupedItems = items.reduce<Record<string, typeof items>>((groups, item) => {
      const key = `${item.provider}:${item.supplierId}`;
      groups[key] = [...(groups[key] ?? []), item];
      return groups;
    }, {});

    const procurementForOrder: ProcurementOrderRecord[] = [];
    const procurementOrderIds: string[] = [];

    for (const [shipmentIndex, [groupKey, groupItems]] of Object.entries(groupedItems).entries()) {
      const [provider] = groupKey.split(":");
      const createdAt = new Date().toISOString();
      const receipt =
        provider === "dsfulfill_sandbox"
          ? await sourcingProviderRegistry.dsfulfill_sandbox.placeOrder(
              groupItems.map((item) => ({
                productId: item.productId,
                providerProductId: item.providerProductId,
                supplierId: item.supplierId,
                supplierName: item.supplierName,
                title: item.title,
                quantity: item.quantity,
                unitCost: Number((item.unitPrice * 0.58).toFixed(2)),
              })),
              input.shippingAddress
            )
          : buildDomesticReceipt(groupItems[0].supplierName);

      const snapshot = getProcurementSnapshotFromCreatedAt(new Date(receipt.createdAt ?? createdAt).getTime());
      const shipmentId = `shipment-${orderSeed}-${shipmentIndex + 1}`;

      procurementForOrder.push({
        id: shipmentId,
        customerOrderId: orderId,
        provider: provider === "dsfulfill_sandbox" ? "dsfulfill_sandbox" : "mitao_catalog",
        providerOrderId: receipt.providerOrderId,
        providerTrackingId: receipt.providerTrackingId,
        publicTrackingRef: snapshot.customerStatus === "Processing" ? null : publicTrackingRef(String(orderSeed), shipmentIndex + 1),
        supplierId: receipt.supplierId,
        supplierName: receipt.supplierName,
        shipmentLabel: `Shipment ${shipmentIndex + 1}`,
        status: snapshot.status,
        customerStatus: snapshot.customerStatus,
        progress: snapshot.progress,
        costPaid: receipt.costPaid,
        estimatedDeliveryWindow: receipt.estimatedDeliveryWindow,
        createdAt: receipt.createdAt,
        updatedAt: snapshot.updatedAt,
        itemProductIds: groupItems.map((item) => item.productId),
      });
      procurementOrderIds.push(shipmentId);
    }

    const orderItems: CustomerOrderLineItem[] = items.map((item) => ({
      productId: item.productId,
      title: item.title,
      image: item.image,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      sellerLabel: item.sellerLabel,
      shipmentKey: `${item.provider}:${item.supplierId}`,
    }));

    const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const hydratedShipments = hydrateOrders([], procurementForOrder).procurementOrders;
    const lowestRank = hydratedShipments.reduce(
      (min, shipment) => Math.min(min, STATUS_RANK[shipment.customerStatus]),
      STATUS_RANK.Delivered
    );
    const status =
      (Object.entries(STATUS_RANK).find(([, rank]) => rank === lowestRank)?.[0] as CustomerOrderStatus | undefined) ??
      "Processing";

    const order: CustomerOrderRecord = {
      id: orderId,
      orderNumber: formatSeedOrderNumber(orderSeed),
      createdAt: new Date().toISOString(),
      status,
      subtotal,
      total: subtotal,
      currency: "USD",
      paymentLabel: input.paymentLabel,
      shippingAddress: input.shippingAddress,
      items: orderItems,
      procurementOrderIds,
      shipmentCount: procurementOrderIds.length,
    };

    customerOrders = [order, ...customerOrders];
    procurementOrders = [...procurementForOrder, ...procurementOrders];
    refreshState();
    notify();

    return order;
  },
};
