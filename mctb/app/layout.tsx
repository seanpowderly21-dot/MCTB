import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Missed Call Text Back & Google Reviews for Local Service Businesses",
  description:
    "Never lose a job to a missed call. Instant text-back when you can't answer, and automatic Google review requests after every job.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
