import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suit Vault Inventory Prototype",
  description: "Rental inventory booking prototype"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <nav className="top-nav">
            <div className="brand">Suit Vault</div>
            <div className="nav-links">
              <Link href="/">Dashboard</Link>
              <Link href="/inventory">Inventory</Link>
              <Link href="/bookings">Bookings</Link>
              <Link href="/bookings/new">Create Booking</Link>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
