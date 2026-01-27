import "./globals.css";
import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata: Metadata = {
  title: "Funeral Homes Search",
  description: "Search canonical funeral homes dataset",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
