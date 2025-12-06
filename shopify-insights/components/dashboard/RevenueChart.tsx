"use client";

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// IMPORTANT: register scales + elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function RevenueChart() {
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);

  useEffect(() => {
    fetch("/api/insights/revenue")
      .then((r) => r.json())
      .then((d) => {
        if (d?.labels && d?.values) {
          setLabels(d.labels);
          setValues(d.values);
        } else {
          const mLabels = Array.from({ length: 10 }, (_, i) => `04-${11 + i}`);
          setLabels(mLabels);
          setValues([2000, 4000, 3200, 5000, 6200, 5800, 7000, 7600, 8100, 7200]);
        }
      })
      .catch(() => {
        const mLabels = Array.from({ length: 10 }, (_, i) => `04-${11 + i}`);
        setLabels(mLabels);
        setValues([2000, 4000, 3200, 5000, 6200, 5800, 7000, 7600, 8100, 7200]);
      });
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: values,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "category" as const,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="card">
      <h3>Revenue (by day)</h3>
      <div style={{ height: 260 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
