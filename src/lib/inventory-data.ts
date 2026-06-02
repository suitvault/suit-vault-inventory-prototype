import { sampleBookings } from "./sample-bookings.ts";
import { sampleInventoryItems } from "./seed-data.ts";
import { isActiveBookingStatus } from "./booking-conflicts.ts";
import type { Booking, InventoryItem } from "./types.ts";

export function getInventoryItem(itemId: string): InventoryItem | undefined {
  return sampleInventoryItems.find((item) => item.id === itemId);
}

export function getInventoryItemsById(): Map<string, InventoryItem> {
  return new Map(sampleInventoryItems.map((item) => [item.id, item]));
}

export function getBookingsForItem(itemId: string, bookings: Booking[] = sampleBookings): Booking[] {
  return bookings
    .filter((booking) => booking.inventoryItemIds.includes(itemId))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function getUpcomingBookingsForItem(itemId: string, bookings: Booking[] = sampleBookings): Booking[] {
  return getBookingsForItem(itemId, bookings).filter((booking) => isActiveBookingStatus(booking.status));
}

export function getAssignedItemLabels(
  booking: Booking,
  inventoryItems: InventoryItem[] = sampleInventoryItems
): string[] {
  const inventoryById = new Map(inventoryItems.map((item) => [item.id, item]));

  return booking.inventoryItemIds.map((itemId) => {
    const item = inventoryById.get(itemId);
    return item ? `${item.barcode} ${item.styleName}` : itemId;
  });
}

export function getDashboardMetrics(bookings: Booking[] = sampleBookings) {
  const activeBookings = bookings.filter((booking) => isActiveBookingStatus(booking.status));

  return {
    totalItems: sampleInventoryItems.length,
    availableItems: sampleInventoryItems.filter((item) => item.status === "AVAILABLE").length,
    activeBookings: activeBookings.length,
    outOnHireItems: sampleInventoryItems.filter((item) => item.status === "OUT_ON_HIRE").length,
    needsAttentionItems: sampleInventoryItems.filter((item) =>
      ["CLEANING", "REPAIR", "RETIRED"].includes(item.status)
    ).length
  };
}

export function getStatusCounts() {
  return sampleInventoryItems.reduce<Record<string, number>>((counts, item) => {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
    return counts;
  }, {});
}
