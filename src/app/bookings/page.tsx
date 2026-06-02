import Link from "next/link";
import { BookingsTable } from "./bookings-table";

export default function BookingListPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Bookings</h1>
          <p className="muted">Rental bookings and assigned inventory items.</p>
        </div>
        <Link className="button" href="/bookings/new">
          Create booking
        </Link>
      </div>

      <BookingsTable />
    </main>
  );
}
