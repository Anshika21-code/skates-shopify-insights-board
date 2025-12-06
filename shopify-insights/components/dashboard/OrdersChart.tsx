"use client";

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// IMPORTANT: register scales + elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function OrdersChart() {
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);

  useEffect(() => {
    fetch("/api/insights/orders")
      .then((r) => r.json())
      .then((d) => {
        if (d?.labels && d?.values) {
          setLabels(d.labels);
          setValues(d.values);
        } else {
          // fallback mock data
          const mLabels = Array.from({ length: 10 }, (_, i) => `04-${11 + i}`);
          setLabels(mLabels);
          setValues([1, 2, 2, 3, 4, 2, 5, 6, 5, 4]);
        }
      })
      .catch(() => {
        const mLabels = Array.from({ length: 10 }, (_, i) => `04-${11 + i}`);
        setLabels(mLabels);
        setValues([1, 2, 2, 3, 4, 2, 5, 6, 5, 4]);
      });
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: "Orders",
        data: values,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "category" as const, // now CategoryScale is registered
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="card">
      <h3>Orders (by day)</h3>
      <div style={{ height: 260 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
