import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "ClientVault",
  description:
    "Secure client, project, credential and infrastructure management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}{" "}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1C1B1B",
              color: "#E5E2E1",
              border: "1px solid #3B494C",
            },
          }}
        />
      </body>
    </html>
  );
}
