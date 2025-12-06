// app/layout.tsx
import "./globals.css";
import React from "react";

export const metadata = {
  title: "Shopify Insights",
  description: "Overview dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
