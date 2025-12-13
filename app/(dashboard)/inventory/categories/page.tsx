

import { db } from '@/lib/db'
import React from 'react'

import { AddCategoryForm } from '@/app/components/forms/add-category'

// Client component for adding a new category


const page = async () => {
    const categories = await db.category.findMany()
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Categories Dashboard</h1>

            <AddCategoryForm />

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Existing Categories</h2>
                {categories.length === 0 ? (
                    <p className="text-gray-600">No categories found. Add one above!</p>
                ) : (
                    <ul className="space-y-3">
                        {categories.map((category) => (
                            <li key={category.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-md bg-gray-50">
                                <span className="text-lg font-medium">{category.name}</span>
                                {/* Optionally add edit/delete buttons here */}
                                {/* <div className="flex gap-2">
                                    <button className="text-sm text-blue-600 hover:underline">Edit</button>
                                    <button className="text-sm text-red-600 hover:underline">Delete</button>
                                </div> */}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}


export default page