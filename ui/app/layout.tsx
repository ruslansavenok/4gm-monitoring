import { setupMongoConnection } from "../../db/connection";
import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
