"use client";

import { CreditCard, ScanBarcode, Trash2 } from "lucide-react";
import { CartItem } from "./types";
import POSCartItem from "./POSCartItem";

interface POSCartSectionProps {
    cart: CartItem[];
    onUpdateQty: (id: number, delta: number) => void;
    onRemove: (id: number) => void;
    onClearCart: () => void;
    onCheckout: () => void;
    isLoading: boolean;
}

export default function POSCartSection({
    cart,
    onUpdateQty,
    onRemove,
    onClearCart,
    onCheckout,
    isLoading,
}: POSCartSectionProps) {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const total = subtotal;

    return (
        <div className="w-full md:w-[400px] bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col h-full z-10">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                <h2 className="font-bold text-lg text-slate-800">Current Order</h2>
                <p className="text-sm text-slate-500">
                    {cart.length} items
                </p>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                        <ScanBarcode size={48} className="opacity-20" />
                        <p>Order is empty</p>
                    </div>
                ) : (
                    cart.map((item) => (
                        <POSCartItem
                            key={item.id}
                            item={item}
                            onUpdateQty={onUpdateQty}
                            onRemove={onRemove}
                        />
                    ))
                )}
            </div>

            {/* Footer Totals */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl space-y-3">
                <div className="space-y-1 text-sm text-slate-600">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>Rs.{subtotal.toFixed(2)}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-blue-600">
                        Rs.{total.toFixed(2)}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                        onClick={onClearCart}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition disabled:opacity-50"
                    >
                        <Trash2 size={18} /> Cancel
                    </button>
                    <button
                        onClick={onCheckout}
                        disabled={isLoading || cart.length === 0}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        ) : (
                            <>
                                <CreditCard size={18} /> Charge
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
