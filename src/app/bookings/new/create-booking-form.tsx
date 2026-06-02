"use client";

import { useEffect, useMemo, useState } from "react";
import { saveCreatedBooking, readCreatedBookings } from "@/lib/browser-booking-store";
import { readInventoryItems, subscribeToInventory } from "@/lib/browser-inventory-store";
import { BookingConflictError, BookingValidationError, createBooking } from "@/lib/booking-conflicts";
import { formatBookingNumber, formatEnumLabel } from "@/lib/formatting";
import { getAssignedItemLabels } from "@/lib/inventory-data";
import { sampleBookings } from "@/lib/sample-bookings";
import type { Booking, BookingRequest, InventoryItem } from "@/lib/types";

type FormMode = "check" | "create";
type ResultState =
  | { kind: "idle" }
  | { kind: "success"; message: string; booking?: Booking }
  | { kind: "error"; message: string; details?: string[] };

export function CreateBookingForm() {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => readInventoryItems());
  const [inventoryItemId, setInventoryItemId] = useState(() => readInventoryItems()[0]?.id ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState<ResultState>({ kind: "idle" });

  useEffect(() => {
    const refresh = () => {
      const items = readInventoryItems();
      setInventoryItems(items);
      setInventoryItemId((currentItemId) => currentItemId || items[0]?.id || "");
    };

    refresh();
    return subscribeToInventory(refresh);
  }, []);

  const selectedItem = useMemo(
    () => inventoryItems.find((item) => item.id === inventoryItemId),
    [inventoryItemId, inventoryItems]
  );

  function buildRequest(): BookingRequest {
    return {
      customerName,
      customerEmail: customerEmail || undefined,
      inventoryItemIds: [inventoryItemId],
      startDate,
      endDate
    };
  }

  function handleAction(mode: FormMode) {
    const existingBookings = [...sampleBookings, ...readCreatedBookings()];
    const request = buildRequest();

    try {
      const booking = createBooking(existingBookings, request, {
        inventoryItems,
        id: `booking-${Date.now()}`
      });

      if (mode === "check") {
        setResult({
          kind: "success",
          message: `${selectedItem?.barcode ?? "Selected item"} is available for ${startDate} to ${endDate}.`
        });
        return;
      }

      const savedBooking: Booking = {
        ...booking,
        bookingNumber: `B-${Date.now().toString().slice(-6)}`
      };

      saveCreatedBooking(savedBooking);
      setResult({
        kind: "success",
        message: `Created booking ${formatBookingNumber(savedBooking)} for ${savedBooking.customerName}.`,
        booking: savedBooking
      });
    } catch (error) {
      if (error instanceof BookingConflictError) {
        const details = error.conflicts.map((conflict) => {
          const conflictingBooking = existingBookings.find((booking) => booking.id === conflict.bookingId);
          const bookingLabel = conflictingBooking ? formatBookingNumber(conflictingBooking) : conflict.bookingId;
          const customer = conflictingBooking ? ` for ${conflictingBooking.customerName}` : "";
          return `${bookingLabel}${customer}: ${conflict.startDate} to ${conflict.endDate}`;
        });

        setResult({
          kind: "error",
          message: "This item is already booked for the selected dates.",
          details
        });
        return;
      }

      if (error instanceof BookingValidationError) {
        setResult({ kind: "error", message: error.message });
        return;
      }

      setResult({ kind: "error", message: "Could not check this booking request." });
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>New booking</h2>
      </div>

      <form className="form-grid">
        <label>
          Customer
          <input
            required
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Customer name"
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            placeholder="customer@example.com"
          />
        </label>

        <label>
          Item
          <select required value={inventoryItemId} onChange={(event) => setInventoryItemId(event.target.value)}>
            {inventoryItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.barcode} - {item.brand} {item.styleName} - {item.size} - {formatEnumLabel(item.status)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Start date
          <input required type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </label>

        <label>
          End date
          <input required type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </label>

        <div className="actions">
          <button className="button secondary" type="button" onClick={() => handleAction("check")} disabled={!inventoryItemId}>
            Check availability
          </button>
          <button className="button" type="button" onClick={() => handleAction("create")} disabled={!inventoryItemId}>
            Create booking
          </button>
        </div>
      </form>

      {result.kind !== "idle" ? (
        <div className={`notice ${result.kind === "success" ? "success" : "error"}`}>
          <strong>{result.message}</strong>
          {result.details ? (
            <ul>
              {result.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
          {result.booking ? <p>Assigned items: {getAssignedItemLabels(result.booking, inventoryItems).join(", ")}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
