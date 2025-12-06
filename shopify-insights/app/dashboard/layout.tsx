import React from "react";
import Header from "@/components/dashboard/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main className="mt-6">
        {children}
      </main>
    </div>
  );
}
