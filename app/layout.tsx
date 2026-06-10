import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/hooks/useStore";

export const metadata: Metadata = {
  title: "Pup Gains 🐾 — Gym Tracker",
  description: "Your happy little workout buddy. Track lifts & runs, never lose a rep.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#fb923c",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <StoreProvider>
          <div className="mx-auto w-full max-w-md px-4 pb-12 pt-5">{children}</div>
        </StoreProvider>
      </body>
    </html>
  );
}
