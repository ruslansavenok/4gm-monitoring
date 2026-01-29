import type { Metadata } from "next";
import { setupMongoConnection } from "@db/connection";
import { GameItemModel, type GameItem } from "@db/models/GameItem";
import { GameItemsProvider } from "@/context/GameItemsContext";
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
  const gameItems = (await GameItemModel.find({}).lean()) as GameItem[];

  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <GameItemsProvider gameItems={gameItems}>{children}</GameItemsProvider>
      </body>
    </html>
  );
}
