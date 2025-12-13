import POSPage from '@/app/components/model/PosModel'
import { db } from '@/lib/db'
import React from 'react'

const page = async () => {
  const products = await db.product.findMany({
    include: {
      category: true,
    },
  })

  // Convert Decimal fields to numbers (or strings)
  const plainProducts = products.map((product) => ({
    ...product,
    price: product.price.toNumber(),
    costPrice: product.costPrice.toNumber(),
    category: product.category?.name || "Uncategorized",
    categoryId: product.categoryId?.toString(),
  }))

  return (
    <div>
      <POSPage products={plainProducts} />
    </div>
  )
}

export default page
