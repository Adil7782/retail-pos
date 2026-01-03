"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product, UNIT_PRESETS } from "./types";

interface POSQuantityModalProps {
    isOpen: boolean;
    product: Product | null;
    initialQty?: number;
    allowPriceEdit?: boolean;
    onClose: () => void;
    onConfirm: (product: Product, qty: number, price: number) => void;
}

export default function POSQuantityModal({
    isOpen,
    product,
    initialQty = 1,
    allowPriceEdit = false,
    onClose,
    onConfirm,
}: POSQuantityModalProps) {
    const [qtyInput, setQtyInput] = useState("1");
    const [priceInput, setPriceInput] = useState("0");
    const qtyInputRef = useRef<HTMLInputElement>(null);
    const priceInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && product) {
            setQtyInput(initialQty.toString());
            setPriceInput(product.price.toString());

            // Focus appropriate field
            setTimeout(() => {
                if (allowPriceEdit) {
                    priceInputRef.current?.select();
                } else {
                    qtyInputRef.current?.select();
                }
            }, 50);
        }
    }, [isOpen, product, initialQty, allowPriceEdit]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleConfirm();
        } else if (e.key === "Escape") {
            onClose();
        }
    };

    const handleConfirm = () => {
        if (!product) return;

        const qtyToAdd = parseFloat(qtyInput);
        const price = parseFloat(priceInput);

        if (isNaN(qtyToAdd) || qtyToAdd <= 0) return;
        if (isNaN(price) || price < 0) return;

        onConfirm(product, qtyToAdd, price);
    };

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Enter Quantity</h3>
                        <p className="text-sm text-slate-500">{product.name}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Price Input (if enabled) */}
                    {allowPriceEdit && (
                        <div className="relative">
                            <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider font-bold">
                                Unit Price
                            </label>
                            <input
                                ref={priceInputRef}
                                type="number"
                                step="0.01"
                                min="0"
                                value={priceInput}
                                onChange={(e) => setPriceInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        qtyInputRef.current?.select();
                                    } else if (e.key === "Escape") {
                                        onClose();
                                    }
                                }}
                                className="w-full text-center text-3xl font-bold py-3 border-b-2 border-green-500 outline-none bg-transparent text-green-700"
                            />
                            <span className="absolute left-0 bottom-4 text-green-600/50 font-medium text-lg">
                                Rs.
                            </span>
                        </div>
                    )}

                    {/* Qty Input Field */}
                    <div className="relative">
                        <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider font-bold">
                            Quantity
                        </label>
                        <input
                            ref={qtyInputRef}
                            type="number"
                            step="0.001" // Allows 3 decimal places
                            min="0.001"
                            value={qtyInput}
                            onChange={(e) => setQtyInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full text-center text-4xl font-bold py-4 border-b-2 border-blue-500 outline-none bg-transparent"
                        />
                        <span className="absolute right-0 bottom-4 text-slate-400 font-medium text-lg uppercase">
                            {product.unit}
                        </span>
                    </div>

                    {/* Quick Select Buttons for Kg/L */}
                    {product.unit && UNIT_PRESETS[product.unit] && (
                        <div className="grid grid-cols-3 gap-2">
                            {UNIT_PRESETS[product.unit].map((preset) => (
                                <button
                                    key={preset.label}
                                    onClick={() => {
                                        setQtyInput(preset.value.toString());
                                        qtyInputRef.current?.focus();
                                    }}
                                    className={cn(
                                        "py-2 rounded-lg text-sm font-semibold border transition",
                                        parseFloat(qtyInput) === preset.value
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                    )}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-slate-200 font-medium hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
                        >
                            Confirm (↵)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
