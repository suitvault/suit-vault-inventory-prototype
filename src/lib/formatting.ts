import type { Booking } from "./types.ts";

export function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0
  }).format(cents / 100);
}

export function formatBookingNumber(booking: Booking): string {
  return booking.bookingNumber ?? booking.id;
}
