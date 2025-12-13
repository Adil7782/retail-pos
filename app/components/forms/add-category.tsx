'use client'
import { toast } from "@/components/ui/use-toast"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useState } from "react"

export const AddCategoryForm: React.FC = () => {

    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await axios.post('/api/categories', [{ name }]);
            toast({
                title: "Successfully created new category",
                variant: "success",
                description: (
                    <div className='mt-2 bg-slate-200 py-2 px-3 md:w-[336px] rounded-md'>
                        <code className="text-slate-800">
                            Name: {res.data.data.name}
                        </code>
                    </div>
                ),
            });

            if (!res) {
                throw new Error('Failed to add category')
            }

            setName('') // Clear input
            router.refresh() // Revalidate data on the server component
        } catch (error) {
            console.error('Error adding category:', error)
            alert('Failed to add category.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg shadow-sm bg-white">
            <h3 className="text-xl font-semibold mb-4">Add New Category</h3>
            <div className="flex items-center gap-4">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Category Name"
                    required
                    className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                    {loading ? 'Adding...' : 'Add Category'}
                </button>
            </div>
        </form>
    )
}