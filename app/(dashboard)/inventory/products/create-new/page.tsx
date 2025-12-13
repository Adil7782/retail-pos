import AddProductForm from '@/app/components/forms/create-product'
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