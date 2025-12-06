import React from "react";

export default function MetricCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="metric">
      <div className="small-muted">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
    </div>
  );
}
