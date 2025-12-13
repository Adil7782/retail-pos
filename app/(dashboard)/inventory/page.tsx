"use client";
import React from 'react'
import StatCard from '../../components/StatCard'
import { BookmarkXIcon, BoxIcon, BoxSelect, DollarSign, GroupIcon, PlusSquare, ShoppingBagIcon, TrendingUp, Users2 } from 'lucide-react'
import Link from 'next/link'


import { usePathname } from "next/navigation";
const InventoryDashboard = () => {
  const pathname = usePathname();
  console.log(pathname);





  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href={`${pathname}/products/create-new`} >
          <StatCard title="Add Product" icon={PlusSquare} color="bg-blue-500" />
        </Link>
        <Link href={`${pathname}/products`} >
          <StatCard title="View Products" icon={BoxIcon} color="bg-green-500" />
        </Link>
        <Link href={`${pathname}/categories`} >
          <StatCard title="Categories" icon={GroupIcon} color="bg-purple-500" />
        </Link>

      </div>
    </div>
  )
}

export default InventoryDashboard