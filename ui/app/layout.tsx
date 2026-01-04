import { setupMongoConnection } from "../../db/connection";

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
