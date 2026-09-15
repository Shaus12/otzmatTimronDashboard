import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "עוצמת התמרון | מרכז הניהול",
  description: "המערכות, העובדים והפעילות השוטפת של עוצמת התמרון במקום אחד.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
