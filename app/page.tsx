
import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";
import DashboardLayout from "./components/DashboardLayout";
import StatCard from "./components/StatCard";

// Simple Card Component for stats


export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            New Sale
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Sales" value="$12,450" icon={DollarSign} color="bg-green-500" />
          <StatCard title="Total Orders" value="450" icon={ShoppingBag} color="bg-blue-500" />
          <StatCard title="New Customers" value="24" icon={Users} color="bg-purple-500" />
          <StatCard title="Growth" value="+12.5%" icon={TrendingUp} color="bg-orange-500" />
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium">#ORD-00{i}</td>
                    <td className="px-6 py-4">Walk-in Customer</td>
                    <td className="px-6 py-4">$45.00</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                        Completed
                      </span>
                    </td>
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