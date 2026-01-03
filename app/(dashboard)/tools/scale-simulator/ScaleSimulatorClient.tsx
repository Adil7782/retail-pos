"use client";

import { useState, useEffect } from "react";
import { generateWeightedBarcode } from "@/lib/barcode";
import { Copy, Scale, RefreshCw, Calculator, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Product {
    id: number;
    name: string;
    scalePlu: string | null;
}

interface ScaleSimulatorClientProps {
    products: Product[];
}

const formSchema = z.object({
    scalePlu: z.string().min(1, "Please select a product"),
    weight: z.coerce.number().min(0.001, "Weight must be greater than 0"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ScaleSimulatorClient({ products }: ScaleSimulatorClientProps) {
    const [generatedCode, setGeneratedCode] = useState("");
    const [open, setOpen] = useState(false);

    // Cast resolver to any to avoid strict type mismatch issues between RHF and Zod
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            scalePlu: "",
            weight: 1.25,
        },
    });

    const onSubmit = (values: FormValues) => {
        const code = generateWeightedBarcode(values.scalePlu, values.weight);
        setGeneratedCode(code);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 rounded-xl">
                    <Scale className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Scale Simulator</h1>
                    <p className="text-slate-500">Generate test barcodes for weighted items</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-slate-400" />
                        Scale Inputs
                    </h2>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Product Selection Combobox */}
                            <FormField
                                control={form.control}
                                name="scalePlu"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Product</FormLabel>
                                        <Popover open={open} onOpenChange={setOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={open}
                                                        className={cn(
                                                            "w-full justify-between font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? products.find(
                                                                (product) => product.scalePlu === field.value
                                                            )?.name
                                                            : "Select a weighted product..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search product..." />
                                                    <CommandList>
                                                        <CommandEmpty>No product found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {products.map((product) => (
                                                                <CommandItem
                                                                    key={product.id}
                                                                    value={product.name}
                                                                    onSelect={() => {
                                                                        form.setValue("scalePlu", product.scalePlu || "");
                                                                        setOpen(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            product.scalePlu === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <div className="flex flex-col">
                                                                        <span>{product.name}</span>
                                                                        <span className="text-xs text-muted-foreground">PLU: {product.scalePlu}</span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Weight Input */}
                            <FormField
                                control={form.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Weight (Kg)</FormLabel>
                                        <FormControl>
                                            <input
                                                type="number"
                                                {...field}
                                                step="0.001"
                                                min="0"
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition font-mono text-lg"
                                                placeholder="e.g. 1.250"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full py-6 text-lg">
                                <RefreshCw className="w-5 h-5 mr-2" />
                                Generate Barcode
                            </Button>
                        </form>
                    </Form>
                </div>

                {/* Output */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Scale className="w-32 h-32" />
                        </div>

                        <div className="relative z-10 text-center space-y-6">
                            <div className="text-slate-400 text-sm font-mono tracking-widest uppercase">
                                Generated Barcode
                            </div>

                            {generatedCode ? (
                                <div className="space-y-4">
                                    <div className="font-mono text-4xl sm:text-5xl font-bold tracking-wider text-white">
                                        {generatedCode}
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copy to Clipboard
                                    </button>
                                </div>
                            ) : (
                                <div className="py-8 text-slate-500 italic">
                                    Select product & weight...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Breakdown */}
                    {generatedCode && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                            <h3 className="font-semibold text-slate-800">Barcode Structure</h3>
                            <div className="grid grid-cols-4 gap-2 text-center text-sm">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <div className="font-bold text-slate-900">21</div>
                                    <div className="text-xs text-slate-500">Prefix</div>
                                </div>
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <div className="font-bold text-blue-700">{generatedCode.substring(2, 7)}</div>
                                    <div className="text-xs text-blue-400">PLU</div>
                                </div>
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <div className="font-bold text-green-700">{generatedCode.substring(7, 12)}</div>
                                    <div className="text-xs text-green-400">Weight (g)</div>
                                </div>
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <div className="font-bold text-purple-700">{generatedCode.substring(12)}</div>
                                    <div className="text-xs text-purple-400">Check</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
