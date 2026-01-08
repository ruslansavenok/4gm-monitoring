import type { Metadata } from "next";
import { setupMongoConnection } from "../../db/connection";
import { Item, type ItemType } from "../../db/models/Item";
import { ItemsProvider } from "./context/ItemsContext";
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
  const items = (await Item.find({}).lean()) as ItemType[];

  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <ItemsProvider items={items}>{children}</ItemsProvider>
      </body>
    </html>
  );
}
