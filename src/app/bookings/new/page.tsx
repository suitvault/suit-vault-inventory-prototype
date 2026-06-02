import Link from "next/link";
import { CreateBookingForm } from "./create-booking-form";

export default function CreateBookingPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Create booking</h1>
          <p className="muted">Check availability before reserving an inventory item.</p>
        </div>
        <Link className="button secondary" href="/bookings">
          Back to bookings
        </Link>
      </div>

      <CreateBookingForm />
    </main>
  );
}
