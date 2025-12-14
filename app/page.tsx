
import { DollarSign, ShoppingBag, Users, TrendingUp, Box, IndianRupee, Coins } from "lucide-react";
import DashboardLayout from "./components/DashboardLayout";
import StatCard from "./components/StatCard";
import { db } from "@/lib/db";

// Simple Card Component for stats


export default async function Home() {

  const sales = await db.order.findMany();
  const products = await db.product.count()
  const totalSales = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  const totalOrders = sales.length;

  const growth = (totalSales / totalOrders) * 100;
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>

        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Sales" value={totalSales} icon={Coins} color="bg-green-500" />
          <StatCard title="Total Orders" value={totalOrders} icon={ShoppingBag} color="bg-blue-500" />
          <StatCard title="Total Products" value={products} icon={Box} color="bg-purple-500" />

        </div>

        {/* Recent Orders Table (Placeholder) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-bold text-lg text-slate-800">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium">#{order.id}</td>
                    <td className="px-6 py-4">{"Walk-in Customer"}</td>
                    <td className="px-6 py-4">Rs.{order.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}