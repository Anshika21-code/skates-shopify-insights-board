"use client";
import React, { useEffect, useState } from "react";
import MetricCard from "@/components/ui/MetricCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type Overview = {
  customers: number;
  orders: number;
  revenue: number;
  avgOrderValue: number;
};

export default function OverviewMetrics() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    // fetch from API; fallback to mock if not ready
    fetch("/api/insights/overview")
      .then(r => r.json())
      .then(setData)
      .catch(() => {
        setData({
          customers: 123,
          orders: 456,
          revenue: 12345,
          avgOrderValue: 27.06
        });
      });
  }, []);

  if (!data) return <div className="card flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard title="Total Customers" value={data.customers} />
      <MetricCard title="Total Orders" value={data.orders} />
      <MetricCard title="Total Revenue" value={`₹ ${data.revenue.toLocaleString()}`} />
      <MetricCard title="Avg Order Value" value={`₹ ${data.avgOrderValue}`} />
    </div>
  );
}
