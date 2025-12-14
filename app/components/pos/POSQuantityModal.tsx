"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product, UNIT_PRESETS } from "./types";

interface POSQuantityModalProps {
    isOpen: boolean;
    product: Product | null;
    onClose: () => void;
    onConfirm: (product: Product, qty: number) => void;
}

export default function POSQuantityModal({
    isOpen,
    product,
    onClose,
    onConfirm,
}: POSQuantityModalProps) {
    const [qtyInput, setQtyInput] = useState("1");
    const qtyInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setQtyInput("1");
            // Select all text when opening so user can type immediately to replace
            setTimeout(() => qtyInputRef.current?.select(), 50);
        }
    }, [isOpen, product]);

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

        if (isNaN(qtyToAdd) || qtyToAdd <= 0) return;

        onConfirm(product, qtyToAdd);
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
                    {/* Input Field */}
                    <div className="relative">
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
                    {UNIT_PRESETS[product.unit] && (
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
