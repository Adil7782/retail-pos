"use client";

import { Search, ScanBarcode } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Product } from "./types";

interface POSSearchSectionProps {
    products: Product[];
    onProductSelect: (product: Product) => void;
    isLocked: boolean; // e.g., when modal is open
}

export default function POSSearchSection({
    products,
    onProductSelect,
    isLocked,
}: POSSearchSectionProps) {
    const [query, setQuery] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.barcode.includes(query)
    );

    useEffect(() => {
        if (!isLocked) {
            searchInputRef.current?.focus();
        }
    }, [isLocked]);

    useEffect(() => {
        if (query.length > 0) {
            setIsDropdownOpen(true);
            setFocusedIndex(0);
        } else {
            setIsDropdownOpen(false);
            setFocusedIndex(-1);
        }
    }, [query]);

    // Clear query when a product is selected
    const handleSelect = (product: Product) => {
        setQuery("");
        onProductSelect(product);
        // We'll rely on parent to handle focus management via isLocked prop changes
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (filteredProducts.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusedIndex((prev) =>
                prev < filteredProducts.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const exactMatch = products.find((p) => p.barcode === query);
            if (exactMatch) {
                handleSelect(exactMatch);
            } else if (focusedIndex >= 0 && filteredProducts[focusedIndex]) {
                handleSelect(filteredProducts[focusedIndex]);
            } else if (filteredProducts.length === 1) {
                handleSelect(filteredProducts[0]);
            }
        } else if (e.key === "Escape") {
            setIsDropdownOpen(false);
            setFocusedIndex(-1);
        }
    };

    return (
        <div className="flex-1 flex flex-col gap-4 relative">
            {/* Search Bar Container */}
            <div className="relative z-20">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Scan barcode or type name..."
                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition text-lg shadow-sm"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLocked}
                        autoComplete="off"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                        <ScanBarcode className="text-slate-400" />
                    </div>
                </div>

                {/* Dropdown Suggestions */}
                {isDropdownOpen && filteredProducts.length > 0 && (
                    <div
                        ref={dropdownRef}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-[60vh] overflow-y-auto z-30"
                    >
                        {filteredProducts.map((product, index) => (
                            <div
                                key={product.id}
                                onClick={() => handleSelect(product)}
                                className={cn(
                                    "flex justify-between items-center p-4 cursor-pointer border-b border-slate-50 last:border-0",
                                    index === focusedIndex ? "bg-blue-50" : "hover:bg-slate-50"
                                )}
                            >
                                <div>
                                    <div className="font-medium text-slate-800">{product.name}</div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span>#{product.barcode}</span>
                                        {/* Show Unit Badge */}
                                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-medium uppercase">
                                            {product.unit}
                                        </span>
                                    </div>
                                </div>
                                <div className="font-semibold text-blue-600">
                                    Rs.{product.price.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Helper Text */}
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                <div className="text-center space-y-2">
                    <p>Scan a product or type to search.</p>
                    <div className="flex gap-2 justify-center text-xs">
                        <span className="px-2 py-1 bg-white border rounded">↑/↓ Navigate</span>
                        <span className="px-2 py-1 bg-white border rounded">↵ Select</span>
                    </div>
                </div>
            </div>

            {/* All Products as Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-2">
                {products.map((product) => (
                    <button
                        key={product.id}
                        onClick={() => handleSelect(product)}
                        disabled={isLocked}
                        className="flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-center disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <span className="font-medium text-sm text-slate-800 line-clamp-2">
                            {product.name}
                        </span>
                        <span className="text-xs text-blue-600 mt-1">
                            Rs.{product.price.toFixed(2)}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
