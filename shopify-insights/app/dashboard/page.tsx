// app/dashboard/page.tsx

import OverviewMetrics from "@/components/dashboard/OverviewMetrics";
import RevenueChart from "@/components/dashboard/RevenueChart";
import OrdersChart from "@/components/dashboard/OrdersChart";
import TopCustomersTable from "@/components/dashboard/TopCustomersTable";
import QuickActivity from "@/components/dashboard/QuickActivity";
import DateRangePicker from "@/components/ui/DateRangePicker";

export default function DashboardPage() {
  return (
    <div className="dash-page">
      <div className="dash-shell">
        {/* Top header */}
        <header className="dash-header">
          <div>
            <h1>Shopify Insights</h1>
            <p>Overview dashboard — multi-tenant preview</p>
          </div>

          <div className="dash-header-right">
            {/* Tumhara existing DateRangePicker component */}
            <DateRangePicker />
          </div>
        </header>

        {/* Metrics row (4 cards: customers / orders / revenue / avg order) */}
        <section className="dash-row">
          <OverviewMetrics />
        </section>

        {/* Charts row */}
        <section className="dash-row dash-row-charts">
          <div className="dash-card">
            <h3 className="dash-card-title">Revenue (by day)</h3>
            <RevenueChart />
          </div>
          <div className="dash-card">
            <h3 className="dash-card-title">Orders (by day)</h3>
            <OrdersChart />
          </div>
        </section>

        {/* Bottom row: Top customers + Quick activity */}
        <section className="dash-row dash-row-bottom">
          <div className="dash-card dash-card-table">
            <div className="dash-card-header">
              <h3 className="dash-card-title">Top Customers</h3>
            </div>
            <TopCustomersTable />
          </div>

          <div className="dash-card dash-card-activity">
            <h3 className="dash-card-title">Quick Activity</h3>
            <QuickActivity />
          </div>
        </section>

        <footer className="dash-footer">
          Made with ♥ — Shopify insights demo UI
        </footer>
      </div>
    </div>
  );
}
