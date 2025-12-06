import OverviewMetrics from "@/components/dashboard/OverviewMetrics";
import RevenueChart from "@/components/dashboard/RevenueChart";
import OrdersChart from "@/components/dashboard/OrdersChart";
import TopCustomersTable from "@/components/dashboard/TopCustomersTable";
import QuickActivity from "@/components/dashboard/QuickActivity";

export default async function DashboardPage() {
  // If your APIs are ready you can call them here via fetch("/api/insights/overview")
  // For now we show client components that will fetch on mount.
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Shopify Insights</h1>
      <p className="small-muted mb-6">Overview dashboard — multi-tenant preview</p>

      <OverviewMetrics />

      <div className="grid grid-cols-2 gap-6 mt-6">
        <RevenueChart />
        <OrdersChart />
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="col-span-2 card">
          <TopCustomersTable />
        </div>
        <div className="card">
          <QuickActivity />
        </div>
      </div>
    </div>
  );
}
