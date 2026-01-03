
import { db } from '@/lib/db'
import React from 'react'
import { AddCategoryForm } from '@/app/components/forms/add-category'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const page = async () => {
    const categories = await db.category.findMany({
        orderBy: {
            name: 'asc'
        }
    })

    return (
        <div className="mx-auto max-w-7xl mt-6 pb-10">
            {/* Header omitted to match product form style where header is often in logic or simple */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Add Category Form */}
                <div className="md:col-span-1">
                    <AddCategoryForm />
                </div>

                {/* Right Column: Existing Categories List */}
                <div className="md:col-span-2 h-[calc(100vh-10rem)] overflow-y-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Categories</CardTitle>
                            <CardDescription>Manage your product categories.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {categories.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    No categories found. Create one to get started.
                                </p>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {categories.map((category) => (
                                                <TableRow key={category.id}>
                                                    <TableCell className="font-medium">{category.name}</TableCell>
                                                    <TableCell className="text-right">
                                                        {/* Placeholder for future actions */}
                                                        <span className="text-xs text-muted-foreground">Edit</span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default page