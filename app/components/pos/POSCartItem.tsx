"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "./types";
import { cn } from "@/lib/utils";

interface POSCartItemProps {
    item: CartItem;
    isActive?: boolean;
    onClick?: () => void;
    onUpdateQty: (id: number, delta: number) => void;
    onRemove: (id: number) => void;
}

export default function POSCartItem({ item, isActive, onClick, onUpdateQty, onRemove }: POSCartItemProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex flex-col p-3 rounded-xl border bg-white shadow-sm transition group cursor-pointer",
                isActive
                    ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/30"
                    : "border-slate-100 hover:shadow-md hover:border-slate-200"
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-slate-700 w-3/4 truncate">
                    {item.name}
                </span>
                <button
                    onClick={() => onRemove(item.id)}
                    className="text-slate-300 hover:text-red-500 transition"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                    <button
                        onClick={() => onUpdateQty(item.id, item.unit === 'pcs' ? -1 : -0.1)}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-200 transition"
                    >
                        <Minus size={12} />
                    </button>
                    <span className="text-sm font-semibold min-w-[30px] text-center">
                        {item.qty}
                        <span className="text-[10px] text-slate-400 ml-0.5">{item.unit}</span>
                    </span>
                    <button
                        onClick={() => onUpdateQty(item.id, item.unit === 'pcs' ? 1 : 0.1)}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-200 transition"
                    >
                        <Plus size={12} />
                    </button>
                </div>
                <div className="text-right">
                    <div className="font-bold text-slate-800">
                        Rs.{(item.price * item.qty).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                        Rs.{item.price}/{item.unit}
                    </div>
                </div>
            </div>
        </div>
    );
}
