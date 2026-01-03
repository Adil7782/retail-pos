import POSPage from '@/app/components/model/PosModel'
import { db } from '@/lib/db'
import React from 'react'

export const dynamic = 'force-dynamic'  // <-- add this

const page = async () => {
  const products = await db.product.findMany({
    include: {
      category: true,
    },
  })

  const plainProducts = products.map((product) => ({
    ...product,
    price: product.price,
    costPrice: product.costPrice,
    category: product.category?.name || "Uncategorized",
    categoryId: product.categoryId?.toString(),
    unit: product.unit || "pcs",
    scalePlu: product.scalePlu || null,
    isWeighed: product.isWeighed || false,
    barcode: product.barcode || null,
  }))

  return (
    <div>
      <POSPage products={plainProducts} />
    </div>
  )
}

export default page
