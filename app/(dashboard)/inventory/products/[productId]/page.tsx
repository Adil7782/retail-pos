import AddProductForm from "@/app/components/forms/create-product"
import { db } from "@/lib/db"
import React from "react"

const ProductId = async ({
    params,
}: {
    params: { productId: string }
}) => {


    const { productId } = await params

    const product = await db.product.findUnique({
        where: { id: Number(productId) },
        include: {
            category: true
        }
    })
    console.log(product)
    const categories = await db.category.findMany()
    return (
        <div>
            <AddProductForm
                mode="update"
                productId={productId}
                initialData={product}
                categories={categories  }
            />
        </div>
    )
}

export default ProductId
