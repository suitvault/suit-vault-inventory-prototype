import { activeBookingStatuses } from "./types.ts";
import type { Booking, BookingConflict, BookingRequest, BookingStatus, InventoryItem } from "./types.ts";

const dayPattern = /^\d{4}-\d{2}-\d{2}$/;

export class BookingConflictError extends Error {
  readonly conflicts: BookingConflict[];

  constructor(conflicts: BookingConflict[]) {
    super("Booking overlaps an existing booking for one or more inventory items.");
    this.name = "BookingConflictError";
    this.conflicts = conflicts;
  }
}

export class BookingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingValidationError";
  }
}

export function createBooking(
  existingBookings: Booking[],
  request: BookingRequest,
  options: { inventoryItems?: InventoryItem[]; id?: string; status?: BookingStatus } = {}
): Booking {
  validateBookingRequest(request);
  assertInventoryItemsCanBeBooked(request.inventoryItemIds, options.inventoryItems);

  const conflicts = findBookingConflicts(existingBookings, request);
  if (conflicts.length > 0) {
    throw new BookingConflictError(conflicts);
  }

  return {
    id: options.id ?? crypto.randomUUID(),
    customerName: request.customerName,
    customerEmail: request.customerEmail,
    inventoryItemIds: [...new Set(request.inventoryItemIds)],
    startDate: request.startDate,
    endDate: request.endDate,
    status: options.status ?? "RESERVED"
  };
}

export function findBookingConflicts(existingBookings: Booking[], request: BookingRequest): BookingConflict[] {
  validateBookingRequest(request);

  const requestedItemIds = new Set(request.inventoryItemIds);
  const requestStart = parseDateOnly(request.startDate);
  const requestEnd = parseDateOnly(request.endDate);

  return existingBookings.flatMap((booking) => {
    if (!isActiveBookingStatus(booking.status)) {
      return [];
    }

    const sharedItemIds = booking.inventoryItemIds.filter((itemId) => requestedItemIds.has(itemId));
    if (sharedItemIds.length === 0) {
      return [];
    }

    const bookingStart = parseDateOnly(booking.startDate);
    const bookingEnd = parseDateOnly(booking.endDate);

    if (!dateRangesOverlap(requestStart, requestEnd, bookingStart, bookingEnd)) {
      return [];
    }

    return [
      {
        bookingId: booking.id,
        inventoryItemIds: sharedItemIds,
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status
      }
    ];
  });
}

export function dateRangesOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA <= endB && startB <= endA;
}

export function isActiveBookingStatus(status: BookingStatus): boolean {
  return activeBookingStatuses.includes(status as never);
}

function assertInventoryItemsCanBeBooked(requestedItemIds: string[], inventoryItems?: InventoryItem[]): void {
  if (!inventoryItems) {
    return;
  }

  const inventoryById = new Map(inventoryItems.map((item) => [item.id, item]));

  for (const itemId of requestedItemIds) {
    const item = inventoryById.get(itemId);
    if (!item) {
      throw new BookingValidationError(`Inventory item ${itemId} does not exist.`);
    }

    if (item.status !== "AVAILABLE") {
      throw new BookingValidationError(`Inventory item ${item.sku} is ${item.status} and cannot be booked.`);
    }
  }
}

function validateBookingRequest(request: BookingRequest): void {
  if (!request.customerName.trim()) {
    throw new BookingValidationError("Customer name is required.");
  }

  if (request.inventoryItemIds.length === 0) {
    throw new BookingValidationError("At least one inventory item is required.");
  }

  if (new Set(request.inventoryItemIds).size !== request.inventoryItemIds.length) {
    throw new BookingValidationError("Booking request contains duplicate inventory item ids.");
  }

  const start = parseDateOnly(request.startDate);
  const end = parseDateOnly(request.endDate);

  if (start > end) {
    throw new BookingValidationError("Booking start date must be on or before end date.");
  }
}

function parseDateOnly(value: string): number {
  if (!dayPattern.test(value)) {
    throw new BookingValidationError(`Invalid date ${value}. Use YYYY-MM-DD.`);
  }

  const time = Date.parse(`${value}T00:00:00.000Z`);
  if (Number.isNaN(time)) {
    throw new BookingValidationError(`Invalid date ${value}. Use YYYY-MM-DD.`);
  }

  return time;
}
