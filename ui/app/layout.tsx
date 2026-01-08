import type { Metadata } from "next";
import { setupMongoConnection } from "../../db/connection";
import "./globals.css";

export const metadata: Metadata = {
  title: "L2",
  icons: {
    icon: "/icon.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await setupMongoConnection();

  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
