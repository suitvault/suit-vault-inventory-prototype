import type { Booking } from "./types.ts";

const storageKey = "suit-vault-created-bookings";

export function readCreatedBookings(): Booking[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return [];
  }

  try {
    const bookings = JSON.parse(raw) as Booking[];
    return Array.isArray(bookings) ? bookings : [];
  } catch {
    return [];
  }
}

export function saveCreatedBooking(booking: Booking): Booking[] {
  const bookings = [...readCreatedBookings(), booking];
  window.localStorage.setItem(storageKey, JSON.stringify(bookings));
  window.dispatchEvent(new Event("suit-vault-bookings-updated"));
  return bookings;
}

export function subscribeToCreatedBookings(listener: () => void): () => void {
  window.addEventListener("storage", listener);
  window.addEventListener("suit-vault-bookings-updated", listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("suit-vault-bookings-updated", listener);
  };
}
