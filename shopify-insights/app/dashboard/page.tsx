// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OverviewMetrics {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

interface TopCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  totalSpent: number;
  ordersCount: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const [overview, setOverview] = useState<OverviewMetrics>({
    totalCustomers: 123,
    totalOrders: 456,
    totalRevenue: 12345,
    avgOrderValue: 27.06
  });
  
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([
    { id: '1', firstName: 'Aman', lastName: 'Verma', email: 'aman@example.com', totalSpent: 244.00, ordersCount: 3 },
    { id: '2', firstName: 'Priya', lastName: 'Singh', email: 'priya@example.com', totalSpent: 199.0, ordersCount: 2 },
    { id: '3', firstName: 'Rohit', lastName: 'Jain', email: 'rohit@example.com', totalSpent: 530.0, ordersCount: 4 },
    { id: '4', firstName: 'Sheha', lastName: 'Patel', email: 'sheha@example.com', totalSpent: 870.0, ordersCount: 5 },
    { id: '5', firstName: 'Vikas', lastName: 'Rumar', email: 'vikas@example.com', totalSpent: 645.0, ordersCount: 3 },
  ]);
  
  const [revenueData] = useState([
    { date: '04-11', revenue: 2100 },
    { date: '04-12', revenue: 1800 },
    { date: '04-13', revenue: 2400 },
    { date: '04-14', revenue: 2200 },
    { date: '04-15', revenue: 2800 },
    { date: '04-16', revenue: 2600 },
    { date: '04-17', revenue: 3200 },
    { date: '04-18', revenue: 3000 },
    { date: '04-19', revenue: 3400 },
    { date: '04-20', revenue: 3800 },
    { date: '04-21', revenue: 3600 },
    { date: '04-22', revenue: 4000 },
    { date: '04-23', revenue: 3900 },
    { date: '04-24', revenue: 3500 },
  ]);
  
  const [ordersData] = useState([
    { date: '04-11', orders: 2 },
    { date: '04-12', orders: 3 },
    { date: '04-13', orders: 2 },
    { date: '04-14', orders: 3 },
    { date: '04-15', orders: 2 },
    { date: '04-16', orders: 4 },
    { date: '04-17', orders: 3 },
    { date: '04-18', orders: 4 },
    { date: '04-19', orders: 3 },
    { date: '04-20', orders: 2 },
    { date: '04-21', orders: 4 },
    { date: '04-22', orders: 6 },
    { date: '04-23', orders: 5 },
    { date: '04-24', orders: 4 },
  ]);

  const [dateRange, setDateRange] = useState({
    from: '2024-04-11',
    to: '2024-04-24'
  });

  const handleRefresh = async () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopify Insights</h1>
              <p className="text-gray-500 text-sm mt-1">Overview dashboard — multi-tenant preview</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">From</span>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
                />
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
                />
              </div>

              <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg">
                <Calendar className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">Total Customers</div>
            <div className="text-4xl font-bold text-gray-900">{overview.totalCustomers}</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">Total Orders</div>
            <div className="text-4xl font-bold text-gray-900">{overview.totalOrders}</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
            <div className="text-4xl font-bold text-gray-900">₹ {overview.totalRevenue.toLocaleString()}</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">Avg Order Value</div>
            <div className="text-4xl font-bold text-gray-900">₹ {overview.avgOrderValue.toFixed(2)}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue (by day)</h3>
              <p className="text-sm text-gray-600 mt-1">₹ 24,870</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Bar dataKey="revenue" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders (by day)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-[2fr_1fr] gap-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Top Customers</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Total Spent</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Orders</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((customer, index) => (
                  <tr key={customer.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-gray-500 w-4">{index + 1}</div>
                        <div className="text-sm font-medium text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      € {customer.totalSpent.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Activity</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Latest Sync</span>
                <span className="text-sm text-gray-900">a minutess ago</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Pending webhooks</span>
                <span className="text-sm text-gray-900">0</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Connected stores</span>
                <span className="text-sm text-gray-900">1</span>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={syncing}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              Refresh Dashboard
            </button>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          Made with ❤️ — Shopify Insights demo UI
        </div>
      </div>
    </div>
  );
}