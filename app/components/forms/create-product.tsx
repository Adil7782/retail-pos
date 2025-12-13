"use client"

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Zap } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

import Link from "next/link";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Ensure you have this component
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Category, Product } from "@/generated/prisma/client";

interface AddProductFormProps {
    initialData?: Product | null;
    categories?: Category[]; // Pass fetched categories here
    productId?: string; // ID is Int in DB, but usually passed as string in URLs
    mode?: string;
}

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Product name is required"
    }),
    barcode: z.string().min(1, {
        message: "Barcode is required"
    }),
    description: z.string().optional(),
    price: z.coerce.number().min(0, {
        message: "Price must be a positive number"
    }),
    costPrice: z.coerce.number().min(0, {
        message: "Cost price must be a positive number"
    }),
    stock: z.coerce.number().int().min(0, {
        message: "Stock must be a positive integer"
    }),
    categoryId: z.string().optional(), // We handle string->int conversion on submit,
    unit: z.string().optional(),
});

const AddProductForm = ({
    initialData,
    categories,
    productId,
    mode
}: AddProductFormProps) => {
    const { toast } = useToast();
    const router = useRouter();


    const units = [
        { label: "Kilogram (kg)", value: "kg" },
        { label: "Gram (g)", value: "g" },
        { label: "Liter (l)", value: "l" },
        { label: "Milliliter (ml)", value: "ml" },
        { label: "Pieces (pcs)", value: "pcs" },
        { label: "Packet (pkt)", value: "pkt" },
        { label: "Box (box)", value: "box" },
        { label: "Dozen (dz)", value: "dz" },
    ];

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            barcode: initialData?.barcode || "",
            description: initialData?.description || "",
            // Convert Decimals to string/number for the input
            price: initialData?.price ? parseFloat(initialData.price.toString()) : 0,
            costPrice: initialData?.costPrice ? parseFloat(initialData.costPrice.toString()) : 0,
            stock: initialData?.stock || 0,
            categoryId: initialData?.categoryId ? initialData.categoryId.toString() : "",
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        // Format payload: convert categoryId string back to Int if it exists
        const payload = {
            ...data,
            categoryId: data.categoryId ? parseInt(data.categoryId) : null
        };

        if (mode && mode === 'create') {
            try {
                const res = await axios.post('/api/products/add', payload);
                toast({
                    title: "Successfully created new product",
                    variant: "success",
                    description: (
                        <div className='mt-2 bg-slate-200 py-2 px-3 md:w-[336px] rounded-md'>
                            <code className="text-slate-800">
                                Name: {res.data.name}
                            </code>
                        </div>
                    ),
                });
                router.refresh();
                form.reset();
            } catch (error: any) {
                if (error.response && error.response.status === 409) {
                    toast({
                        title: error.response.data,
                        variant: "error"
                    });
                } else {
                    toast({
                        title: "Something went wrong! Try again",
                        variant: "error",
                        description: (
                            <div className='mt-2 bg-slate-200 py-2 px-3 md:w-[336px] rounded-md'>
                                <code className="text-slate-800">
                                    ERROR: {error.message}
                                </code>
                            </div>
                        ),
                    });
                }
            }
        } else {
            try {
                const res = await axios.put(`/api/products/${productId}`, payload);
                toast({
                    title: "Updated successfully",
                    variant: "success",
                });
                router.refresh();
                router.push('/products');
            } catch (error: any) {
                if (error.response && error.response.status === 409) {
                    toast({
                        title: error.response.data,
                        variant: "error"
                    });
                } else {
                    toast({
                        title: "Something went wrong! Try again",
                        variant: "error",
                        description: (
                            <div className='mt-2 bg-slate-200 py-2 px-3 md:w-[336px] rounded-md'>
                                <code className="text-slate-800">
                                    ERROR: {error.message}
                                </code>
                            </div>
                        ),
                    });
                }
            }
        }
    }

    return (
        <div className='mx-auto max-w-7xl mt-16 border px-12 pt-6 pb-10 rounded-lg shadow-xl'>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full space-y-6 mt-4"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">

                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Product Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isSubmitting}
                                            placeholder="e.g. 'Sugar'"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Barcode */}
                        <FormField
                            control={form.control}
                            name="barcode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Barcode / QR
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isSubmitting}
                                            placeholder="Scan or enter code"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Category Select */}
                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Category
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isSubmitting}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories && categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Price */}
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Selling Price
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            disabled={isSubmitting}
                                            placeholder="0.00"
                                            {...field}
                                            // 1. Use empty string '' (not {})
                                            // 2. Parse input to number on change to satisfy z.coerce.number
                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            value={(field.value as number) ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Cost Price */}
                        <FormField
                            control={form.control}
                            name="costPrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Cost Price
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            disabled={isSubmitting}
                                            placeholder="0.00"
                                            {...field}


                                            value={(field.value as number) ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Stock */}
                        <FormField
                            control={form.control}
                            name="stock"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Stock Quantity
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            disabled={isSubmitting}
                                            placeholder="0"
                                            {...field}
                                            value={(field.value as number) ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="unit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">Unit</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {units.map((unit) => (
                                                <SelectItem key={unit.value} value={unit.value}>
                                                    {unit.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Description (Spans Full Width) */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">
                                            Description
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                disabled={isSubmitting}
                                                placeholder="Product details..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                    </div>

                    {mode && mode === 'create' ?
                        <div className="mt-4 flex justify-between gap-2">
                            <Button variant='outline' className="flex gap-2 pr-5" onClick={() => form.reset()} type="button">
                                Reset
                            </Button>
                            <Button
                                type="submit"
                                disabled={!isValid || isSubmitting}
                                className="flex gap-2 pr-5"
                            >
                                <Zap className={cn("w-5 h-5", isSubmitting && "hidden")} />
                                <Loader2 className={cn("animate-spin w-5 h-5 hidden", isSubmitting && "flex")} />
                                Add Product
                            </Button>
                        </div>
                        :
                        <div className="mt-4 flex justify-between gap-2">
                            <Link href="/products">
                                <Button variant='outline' className="flex gap-2 pr-5 text-red-600">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={!isValid || isSubmitting}
                                className="flex gap-2 pr-5"
                            >
                                <Zap className={cn("w-5 h-5", isSubmitting && "hidden")} />
                                <Loader2 className={cn("animate-spin w-5 h-5 hidden", isSubmitting && "flex")} />
                                Update Product
                            </Button>
                        </div>
                    }
                </form>
            </Form>
        </div>
    )
}

export default AddProductForm;