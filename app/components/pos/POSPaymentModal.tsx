"use client";

import { useEffect, useRef, useState } from "react";
import { X, ArrowRight, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface POSPaymentModalProps {
    isOpen: boolean;
    total: number;
    onClose: () => void;
    onConfirm: (receivedAmount: number) => void;
    isLoading: boolean;
}

export default function POSPaymentModal({
    isOpen,
    total,
    onClose,
    onConfirm,
    isLoading,
}: POSPaymentModalProps) {
    const [receivedAmount, setReceivedAmount] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setReceivedAmount("");
            // Focus input slightly after mount
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen, total]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const received = parseFloat(receivedAmount) || 0;
    const change = received - total;
    const isSufficient = received >= total;

    const handleConfirm = () => {
        if (isSufficient && !isLoading) {
            onConfirm(received);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleConfirm();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Payment Details</h3>
                            <p className="text-sm text-slate-500">Enter cash received</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-slate-400 hover:text-slate-600 transition disabled:opacity-50"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Amount Display */}
                    <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100">
                        <span className="text-slate-500 font-medium">Total Amount</span>
                        <span className="text-2xl font-bold text-slate-800">
                            Rs.{total.toFixed(2)}
                        </span>
                    </div>

                    {/* Input Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Amount Received From Customer
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                Rs.
                            </span>
                            <input
                                ref={inputRef}
                                type="number"
                                value={receivedAmount}
                                onChange={(e) => setReceivedAmount(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                                placeholder={total.toFixed(2)}
                                className={cn(
                                    "w-full pl-12 pr-4 py-4 text-xl font-bold rounded-xl border-2 outline-none transition",
                                    isSufficient
                                        ? "border-green-500/50 focus:border-green-500 bg-green-50/10"
                                        : "border-slate-200 focus:border-blue-500 focus:bg-white bg-slate-50"
                                )}
                            />
                        </div>
                    </div>

                    {/* Change Display */}
                    <div className={cn(
                        "rounded-xl p-4 flex justify-between items-center transition-all duration-300",
                        isSufficient
                            ? "bg-green-600 text-white shadow-lg shadow-green-200 translate-y-0 opacity-100"
                            : "bg-slate-100 text-slate-400 translate-y-2 opacity-80"
                    )}>
                        <span className="font-medium">Change to Return</span>
                        <span className="text-3xl font-bold">
                            Rs.{Math.max(0, change).toFixed(2)}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="pt-2">
                        <button
                            onClick={handleConfirm}
                            disabled={!isSufficient || isLoading}
                            className={cn(
                                "w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all",
                                isSufficient
                                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98]"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            )}
                        >
                            {isLoading ? (
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                            ) : (
                                <>
                                    Complete Transaction <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
