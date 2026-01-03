"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Zap } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Category, Product } from "@/generated/prisma/client";

import { formSchema, ProductFormValues } from "./schema";
import { ProductBasics } from "./product-basics";
import { ProductPricing } from "./product-pricing";
import { ProductOrganization } from "./product-organization";
import { ProductIdentity } from "./product-identity";

interface AddProductFormProps {
    initialData?: Product | null;
    categories?: Category[];
    productId?: string;
    mode?: string;
}

const AddProductForm = ({
    initialData,
    categories = [],
    productId,
    mode,
}: AddProductFormProps) => {
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            barcode: initialData?.barcode || "",
            scalePlu: initialData?.scalePlu || "",
            isWeighed: initialData?.isWeighed ?? false,
            description: initialData?.description || "",
            price: initialData?.price ? parseFloat(initialData.price.toString()) : 0,
            costPrice: initialData?.costPrice
                ? parseFloat(initialData.costPrice.toString())
                : 0,
            stock: initialData?.stock || 0,
            categoryId: initialData?.categoryId
                ? initialData.categoryId.toString()
                : "",
            unit: initialData?.unit || "",
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (data: ProductFormValues) => {
        // Format payload: convert categoryId string back to Int if it exists
        const payload = {
            ...data,
            categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        };

        if (mode && mode === "create") {
            try {
                const res = await axios.post("/api/products/add", payload);
                toast({
                    title: "Successfully created new product",
                    variant: "success",
                    description: (
                        <div className="mt-2 bg-slate-200 py-2 px-3 md:w-[336px] rounded-md">
                            <code className="text-slate-800">Name: {res.data.name}</code>
                        </div>
                    ),
                });
                router.refresh();
                form.reset();
            } catch (error: any) {
                if (error.response && error.response.status === 409) {
                    toast({
                        title: error.response.data,
                        variant: "error",
                    });
                } else {
                    toast({
                        title: "Something went wrong! Try again",
                        variant: "error",
                        description: (
                            <div className="mt-2 bg-slate-200 py-2 px-3 md:w-[336px] rounded-md">
                                <code className="text-slate-800">ERROR: {error.message}</code>
                            </div>
                        ),
                    });
                }
            }
        } else {
            try {
                await axios.put(`/api/products/${productId}`, payload);
                toast({
                    title: "Updated successfully",
                    variant: "success",
                });
                router.refresh();
                router.push("/products");
            } catch (error: any) {
                if (error.response && error.response.status === 409) {
                    toast({
                        title: error.response.data,
                        variant: "error",
                    });
                } else {
                    toast({
                        title: "Something went wrong! Try again",
                        variant: "error",
                        description: (
                            <div className="mt-2 bg-slate-200 py-2 px-3 md:w-[336px] rounded-md">
                                <code className="text-slate-800">ERROR: {error.message}</code>
                            </div>
                        ),
                    });
                }
            }
        }
    };

    return (
        <div className="mx-auto max-w-7xl mt-6 pb-10">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column (Main Info) */}
                        <div className="lg:col-span-2 space-y-6">
                            <ProductBasics />
                            <ProductPricing />
                        </div>

                        {/* Right Column (Meta Info) */}
                        <div className="lg:col-span-1 space-y-6">
                            <ProductOrganization categories={categories} />
                            <ProductIdentity />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        {mode === "create" ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => form.reset()}
                                    type="button"
                                >
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!isValid || isSubmitting}
                                    className="flex gap-2"
                                >
                                    <Zap className={cn("w-5 h-5", isSubmitting && "hidden")} />
                                    <Loader2
                                        className={cn(
                                            "animate-spin w-5 h-5 hidden",
                                            isSubmitting && "flex"
                                        )}
                                    />
                                    Add Product
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/inventory/products">
                                    <Button variant="outline" className="text-red-600">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={!isValid || isSubmitting}
                                    className="flex gap-2"
                                >
                                    <Zap className={cn("w-5 h-5", isSubmitting && "hidden")} />
                                    <Loader2
                                        className={cn(
                                            "animate-spin w-5 h-5 hidden",
                                            isSubmitting && "flex"
                                        )}
                                    />
                                    Update Product
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default AddProductForm;
