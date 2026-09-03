// Mapping provider status (DSFulfill) to customer timeline status
export type ProcurementStatus =
  | 'submitted'
  | 'purchased'
  | 'warehouse_received'
  | 'international_transit'
  | 'customs_clearance'
  | 'local_hub'
  | 'out_for_delivery'
  | 'delivered';

export type CustomerOrderStatus = 'Processing' | 'In Transit' | 'Out for delivery' | 'Delivered' | 'Cancelled';

const PROCUREMENT_FLOW: Array<{
  status: ProcurementStatus;
  label: string;
  customerStatus: CustomerOrderStatus;
}> = [
  { status: 'submitted', label: 'Submitted to sourcing team', customerStatus: 'Processing' },
  { status: 'purchased', label: 'Purchased from supplier', customerStatus: 'Processing' },
  { status: 'warehouse_received', label: 'Received at consolidation warehouse', customerStatus: 'In Transit' },
  { status: 'international_transit', label: 'In international transit', customerStatus: 'In Transit' },
  { status: 'customs_clearance', label: 'Clearing customs', customerStatus: 'In Transit' },
  { status: 'local_hub', label: 'At local delivery hub', customerStatus: 'Out for delivery' },
  { status: 'out_for_delivery', label: 'Out for delivery', customerStatus: 'Out for delivery' },
  { status: 'delivered', label: 'Delivered', customerStatus: 'Delivered' },
];

export function mapProcurementStatusToCustomerStatus(status: ProcurementStatus): CustomerOrderStatus {
  return PROCUREMENT_FLOW.find((entry) => entry.status === status)?.customerStatus ?? 'Processing';
}

export function getStatusLabel(status: ProcurementStatus): string {
  return PROCUREMENT_FLOW.find((entry) => entry.status === status)?.label ?? 'Unknown status';
}

export function getStatusProgress(status: ProcurementStatus): number {
  const index = PROCUREMENT_FLOW.findIndex((entry) => entry.status === status);
  if (index === -1) return 0;
  return Math.round(((index + 1) / PROCUREMENT_FLOW.length) * 100);
}
