"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "./types";

interface POSCartItemProps {
    item: CartItem;
    onUpdateQty: (id: number, delta: number) => void;
    onRemove: (id: number) => void;
}

export default function POSCartItem({ item, onUpdateQty, onRemove }: POSCartItemProps) {
    return (
        <div className="flex flex-col p-3 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition group">
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
