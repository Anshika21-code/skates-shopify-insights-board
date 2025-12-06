"use client";

import React from "react";

export default function DashboardPage() {
  // Abhi ke liye static numbers daal diye – demo ke liye perfect.
  // Baad me tu inko API se replace kar sakti hai.
  const overview = {
    totalCustomers: 123,
    totalOrders: 456,
    totalRevenue: 12345,
    avgOrderValue: 27.06,
  };

  const topCustomers = [
    { id: 1, name: "Aman Verma", spent: "₹ 244.00", email: "aman@example" },
    { id: 2, name: "Priya Singh", spent: "₹ 199.00", email: "priya@example" },
    { id: 3, name: "Rohit Jain", spent: "₹ 530.00", email: "rohit@example" },
    { id: 4, name: "Sheha Patel", spent: "₹ 870.00", email: "sheha@example" },
    { id: 5, name: "Vikas Rumar", spent: "₹ 645.00", email: "vikas@example" },
  ];

  return (
    <div className="dash-page">
      {/* Top page heading (Overview + date range) */}
      <header className="dash-overview-header">
        <div>
          <h1 className="dash-overview-title">Overview</h1>
          <p className="dash-overview-subtitle">Last 30 days</p>
        </div>
        <div className="dash-overview-dates">
          <input type="date" className="dash-date-input" />
          <input type="date" className="dash-date-input" />
        </div>
      </header>

      {/* Main white card */}
      <main className="dash-card">
        {/* Card header */}
        <div className="dash-card-header">
          <div>
            <h2 className="dash-card-title">Shopify Insights</h2>
            <p className="dash-card-subtitle">
              Overview dashboard — multi-tenant preview
            </p>
          </div>

          <div className="dash-card-date-range">
            <input type="date" className="dash-date-input" />
            <input type="date" className="dash-date-input" />
          </div>
        </div>

        {/* Metric cards */}
        <section className="dash-metric-grid">
          <div className="dash-metric-card">
            <p className="dash-metric-label">Total Customers</p>
            <p className="dash-metric-value">{overview.totalCustomers}</p>
          </div>

          <div className="dash-metric-card">
            <p className="dash-metric-label">Total Orders</p>
            <p className="dash-metric-value">{overview.totalOrders}</p>
          </div>

          <div className="dash-metric-card">
            <p className="dash-metric-label">Total Revenue</p>
            <p className="dash-metric-value">
              ₹ {overview.totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="dash-metric-card">
            <p className="dash-metric-label">Avg Order Value</p>
            <p className="dash-metric-value">
              ₹ {overview.avgOrderValue.toFixed(2)}
            </p>
          </div>
        </section>

        {/* Charts row */}
        <section className="dash-charts-row">
          {/* Revenue chart */}
          <div className="dash-chart-card">
            <div className="dash-chart-header">
              <p className="dash-chart-title">Revenue (by day)</p>
              <p className="dash-chart-subtitle">₹ 24,870</p>
            </div>
            <div className="dash-chart-body dash-fake-chart dash-fake-chart--bars" />
            <div className="dash-chart-footer">
              <span>04-11</span>
              <span>04-24</span>
            </div>
          </div>

          {/* Orders chart */}
          <div className="dash-chart-card">
            <div className="dash-chart-header">
              <p className="dash-chart-title">Orders (by day)</p>
            </div>
            <div className="dash-chart-body dash-fake-chart dash-fake-chart--line" />
            <div className="dash-chart-footer">
              <span>04-11</span>
              <span>04-24</span>
            </div>
          </div>
        </section>

        {/* Bottom row: table + quick activity */}
        <section className="dash-bottom-row">
          {/* Top customers table */}
          <div className="dash-table-card">
            <div className="dash-table-header">
              <p className="dash-table-title">Top Customers</p>
            </div>
            <div className="dash-table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Total Spent</th>
                    <th>Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.name}</td>
                      <td>{c.spent}</td>
                      <td>{c.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Activity */}
          <aside className="dash-activity-card">
            <h3 className="dash-activity-title">Quick Activity</h3>

            <div className="dash-activity-list">
              <div className="dash-activity-row">
                <span className="dash-activity-label">Latest Sync</span>
                <span className="dash-activity-value">a minute ago</span>
              </div>
              <div className="dash-activity-row">
                <span className="dash-activity-label">Pending webhooks</span>
                <span className="dash-activity-value">0</span>
              </div>
              <div className="dash-activity-row">
                <span className="dash-activity-label">Connected stores</span>
                <span className="dash-activity-value">1</span>
              </div>
            </div>

            <button className="dash-refresh-btn">Refresh Dashboard</button>
          </aside>
        </section>

        {/* Footer */}
        <footer className="dash-footer">
          <span>Made with 💜 — Shopify insights demo UI</span>
        </footer>
      </main>
    </div>
  );
}
