import AddProductForm from '@/app/components/forms/product-form'
import { db } from '@/lib/db'
import React from 'react'

const page = async () => {


    const categories = await db.category.findMany()



    return (
        <div>
            <AddProductForm mode="create" categories={categories} />
        </div>
    )
}

export default page