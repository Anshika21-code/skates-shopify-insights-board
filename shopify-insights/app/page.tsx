import Link from "next/link";
// app/page.js
import { redirect } from 'next/navigation';

export default function Home() {
   redirect('/dashboard');
  return (
    <main className="card">
      <h1 className="text-3xl font-semibold mb-2">Shopify Insights</h1>
      <p className="small-muted mb-6">Overview dashboard — multi-tenant preview</p>

      <div className="flex gap-3">
        <Link href="/dashboard" className="px-4 py-2 bg-primary text-white rounded-lg">Open Dashboard</Link>
        <Link href="/login" className="px-4 py-2 border rounded-lg">Login</Link>
      </div>
    </main>
  );
}
