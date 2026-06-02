export const inventoryCategories = ["JACKETS", "PANTS", "VESTS", "CHINOS"] as const;

export const inventoryStatuses = [
  "AVAILABLE",
  "RESERVED",
  "PICKING",
  "OUT_ON_HIRE",
  "RETURNED",
  "CLEANING",
  "REPAIR",
  "RETIRED"
] as const;

export const activeBookingStatuses = ["RESERVED", "PICKING", "OUT_ON_HIRE"] as const;

export type InventoryCategory = (typeof inventoryCategories)[number];
export type InventoryStatus = (typeof inventoryStatuses)[number];
export type ActiveBookingStatus = (typeof activeBookingStatuses)[number];
export type BookingStatus = ActiveBookingStatus | "RETURNED" | "CANCELLED";

export type InventoryItem = {
  id: string;
  sku: string;
  brand: string;
  styleName: string;
  category: InventoryCategory;
  colour: string;
  size: string;
  barcode: string;
  rackLocation: string;
  condition: string;
  status: InventoryStatus;
  purchaseCostCents: number;
  replacementCostCents: number;
  notes: string;
};

export type Booking = {
  id: string;
  bookingNumber?: string;
  customerName: string;
  customerEmail?: string;
  inventoryItemIds: string[];
  startDate: string;
  endDate: string;
  status: BookingStatus;
};

export type BookingRequest = {
  customerName: string;
  customerEmail?: string;
  inventoryItemIds: string[];
  startDate: string;
  endDate: string;
};

export type BookingConflict = {
  bookingId: string;
  inventoryItemIds: string[];
  startDate: string;
  endDate: string;
  status: BookingStatus;
};
