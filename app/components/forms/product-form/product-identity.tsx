"use client";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductFormValues } from "./schema";

export const ProductIdentity = () => {
    const { control, watch, formState: { isSubmitting } } = useFormContext<ProductFormValues>();
    const isWeighed = watch("isWeighed");

    return (
        <Card>
            <CardHeader>
                <CardTitle>Identification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={control}
                    name="isWeighed"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="w-4 h-4 mt-1"
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Weighted Item</FormLabel>
                                <FormDescription>
                                    This item is weighed at the scale (e.g. Vegetables)
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                {isWeighed ? (
                    <FormField
                        control={control}
                        name="scalePlu"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Scale PLU (5 Digits)</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={isSubmitting}
                                        placeholder="e.g. 00101"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ) : (
                    <FormField
                        control={control}
                        name="barcode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Barcode / QR</FormLabel>
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
                )}
            </CardContent>
        </Card>
    );
};
