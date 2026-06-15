import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kidz Care — نظام متابعة المرضى",
  description: "نظام إدارة عيادة حديثي الولادة والأطفال",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b82f6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar-u-nu-latn" dir="rtl" className={`${cairo.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="min-h-full bg-background font-[family-name:var(--font-cairo)]">
        {children}
        <Toaster richColors position="top-center" dir="rtl" />
      </body>
    </html>
  );
}
