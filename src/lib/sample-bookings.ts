import type { Booking } from "./types.ts";

export const sampleBookings: Booking[] = [
  {
    id: "booking-001",
    bookingNumber: "B-1001",
    customerName: "Alex Morgan",
    customerEmail: "alex@example.com",
    inventoryItemIds: ["item-jacket-001", "item-pants-001"],
    startDate: "2026-06-10",
    endDate: "2026-06-14",
    status: "RESERVED"
  },
  {
    id: "booking-002",
    bookingNumber: "B-1002",
    customerName: "Sam Lee",
    customerEmail: "sam@example.com",
    inventoryItemIds: ["item-vest-001"],
    startDate: "2026-06-18",
    endDate: "2026-06-20",
    status: "OUT_ON_HIRE"
  },
  {
    id: "booking-003",
    bookingNumber: "B-1003",
    customerName: "Chris Patel",
    customerEmail: "chris@example.com",
    inventoryItemIds: ["item-pants-003"],
    startDate: "2026-06-03",
    endDate: "2026-06-08",
    status: "PICKING"
  },
  {
    id: "booking-004",
    bookingNumber: "B-1004",
    customerName: "Jamie Chen",
    customerEmail: "jamie@example.com",
    inventoryItemIds: ["item-pants-005"],
    startDate: "2026-05-29",
    endDate: "2026-06-05",
    status: "OUT_ON_HIRE"
  },
  {
    id: "booking-005",
    bookingNumber: "B-1005",
    customerName: "Morgan Ruiz",
    customerEmail: "morgan@example.com",
    inventoryItemIds: ["item-chino-003"],
    startDate: "2026-06-07",
    endDate: "2026-06-10",
    status: "PICKING"
  },
  {
    id: "booking-006",
    bookingNumber: "B-1006",
    customerName: "Taylor Green",
    customerEmail: "taylor@example.com",
    inventoryItemIds: ["item-jacket-002"],
    startDate: "2026-06-10",
    endDate: "2026-06-14",
    status: "CANCELLED"
  }
];
