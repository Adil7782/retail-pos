import { db } from '@/lib/db'
import React from 'react'
import { DataTable } from './_components/data-table'
import { columns } from './_components/columns'
import { Prisma } from '@/generated/prisma/client'

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
  }>
}

const page = async ({ searchParams }: PageProps) => {
  const params = await searchParams
  const pageIndex = typeof params.page === 'string' ? parseInt(params.page) : 0
  const pageSize = 10
  const search = typeof params.search === 'string' ? params.search : undefined

  const where: Prisma.ProductWhereInput = search
    ? {
      OR: [
        { name: { contains: search } },
        { barcode: { contains: search } },
      ],
    }
    : {}

  const [products, totalCount] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: true,
      },
      skip: pageIndex * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    db.product.count({ where }),
  ])

  const plainProducts = products.map((product) => ({
    ...product,
    price: product.price,
    costPrice: product.costPrice,
  }))

  return (
    <div>
      <DataTable
        columns={columns}
        data={plainProducts}
        pageCount={Math.ceil(totalCount / pageSize)}
        pageSize={pageSize}
        pageIndex={pageIndex}
      />
    </div>
  )
}

export default page
