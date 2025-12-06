"use client";
import React, { useEffect, useState } from "react";

type Customer = { id: number; name: string; totalSpent: string; email?: string };

export default function TopCustomersTable() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetch("/api/insights/customers")
      .then(r => r.json())
      .then((d) => setCustomers(d?.top || []))
      .catch(() => {
        setCustomers([
          { id: 1, name: "Aman Verma", totalSpent: "€ 244.00", email: "aman@example" },
          { id: 2, name: "Priya Singh", totalSpent: "€ 199.00", email: "priya@example" },
          { id: 3, name: "Rohit Jain", totalSpent: "€ 530.00", email: "rohit@example" },
          { id: 4, name: "Sheha Patel", totalSpent: "€ 870.00" },
          { id: 5, name: "Vikas Rumar", totalSpent: "€ 645.00" }
        ]);
      });
  }, []);

  return (
    <div>
      <h4 className="font-medium mb-4">Top Customers</h4>
      <table className="w-full text-left">
        <thead className="text-sm text-gray-500">
          <tr>
            <th className="w-10">#</th>
            <th>Name</th>
            <th>Total Spent</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c, i) => (
            <tr key={c.id} className="border-t">
              <td className="py-3">{i + 1}</td>
              <td>{c.name}</td>
              <td>{c.totalSpent}</td>
              <td>{c.email ?? c.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
