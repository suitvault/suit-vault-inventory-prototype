import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BookingConflictError,
  BookingValidationError,
  createBooking,
  findBookingConflicts
} from "../src/lib/booking-conflicts.ts";
import { sampleInventoryItems } from "../src/lib/seed-data.ts";
import type { Booking, BookingRequest } from "../src/lib/types.ts";

const existingBookings: Booking[] = [
  {
    id: "booking-001",
    customerName: "Alex Morgan",
    inventoryItemIds: ["item-jacket-001", "item-pants-001"],
    startDate: "2026-06-10",
    endDate: "2026-06-14",
    status: "RESERVED"
  },
  {
    id: "booking-002",
    customerName: "Sam Lee",
    inventoryItemIds: ["item-vest-001"],
    startDate: "2026-06-18",
    endDate: "2026-06-20",
    status: "OUT_ON_HIRE"
  },
  {
    id: "booking-003",
    customerName: "Taylor Green",
    inventoryItemIds: ["item-jacket-002"],
    startDate: "2026-06-10",
    endDate: "2026-06-14",
    status: "CANCELLED"
  }
];

describe("booking conflict detection", () => {
  it("blocks an overlapping booking for the same inventory item", () => {
    const request: BookingRequest = {
      customerName: "Jordan Smith",
      inventoryItemIds: ["item-jacket-001"],
      startDate: "2026-06-12",
      endDate: "2026-06-16"
    };

    assert.throws(() => createBooking(existingBookings, request), BookingConflictError);
  });

  it("returns conflict details for every shared item in the overlap", () => {
    const conflicts = findBookingConflicts(existingBookings, {
      customerName: "Jordan Smith",
      inventoryItemIds: ["item-jacket-001", "item-pants-001"],
      startDate: "2026-06-09",
      endDate: "2026-06-10"
    });

    assert.equal(conflicts.length, 1);
    assert.deepEqual(conflicts[0]?.inventoryItemIds, ["item-jacket-001", "item-pants-001"]);
  });

  it("treats the return date as unavailable and blocks same-day overlap", () => {
    const request: BookingRequest = {
      customerName: "Jordan Smith",
      inventoryItemIds: ["item-pants-001"],
      startDate: "2026-06-14",
      endDate: "2026-06-15"
    };

    assert.throws(() => createBooking(existingBookings, request), BookingConflictError);
  });

  it("allows a booking that starts the day after an existing booking ends", () => {
    const booking = createBooking(existingBookings, {
      customerName: "Jordan Smith",
      inventoryItemIds: ["item-jacket-001"],
      startDate: "2026-06-15",
      endDate: "2026-06-18"
    });

    assert.equal(booking.status, "RESERVED");
    assert.deepEqual(booking.inventoryItemIds, ["item-jacket-001"]);
  });

  it("allows the same dates for a different inventory item", () => {
    const booking = createBooking(existingBookings, {
      customerName: "Jordan Smith",
      inventoryItemIds: ["item-jacket-005"],
      startDate: "2026-06-10",
      endDate: "2026-06-14"
    });

    assert.equal(booking.inventoryItemIds[0], "item-jacket-005");
  });

  it("ignores cancelled bookings when checking conflicts", () => {
    const booking = createBooking(existingBookings, {
      customerName: "Jordan Smith",
      inventoryItemIds: ["item-jacket-002"],
      startDate: "2026-06-12",
      endDate: "2026-06-13"
    });

    assert.equal(booking.inventoryItemIds[0], "item-jacket-002");
  });

  it("blocks a multi-item request when any requested item is already booked", () => {
    const request: BookingRequest = {
      customerName: "Jordan Smith",
      inventoryItemIds: ["item-chino-001", "item-vest-001"],
      startDate: "2026-06-19",
      endDate: "2026-06-21"
    };

    assert.throws(() => createBooking(existingBookings, request), BookingConflictError);
  });

  it("rejects booking inventory that is not currently available", () => {
    const request: BookingRequest = {
      customerName: "Jordan Smith",
      inventoryItemIds: ["item-jacket-003"],
      startDate: "2026-06-22",
      endDate: "2026-06-25"
    };

    assert.throws(
      () => createBooking(existingBookings, request, { inventoryItems: sampleInventoryItems }),
      BookingValidationError
    );
  });
});
